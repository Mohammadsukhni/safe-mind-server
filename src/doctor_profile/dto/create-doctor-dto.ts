import { ApiProperty } from '@nestjs/swagger';
import { doctor_languages } from '@prisma/client';
import { IsOptional, IsInt, IsString, IsEnum } from 'class-validator';

export class CreateDoctorProfileDto {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  experience_years?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  bio?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  qualifications?: string;

  @IsOptional()
  @IsEnum(doctor_languages)
  @ApiProperty({ enum: doctor_languages, example: 'arabic' })
  languages?: doctor_languages;
}
