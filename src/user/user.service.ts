import { CreateAccountDto } from './../account/dto/create-account-dto';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<{
    user: User;
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const existingAccount = await this.prisma.account.findUnique({
        where: { email: createAccountDto.email },
      });

      if (existingAccount) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

      const createdAccount = await this.prisma.account.create({
        data: {
          ...createAccountDto,
          password: hashedPassword,
        },
      });

      const createdUser = await this.prisma.user.create({
        data: {
          account_id: createdAccount.id,
        },
        include: { account: true },
      });

      const tokens = await this.authService.generateAccessRefreshTokens(
        createdAccount.id,
        { email: createdAccount.email },
        this.prisma,
      );

      return {
        user: createdUser,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error.message);
    }
  }

  async update(id: number, updateDoctorDto: UpdateAccountDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { account_id: id },
        include: { account: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (
        updateDoctorDto.email ||
        updateDoctorDto.first_name ||
        updateDoctorDto.last_name ||
        updateDoctorDto.phone_number
      ) {
        await this.prisma.account.update({
          where: { id: user.account_id },
          data: {
            email: updateDoctorDto.email || user.account.email,
            first_name: updateDoctorDto.first_name || user.account.first_name,
            last_name: updateDoctorDto.last_name || user.account.last_name,
            phone_number:
              updateDoctorDto.phone_number || user.account.phone_number,
          },
        });
      }

      return await this.prisma.user.findUnique({
        where: { account_id: user.account_id },
        include: { account: true },
      });
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
    filter: Prisma.UserWhereInput,
    page: number,
    pageSize: number,
  ) {
    try {
      const users = await prisma.user.findMany({
        where: { ...filter },
        include: {
          account: true,
        },
        ...(page && {
          ...(page && {
            skip: Number(pageSize) * (page - 1),
            take: Number(pageSize),
          }),
        }),
      });

      return users;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(account_id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { account_id },
      });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error.message);
    }
  }
}
