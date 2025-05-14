import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
import { RegisterDto2 } from './dto/register2.dto';
import { LoginDto2 } from './dto/login.dto2';
import { SmsService } from '../service/smsFunction';
import { NotFoundError } from 'src/service/errorClass';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private configService: ConfigService,
    private smsService: SmsService,
  ) {}

  private validatePassword(password: string): { isValid: boolean; message: string } {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const validations = [
      {
        isValid: password.length >= minLength,
        message: `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`
      },
      {
        isValid: hasUpperCase,
        message: '대문자를 포함해야 합니다.'
      },
      {
        isValid: hasLowerCase,
        message: '소문자를 포함해야 합니다.'
      },
      {
        isValid: hasNumbers,
        message: '숫자를 포함해야 합니다.'
      },
      {
        isValid: hasSpecialChar,
        message: '특수문자를 포함해야 합니다.'
      }
    ];

    const failedValidations = validations.filter(v => !v.isValid);
    
    if (failedValidations.length > 0) {
      return {
        isValid: false,
        message: `비밀번호 요구사항이 충족되지 않았습니다: ${failedValidations.map(v => v.message).join(', ')}`
      };
    }

    return { isValid: true, message: '유효한 비밀번호입니다.' };
  }

  async register(registerDto: RegisterDto, response: Response) {
    // 비밀번호 정책 검증 추가
    const passwordValidation = this.validatePassword(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new UnauthorizedException(passwordValidation.message);
    }

    const user = await this.usersService.register(registerDto);
    
    // createTokens 메서드 사용
    const tokens = await this.createTokens(
      user,
      response.req.headers['user-agent'],
      response.req.ip || ''
    );

    return { 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        role: registerDto.role,
        profile: registerDto.role === UserRole.CUSTOMER 
          ? user.customerProfile 
          : user.ownerProfile,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }

  async register2(registerDto: RegisterDto2, response: Response) {
    // 비밀번호 정책 검증 추가
    const passwordValidation = this.validatePassword(registerDto.password);
    if (!passwordValidation.isValid) {
      throw new ConflictException(passwordValidation.message);
    }

    const user = await this.usersService.register2(registerDto);
    
    // createTokens 메서드 사용
    const tokens = await this.createTokens(
      user,
      response.req.headers['user-agent'],
      response.req.ip || ''
    );

    return { 
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: registerDto.role,
        profile: registerDto.role === UserRole.CUSTOMER 
          ? user.customerProfile 
          : user.ownerProfile,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
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

    return { 
      user: { id: user.id, email: user.email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }


  async login2(loginDto: LoginDto2, response: Response) {
    const user = await this.validateUser2(loginDto.identifier, loginDto.password);
    
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

    return { 
      user: { id: user.id, email: user.email },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    };
  }


  async logout(response: Response, sessionId: number) {
    await this.invalidateSession(sessionId);
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

  private async validateUser2(identifier: string, password: string) {
    const user = await this.usersService.findByEmailOrPhone(identifier);
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
    // 사용자 역할 결정
    let role = UserRole.CUSTOMER;

    if (user.ownerProfile) {
      role = UserRole.OWNER;
    }
    // 세션 저장
    const session = new UserSession();
    session.user = user;
    session.userId = user.id;
    session.deviceInfo = deviceInfo;
    session.ipAddress = ipAddress;
    session.lastActivityAt = new Date();
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
    
    const savedSession = await this.userSessionRepository.save(session);
  
    // 토큰에 역할 및 세션 ID 포함
    const payload = {
      sub: user.id,
      email: user.email,
      role,
      sessionId: savedSession.id,
      isActive: user.isActive,
      ...(role === UserRole.OWNER ? {
        ownerId: user.ownerProfile?.id
      } : role === UserRole.CUSTOMER ? {
        customerId: user.customerProfile?.id
      } : {})
    };
  
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m'
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d'
      })
    ]);
  
    session.sessionToken = accessToken;
    session.refreshToken = refreshToken;
    await this.userSessionRepository.save(session);
  
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // 세션 조회 시 refreshToken이 아닌 sessionId로 조회
      const session = await this.userSessionRepository.findOne({
        where: { 
          id: payload.sessionId,
          isValid: true 
        },
        relations: ['user', 'user.customerProfile', 'user.ownerProfile'],
      });

      if (!session) {
        throw new UnauthorizedException('유효하지 않은 세션입니다');
      }
  
      if (session.expiresAt < new Date()) {
        session.isValid = false;
        await this.userSessionRepository.save(session);
        throw new UnauthorizedException('세션이 만료되었습니다');
      }
  
      // 사용자 활성 상태 확인
      if (!session.user.isActive) {
        throw new UnauthorizedException('비활성화된 계정입니다');
      }
  
      // 기존 세션 무효화 (토큰 순환을 위해)
      session.isValid = false;
      await this.userSessionRepository.save(session);
  
      // 새로운 토큰 발급
      const tokens = await this.createTokens(
        session.user,
        session.deviceInfo,
        session.ipAddress,
      );
  
      return tokens;
    } catch (error) {
      console.log('Error in refreshTokens:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다');
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

  async sendSmsCode(phone: string) {
    const result = await this.smsService.sendSms('+82', phone);
    return result;
  }

  async verifySmsCode(phone: string, code: string) {
    const compareCodeResult = await this.smsService.compareAuthCode(phone, code);
    if (!compareCodeResult)
      throw new NotFoundError("인증번호가 일치하지 않습니다");
    
    return {
      code: 200,
      message: "인증번호가 일치합니다",
    };
  }
}