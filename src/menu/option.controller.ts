import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Delete, 
    Patch, 
    UseGuards, 
    Request, 
    Query, 
    ParseIntPipe 
  } from '@nestjs/common';
  import { 
    ApiBearerAuth, 
    ApiOperation, 
    ApiResponse, 
    ApiTags, 
    ApiParam, 
    ApiQuery, 
    ApiBody 
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from '../auth/dto/register.dto';
  import { OptionService } from './option.service';
  import { 
    CreateOptionGroupDto, 
    UpdateOptionGroupDto, 
    CreateOptionItemDto, 
    UpdateOptionItemDto, 
    CreateMenuOptionGroupDto, 
    UpdateMenuOptionGroupDto,
    OptionGroupQueryDto
  } from './dto/option.dto';
  
  @ApiTags('옵션')
  @Controller('options')
  export class OptionController {
    constructor(private readonly optionService: OptionService) {}
  
    // Option Group Endpoints
    @ApiOperation({ summary: '모든 옵션 그룹 조회' })
    @ApiResponse({ status: 200, description: '옵션 그룹 목록 반환 성공' })
    @Get('groups')
    findAllOptionGroups(@Query() query: OptionGroupQueryDto) {
      return this.optionService.findAllOptionGroups(query);
    }
  
    @ApiOperation({ summary: '옵션 그룹 상세 조회' })
    @ApiParam({ name: 'id', description: '옵션 그룹 ID' })
    @ApiResponse({ status: 200, description: '옵션 그룹 조회 성공' })
    @ApiResponse({ status: 404, description: '옵션 그룹을 찾을 수 없음' })
    @Get('groups/:id')
    findOptionGroupById(@Param('id', ParseIntPipe) id: number) {
      return this.optionService.findOptionGroupById(id);
    }
  
    @ApiOperation({ summary: '옵션 그룹 생성' })
    @ApiParam({ name: 'storeId', description: '매장 ID' })
    @ApiBody({ type: CreateOptionGroupDto })
    @ApiResponse({ status: 201, description: '옵션 그룹 생성 성공' })
    @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('groups/store/:storeId')
    createOptionGroup(
      @Param('storeId', ParseIntPipe) storeId: number,
      @Body() dto: CreateOptionGroupDto,
      @Request() req
    ) {
      // 매장 소유권 확인 로직 추가 필요
      return this.optionService.createOptionGroup(storeId, dto);
    }
  
    @ApiOperation({ summary: '옵션 그룹 수정' })
    @ApiParam({ name: 'id', description: '옵션 그룹 ID' })
    @ApiBody({ type: UpdateOptionGroupDto })
    @ApiResponse({ status: 200, description: '옵션 그룹 수정 성공' })
    @ApiResponse({ status: 404, description: '옵션 그룹을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('groups/:id')
    updateOptionGroup(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateOptionGroupDto,
    ) {
      return this.optionService.updateOptionGroup(id, dto);
    }
  
    @ApiOperation({ summary: '옵션 그룹 삭제' })
    @ApiParam({ name: 'id', description: '옵션 그룹 ID' })
    @ApiResponse({ status: 200, description: '옵션 그룹 삭제 성공' })
    @ApiResponse({ status: 404, description: '옵션 그룹을 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '사용 중인 옵션 그룹은 삭제할 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Delete('groups/:id')
    deleteOptionGroup(@Param('id', ParseIntPipe) id: number) {
      return this.optionService.deleteOptionGroup(id);
    }
  
    // Option Item Endpoints
    @ApiOperation({ summary: '옵션 그룹에 속한 옵션 항목 조회' })
    @ApiParam({ name: 'groupId', description: '옵션 그룹 ID' })
    @ApiResponse({ status: 200, description: '옵션 항목 목록 반환 성공' })
    @ApiResponse({ status: 404, description: '옵션 그룹을 찾을 수 없음' })
    @Get('items/group/:groupId')
    findOptionItemsByGroupId(@Param('groupId', ParseIntPipe) groupId: number) {
      return this.optionService.findOptionItemsByGroupId(groupId);
    }
  
    @ApiOperation({ summary: '옵션 항목 생성' })
    @ApiParam({ name: 'groupId', description: '옵션 그룹 ID' })
    @ApiBody({ type: CreateOptionItemDto })
    @ApiResponse({ status: 201, description: '옵션 항목 생성 성공' })
    @ApiResponse({ status: 404, description: '옵션 그룹을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('items/group/:groupId')
    createOptionItem(
      @Param('groupId', ParseIntPipe) groupId: number,
      @Body() dto: CreateOptionItemDto,
    ) {
      return this.optionService.createOptionItem(groupId, dto);
    }
  
    @ApiOperation({ summary: '옵션 항목 수정' })
    @ApiParam({ name: 'id', description: '옵션 항목 ID' })
    @ApiBody({ type: UpdateOptionItemDto })
    @ApiResponse({ status: 200, description: '옵션 항목 수정 성공' })
    @ApiResponse({ status: 404, description: '옵션 항목을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('items/:id')
    updateOptionItem(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateOptionItemDto,
    ) {
      return this.optionService.updateOptionItem(id, dto);
    }
  
    @ApiOperation({ summary: '옵션 항목 삭제' })
    @ApiParam({ name: 'id', description: '옵션 항목 ID' })
    @ApiResponse({ status: 200, description: '옵션 항목 삭제 성공' })
    @ApiResponse({ status: 404, description: '옵션 항목을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Delete('items/:id')
    deleteOptionItem(@Param('id', ParseIntPipe) id: number) {
      return this.optionService.deleteOptionItem(id);
    }
  
    // Menu Option Group Endpoints
    @ApiOperation({ summary: '메뉴에 할당된 옵션 그룹 조회' })
    @ApiParam({ name: 'menuId', description: '메뉴 ID' })
    @ApiResponse({ status: 200, description: '메뉴 옵션 그룹 목록 반환 성공' })
    @ApiResponse({ status: 404, description: '메뉴를 찾을 수 없음' })
    @Get('menu-option-groups/menu/:menuId')
    findMenuOptionGroupsByMenuId(@Param('menuId', ParseIntPipe) menuId: number) {
      return this.optionService.findMenuOptionGroupsByMenuId(menuId);
    }
  
    @ApiOperation({ summary: '메뉴-옵션 그룹 연결 생성' })
    @ApiBody({ type: CreateMenuOptionGroupDto })
    @ApiResponse({ status: 201, description: '메뉴-옵션 그룹 연결 생성 성공' })
    @ApiResponse({ status: 404, description: '메뉴 또는 옵션 그룹을 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '이미 연결된 옵션 그룹' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('menu-option-groups')
    createMenuOptionGroup(@Body() dto: CreateMenuOptionGroupDto) {
      return this.optionService.createMenuOptionGroup(dto);
    }
  
    @ApiOperation({ summary: '메뉴-옵션 그룹 연결 수정' })
    @ApiParam({ name: 'id', description: '메뉴-옵션 그룹 연결 ID' })
    @ApiBody({ type: UpdateMenuOptionGroupDto })
    @ApiResponse({ status: 200, description: '메뉴-옵션 그룹 연결 수정 성공' })
    @ApiResponse({ status: 404, description: '메뉴-옵션 그룹 연결을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Post('menu-option-groups/:id')
    updateMenuOptionGroup(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateMenuOptionGroupDto,
    ) {
      return this.optionService.updateMenuOptionGroup(id, dto);
    }
  
    @ApiOperation({ summary: '메뉴-옵션 그룹 연결 삭제' })
    @ApiParam({ name: 'id', description: '메뉴-옵션 그룹 연결 ID' })
    @ApiResponse({ status: 200, description: '메뉴-옵션 그룹 연결 삭제 성공' })
    @ApiResponse({ status: 404, description: '메뉴-옵션 그룹 연결을 찾을 수 없음' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    @Delete('menu-option-groups/:id')
    deleteMenuOptionGroup(@Param('id', ParseIntPipe) id: number) {
      return this.optionService.deleteMenuOptionGroup(id);
    }
  }