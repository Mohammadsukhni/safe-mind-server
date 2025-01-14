import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DoctorProfile } from './entity/doctor-profile.entity';
import { CreateDoctorProfileDto } from './dto/create-doctor-dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-dto';
import { Account } from 'src/account/entities/account-entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorProfileService {
  private readonly logger = new Logger(DoctorProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDoctorProfileDto: CreateDoctorProfileDto,
    account: Account,
  ): Promise<DoctorProfile> {
    try {
      if (account.account_type !== 'doctor') {
        throw new UnauthorizedException(
          'Only doctors can create their profiles',
        );
      }

      const doctor = await this.prisma.doctor.findUnique({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new BadRequestException(
          'Doctor not found for the current account',
        );
      }

      const existingProfile = await this.prisma.doctor_profile.findFirst({
        where: { doctor_id: doctor.id },
      });

      if (existingProfile) {
        throw new BadRequestException('Doctor profile already exists');
      }

      const createdProfile = await this.prisma.doctor_profile.create({
        data: {
          ...createDoctorProfileDto,
          doctor_id: doctor.id,
        },
      });

      return createdProfile;
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async update(
    updateDoctorProfileDto: UpdateDoctorProfileDto,
    account: Account,
  ): Promise<DoctorProfile> {
    try {
      if (account.account_type !== 'doctor') {
        throw new UnauthorizedException(
          'Only doctors can update their profiles',
        );
      }

      const doctor = await this.prisma.doctor.findUnique({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new BadRequestException(
          'Doctor not found for the current account',
        );
      }

      const existingProfile = await this.prisma.doctor_profile.findFirst({
        where: { doctor_id: doctor.id },
      });

      if (!existingProfile) {
        throw new BadRequestException('Doctor profile does not exist');
      }

      const updatedProfile = await this.prisma.doctor_profile.update({
        where: { id: existingProfile.id },
        data: {
          ...updateDoctorProfileDto,
        },
      });

      return updatedProfile;
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(account: Account): Promise<DoctorProfile> {
    try {
      if (account.account_type !== 'doctor') {
        throw new UnauthorizedException('Only doctors can view their profiles');
      }

      const doctor = await this.prisma.doctor.findUnique({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new BadRequestException(
          'Doctor not found for the current account',
        );
      }

      const profile = await this.prisma.doctor_profile.findFirst({
        where: { doctor_id: doctor.id },
      });

      if (!profile) {
        throw new BadRequestException('Doctor profile does not exist');
      }

      return profile;
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(
    prisma: Prisma.TransactionClient,
    filter: Prisma.doctor_profileWhereInput,
    page: number,
    pageSize: number,
  ) {
    try {
      const doctor_profiles = await prisma.doctor_profile.findMany({
        where: { ...filter },
        include: {
          doctor: true,
        },
        ...(page && {
          ...(page && {
            skip: Number(pageSize) * (page - 1),
            take: Number(pageSize),
          }),
        }),
      });

      return doctor_profiles;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async delete(account: Account): Promise<DoctorProfile> {
    try {
      if (account.account_type !== 'doctor') {
        throw new UnauthorizedException(
          'Only doctors can delete their profiles',
        );
      }

      const doctor = await this.prisma.doctor.findUnique({
        where: { account_id: account.id },
      });

      if (!doctor) {
        throw new BadRequestException(
          'Doctor not found for the current account',
        );
      }

      const profile = await this.prisma.doctor_profile.findFirst({
        where: { doctor_id: doctor.id },
      });

      if (!profile) {
        throw new BadRequestException('Doctor profile does not exist');
      }

      return await this.prisma.doctor_profile.delete({
        where: { id: profile.id },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }
  }
}
