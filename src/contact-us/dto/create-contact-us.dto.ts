import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { contact_us_type } from '@prisma/client';

export class CreateContactUsDto {
  @IsString()
  @ApiProperty()
  message: string;

  @IsEnum(contact_us_type)
  @ApiProperty({ enum: contact_us_type, example: 'general' })
  type: contact_us_type;
}
