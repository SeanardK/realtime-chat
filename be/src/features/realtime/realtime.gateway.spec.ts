import { RealtimeGateway } from './realtime.gateway';

describe('RealtimeGateway', () => {
  const buildGateway = (isMember: boolean) => {
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    const rooms = {
      isMember: jest.fn(async () => isMember),
      listForUser: jest.fn(async () => []),
    };
    const messages = {
      send: jest.fn(async (roomId: string, userId: string, body: string) => ({
        id: 'msg-1',
        roomId,
        senderId: userId,
        body,
        createdAt: new Date(),
      })),
    };
    const gateway = new RealtimeGateway(
      {} as never,
      {} as never,
      rooms as never,
      messages as never,
      {} as never,
    );
    gateway.server = { to, emit } as never;
    return { gateway, rooms, messages, to, emit };
  };

  it('persists and broadcasts a message from a member', async () => {
    const { gateway, messages, to, emit } = buildGateway(true);
    const client = { userId: 'user-1' } as never;

    await gateway.onMessageSend(client, { roomId: 'room-1', body: 'hi' });

    expect(messages.send).toHaveBeenCalledWith('room-1', 'user-1', 'hi');
    expect(to).toHaveBeenCalledWith('room-1');
    expect(emit).toHaveBeenCalledWith(
      'message:new',
      expect.objectContaining({ body: 'hi' }),
    );
  });

  it('ignores a message from a non-member', async () => {
    const { gateway, messages } = buildGateway(false);
    const client = { userId: 'user-9' } as never;

    await gateway.onMessageSend(client, { roomId: 'room-1', body: 'hi' });

    expect(messages.send).not.toHaveBeenCalled();
  });

  it('emits a typing update to the room excluding the sender', async () => {
    const { gateway } = buildGateway(true);
    const emit = jest.fn();
    const to = jest.fn(() => ({ emit }));
    const client = { userId: 'user-1', to } as never;

    await gateway.onTypingStart(client, { roomId: 'room-1' });

    expect(to).toHaveBeenCalledWith('room-1');
    expect(emit).toHaveBeenCalledWith('typing:update', {
      roomId: 'room-1',
      userId: 'user-1',
      typing: true,
    });
  });
});
