import { ApiProperty } from '@nestjs/swagger';
import { account_type } from '@prisma/client'; // Enum from Prisma
import { Exclude } from 'class-transformer';
import { Admin } from 'src/admin/entity/admin-entity';
import { Token } from 'src/auth/entities/token.entity';
import { Doctor } from 'src/doctor/entity/doctor.entity';
import { User } from 'src/user/entity/user.entity';

export class Account {
  @ApiProperty()
  id: number;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  @Exclude()
  password: string;

  @ApiProperty()
  dob: Date;

  @ApiProperty()
  reset_password: boolean;

  @ApiProperty()
  is_deleted: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty()
  account_type: account_type;

  @ApiProperty({ type: () => [Admin] })
  admins?: Admin[];

  @ApiProperty({ type: () => [Doctor] })
  Doctor?: Doctor[];

  @ApiProperty({ type: () => [User] })
  User?: User[];

  @ApiProperty({ type: () => [Token] })
  tokens?: Token[];
}
