import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpWithEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
