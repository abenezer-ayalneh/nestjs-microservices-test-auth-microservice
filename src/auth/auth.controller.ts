import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto";
import { SignInDto } from "./dto/sign-in.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signUp(@Body() signUpRequest: SignUpDto) {
    return this.authService.signUp(signUpRequest);
  }

  @HttpCode(HttpStatus.OK)
  @Post("signin")
  signIn(@Body() signInRequest: SignInDto) {
    return this.authService.signIn(signInRequest);
  }
}
