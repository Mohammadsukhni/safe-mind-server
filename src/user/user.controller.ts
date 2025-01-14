import { PrismaService } from 'src/prisma.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { CreateAccountDto } from 'src/account/dto/create-account-dto';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { Prisma } from '@prisma/client';
import { filterConverter } from 'src/utils/helpers/filter.helper';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';

@ApiTags('User Controller')
@Controller('users')
@ApiHeaders()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'Creates a new user in the system',
  })
  @ApiCreatedResponse({ type: User })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<{
    user: User;
    access_token: string;
    refresh_token: string;
  }> {
    const { user, access_token, refresh_token } =
      await this.userService.create(createAccountDto);

    return { user, access_token, refresh_token };
  }

  @Get(':account_id')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Fetches user details by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: User })
  async findOne(@Param('account_id') account_id: number): Promise<User> {
    return this.userService.findOne(account_id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Multiple Users - User Controller',
  })
  @ApiCreatedResponse({ type: [User] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.UserWhereInput & {
      page: number;
      pageSize: number;
    },
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.user.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.userService.findAll(prisma, filter, page, pageSize);
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
    summary: 'Update a user',
    description: 'Updates the details of an existing user',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: User })
  async update(
    @Param('account_id') account_id: number,
    @Body() updateUserDto: UpdateAccountDto,
  ): Promise<User> {
    return this.userService.update(account_id, updateUserDto);
  }

  @Delete(':account_id')
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Deletes an existing user by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: User })
  async delete(@Param('account_id') account_id: number): Promise<User> {
    return this.userService.delete(account_id);
  }
}
