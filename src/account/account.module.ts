import { forwardRef, Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccountController],
  providers: [AccountService, PrismaService],
  imports: [forwardRef(() => AuthModule)],
  exports: [AccountService],
})
export class AccountModule {}
