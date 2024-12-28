import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/configurations/configuration.interface';
import { JwtStrategy } from 'src/utils/strategies/jwt.strategy';
import { AccountService } from 'src/account/account.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService<EnvVariables>) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    SendEmailHelper,
    JwtStrategy,
    AccountService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
