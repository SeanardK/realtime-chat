import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

export const createChatSocket = (token: string): Socket =>
  io(WS_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  });
