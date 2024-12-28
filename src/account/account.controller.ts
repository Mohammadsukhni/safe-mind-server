import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account-dto';
import { UpdateAccountDto } from './dto/update-account-dto';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { AuthService } from 'src/auth/auth.service';
import { SendOtpDto } from './dto/send-otp-dto';
import { VerifyOtpDto } from './dto/verify-otp-dto';
import { Account } from './entities/account-entity';
import { LoginDto } from './dto/login-dto';
import { ResetPasswordDto } from './dto/reset-password-dto';

@ApiTags('Account Controller')
@Controller('accounts')
@ApiHeaders()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an account',
    description:
      'Creates a new account in the system and returns the account along with access and refresh tokens',
  })
  @ApiCreatedResponse({
    description: 'The account has been successfully created.',
    type: Account,
  })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<{
    account: Account;
    access_token: string;
    refresh_token: string;
  }> {
    const { account, access_token, refresh_token } =
      await this.accountService.create(createAccountDto);

    return { account, access_token, refresh_token };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get account details',
    description: 'Fetches account details by the provided ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Account })
  async findOne(@Param('id') id: number): Promise<Account> {
    return this.accountService.findOne(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all accounts',
    description: 'Fetches all accounts from the system',
  })
  @ApiCreatedResponse({ type: Account, isArray: true })
  async findAll(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an account',
    description: 'Updates the details of an existing account',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Account })
  async update(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an account',
    description: 'Deletes an existing account by the provided ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Account })
  async delete(@Param('id') id: number): Promise<Account> {
    return this.accountService.delete(id);
  }

  @Post('re-send-otp')
  @ApiOperation({
    summary: 'Re-send OTP for account',
    description: 'Sends a new OTP to the given email for account verification',
  })
  @ApiCreatedResponse({ type: String })
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<string> {
    await this.authService.sendOTP(sendOtpDto.email);
    return 'OTP has been sent successfully.';
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password flow',
    description:
      'Sends an OTP for password recovery to the given email address',
  })
  @ApiCreatedResponse({ type: String })
  async forgotPassword(@Body() sendOtpDto: SendOtpDto): Promise<string> {
    await this.authService.forgotPassword(sendOtpDto);
    return 'OTP has been sent for password recovery.';
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP for password recovery',
    description: 'Verifies the OTP entered for password recovery',
  })
  @ApiCreatedResponse({
    description: 'Access token and refresh token generated upon success',
    type: Object,
  })
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.verifyOTP(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Account login',
  })
  @ApiCreatedResponse({
    description: 'Access token and refresh token generated upon success',
    type: Object,
  })
  async login(@Body() loginDto: LoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    account: Account;
  }> {
    const { email, password } = loginDto;

    const { access_token, refresh_token, account } =
      await this.authService.login({
        email,
        password,
      });

    return {
      access_token,
      refresh_token,
      account,
    };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'reset password',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    return this.authService.resetPassword(
      resetPasswordDto.new_password,
      resetPasswordDto.token_id,
    );
  }
}
