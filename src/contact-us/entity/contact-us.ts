import { ApiProperty } from '@nestjs/swagger';
import { contact_us_type } from '@prisma/client';

export class contact_us {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone_number?: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  type: contact_us_type;

  @ApiProperty()
  is_deleted: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at?: Date;
}
