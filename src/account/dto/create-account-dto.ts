import { ApiProperty } from '@nestjs/swagger';
import { account_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDate,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';
import { ValidationPassword } from 'src/utils/helpers/validitoion-password.helper';

export class CreateAccountDto {
  @IsString()
  @ApiProperty()
  first_name: string;

  @IsString()
  @ApiProperty()
  last_name: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  phone_number?: string;

  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  @Matches(ValidationPassword.uppercase.rgx, {
    message: ValidationPassword.uppercase.message,
  })
  @Matches(ValidationPassword.lowercase.rgx, {
    message: ValidationPassword.lowercase.message,
  })
  @Matches(ValidationPassword.number.rgx, {
    message: ValidationPassword.number.message,
  })
  @Matches(ValidationPassword.specialSymbol.rgx, {
    message: ValidationPassword.specialSymbol.message,
  })
  @IsString()
  @ApiProperty()
  password: string;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  @Type(() => Date)
  dob?: Date;

  @IsEnum(account_type)
  @ApiProperty({ enum: account_type, example: 'user' })
  account_type: account_type;
}
