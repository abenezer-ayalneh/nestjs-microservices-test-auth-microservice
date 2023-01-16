import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guards';

@Controller('users')
export class UserController {
    @UseGuards(JwtGuard)
    @Get('me')
    me(@GetUser() user: User) {
        return user;
    }
}
