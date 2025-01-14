import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { DoctorProfileService } from './doctor_profile.service';
import { DoctorProfile } from './entity/doctor-profile.entity';
import { CreateDoctorProfileDto } from './dto/create-doctor-dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-dto';
import { CustomAuthGuard } from 'src/utils/guards/auth.guard';
import { CurrentAccount } from 'src/utils/decorators/account.decorator';
import { Account } from 'src/account/entities/account-entity';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { PrismaService } from 'src/prisma.service';
import { filterConverter } from 'src/utils/helpers/filter.helper';

@ApiTags('DoctorProfile Controller')
@Controller('doctor-profiles')
@ApiHeaders()
export class DoctorProfileController {
  constructor(
    private readonly doctorProfileService: DoctorProfileService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Post()
  @ApiOperation({
    summary: 'Create a doctor profile',
    description: 'Creates a new doctor profile in the system',
  })
  @ApiCreatedResponse({ type: DoctorProfile })
  async create(
    @Body() createDoctorProfileDto: CreateDoctorProfileDto,
    @CurrentAccount() account: Account,
  ): Promise<DoctorProfile> {
    return this.doctorProfileService.create(createDoctorProfileDto, account);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Get('your_profile')
  @ApiOperation({
    summary: 'Get doctor profile details',
    description: 'Fetches doctor profile details by the associated doctor ID',
  })
  @ApiCreatedResponse({ type: DoctorProfile })
  async findOne(@CurrentAccount() account: Account): Promise<DoctorProfile> {
    return this.doctorProfileService.findOne(account);
  }

  @Get()
  @ApiOperation({
    summary: 'Get Multiple Doctors profiles - Doctor Controller',
  })
  @ApiCreatedResponse({ type: [DoctorProfile] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.doctor_profileWhereInput & {
      page: number;
      pageSize: number;
    },
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.doctor_profile.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.doctorProfileService.findAll(
          prisma,
          filter,
          page,
          pageSize,
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

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Patch('your_profile')
  @ApiOperation({
    summary: 'Update a doctor profile',
    description: 'Updates the details of an existing doctor profile',
  })
  @ApiCreatedResponse({ type: DoctorProfile })
  async update(
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
    @CurrentAccount() account: Account,
  ): Promise<DoctorProfile> {
    return this.doctorProfileService.update(updateDoctorProfileDto, account);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Delete('your_profile')
  @ApiOperation({
    summary: 'Delete a doctor profile',
    description:
      'Deletes an existing doctor profile by the associated doctor ID',
  })
  @ApiCreatedResponse({ type: DoctorProfile })
  async delete(@CurrentAccount() account: Account): Promise<DoctorProfile> {
    return this.doctorProfileService.delete(account);
  }
}
