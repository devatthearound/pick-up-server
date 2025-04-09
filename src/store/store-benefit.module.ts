import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreBenefitController } from './store-benefit.controller';
import { StoreBenefitService } from './store-benefit.service';
import { StoreBenefit } from './entities/store-benefit.entity';
import { Store } from './entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreBenefit, 
      Store
    ]),
  ],
  controllers: [StoreBenefitController],
  providers: [StoreBenefitService],
  exports: [StoreBenefitService],
})
export class StoreBenefitModule {}