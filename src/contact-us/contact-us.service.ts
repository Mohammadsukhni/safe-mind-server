import { UpdateContactUsDto } from './dto/update-contact-us.dto';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { Account } from 'src/account/entities/account-entity';
import { PrismaService } from 'src/prisma.service';
import { contact_us } from './entity/contact-us';

@Injectable()
export class ContactUsService {
  private readonly logger = new Logger(ContactUsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createContactUsDto: CreateContactUsDto,
    account: Account,
  ): Promise<contact_us> {
    try {
      const createdContactUs = await this.prisma.contact_us.create({
        data: {
          email: account.email,
          phone_number: account.phone_number,
          ...createContactUsDto,
        },
      });

      return createdContactUs;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(
    contact_us_id: number,
    updateContactUsDto: UpdateContactUsDto,
    account: Account,
  ): Promise<contact_us> {
    try {
      if (account.account_type != 'admin') {
        throw new UnauthorizedException(
          'Only admin users can update contact us records',
        );
      }
      const contactUsRecord = await this.prisma.contact_us.findUnique({
        where: { id: contact_us_id },
      });

      if (!contactUsRecord) {
        throw new BadRequestException('Contact Us record not found');
      }

      const updatedContactUs = await this.prisma.contact_us.update({
        where: { id: contact_us_id },
        data: { ...updateContactUsDto },
      });

      return updatedContactUs;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(account_id: number): Promise<User> {
    try {
      return await this.prisma.user.findUnique({
        where: { account_id },
        include: { account: true },
      });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    prisma: Prisma.TransactionClient,
    filter: Prisma.contact_usWhereInput,
    page: number,
    pageSize: number,
    account: Account,
  ) {
    try {
      if (account.account_type != 'admin') {
        throw new UnauthorizedException('only admin  can perform this action');
      }
      const contact_us = await prisma.contact_us.findMany({
        where: { ...filter },

        ...(page && {
          ...(page && {
            skip: Number(pageSize) * (page - 1),
            take: Number(pageSize),
          }),
        }),
      });

      return contact_us;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(id: number, account: Account): Promise<contact_us> {
    try {
      if (account.account_type != 'admin') {
        throw new UnauthorizedException('only admin  can perform this action');
      }
      return await this.prisma.contact_us.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
