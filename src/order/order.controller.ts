import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards, 
    Request, 
    Query, 
    ParseIntPipe, 
    BadRequestException,
    ForbiddenException,
  } from '@nestjs/common';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../auth/dto/register.dto';
  import { OrderService } from './order.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
  import { OrderQueryDto } from './dto/order-query.dto';
  import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
  
  @ApiTags('주문')
  @Controller('orders')
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}
  
    @ApiOperation({ summary: '주문 목록 조회' })
    @ApiResponse({ status: 200, description: '주문 목록 반환' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req, @Query() queryDto: OrderQueryDto) {
      // 고객은 자신의 주문만 조회 가능
      if (req.user.role === UserRole.CUSTOMER) {
        queryDto.customerId = req.user.id;
      }
      // 점주는 자신의 매장 주문만 조회 가능
      else if (req.user.role === UserRole.OWNER) {
        if (queryDto.storeId) {
          // TODO: 매장 소유권 확인 로직 추가
        } else {
          throw new BadRequestException('매장 ID는 필수입니다.');
        }
      }
      
      return this.orderService.findAll(queryDto);
    }
  
    @ApiOperation({ summary: '주문 상세 조회' })
    @ApiResponse({ status: 200, description: '주문 상세 정보 반환' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
      const order = await this.orderService.findOne(id);
      
      // 권한 확인: 고객은 자신의 주문만 조회 가능
      if (req.user.role === UserRole.CUSTOMER && order.customerId !== req.user.id) {
        throw new ForbiddenException('해당 주문에 접근할 권한이 없습니다.');
      }
      
      // 점주는 자신의 매장 주문만 조회 가능
      if (req.user.role === UserRole.OWNER && order.store.ownerId !== req.user.ownerId) {
        throw new ForbiddenException('해당 주문에 접근할 권한이 없습니다.');
      }
      
      return order;
    }
  
    @ApiOperation({ summary: '주문 번호로 주문 조회' })
    @ApiResponse({ status: 200, description: '주문 상세 정보 반환' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('by-number/:orderNumber')
    async findByOrderNumber(
      @Request() req,
      @Param('orderNumber') orderNumber: string
    ) {
      const order = await this.orderService.findByOrderNumber(orderNumber);
      
      // 권한 확인: 고객은 자신의 주문만 조회 가능
      if (req.user.role === UserRole.CUSTOMER && order.customerId !== req.user.id) {
        throw new ForbiddenException('해당 주문에 접근할 권한이 없습니다.');
      }
      
      // 점주는 자신의 매장 주문만 조회 가능
      if (req.user.role === UserRole.OWNER && order.store.ownerId !== req.user.ownerId) {
        throw new ForbiddenException('해당 주문에 접근할 권한이 없습니다.');
      }
      
      return order;
    }
  
    @ApiOperation({ summary: '주문 생성' })
    @ApiResponse({ status: 201, description: '주문 생성 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
      // // 회원 주문인 경우 customerId 사용
      // if (createOrderDto.customerId) {
      //   return this.orderService.create(createOrderDto.customerId, createOrderDto);
      // }
      
      // // 비회원 주문인 경우 customerPhone과 customerName 사용
      // if (!createOrderDto.customerPhone || !createOrderDto.customerName) {
      //   throw new BadRequestException('비회원 주문의 경우 고객 이름과 전화번호가 필요합니다.');
      // }
      
      return this.orderService.create(null, createOrderDto);
    }
  
    @ApiOperation({ summary: '주문 상태 변경' })
    @ApiResponse({ status: 200, description: '주문 상태 변경 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Patch(':id/status')
    async updateStatus(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ) {
      const order = await this.orderService.findOne(id);
      
      // 점주 권한 확인
      if (order.store.ownerId !== req.user.ownerId) {
        throw new ForbiddenException('해당 주문의 상태를 변경할 권한이 없습니다.');
      }
      
      return this.orderService.updateStatus(id, updateOrderStatusDto, req.user.id);
    }
  
    @ApiOperation({ summary: '주문 취소' })
    @ApiResponse({ status: 200, description: '주문 취소 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Post(':id/cancel')
    async cancelOrder(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body('reason') reason: string
    ) {
      return this.orderService.cancelOrder(id, req.user.id, reason);
    }
  
    @ApiOperation({ summary: '결제 정보 생성' })
    @ApiResponse({ status: 201, description: '결제 정보 생성 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('payment')
    async createPayment(
      @Request() req,
      @Body() createPaymentDto: CreatePaymentDto
    ) {
      const order = await this.orderService.findOne(createPaymentDto.orderId);
      
      // 권한 확인: 고객은 자신의 주문만 결제 가능
      if (req.user.role === UserRole.CUSTOMER && order.customerId !== req.user.id) {
        throw new ForbiddenException('해당 주문에 대한 결제 권한이 없습니다.');
      }
      
      return this.orderService.createPayment(createPaymentDto);
    }
  
    @ApiOperation({ summary: '결제 상태 변경' })
    @ApiResponse({ status: 200, description: '결제 상태 변경 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 403, description: '권한 없음' })
    @ApiResponse({ status: 404, description: '주문 또는 결제 정보를 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Patch(':id/payment-status')
    async updatePaymentStatus(
      @Request() req,
      @Param('id', ParseIntPipe) id: number,
      @Body() updatePaymentStatusDto: UpdatePaymentStatusDto
    ) {
      const order = await this.orderService.findOne(id);
      
      // 점주 권한 확인
      if (order.store.ownerId !== req.user.ownerId) {
        throw new ForbiddenException('해당 주문의 결제 상태를 변경할 권한이 없습니다.');
      }
      
      return this.orderService.updatePaymentStatus(id, updatePaymentStatusDto);
    }
  
    @ApiOperation({ summary: '전화번호로 주문 조회' })
    @ApiResponse({ status: 200, description: '주문 목록 반환' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @Get('by-phone/:phone')
    async findByPhone(@Param('phone') phone: string) {
      return this.orderService.findByPhone(phone);
    }
  
    @ApiOperation({ summary: '주문 번호와 전화번호로 주문 조회' })
    @ApiResponse({ status: 200, description: '주문 상세 정보 반환' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 404, description: '주문을 찾을 수 없음' })
    @Get('by-number-and-phone/:orderNumber/:phone')
    async findByOrderNumberAndPhone(
      @Param('orderNumber') orderNumber: string,
      @Param('phone') phone: string
    ) {
      return this.orderService.findByOrderNumberAndPhone(orderNumber, phone);
    }
  }