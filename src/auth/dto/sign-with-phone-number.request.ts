import { IsNotEmpty } from 'class-validator';

export class SignUpWithPhoneNumberDTO {
  @IsNotEmpty()
  accessToken: string;
}
