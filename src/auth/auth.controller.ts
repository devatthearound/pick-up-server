import { Controller, Post, Body, Res, UseGuards, Get, Request, Headers, Ip, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { RegisterDto2 } from './dto/register2.dto';
import { LoginDto2 } from './dto/login.dto2';
@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    return this.authService.register(registerDto, response);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  @Post('register2')
  async register2(@Body() registerDto: RegisterDto2, @Res({ passthrough: true }) response: Response) {
    return this.authService.register2(registerDto, response);
  }


  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }


  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Post('login2')
  async login2(
    @Body() loginDto: LoginDto2,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login2(loginDto, response);
  }


  @ApiOperation({ summary: '리프레시 토큰 발급' })
  @ApiResponse({ status: 200, description: '리프레시 토큰 발급 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @Post('refresh')
  async refreshTokens(
    @Body() body: { refreshToken: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      console.log('1. Received refresh request:', body);
      
      if (!body.refreshToken) {
        console.log('2. No refresh token provided');
        throw new UnauthorizedException('리프레시 토큰이 필요합니다');
      }

      console.log('3. Calling authService.refreshTokens');
      const tokens = await this.authService.refreshTokens(body.refreshToken);
      console.log('4. Tokens created successfully');
      
      return { 
        message: '토큰이 갱신되었습니다',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      console.log('5. Error in refresh endpoint:', error);
      throw error;
    }
  }


  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: Request) {
    const sessionId = request['user']['sessionId'];
    await this.authService.invalidateSession(sessionId);
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '내 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  // 이제 역할별로 접근을 제한하는 엔드포인트 예시
  @ApiOperation({ summary: '고객 전용 정보' })
  @ApiResponse({ status: 200, description: '고객 전용 정보 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth()
  @Get('customer-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getCustomerInfo(@Request() req) {
    return { message: '이 정보는 고객만 볼 수 있습니다.', userId: req.user.id };
  }

  @ApiOperation({ summary: '사장님 전용 정보' })
  @ApiResponse({ status: 200, description: '사장님 전용 정보 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth()
  @Get('owner-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async getOwnerInfo(@Request() req) {
    return { message: '이 정보는 사장님만 볼 수 있습니다.', userId: req.user.id };
  }


  @ApiOperation({ summary: '핸드폰 인증 코드 발송' })
  @ApiResponse({ status: 200, description: '핸드폰 인증 코드 발송 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @Post('send-sms-code')
  async sendSmsCode(@Body() body: { phone: string }) {
    return this.authService.sendSmsCode(body.phone);
  }

  @ApiOperation({ summary: '핸드폰 인증 코드 검증' })
  @ApiResponse({ status: 200, description: '핸드폰 인증 코드 검증 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @Post('verify-sms-code')
  async verifySmsCode(@Body() body: { phone: string, code: string }) {
    return this.authService.verifySmsCode(body.phone, body.code);
  }

  
}