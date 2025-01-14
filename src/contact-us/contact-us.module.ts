import { Module } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ContactUsService, PrismaService],
  controllers: [ContactUsController],
})
export class ContactUsModule {}
