import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { AppConfig } from '../../shared/config/configuration';
import { RoomsService } from '../rooms/rooms.service';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from './presence.service';

interface AuthedSocket extends Socket {
  userId: string;
}

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly rooms: RoomsService,
    private readonly messages: MessagesService,
    private readonly presence: PresenceService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers.authorization?.replace('Bearer ', '') ??
        undefined);
    if (!token) {
      client.disconnect();
      return;
    }

    let userId: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.get('jwt.accessSecret', { infer: true }),
      });
      userId = payload.sub;
    } catch {
      client.disconnect();
      return;
    }

    (client as AuthedSocket).userId = userId;
    const roomIds = (await this.rooms.listForUser(userId)).map((r) => r.id);
    roomIds.forEach((id) => client.join(id));

    const wasOffline = this.presence.add(userId, client.id);
    if (wasOffline) {
      this.server.emit('presence:update', { userId, online: true });
    }
  }

  handleDisconnect(client: Socket): void {
    const { userId, nowOffline } = this.presence.remove(client.id);
    if (userId && nowOffline) {
      this.server.emit('presence:update', { userId, online: false });
    }
  }

  @SubscribeMessage('message:send')
  async onMessageSend(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string; body: string },
  ): Promise<void> {
    if (!(await this.rooms.isMember(data.roomId, client.userId))) {
      return;
    }
    const message = await this.messages.send(
      data.roomId,
      client.userId,
      data.body,
    );
    this.server.to(data.roomId).emit('message:new', message);
  }

  @SubscribeMessage('typing:start')
  async onTypingStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string },
  ): Promise<void> {
    await this.emitTyping(client, data.roomId, true);
  }

  @SubscribeMessage('typing:stop')
  async onTypingStop(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() data: { roomId: string },
  ): Promise<void> {
    await this.emitTyping(client, data.roomId, false);
  }

  private async emitTyping(
    client: AuthedSocket,
    roomId: string,
    typing: boolean,
  ): Promise<void> {
    if (!(await this.rooms.isMember(roomId, client.userId))) {
      return;
    }
    client.to(roomId).emit('typing:update', {
      roomId,
      userId: client.userId,
      typing,
    });
  }
}
