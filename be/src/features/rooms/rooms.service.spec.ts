import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './room.entity';
import { RoomMember } from './room-member.entity';

const roomsRepo = () => {
  const rows: Partial<Room>[] = [];
  return {
    rows,
    create: (data: Partial<Room>) => ({ ...data }),
    save: jest.fn(async (data: Partial<Room>) => {
      const row = { id: `room-${rows.length + 1}`, createdAt: new Date(), ...data };
      rows.push(row);
      return row;
    }),
    findOne: jest.fn(async ({ where }: { where: { id: string } }) =>
      rows.find((r) => r.id === where.id) ?? null,
    ),
    find: jest.fn(async () => rows),
  };
};

const membersRepo = () => {
  const rows: Partial<RoomMember>[] = [];
  return {
    rows,
    create: (data: Partial<RoomMember>) => ({ ...data }),
    save: jest.fn(async (data: Partial<RoomMember> | Partial<RoomMember>[]) => {
      const list = Array.isArray(data) ? data : [data];
      rows.push(...list);
      return data;
    }),
    findOne: jest.fn(async ({ where }: { where: Partial<RoomMember> }) =>
      rows.find((r) => r.roomId === where.roomId && r.userId === where.userId) ??
      null,
    ),
    find: jest.fn(async ({ where }: { where: Partial<RoomMember> }) =>
      rows.filter(
        (r) =>
          (where.userId === undefined || r.userId === where.userId) &&
          (where.roomId === undefined || r.roomId === where.roomId),
      ),
    ),
    count: jest.fn(async ({ where }: { where: Partial<RoomMember> }) =>
      rows.filter((r) => r.roomId === where.roomId && r.userId === where.userId)
        .length,
    ),
    delete: jest.fn(),
  };
};

describe('RoomsService', () => {
  it('rejects a direct room without exactly two members', async () => {
    const service = new RoomsService(roomsRepo() as never, membersRepo() as never);
    await expect(
      service.create('user-1', { isDirect: true, memberIds: ['user-1'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a direct room with the creator and one member', async () => {
    const members = membersRepo();
    const service = new RoomsService(roomsRepo() as never, members as never);
    const room = await service.create('user-1', {
      isDirect: true,
      memberIds: ['user-2'],
    });
    expect(room.isDirect).toBe(true);
    expect(members.rows).toHaveLength(2);
  });

  it('creates a group room with a name and unique members', async () => {
    const members = membersRepo();
    const service = new RoomsService(roomsRepo() as never, members as never);
    const room = await service.create('user-1', {
      isDirect: false,
      name: 'General',
      memberIds: ['user-1', 'user-2', 'user-3'],
    });
    expect(room.name).toBe('General');
    expect(members.rows).toHaveLength(3);
  });

  it('reports membership correctly', async () => {
    const members = membersRepo();
    const service = new RoomsService(roomsRepo() as never, members as never);
    await service.create('user-1', { isDirect: false, memberIds: ['user-2'] });
    expect(await service.isMember('room-1', 'user-1')).toBe(true);
    expect(await service.isMember('room-1', 'user-9')).toBe(false);
  });

  it('blocks joining a direct room', async () => {
    const rooms = roomsRepo();
    const service = new RoomsService(rooms as never, membersRepo() as never);
    await service.create('user-1', { isDirect: true, memberIds: ['user-2'] });
    await expect(service.join('room-1', 'user-3')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
