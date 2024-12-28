import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { CreateAccountDto } from 'src/account/dto/create-account-dto';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';
import { Admin } from './entity/admin-entity';
import { Prisma } from '@prisma/client';
import { filterConverter } from 'src/utils/helpers/filter.helper';
import { Response } from 'express';
import { CurrentAccount } from 'src/utils/decorators/account.decorator';
import { CustomAuthGuard } from 'src/utils/guards/auth.guard';
import { Account } from 'src/account/entities/account-entity';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';

@ApiTags('Admin Controller')
@Controller('admins')
@ApiHeaders()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create an admin',
    description: 'Creates a new admin in the system',
  })
  @ApiCreatedResponse({ type: Admin })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<{
    admin: Admin;
    access_token: string;
    refresh_token: string;
  }> {
    const { admin, access_token, refresh_token } =
      await this.adminService.create(createAccountDto);

    return { admin, access_token, refresh_token };
  }

  @Get(':account_id')
  @ApiOperation({
    summary: 'Get admin details',
    description: 'Fetches admin details by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Admin })
  async findOne(@Param('account_id') account_id: number): Promise<Admin> {
    return this.adminService.findOne(account_id);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Get()
  @ApiOperation({
    summary: 'Get Multiple Admins - Admin Controller',
  })
  @ApiCreatedResponse({ type: [Admin] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.AdminWhereInput & {
      page: number;
      pageSize: number;
    },
    @CurrentAccount() account: Account,
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.admin.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.adminService.findAll(
          prisma,
          filter,
          page,
          pageSize,
          account,
        );
      },
      {
        maxWait: 3000,
        timeout: 3000,
      },
    );
    res.send(data);
    return data;
  }

  @Patch(':account_id')
  @ApiOperation({
    summary: 'Update an admin',
    description: 'Updates the details of an existing admin',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Admin })
  async update(
    @Param('account_id') account_id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Admin> {
    return this.adminService.update(account_id, updateAccountDto);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Delete(':account_id')
  @ApiOperation({
    summary: 'Delete an admin',
    description: 'Deletes an existing admin by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Admin })
  async delete(
    @Param('account_id') account_id: number,
    @CurrentAccount() account: Account,
  ): Promise<Admin> {
    return this.adminService.delete(account_id, account);
  }
}
