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
  ApiResponse,
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entity/appointemnt-entity';
import { CreateAppointmentDto } from './dto/create-appointemnt-dto';
import { UpdateAppointmentDto } from './dto/update-appointemnt-dto';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { CustomAuthGuard } from 'src/utils/guards/auth.guard';
import { CurrentAccount } from 'src/utils/decorators/account.decorator';
import { Account } from 'src/account/entities/account-entity';
import { filterConverter } from 'src/utils/helpers/filter.helper';
import { ApiHeaders } from 'src/utils/decorators/header.decorator';
import { BookAppointmentDto } from './dto/book-appointement-dto';

@ApiTags('Appointment Controller')
@Controller('appointments')
@ApiHeaders()
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Post()
  @ApiOperation({
    summary: 'Create an appointment',
    description:
      'Creates a new appointment in the system for the logged-in doctor',
  })
  @ApiCreatedResponse({ type: Appointment })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @CurrentAccount() account: Account,
  ): Promise<Appointment> {
    return this.appointmentService.create(createAppointmentDto, account);
  }

  @Get('findAllForUser/:doctor_id')
  @ApiOperation({
    summary: 'Get multiple appointments for the same doctor',
    description: 'Fetches multiple appointments for the specified doctor ',
  })
  @ApiCreatedResponse({ type: [Appointment] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  @ApiParam({ name: 'doctor_id', type: Number })
  async findAllAppointmentForUser(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.AppointmentWhereInput & {
      page: number;
      pageSize: number;
    },
    @Param('doctor_id') doctor_id: number,
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.appointment.count({
            where: {
              ...filter,
              doctor_id,
            },
          })}`,
        );

        return this.appointmentService.findAllAppointmentsForUser(
          prisma,
          filter,
          page,
          pageSize,
          doctor_id,
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
  @Get('findAllForDoctors')
  @ApiOperation({
    summary: 'Get multiple appointments related to the same doctor',
    description:
      'Fetches multiple appointments associated with the same doctor',
  })
  @ApiCreatedResponse({ type: [Appointment] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAllDoctorAppointment(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.AppointmentWhereInput & {
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
          `${await prisma.appointment.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.appointmentService.findAllDoctorAppointment(
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get appointment details',
    description: 'Fetches appointment details by the appointment ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Appointment })
  async findOne(@Param('id') id: number): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get multiple appointments',
    description:
      'Fetches multiple appointments with optional filters and pagination',
  })
  @ApiCreatedResponse({ type: [Appointment] })
  @ApiQuery({ name: 'page', type: Number, example: '1' })
  @ApiQuery({ name: 'pageSize', type: Number, example: '10' })
  async findAll(
    @Res() res: Response,
    @Query()
    {
      page,
      pageSize,
      ...filter
    }: Prisma.AppointmentWhereInput & {
      page: number;
      pageSize: number;
    },
  ) {
    filter = filterConverter(filter);

    const data = await this.prismaService.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        res.set(
          'x-total-count',
          `${await prisma.appointment.count({
            where: {
              ...filter,
            },
          })}`,
        );

        return this.appointmentService.findAll(prisma, filter, page, pageSize);
      },
      {
        maxWait: 3000,
        timeout: 3000,
      },
    );
    res.send(data);
    return data;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an appointment',
    description: 'Updates the details of an existing appointment',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Appointment })
  async update(
    @Param('id') id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an appointment',
    description: 'Deletes an existing appointment by the appointment ID',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiCreatedResponse({ type: Appointment })
  async delete(@Param('id') id: number): Promise<void> {
    await this.appointmentService.remove(id);
  }

  @UseGuards(CustomAuthGuard)
  @ApiSecurity('bearer')
  @Post('book')
  @ApiOperation({
    summary: 'Book an appointment for the logged-in user',
    description:
      'Allows the logged-in user to book an appointment by providing the appointment ID.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Appointment booked successfully and confirmation emails sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or appointment already booked.',
  })
  async bookAppointment(
    @Body() bookAppointmentDto: BookAppointmentDto,
    @CurrentAccount() account: Account,
  ) {
    return await this.appointmentService.bookAppointment(
      bookAppointmentDto,
      account,
    );
  }
}
