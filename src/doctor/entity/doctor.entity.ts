import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/entities/account-entity';

export class Doctor {
  @ApiProperty()
  id: number;

  @ApiProperty()
  account_id: number;

  @ApiProperty({
    type: () => Account,
    nullable: true,
  })
  account?: Account;
}
