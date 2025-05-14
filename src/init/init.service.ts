import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
@Injectable()
export class InitService {
  constructor(private readonly usersService: UsersService) {}

  async initialize(customerId : string) {
    const user = await this.usersService.findByCustomerId(customerId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // 초기화 로직을 여기에 구현

    console.log(user);
    return {
      id : user.id,
      email : user.email,
      phone : user.phone,
      name : user.customerProfile.firstName,
      lastName : user.customerProfile.lastName,
      profileImage : user.customerProfile.profileImage,
    }
  }
}
