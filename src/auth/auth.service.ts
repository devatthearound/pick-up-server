import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from '../session/entities/user-session.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { DeviceInfo } from '../session/types/device-info.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto, response: Response) {
    const user = await this.usersService.register(registerDto);
    
    // createTokens 메서드 사용
    const tokens = await this.createTokens(
      user,
      response.req.headers['user-agent'],
      response.req.ip || ''
    );

    // 쿠키 설정
    this.setTokenCookies(response, tokens);

    return { 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        role: registerDto.role,
        profile: registerDto.role === UserRole.CUSTOMER 
          ? user.customerProfile 
          : user.ownerProfile,
      }
    };
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // 디바이스 정보 구조화
    const deviceInfo = this.parseDeviceInfo(response.req.headers['user-agent'] || '');
    
    // 동일 디바이스의 기존 세션 처리
    await this.handleExistingSession(user.id, deviceInfo);
    
    const tokens = await this.createTokens(
      user,
      deviceInfo,
      response.req.ip || ''
    );

    // 사용자 마지막 로그인 시간 업데이트
    await this.usersService.updateLastLogin(user.id);

    this.setTokenCookies(response, tokens);
    return { user: { id: user.id, email: user.email } };
  }

  // 쿠키 설정을 위한 헬퍼 메서드
  private setTokenCookies(response: Response, tokens: { accessToken: string, refreshToken: string }) {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15분
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });
  }

  async logout(response: Response, sessionId: number) {
    await this.invalidateSession(sessionId);
    
    // 쿠키 제거
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    
    return { message: '로그아웃되었습니다.' };
  }

  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    return user;
  }

  async createTokens(user: User, deviceInfo: any, ipAddress: string) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' }
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' }
    );

    // 세션 저장
    const session = new UserSession();
    session.user = user;
    session.userId = user.id;
    session.sessionToken = accessToken;
    session.refreshToken = refreshToken;
    session.deviceInfo = deviceInfo;
    session.ipAddress = ipAddress;
    session.lastActivityAt = new Date();
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
    
    await this.userSessionRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const session = await this.userSessionRepository.findOne({
        where: { refreshToken, isValid: true },
        relations: ['user'],
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (session.expiresAt < new Date()) {
        session.isValid = false;
        await this.userSessionRepository.save(session);
        throw new UnauthorizedException('Refresh token expired');
      }

      // 새로운 토큰 발급
      const tokens = await this.createTokens(
        session.user,
        session.deviceInfo,
        session.ipAddress,
      );

      // 이전 세션 무효화
      session.isValid = false;
      await this.userSessionRepository.save(session);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async invalidateSession(sessionId: number) {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId },
    });
    
    if (session) {
      session.isValid = false;
      await this.userSessionRepository.save(session);
    }
  }

  private async handleExistingSession(userId: number, deviceInfo: DeviceInfo) {
    const existingSessions = await this.userSessionRepository.find({
        where: {
            userId,
            isValid: true,
            deviceInfo: deviceInfo // 같은 디바이스의 세션 찾기
        }
    });

    if (existingSessions.length > 0) {
        await this.userSessionRepository.update(
            existingSessions.map(session => session.id),
            { 
                isValid: false,
                lastActivityAt: new Date(),
            }
        );
    }
  }

  // 디바이스 정보 파싱을 위한 유틸리티
  private parseDeviceInfo(userAgent: string): DeviceInfo {
    return {
        browser: this.getBrowserInfo(userAgent),
        os: this.getOSInfo(userAgent),
        device: this.getDeviceInfo(userAgent),
        userAgent
    };
  }

  private getBrowserInfo(userAgent: string): { name: string; version: string } {
    // 간단한 브라우저 감지 로직
    let browser = { name: 'Unknown', version: 'Unknown' };
    
    if (userAgent.includes('Chrome')) {
      browser.name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Firefox')) {
      browser.name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Safari')) {
      browser.name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) browser.version = match[1];
    } else if (userAgent.includes('Edge')) {
      browser.name = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      if (match) browser.version = match[1];
    }
    
    return browser;
  }

  private getOSInfo(userAgent: string): { name: string; version: string } {
    // 간단한 OS 감지 로직
    let os = { name: 'Unknown', version: 'Unknown' };
    
    if (userAgent.includes('Windows')) {
      os.name = 'Windows';
      const match = userAgent.match(/Windows NT (\d+\.\d+)/);
      if (match) os.version = match[1];
    } else if (userAgent.includes('Mac OS X')) {
      os.name = 'Mac OS';
      const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
      if (match) os.version = match[1].replace('_', '.');
    } else if (userAgent.includes('Linux')) {
      os.name = 'Linux';
    } else if (userAgent.includes('Android')) {
      os.name = 'Android';
      const match = userAgent.match(/Android (\d+)/);
      if (match) os.version = match[1];
    } else if (userAgent.includes('iOS')) {
      os.name = 'iOS';
      const match = userAgent.match(/OS (\d+[._]\d+)/);
      if (match) os.version = match[1].replace('_', '.');
    }
    
    return os;
  }

  private getDeviceInfo(userAgent: string): { type: string; model: string | undefined } {
    // 간단한 디바이스 타입 감지 로직
    let device = { type: 'Unknown', model: undefined as string | undefined };
    
    if (userAgent.includes('Mobile')) {
      device.type = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      device.type = 'Tablet';
    } else if (userAgent.includes('iPad')) {
      device.type = 'Tablet';
      device.model = 'iPad';
    } else if (userAgent.includes('iPhone')) {
      device.type = 'Mobile';
      device.model = 'iPhone';
    } else if (userAgent.includes('Android')) {
      device.type = 'Mobile';
      const match = userAgent.match(/Android [^;]+; ([^;]+)/);
      if (match) device.model = match[1].trim();
    } else {
      device.type = 'Desktop';
    }
    
    return device;
  }
}