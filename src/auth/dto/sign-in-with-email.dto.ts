import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInWithEmailDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
