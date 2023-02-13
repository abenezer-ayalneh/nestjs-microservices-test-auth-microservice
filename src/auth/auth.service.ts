import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import * as firebase from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';
import {
  SignInWithEmailDTO,
  SignUpWithEmailDTO,
  SignUpWithPhoneNumberDTO,
} from './dto';

@Injectable({})
export class AuthService {
  private firebaseApp: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {
    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: config.get('PROJECT_ID'),
        privateKey: config.get('PRIVATE_KEY'),
        clientEmail: config.get('CLIENT_EMAIL'),
      }),
    });
  }

  // Auth with Email
  async signUpWithEmail(signUpRequest: SignUpWithEmailDTO) {
    // generate has for the password
    const token = await argon.hash(signUpRequest.password);

    // create the user on DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: signUpRequest.email,
          accessToken: token,
        },
      });

      return await this.signToken({
        sub: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } catch (exception) {
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case 'P2002':
            throw new RpcException({
              message: 'Entry exists on the system. Try signing in',
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            });
          default:
            throw new RpcException({
              message: exception.message,
              statusCode: 400,
            });
        }
      } else {
        throw new RpcException({
          message: exception.message,
          statusCode: 400,
        });
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
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const passwordMatches = await argon.verify(
      user.accessToken,
      signInRequest.password
    );

    if (!passwordMatches) {
      throw new RpcException({
        message: 'Credential is incorrect',
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    return this.signToken({
      sub: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  }

  // JWT token generator
  async signToken(payload: {
    sub: number;
    email: string;
    phoneNumber: string;
  }): Promise<{ accessToken: string }> {
    const token = await this.jwt.signAsync(payload, {
      expiresIn: `${this.config.get('JWT_TTL')}m`,
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      accessToken: token,
    };
  }

  // Auth with Phone Number
  async signUpWithPhoneNumber(signUpRequest: SignUpWithPhoneNumberDTO) {
    let tokenVerificationResult: any;
    let token: string;

    try {
      tokenVerificationResult = await this.firebaseApp
        .auth()
        .verifyIdToken(signUpRequest.accessToken);

      token = await argon.hash(tokenVerificationResult.user_id);

      const user = await this.prisma.user.create({
        data: {
          accessToken: token,
        },
      });

      return await this.signToken({
        sub: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // TODO sign the user in rather than creating a new user
            const user = await this.prisma.user.update({
              where: {
                phoneNumber: tokenVerificationResult.phone_number,
              },
              data: {
                updatedAt: new Date(),
              },
            });

            return await this.signToken({
              sub: user.id,
              email: user.email,
              phoneNumber: user.phoneNumber,
            });
          default:
            throw error;
        }
      } else {
        throw new RpcException({
          message: error.message,
          statusCode: 400,
        });
      }
    }
  }
}
