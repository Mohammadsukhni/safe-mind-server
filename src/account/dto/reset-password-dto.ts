import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ValidationPassword } from 'src/utils/helpers/validitoion-password.helper';

export class ResetPasswordDto {
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
  new_password: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  token_id: number;
}
