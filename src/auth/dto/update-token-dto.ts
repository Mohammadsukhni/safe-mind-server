import { IsOptional, IsString } from 'class-validator';

export class UpdateTokenDto {
  @IsOptional()
  @IsString()
  access_token?: string;

  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsString()
  temp_token?: string;
}
