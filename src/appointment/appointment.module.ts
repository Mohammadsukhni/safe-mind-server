import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from 'src/prisma.service';
import { DoctorModule } from 'src/doctor/doctor.module';
import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';

@Module({
  providers: [AppointmentService, PrismaService, SendEmailHelper],
  controllers: [AppointmentController],
  imports: [DoctorModule],
})
export class AppointmentModule {}
