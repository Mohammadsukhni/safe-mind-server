import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BookAppointmentDto {
  @IsNumber()
  @ApiProperty()
  @IsNotEmpty()
  appointment_id: number;
}
