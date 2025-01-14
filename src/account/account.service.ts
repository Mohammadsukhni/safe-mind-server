import { UpdateAccountDto } from './dto/update-account-dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Account } from './entities/account-entity';
import { CreateAccountDto } from './dto/create-account-dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<{
    account: Account;
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);
      createAccountDto.password = hashedPassword;

      const account = await this.prisma.account.create({
        data: createAccountDto,
      });

      const tokens = await this.authService.generateAccessRefreshTokens(
        account.id,
        { email: account.email },
        this.prisma,
      );

      return {
        account,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<Account> {
    try {
      return await this.prisma.account.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<Account[]> {
    try {
      return await this.prisma.account.findMany();
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async update(
    id: number,
    UpdateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    try {
      return await this.prisma.account.update({
        where: { id },
        data: UpdateAccountDto,
      });
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async delete(id: number): Promise<Account> {
    try {
      return await this.prisma.account.update({
        where: { id },
        data: { is_deleted: true },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findByEmail(email: string): Promise<Account> {
    return this.prisma.account.findUnique({
      where: {
        email: email,
      },
    });
  }
}
