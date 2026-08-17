import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { ReadReceiptDto } from './dto/read-receipt.dto';

@Controller('rooms/:roomId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Post()
  send(
    @CurrentUser() userId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.send(roomId, userId, dto.body);
  }

  @Get()
  history(
    @CurrentUser() userId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.messages.history(roomId, userId, query.before, query.limit);
  }

  @Post('read')
  async read(
    @CurrentUser() userId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() dto: ReadReceiptDto,
  ) {
    await this.messages.markRead(roomId, userId, dto.messageId);
    return { read: true };
  }
}
