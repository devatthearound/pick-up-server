import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { InitService } from './init.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/auth/dto/register.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('init')
export class InitController {
  constructor(private readonly initService: InitService) {}

  @ApiOperation({ summary: '초기화' })
  @ApiResponse({ status: 200, description: '초기화 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get()
  async initialize(@Request() req) {
    console.log(req.user);
    if(!req.user) {
      return{
        isSuccess: false,
        message: '인증이 필요합니다.'
      }
    }
    
    const customerId = req.user.customerId;

    if(!customerId) {
      return{
        isSuccess: false,
        message: '고객 아이디가 없습니다.'
      }
    }

    return  this.initService.initialize(customerId);
  }
}
