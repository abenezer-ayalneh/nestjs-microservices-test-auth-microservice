import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import {
  SignUpWithEmailDTO,
  SignInWithEmailDTO,
  SignUpWithPhoneNumberDTO,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import * as firebase from 'firebase-admin';
import * as serviceAccount from './firebaseServiceAccount.json';

const firebase_params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url,
};

@Injectable({})
export class AuthService {
  private firebaseApp: any;
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.firebaseApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebase_params),
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
      });
    } catch (exception) {
      if (exception instanceof PrismaClientKnownRequestError) {
        switch (exception.code) {
          case 'P2002':
            throw new RpcException('Entry exists on the system');
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
      throw new RpcException('User not found');
    }

    const passwordMatches = await argon.verify(
      user.accessToken,
      signInRequest.password,
    );

    if (!passwordMatches) {
      throw new RpcException('Credential is incorrect');
    }

    return this.signToken({
      sub: user.id,
      email: user.email,
    });
  }

  // JWT token generator
  async signToken(payload: {}): Promise<{ accessToken: string }> {
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
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
          phoneNumber: signUpRequest.phoneNumber,
          accessToken: token,
        },
      });

      return await this.signToken({
        sub: user.id,
        phoneNumber: user.phoneNumber,
      });
    } catch (error) {
      console.error({ verifyIdTokenError: error });
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            // TODO sign the user in rather than creating a new user
            const user = await this.prisma.user.update({
              where: {
                phoneNumber: signUpRequest.phoneNumber,
              },
              data: {
                updatedAt: new Date(),
              },
            });

            return await this.signToken({
              sub: user.id,
              phoneNumber: user.phoneNumber,
            });
          default:
            throw error;
        }
      }
    }
  }
}
