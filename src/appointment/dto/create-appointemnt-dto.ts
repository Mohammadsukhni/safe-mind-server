import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsDate } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsDate()
  @ApiProperty()
  @Type(() => Date)
  date: Date;

  @IsString()
  @ApiProperty()
  price: string;
}
