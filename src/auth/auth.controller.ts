import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto";
import { SignInDto } from "./dto/sign-in.dto";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) { }

  @MessagePattern({ cmd: "userSignUp" })
  async signUp(signUpRequest: SignUpDto) {
    return this.authService.signUp(signUpRequest);
  }

  // @HttpCode(HttpStatus.OK)
  // @Post("signin")
  // signIn(@Body() signInRequest: SignInDto) {
  //   return this.authService.signIn(signInRequest);
  // }
}
