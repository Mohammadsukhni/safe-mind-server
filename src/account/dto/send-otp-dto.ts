import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}
