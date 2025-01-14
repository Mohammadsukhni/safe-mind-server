import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointemnt-dto';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
