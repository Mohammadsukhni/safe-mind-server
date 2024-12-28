import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsDate,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Doctor } from 'src/doctor/entity/doctor.entity';
import { User } from 'src/user/entity/user.entity';

export class Appointment {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsBoolean()
  is_deleted: boolean;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty()
  @IsInt()
  doctor_id: number;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiProperty()
  doctor?: Doctor;

  @ApiProperty()
  patient?: User;
}
