import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return errors.map((error) => {
          throw new RpcException({
            message: error.constraints
              ? Object.values(error.constraints)[0]
              : null,
            code: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: error.constraints ? Object.values(error.constraints) : null,
          });
        });
      },
    })
  );
  app.listen();
}
bootstrap();
