import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CustomerProfile } from './entities/customer-profile.entity';
import { OwnerProfile } from './entities/owner-profile.entity';
import { RegisterDto, UserRole } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { IdentifierType, RegisterDto2 } from 'src/auth/dto/register2.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CustomerProfile)
    private customerProfileRepository: Repository<CustomerProfile>,
    @InjectRepository(OwnerProfile)
    private ownerProfileRepository: Repository<OwnerProfile>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { email },
      relations: ['customerProfile', 'ownerProfile'],
    });
  }

  async findByCustomerId(customerId: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { customerProfile: { id: Number(customerId) } },
      relations: ['customerProfile'],
    });
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, phone, first_name, last_name, role } = registerDto;

    // 이메일 중복 체크
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      phone,
    });

    await this.userRepository.save(user);

    // 역할에 따른 프로필 생성
    if (role === UserRole.CUSTOMER) {
      const customerProfile = this.customerProfileRepository.create({
        user: user,
        firstName: first_name,
        lastName: last_name,
      });
      await this.customerProfileRepository.save(customerProfile);
    } else if (role === UserRole.OWNER) {
      const ownerProfile = this.ownerProfileRepository.create({
        user: user,
        firstName: first_name,
        lastName: last_name,
      });
      await this.ownerProfileRepository.save(ownerProfile);
    }

    return user;
  }


  async findByUserPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { phone },
      relations: ['customerProfile', 'ownerProfile'],
    });
  }

  async register2(registerDto: RegisterDto2): Promise<User> {
    const { password, identifier, user_name, role, identifierType } = registerDto;

    // 이메일 중복 체크
    const existingUser = await this.findByEmailOrPhone(identifier);
    if (existingUser) {
      throw new ConflictException('이미 존재하는 계정입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = new User();
    user.password = hashedPassword;
    user.email = identifierType === IdentifierType.EMAIL ? identifier : null;
    user.phone = identifierType === IdentifierType.PHONE ? identifier : null;

    await this.userRepository.save(user);

    // 역할에 따른 프로필 생성
    if (role === UserRole.CUSTOMER) {
      const customerProfile = this.customerProfileRepository.create({
        user: user,
        firstName: user_name,
        lastName: user_name,
      });
      await this.customerProfileRepository.save(customerProfile);
    } else if (role === UserRole.OWNER) {
      const ownerProfile = this.ownerProfileRepository.create({
        user: user,
        firstName: user_name,
        lastName: user_name,
      });
      await this.ownerProfileRepository.save(ownerProfile);
    }

    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.update(
      userId,
      { lastLoginAt: new Date() }
    );
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [
        { email: identifier },
        { phone: identifier }
      ]
    });
  }
} 