import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  SignInWithEmailDTO,
  SignUpWithEmailDTO,
  SignUpWithPhoneNumberDTO,
} from './dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  // Auth with Email
  // @UseFilters(new CustomRpcExceptionFilter())
  @MessagePattern({ cmd: 'userSignUpWithEmail' })
  signUpWithEmail(signUpRequest: SignUpWithEmailDTO) {
    return this.authService.signUpWithEmail(signUpRequest);
  }

  @MessagePattern({ cmd: 'userSignInWithEmail' })
  signInWithEmail(signInRequest: SignInWithEmailDTO) {
    return this.authService.signInWithEmail(signInRequest);
  }

  // Auth with Phone Number
  @MessagePattern({ cmd: 'userSignUpWithPhoneNumber' })
  signUpWithPhoneNumber(signUpRequest: SignUpWithPhoneNumberDTO) {
    return this.authService.signUpWithPhoneNumber(signUpRequest);
  }

  // @MessagePattern({ cmd: "userSignInWithPhoneNumber" })
  // signInWithPhoneNumber(signInRequest: SignInDto) {
  //   return this.authService.signIn(signInRequest);
  // }
}
