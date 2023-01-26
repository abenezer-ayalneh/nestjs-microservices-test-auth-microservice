import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';

@Controller()
export class UserController {
  // @UseGuards(JwtGuard)
  @MessagePattern({ cmd: 'me' })
  // me() {
  //     return new RpcException("This is an RCP exception");
  // }
  me(@GetUser() user: User) {
    return user;
  }
}
