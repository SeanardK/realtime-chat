import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomMember } from './room-member.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly rooms: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly members: Repository<RoomMember>,
  ) {}

  async create(
    creatorId: string,
    data: { name?: string; isDirect: boolean; memberIds: string[] },
  ): Promise<Room> {
    const memberIds = Array.from(new Set([creatorId, ...data.memberIds]));
    if (data.isDirect && memberIds.length !== 2) {
      throw new BadRequestException('A direct room needs exactly two members');
    }

    const room = await this.rooms.save(
      this.rooms.create({
        name: data.isDirect ? null : data.name ?? null,
        isDirect: data.isDirect,
        createdBy: creatorId,
      }),
    );

    await this.members.save(
      memberIds.map((userId) =>
        this.members.create({ roomId: room.id, userId }),
      ),
    );

    return room;
  }

  async join(roomId: string, userId: string): Promise<void> {
    const room = await this.rooms.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.isDirect) {
      throw new ForbiddenException('Cannot join a direct room');
    }
    const existing = await this.members.findOne({
      where: { roomId, userId },
    });
    if (!existing) {
      await this.members.save(this.members.create({ roomId, userId }));
    }
  }

  async leave(roomId: string, userId: string): Promise<void> {
    await this.members.delete({ roomId, userId });
  }

  async listForUser(userId: string): Promise<Room[]> {
    const memberships = await this.members.find({ where: { userId } });
    const roomIds = memberships.map((m) => m.roomId);
    if (roomIds.length === 0) {
      return [];
    }
    return this.rooms.find({
      where: { id: In(roomIds) },
      order: { createdAt: 'DESC' },
    });
  }

  async isMember(roomId: string, userId: string): Promise<boolean> {
    const count = await this.members.count({ where: { roomId, userId } });
    return count > 0;
  }

  async assertMember(roomId: string, userId: string): Promise<void> {
    if (!(await this.isMember(roomId, userId))) {
      throw new ForbiddenException('Not a member of this room');
    }
  }

  async memberIds(roomId: string): Promise<string[]> {
    const rows = await this.members.find({ where: { roomId } });
    return rows.map((r) => r.userId);
  }

  async setLastRead(
    roomId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    await this.members.update({ roomId, userId }, { lastReadMessageId: messageId });
  }
}
