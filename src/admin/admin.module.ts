import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [AdminService, PrismaService],
  controllers: [AdminController],
  imports: [AuthModule],
})
export class AdminModule {}
