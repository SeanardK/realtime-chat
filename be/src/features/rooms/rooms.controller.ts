import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateRoomDto) {
    return this.rooms.create(userId, dto);
  }

  @Get()
  list(@CurrentUser() userId: string) {
    return this.rooms.listForUser(userId);
  }

  @Post(':id/join')
  async join(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.rooms.join(id, userId);
    return { joined: true };
  }

  @Post(':id/leave')
  async leave(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.rooms.leave(id, userId);
    return { left: true };
  }
}
