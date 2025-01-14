import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { token_type } from '@prisma/client';

export class Token {
  @ApiProperty()
  id: number;

  @ApiProperty()
  token_data?: string;

  @ApiProperty()
  expiry_date: Date;

  @ApiProperty()
  is_deleted: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at?: Date;

  @ApiProperty()
  account_id: number;

  @ApiProperty()
  related_token_id?: number;

  @ApiProperty()
  @IsEnum(token_type)
  token_type: token_type;
}
