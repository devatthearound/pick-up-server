import { Controller, Post, Body, Res, UseGuards, Get, Request, Headers, Ip, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

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

  @ApiOperation({ summary: '리프레시 토큰 발급' })
  @ApiResponse({ status: 200, description: '리프레시 토큰 발급 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @Post('refresh')
  async refreshTokens(
    @Body('refreshToken') refreshToken: string,
    @Req() request: Request,
  ) {
    return this.authService.refreshTokens(refreshToken);
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
}