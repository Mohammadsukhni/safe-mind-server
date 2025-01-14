import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { APIKeyGuard } from './utils/guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './configurations/mailer.configs';
import { UserModule } from './user/user.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { AdminModule } from './admin/admin.module';
import { DoctorModule } from './doctor/doctor.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DoctorProfileModule } from './doctor_profile/doctor_profile.module';

@Module({
  imports: [
    MailerModule.forRootAsync({ useClass: MailerConfig }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccountModule,
    AuthModule,
    UserModule,
    ContactUsModule,
    AdminModule,
    DoctorModule,
    AppointmentModule,
    DoctorProfileModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: APIKeyGuard,
    },
  ],
})
export class AppModule {}
