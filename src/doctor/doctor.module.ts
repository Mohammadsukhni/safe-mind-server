import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService, PrismaService, SendEmailHelper],
  exports: [DoctorService],
  imports: [AuthModule],
})
export class DoctorModule {}
