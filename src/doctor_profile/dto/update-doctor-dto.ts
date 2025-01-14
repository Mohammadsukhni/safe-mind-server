import { PartialType } from '@nestjs/swagger';
import { CreateDoctorProfileDto } from './create-doctor-dto';

export class UpdateDoctorProfileDto extends PartialType(
  CreateDoctorProfileDto,
) {}
