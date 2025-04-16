import { Controller, Post, Body, UseGuards, Request, Delete, Get } from '@nestjs/common';
import { FirebaseMessagingService } from './firebase-messaging.service';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { UnregisterTokenDto } from './dto/unregister-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('알림')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly firebaseMessagingService: FirebaseMessagingService,
  ) {}

  @Get('tokens')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'FCM 토큰 조회', description: '사용자의 FCM 토큰을 조회합니다.' })
  @ApiResponse({ status: 200, description: '토큰 목록이 성공적으로 조회되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  async getTokens(@Request() req) {
    const userId = req.user.id;
    return this.firebaseMessagingService.getTokens(userId);
  }   

  @Post('register-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'FCM 토큰 등록', description: '사용자의 FCM 토큰을 등록합니다.' })
  @ApiResponse({ status: 201, description: '토큰이 성공적으로 등록되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async registerToken(
    @Request() req,
    @Body() registerFcmTokenDto: RegisterFcmTokenDto,
  ) {
    const userId = req.user.id;
    return this.firebaseMessagingService.registerToken(
      userId,
      registerFcmTokenDto.fcmToken,
      registerFcmTokenDto.deviceType,
      registerFcmTokenDto.deviceId,
    );
  }

  @Post('send')
  @ApiOperation({ summary: '푸시 알림 전송', description: '특정 사용자에게 푸시 알림을 전송합니다.' })
  @ApiResponse({ status: 201, description: '알림이 성공적으로 전송되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    return this.firebaseMessagingService.sendNotification(
      sendNotificationDto.userId,
      sendNotificationDto.title,
      sendNotificationDto.body,
      sendNotificationDto.data,
    );
  }

  @Delete('unregister-token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'FCM 토큰 삭제', description: '사용자의 FCM 토큰을 삭제합니다.' })
  @ApiResponse({ status: 200, description: '토큰이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청입니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async unregisterToken(
    @Request() req,
    @Body() unregisterTokenDto: UnregisterTokenDto,
  ) {
    const userId = req.user.id;
    return this.firebaseMessagingService.unregisterToken(
      userId,
      unregisterTokenDto.deviceId,
    );
  }
} 