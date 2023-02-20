import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
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
  @GrpcMethod('AuthGrpcService', 'SignUpWithEmail')
  signUpWithEmail(signUpRequest: SignUpWithEmailDTO) {
    return this.authService.signUpWithEmail(signUpRequest);
  }

  @GrpcMethod('AuthGrpcService', 'SignInWithEmail')
  signInWithEmail(signInRequest: SignInWithEmailDTO) {
    return this.authService.signInWithEmail(signInRequest);
  }

  // Auth with Phone Number
  // @GrpcMethod('AuthGrpcService', 'SignUpWithPhoneNumber')
  // signUpWithPhoneNumber(signUpRequest: SignUpWithPhoneNumberDTO) {
  //   return this.authService.signUpWithPhoneNumber(signUpRequest);
  // }
}
