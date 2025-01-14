import { token_type } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  IsString,
} from 'class-validator';

export class CreateTokenDto {
  @IsOptional()
  @IsString()
  token_data?: string;

  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @IsNotEmpty()
  @IsEnum(token_type)
  token_type: token_type;

  @IsNotEmpty()
  @IsDate()
  expiry_date: Date;

  @IsOptional()
  @IsNumber()
  related_token_id?: number;
}
