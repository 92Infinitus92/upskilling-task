import { IsNotEmpty, IsString } from 'class-validator';

export class SiweDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
