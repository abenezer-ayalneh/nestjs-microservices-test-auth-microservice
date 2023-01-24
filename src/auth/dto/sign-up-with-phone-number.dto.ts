import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from "class-validator";

export class SignUpWithPhoneNumberDTO {
  @IsMobilePhone()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  accessToken: string;
}