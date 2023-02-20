import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpWithEmailDTO {
  @IsEmail({}, { message: 'validation.EMAIL_SHOULD_BE_VALID' })
  @IsNotEmpty({ message: 'validation.EMAIL_SHOULD_NOT_BE_EMPTY' })
  email: string;

  @IsString({ message: 'validation.PASSWORD_SHOULD_BE_STRING' })
  @IsNotEmpty({ message: 'validation.PASSWORD_SHOULD_NOT_BE_EMPTY' })
  password: string;
}

export class SignInWithEmailDTO {
  @IsEmail({}, { message: 'validation.EMAIL_SHOULD_BE_VALID' })
  @IsNotEmpty({ message: 'validation.EMAIL_SHOULD_NOT_BE_EMPTY' })
  email: string;

  @IsString({ message: 'validation.PASSWORD_SHOULD_BE_STRING' })
  @IsNotEmpty({ message: 'validation.PASSWORD_SHOULD_NOT_BE_EMPTY' })
  password: string;
}
