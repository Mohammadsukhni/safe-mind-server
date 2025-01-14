import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Doctor } from './entity/doctor.entity';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from 'src/account/dto/create-account-dto';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';
import { Prisma } from '@prisma/client';
import { Account } from 'src/account/entities/account-entity';

@Injectable()
export class DoctorService {
  private readonly logger = new Logger(DoctorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sendEmailHelper: SendEmailHelper,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
    account: Account,
  ): Promise<{ doctor: Doctor }> {
    try {
      if (account.account_type !== 'admin') {
        throw new UnauthorizedException(
          'You are not authorized to create a doctor',
        );
      }

      const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

      const createdAccount = await this.prisma.account.create({
        data: {
          ...createAccountDto,
          password: hashedPassword,
        },
      });

      const createdDoctor = await this.prisma.doctor.create({
        data: {
          account_id: createdAccount.id,
        },
        include: { account: true },
      });

      const emailData = {
        firstName: createAccountDto.first_name,
        email: createAccountDto.email,
        password: createAccountDto.password,
      };

      await this.sendEmailHelper.sendEmail(
        createdAccount.email,
        'welcome-doctor',
        'Welcome to Save Mind',
        emailData,
      );

      return { doctor: createdDoctor };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateDoctorDto: UpdateAccountDto): Promise<Doctor> {
    try {
      const doctor = await this.prisma.doctor.findUnique({
        where: { account_id: id },
        include: { account: true },
      });

      if (!doctor) {
        throw new BadRequestException('Doctor not found');
      }

      if (
        updateDoctorDto.email ||
        updateDoctorDto.first_name ||
        updateDoctorDto.last_name ||
        updateDoctorDto.phone_number
      ) {
        await this.prisma.account.update({
          where: { id: doctor.account_id },
          data: {
            email: updateDoctorDto.email || doctor.account.email,
            first_name: updateDoctorDto.first_name || doctor.account.first_name,
            last_name: updateDoctorDto.last_name || doctor.account.last_name,
            phone_number:
              updateDoctorDto.phone_number || doctor.account.phone_number,
          },
        });
      }

      return await this.prisma.doctor.findUnique({
        where: { account_id: doctor.account_id },
        include: { account: true },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(account_id: number): Promise<Doctor> {
    try {
      return await this.prisma.doctor.findUnique({
        where: { account_id },
        include: { account: true, doctor_profile: true },
      });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    prisma: Prisma.TransactionClient,
    filter: Prisma.DoctorWhereInput,
    page: number,
    pageSize: number,
  ) {
    try {
      const doctors = await prisma.doctor.findMany({
        where: { ...filter },
        include: {
          account: true,
          doctor_profile: true,
        },
        ...(page && {
          ...(page && {
            skip: Number(pageSize) * (page - 1),
            take: Number(pageSize),
          }),
        }),
      });

      return doctors;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(account_id: number, account: Account): Promise<Doctor> {
    try {
      if (account.account_type != 'admin') {
        throw new UnauthorizedException('only admin can perform this action');
      }
      return await this.prisma.doctor.delete({
        where: { account_id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }
}
