import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    UseGuards, 
    Request, 
    Query, 
    ParseIntPipe, 
    ForbiddenException,
    NotFoundException,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../auth/dto/register.dto';
  import { NotificationService } from './notification.service';
  import { NotificationQueryDto, UpdateNotificationDto, CreateNotificationDto } from './dto/notification.dto';
  import { RecipientType } from './entities/order-notification.entity';
  
  @ApiTags('주문 알림')
  @Controller('notifications')
  export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}
  
    @ApiOperation({ summary: '내 알림 목록 조회' })
    @ApiResponse({ status: 200, description: '알림 목록 반환' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('my')
    async findAllByUser(@Request() req, @Query() queryDto: NotificationQueryDto) {
      const recipientType = req.user.role === UserRole.CUSTOMER 
        ? RecipientType.CUSTOMER 
        : RecipientType.OWNER;
      
      const recipientId = req.user.role === UserRole.CUSTOMER 
        ? req.user.id 
        : req.user.ownerId;
      
      return this.notificationService.findAllByRecipient(recipientId, recipientType, queryDto);
    }
  
    @ApiOperation({ summary: '알림 상세 조회' })
    @ApiResponse({ status: 200, description: '알림 상세 정보 반환' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
      const notification = await this.notificationService.findOne(id);
      
      if(!notification) {
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }

      const recipientType = req.user.role === UserRole.CUSTOMER 
        ? RecipientType.CUSTOMER 
        : RecipientType.OWNER;
      
      const recipientId = req.user.role === UserRole.CUSTOMER 
        ? req.user.id 
        : req.user.ownerId;
      
      // 권한 확인: 자신의 알림만 조회 가능
      if (notification.recipientId !== recipientId || notification.recipientType !== recipientType) {
        throw new ForbiddenException('해당 알림에 접근할 권한이 없습니다.');
      }
      
      return notification;
    }
  
    @ApiOperation({ summary: '알림 읽음 상태 변경' })
    @ApiResponse({ status: 200, description: '알림 상태 변경 성공' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateNotificationDto: UpdateNotificationDto
    ) {
      const notification = await this.notificationService.findOne(id);
      
      if(!notification) {
        throw new NotFoundException('알림을 찾을 수 없습니다.');
      }

      const recipientType = req.user.role === UserRole.CUSTOMER 
        ? RecipientType.CUSTOMER 
        : RecipientType.OWNER;
      
      const recipientId = req.user.role === UserRole.CUSTOMER 
        ? req.user.id 
        : req.user.ownerId;
      
      // 권한 확인: 자신의 알림만 수정 가능
      if (notification.recipientId !== recipientId || notification.recipientType !== recipientType) {
        throw new ForbiddenException('해당 알림의 상태를 변경할 권한이 없습니다.');
      }
      
      return this.notificationService.update(id, updateNotificationDto);
    }
  
    @ApiOperation({ summary: '모든 알림 읽음 처리' })
    @ApiResponse({ status: 200, description: '모든 알림 읽음 처리 성공' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('read-all')
    async markAllAsRead(@Request() req) {
      const recipientType = req.user.role === UserRole.CUSTOMER 
        ? RecipientType.CUSTOMER 
        : RecipientType.OWNER;
      
      const recipientId = req.user.role === UserRole.CUSTOMER 
        ? req.user.id 
        : req.user.ownerId;
      
      return this.notificationService.markAllAsRead(recipientId, recipientType);
    }
  
    @ApiOperation({ summary: '읽지 않은 알림 수 조회' })
    @ApiResponse({ status: 200, description: '읽지 않은 알림 수 반환' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('unread/count')
    async countUnread(@Request() req) {
      const recipientType = req.user.role === UserRole.CUSTOMER 
        ? RecipientType.CUSTOMER 
        : RecipientType.OWNER;
      
      const recipientId = req.user.role === UserRole.CUSTOMER 
        ? req.user.id 
        : req.user.ownerId;
      
      return this.notificationService.countUnread(recipientId, recipientType);
    }
  
    // 알림 수동 생성 (테스트/관리자 용)
    @ApiOperation({ summary: '알림 수동 생성 (테스트/관리자용)' })
    @ApiResponse({ status: 201, description: '알림 생성 성공' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER) // 향후 ADMIN 역할 추가시 변경
    @Post()
    async create(@Body() createNotificationDto: CreateNotificationDto) {
      return this.notificationService.create(createNotificationDto);
    }
  }