import { Account } from 'src/account/entities/account-entity';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Admin } from './entity/admin-entity';
import { CreateAccountDto } from 'src/account/dto/create-account-dto';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';
import { Prisma } from '@prisma/client';
import { EnvVariables } from 'src/configurations/configuration.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvVariables>,
  ) {
    this.seedAdminAccount();
  }

  async create(createAccountDto: CreateAccountDto): Promise<{
    admin: Admin;
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

      const createdAccount = await this.prisma.account.create({
        data: {
          ...createAccountDto,
          password: hashedPassword,
        },
      });

      const createdAdmin = await this.prisma.admin.create({
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
        admin: createdAdmin,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async update(
    account_id: number,
    updateAdminDto: UpdateAccountDto,
  ): Promise<Admin> {
    try {
      const admin = await this.prisma.admin.findUnique({
        where: { account_id },
      });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      await this.prisma.account.update({
        where: { id: admin.account_id },
        data: { ...updateAdminDto },
      });

      const updatedAdmin = await this.prisma.admin.findUnique({
        where: { account_id },
        include: { account: true },
      });

      return updatedAdmin;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(account_id: number): Promise<Admin> {
    try {
      return await this.prisma.admin.findUnique({
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
    filter: Prisma.AdminWhereInput,
    page: number,
    pageSize: number,
    account: Account,
  ): Promise<Admin[]> {
    try {
      if (account.account_type !== 'admin') {
        throw new UnauthorizedException('Only admins can perform this action');
      }
      const admins = await prisma.admin.findMany({
        where: { ...filter },
        include: { account: true },
        ...(page && {
          skip: Number(pageSize) * (page - 1),
          take: Number(pageSize),
        }),
      });

      return admins;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async delete(account_id: number, account: Account): Promise<Admin> {
    try {
      if (account.account_type !== 'admin') {
        throw new UnauthorizedException('Only admins can perform this action');
      }

      const admin = await this.prisma.admin.findUnique({
        where: { account_id },
      });

      if (!admin) {
        throw new BadRequestException('Admin not found');
      }

      return await this.prisma.admin.delete({
        where: { account_id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error.message);
    }
  }

  async seedAdminAccount() {
    try {
      const adminEmail = this.configService.get('ADMIN_EMAIL');
      const adminPassword = this.configService.get('ADMIN_PASSWORD');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await this.prisma.$transaction(
        async (prisma) => {
          const existingAdmin = await prisma.account.findUnique({
            where: { email: adminEmail },
          });

          if (existingAdmin) {
            this.logger.log('Admin account already exists. Skipping seeding.');
            return;
          }

          const createdAccount = await prisma.account.create({
            data: {
              email: adminEmail,
              password: hashedPassword,
              first_name: 'Super',
              last_name: 'Admin',
              account_type: 'admin',
            },
          });

          await prisma.admin.create({
            data: {
              account_id: createdAccount.id,
            },
          });

          this.logger.log(
            `Admin account created successfully: ${createdAccount.email}`,
          );
        },
        { timeout: 1000000, maxWait: 1000000 },
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
