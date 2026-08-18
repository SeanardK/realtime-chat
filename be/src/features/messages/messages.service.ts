import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RoomsService } from '../rooms/rooms.service';
import { Message } from './message.entity';

export interface HistoryPage {
  messages: Message[];
  nextCursor: string | null;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
    private readonly rooms: RoomsService,
  ) {}

  async send(
    roomId: string,
    senderId: string,
    body: string,
  ): Promise<Message> {
    await this.rooms.assertMember(roomId, senderId);
    return this.messages.save(
      this.messages.create({ roomId, senderId, body }),
    );
  }

  async history(
    roomId: string,
    userId: string,
    before: string | undefined,
    limit = 30,
  ): Promise<HistoryPage> {
    await this.rooms.assertMember(roomId, userId);
    const rows = await this.messages.find({
      where: {
        roomId,
        ...(before ? { createdAt: LessThan(new Date(before)) } : {}),
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    const nextCursor =
      rows.length === limit ? rows[rows.length - 1].createdAt.toISOString() : null;
    return { messages: rows, nextCursor };
  }

  async markRead(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    await this.rooms.assertMember(roomId, userId);
    await this.rooms.setLastRead(roomId, userId, messageId);
  }
}
