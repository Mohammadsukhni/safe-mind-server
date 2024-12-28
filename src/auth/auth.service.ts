import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'src/account/account.service';
import { PrismaService } from 'src/prisma.service';
import { CreateTokenDto } from './dto/create-token-dto';
import { PrismaClient, token_type } from '@prisma/client';
import { UpdateTokenDto } from './dto/update-token-dto';
import * as dayjs from 'dayjs';
import { Token } from './entities/token.entity';
import { Account } from 'src/account/entities/account-entity';
import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';
import * as moment from 'moment';
import { SendOtpDto } from 'src/account/dto/send-otp-dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from 'src/account/dto/login-dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly sendEmailHelper: SendEmailHelper,
  ) {}

  async create(
    createTokenDto: CreateTokenDto,
    prisma: PrismaClient,
  ): Promise<Token> {
    try {
      const token = await prisma.token.create({
        data: { ...createTokenDto },
      });

      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async update(
    updateTokenDto: UpdateTokenDto,
    prisma: PrismaClient,
  ): Promise<boolean> {
    try {
      const { access_token, refresh_token } = updateTokenDto;

      if (access_token) {
        await prisma.token.updateMany({
          where: { token_data: access_token },
          data: {
            token_data: access_token, // Make sure this is updated with the new JWT
          },
        });
      }

      if (refresh_token) {
        await prisma.token.updateMany({
          where: { token_data: refresh_token },
          data: {
            token_data: refresh_token, // Same as above
          },
        });
      }

      return true;
    } catch (error) {
      this.logger.error('Error updating token', error);
      throw new BadRequestException('Failed to update token');
    }
  }

  async generateAccessRefreshTokens(
    account_id: number,
    payload: { email: string },
    prisma: PrismaClient,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const tokens = await this.generateAccessRefreshTokensDocuments(
        account_id,
        prisma,
      );

      const signedAccessToken = this.JWTSign(
        { token_id: tokens.access_token.id, ...payload },
        '24h',
      );

      const signedRefreshToken = this.JWTSign(
        { token_id: tokens.refresh_token.id, ...payload },
        '30d',
      );

      await this.update(
        {
          access_token: signedAccessToken,
          refresh_token: signedRefreshToken,
        },
        prisma,
      );

      return {
        access_token: signedAccessToken,
        refresh_token: signedRefreshToken,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async generateAccessRefreshTokensDocuments(
    account_id: number,
    prisma: PrismaClient,
  ): Promise<{ access_token: Token; refresh_token: Token }> {
    try {
      const accessTokenString = this.JWTSign({ account_id }, '24h');
      const accessToken = await this.create(
        {
          account_id,
          token_data: accessTokenString,
          expiry_date: dayjs().add(10, 'm').toDate(),
          token_type: token_type.access,
        },
        prisma,
      );

      const refreshTokenString = this.JWTSign({ account_id }, '30d');
      const refreshToken = await this.create(
        {
          account_id,
          related_token_id: accessToken.id,
          token_data: refreshTokenString,
          expiry_date: dayjs().add(30, 'd').toDate(),
          token_type: token_type.refresh,
        },
        prisma,
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async validateAccessRefreshToken(payload: {
    email: string;
    token_id: number;
  }): Promise<boolean | Account> {
    try {
      return this.prismaService.$transaction(
        async (prisma) => {
          const token = await prisma.token.findUnique({
            where: {
              id: payload.token_id,
            },
          });

          if (!token || !token.account_id) return false;

          if (dayjs(token.expiry_date).diff(dayjs(), 'm') <= 2) {
            this.logger.log(
              `${token.token_type} Token has been validated successfully`,
            );
          }

          const account = await this.accountService.findOne(token.account_id);

          return account || false;
        },
        { timeout: 10000, maxWait: 5000 },
      );
    } catch (error) {
      this.logger.error('Error validating token', error);
      throw new BadRequestException('Failed to validate token');
    }
  }

  JWTSign(
    payload: { email?: string; token_id?: number; account_id?: number },
    expiry: string,
  ): string {
    try {
      const token = this.jwtService.sign(
        {
          ...payload,
          email: payload.email ? payload.email.toLocaleLowerCase() : undefined,
        },
        { expiresIn: expiry },
      );
      this.logger.log('Token has been signed successfully');
      return token;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  generateOTP(): string {
    try {
      return (Math.floor(Math.random() * 9000) + 1000).toString();
    } catch (error) {
      this.logger.error(error);

      throw new BadRequestException(error);
    }
  }

  async login(loginDto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    account: Account;
  }> {
    try {
      const account = await this.accountService.findByEmail(loginDto?.email);

      if (!account) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        account.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateAccessRefreshTokens(
        account.id,
        { email: account.email },
        this.prismaService,
      );

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        account,
      };
    } catch (error) {
      this.logger.error('Error during login', error);
      throw new BadRequestException('Login failed');
    }
  }

  async sendOTP(email: string): Promise<boolean> {
    try {
      const account: Account = await this.accountService.findByEmail(email);

      if (!account) {
        this.logger.warn(`Account with email ${email} not found`);
        throw new BadRequestException('Account does not exist');
      }

      const otp = this.generateOTP();

      const emailSent = await this.sendEmailHelper.sendEmail(
        email,
        'code',
        'OTP Verification',
        { otp },
      );

      if (!emailSent) {
        this.logger.error(`Failed to send OTP email to ${email}`);
        throw new BadRequestException('Failed to send OTP email');
      }

      this.logger.log(`OTP sent to ${email} successfully`);

      const tokenData = {
        token_data: otp,
        expiry_date: moment().add(10, 'minutes').toDate(),
        account_id: account.id,
        token_type: token_type.otp,
      };

      await this.prismaService.token.create({
        data: tokenData,
      });

      this.logger.log(`OTP for ${email} saved successfully in token table`);

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async forgotPassword(sendOtpDto: SendOtpDto): Promise<boolean> {
    try {
      const otpSent = await this.sendOTP(sendOtpDto.email);

      if (!otpSent) {
        this.logger.error(
          `Failed to send OTP for forgot password to ${sendOtpDto.email}`,
        );
        throw new BadRequestException('Failed to send OTP for forgot password');
      }

      this.logger.log(`OTP sent for forgot password to ${sendOtpDto.email}`);
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<{
    token_id: number;
    access_token: string;
    refresh_token: string;
  }> {
    try {
      const account = await this.accountService.findByEmail(email);
      if (!account) {
        this.logger.warn(`Account with email ${email} not found`);
        throw new BadRequestException('Account does not exist');
      }

      const token = await this.prismaService.token.findFirst({
        where: {
          token_data: otp,
          token_type: token_type.otp,
          account_id: account.id,
          expiry_date: { gte: moment().toDate() },
        },
      });

      if (!token) {
        this.logger.warn(`Invalid or expired OTP for email ${email}`);
        throw new BadRequestException('Invalid or expired OTP');
      }

      this.logger.log(`OTP verified for email ${email}`);

      const tokens = await this.generateAccessRefreshTokens(
        account.id,
        { email },
        this.prismaService,
      );

      // Mark the OTP as used
      await this.prismaService.token.update({
        where: { id: token.id },
        data: { is_deleted: true },
      });

      this.logger.log(`Access and refresh tokens generated for email ${email}`);

      return {
        token_id: token.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async resetPassword(
    new_password: string,
    token_id: number,
  ): Promise<boolean> {
    try {
      const token = await this.prismaService.token.findUnique({
        where: { id: token_id },
      });

      if (!token || !token.account_id) {
        this.logger.warn('Invalid token or account not found');
        throw new BadRequestException('Invalid token');
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);

      await this.prismaService.account.update({
        where: { id: token.account_id },
        data: { password: hashedPassword },
      });

      this.logger.log(
        `Password reset successfully for account ID ${token.account_id}`,
      );

      await this.prismaService.token.update({
        where: { id: token_id },
        data: { is_deleted: true },
      });

      return true;
    } catch (error) {
      this.logger.error('Error resetting password', error);
      throw new BadRequestException('Failed to reset password');
    }
  }
}
