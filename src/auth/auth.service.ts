import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { SignUpDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

  async signUp(signUpRequest: SignUpDto) {
    // generate has for the password
    const hash = await argon.hash(signUpRequest.password);

    // create the user on DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: signUpRequest.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (exception) {
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case "P2002":
            throw new ForbiddenException("Credential taken");
          default:
            throw exception;
        }
      }
    }
  }

  async signIn(signInRequest: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: signInRequest.email,
      },
    });

    if (!user) {
      throw new ForbiddenException("Credentials incorrect");
    }

    const passwordMatches = await argon.verify(user.hash, signInRequest.password);

    if (!passwordMatches) {
      throw new ForbiddenException("Credentials incorrect");
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(userID: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userID,
      email
    }

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get("JWT_SECRET")
    })

    return {
      access_token: token
    }
  }
}
