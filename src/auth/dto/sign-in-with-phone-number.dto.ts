import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from "class-validator";

export class SignInWithPhoneNumberDTO {
  @IsMobilePhone()
  @IsNotEmpty()
  phoneNumber: string;
}
