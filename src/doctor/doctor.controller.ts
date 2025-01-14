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
import { DoctorService } from './doctor.service';
import { Doctor } from './entity/doctor.entity';
import { CreateAccountDto } from 'src/account/dto/create-account-dto';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { Prisma } from '@prisma/client';
import { filterConverter } from 'src/utils/helpers/filter.helper';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UpdateAccountDto } from 'src/account/dto/update-account-dto';
import { CustomAuthGuard } from 'src/utils/guards/auth.guard';
import { CurrentAccount } from 'src/utils/decorators/account.decorator';
import { Account } from 'src/account/entities/account-entity';

@ApiTags('Doctor Controller')
@Controller('doctors')
@ApiHeaders()
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Post()
  @ApiOperation({
    summary: 'Create a doctor',
    description: 'Creates a new doctor in the system',
  })
  @ApiCreatedResponse({ type: Doctor })
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentAccount() account: Account,
  ): Promise<{
    doctor: Doctor;
  }> {
    return await this.doctorService.create(createAccountDto, account);
  }

  @Get(':account_id')
  @ApiOperation({
    summary: 'Get doctor details',
    description: 'Fetches doctor details by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Doctor })
  async findOne(@Param('account_id') account_id: number): Promise<Doctor> {
    return this.doctorService.findOne(account_id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Multiple Doctors - Doctor Controller',
  })
  @ApiCreatedResponse({ type: [Doctor] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.DoctorWhereInput & {
      page: number;
      pageSize: number;
    },
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.doctor.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.doctorService.findAll(prisma, filter, page, pageSize);
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
    summary: 'Update a doctor',
    description: 'Updates the details of an existing doctor',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Doctor })
  async update(
    @Param('account_id') account_id: number,
    @Body() updateDoctorDto: UpdateAccountDto,
  ): Promise<Doctor> {
    return this.doctorService.update(account_id, updateDoctorDto);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Delete(':account_id')
  @ApiOperation({
    summary: 'Delete a doctor',
    description: 'Deletes an existing doctor by the associated account ID',
  })
  @ApiParam({ name: 'account_id', type: Number })
  @ApiCreatedResponse({ type: Doctor })
  async delete(
    @Param('account_id') account_id: number,
    @CurrentAccount() account: Account,
  ): Promise<Doctor> {
    return this.doctorService.delete(account_id, account);
  }
}
