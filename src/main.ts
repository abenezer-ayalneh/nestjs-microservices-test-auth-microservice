import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      port: 3001
    }
  })
  
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => {
      return new RpcException(errors);
    }
  }))
  app.listen()
}
bootstrap();