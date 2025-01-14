import { Module } from '@nestjs/common';
import { DoctorProfileService } from './doctor_profile.service';
import { DoctorProfileController } from './doctor_profile.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [DoctorProfileService, PrismaService],
  controllers: [DoctorProfileController],
})
export class DoctorProfileModule {}
