import { ApiProperty } from '@nestjs/swagger';
import { doctor_languages } from '@prisma/client';

export class DoctorProfile {
  @ApiProperty()
  id: number;

  @ApiProperty()
  experience_years?: number;

  @ApiProperty()
  bio?: string;

  @ApiProperty()
  qualifications?: string;

  @ApiProperty()
  languages: doctor_languages;

  @ApiProperty()
  is_deleted: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at?: Date;

  @ApiProperty()
  doctor_id: number;
}
