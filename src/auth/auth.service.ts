import { ForbiddenException, Injectable, Res } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as argon from "argon2";
import { SignUpWithEmailDTO, SignInWithEmailDTO, SignUpWithPhoneNumberDTO } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RpcException } from "@nestjs/microservices";

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

  // Auth with Email
  async signUpWithEmail(signUpRequest: SignUpWithEmailDTO) {
    // generate has for the password
    const token = await argon.hash(signUpRequest.password);

    // create the user on DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: signUpRequest.email,
          accessToken: token
        },
      });

      return await this.signToken(user.id, user.email);
    } catch (exception) {
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case "P2002":
            throw new RpcException("Entry exists on the system")
          default:
            throw exception;
        }
      }
    }
  }

  async signInWithEmail(signInRequest: SignInWithEmailDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: signInRequest.email,
      },
    });

    if (!user) {
      throw new RpcException("User not found");
    }

    const passwordMatches = await argon.verify(user.accessToken, signInRequest.password);

    if (!passwordMatches) {
      throw new RpcException("Credential is incorrect");
    }

    return this.signToken(user.id, user.email);
  }

  // JWT token generator
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

  // Auth with Phone Number
  async signUpWithPhoneNumber(signUpRequest: SignUpWithPhoneNumberDTO){
    const token = await argon.hash(signUpRequest.phoneNumber);

    // create the user on DB
    try {
      const user = await this.prisma.user.create({
        data: {
          phoneNumber: signUpRequest.phoneNumber,
          accessToken: token
        },
      });

      return await this.signToken(user.id, user.phoneNumber);
    } catch (exception) {
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case "P2002":
            throw new RpcException("Entry exists on the system")
          default:
            throw exception;
        }
      }
    }
  }
}
