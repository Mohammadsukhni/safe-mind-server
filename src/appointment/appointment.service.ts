import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DoctorService } from 'src/doctor/doctor.service'; // assuming you have a DoctorService
import { CreateAppointmentDto } from './dto/create-appointemnt-dto';
import { Appointment } from './entity/appointemnt-entity';
import { UpdateAppointmentDto } from './dto/update-appointemnt-dto';
import { Prisma } from '@prisma/client';
import { Account } from 'src/account/entities/account-entity';
import { BookAppointmentDto } from './dto/book-appointement-dto';
import { SendEmailHelper } from 'src/utils/helpers/sending-email.helper';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly doctorService: DoctorService,
    private readonly sendEmailHelper: SendEmailHelper,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    account: Account,
  ): Promise<Appointment> {
    try {
      if (account.account_type !== 'doctor') {
        throw new BadRequestException('Only doctors can schedule appointments');
      }

      const doctor = await this.prismaService.doctor.findFirst({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      const appointment = await this.prismaService.appointment.create({
        data: {
          ...createAppointmentDto,
          doctor_id: doctor.id,
        },
      });

      return appointment;
    } catch (error) {
      this.logger.error('Error creating appointment', error);
      throw new BadRequestException(error);
    }
  }

  async findAll(
    prisma: Prisma.TransactionClient,
    filter: Prisma.AppointmentWhereInput,
    page: number,
    pageSize: number,
  ) {
    try {
      const appointments = await prisma.appointment.findMany({
        where: { ...filter, is_booked: false },
        include: {
          doctor: {
            include: {
              account: true,
            },
          },
        },
        ...(page && {
          skip: Number(pageSize) * (page - 1),
          take: Number(pageSize),
        }),
      });

      return appointments;
    } catch (error) {
      this.logger.error('Error fetching appointments', error);
      throw new BadRequestException(error);
    }
  }

  async findAllDoctorAppointment(
    prisma: Prisma.TransactionClient,
    filter: Prisma.AppointmentWhereInput,
    page: number,
    pageSize: number,
    account: Account,
  ) {
    try {
      const doctor = await this.prismaService.doctor.findFirst({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }
      const appointments = await prisma.appointment.findMany({
        where: {
          ...filter,
          doctor_id: doctor.id,
        },
        include: {
          doctor: {
            include: {
              account: true,
            },
          },
          patient: {
            include: {
              account: true,
            },
          },
        },
        skip: Number(pageSize) * (page - 1),
        take: Number(pageSize),
      });

      return appointments;
    } catch (error) {
      this.logger.error('Error fetching appointments', error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<Appointment> {
    try {
      const appointment = await this.prismaService.appointment.findUnique({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      return appointment;
    } catch (error) {
      this.logger.error(`Error fetching appointment with ID ${id}`, error);
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async findAllAppointmentsForUser(
    prisma: Prisma.TransactionClient,
    filter: Prisma.AppointmentWhereInput,
    page: number,
    pageSize: number,
    doctor_id: number,
  ) {
    const appointments = await prisma.appointment.findMany({
      where: { ...filter, is_booked: false, doctor_id: doctor_id },
      include: {
        doctor: {
          include: {
            account: true,
          },
        },
      },
      ...(page && {
        skip: Number(pageSize) * (page - 1),
        take: Number(pageSize),
      }),
    });

    return appointments;
  }
  catch(error) {
    this.logger.error('Error fetching appointments', error);
    throw new BadRequestException(error);
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    try {
      const appointment = await this.prismaService.appointment.update({
        where: { id },
        data: updateAppointmentDto,
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }

      return appointment;
    } catch (error) {
      this.logger.error(`Error updating appointment with ID ${id}`, error);
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      const appointment = await this.prismaService.appointment.delete({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error deleting appointment with ID ${id}`, error);
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }

  async bookAppointment(
    bookAppointmentDto: BookAppointmentDto,
    account: Account,
  ): Promise<{ message: string }> {
    try {
      const appointment = await this.prismaService.appointment.findUnique({
        where: { id: bookAppointmentDto.appointment_id },
        include: {
          doctor: {
            include: { account: true },
          },
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.user_id) {
        throw new BadRequestException('Appointment is already booked');
      }

      const user = await this.prismaService.user.findUnique({
        where: { account_id: account.id },
      });

      if (!user) {
        throw new BadRequestException('User account not found');
      }

      const updatedAppointment = await this.prismaService.appointment.update({
        where: { id: bookAppointmentDto.appointment_id },
        data: {
          user_id: user.id,
          is_booked: true,
        },
        include: {
          doctor: {
            include: { account: true },
          },
          patient: {
            include: { account: true },
          },
        },
      });

      const patientName = `${updatedAppointment.patient.account.first_name} ${updatedAppointment.patient.account.last_name}`;
      const patientEmail = updatedAppointment.patient.account.email;

      this.logger.log('user Date', patientName, patientEmail);

      const doctorName = `${updatedAppointment.doctor.account.first_name} ${updatedAppointment.doctor.account.last_name}`;
      const doctorEmail = updatedAppointment.doctor.account.email;

      await this.sendEmailHelper.sendEmail(
        updatedAppointment.patient.account.email,
        'appointment-booked',
        'Appointment Confirmation',
        {
          patientName,
          doctorName,
          doctorEmail,
        },
      );

      await this.sendEmailHelper.sendEmail(
        updatedAppointment.doctor.account.email,
        'appointment-invitation',
        'New Appointment Scheduled',
        {
          doctorName,
          patientName,
          patientEmail,
        },
      );

      return {
        message: 'Appointment booked successfully. Confirmation emails sent.',
      };
    } catch (error) {
      this.logger.error('Error booking appointment', error);
      throw new BadRequestException(
        error.message || 'Error booking appointment',
      );
    }
  }
}
