import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // To be able to use the '.env' file
      isGlobal: true, // To make it available to all modules (globally)
    }),
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
