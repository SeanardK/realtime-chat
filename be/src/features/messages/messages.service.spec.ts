import { ForbiddenException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';

const messagesRepo = () => {
  const rows: Message[] = [];
  return {
    rows,
    create: (data: Partial<Message>) => ({ ...data }) as Message,
    save: jest.fn(async (data: Message) => {
      const row = {
        ...data,
        id: `msg-${rows.length + 1}`,
        createdAt: new Date(Date.now() + rows.length),
      } as Message;
      rows.push(row);
      return row;
    }),
    find: jest.fn(async ({ take }: { take: number }) =>
      [...rows].reverse().slice(0, take),
    ),
  };
};

describe('MessagesService', () => {
  it('blocks sending when the sender is not a member', async () => {
    const rooms = {
      assertMember: jest.fn(async () => {
        throw new ForbiddenException();
      }),
    };
    const service = new MessagesService(messagesRepo() as never, rooms as never);
    await expect(
      service.send('room-1', 'user-9', 'hi'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sends a message for a member', async () => {
    const rooms = { assertMember: jest.fn(async () => undefined) };
    const service = new MessagesService(messagesRepo() as never, rooms as never);
    const message = await service.send('room-1', 'user-1', 'hello');
    expect(message.body).toBe('hello');
    expect(rooms.assertMember).toHaveBeenCalledWith('room-1', 'user-1');
  });

  it('returns a cursor when the page is full', async () => {
    const repo = messagesRepo();
    const rooms = { assertMember: jest.fn(async () => undefined) };
    const service = new MessagesService(repo as never, rooms as never);
    await service.send('room-1', 'user-1', 'one');
    await service.send('room-1', 'user-1', 'two');

    const page = await service.history('room-1', 'user-1', undefined, 2);
    expect(page.messages).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
  });

  it('sets last read on markRead', async () => {
    const rooms = {
      assertMember: jest.fn(async () => undefined),
      setLastRead: jest.fn(async () => undefined),
    };
    const service = new MessagesService(messagesRepo() as never, rooms as never);
    await service.markRead('room-1', 'user-1', 'msg-1');
    expect(rooms.setLastRead).toHaveBeenCalledWith('room-1', 'user-1', 'msg-1');
  });
});
