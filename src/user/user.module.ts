import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AccountModule } from 'src/account/account.module';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  imports: [AccountModule, AuthModule],
})
export class UserModule {}
