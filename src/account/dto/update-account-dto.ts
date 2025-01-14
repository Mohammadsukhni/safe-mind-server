import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  first_name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsPhoneNumber(null)
  @ApiProperty()
  phone_number?: string;
}
