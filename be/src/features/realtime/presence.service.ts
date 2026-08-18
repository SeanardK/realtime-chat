import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly socketsByUser = new Map<string, Set<string>>();
  private readonly userBySocket = new Map<string, string>();

  add(userId: string, socketId: string): boolean {
    this.userBySocket.set(socketId, userId);
    const sockets = this.socketsByUser.get(userId) ?? new Set<string>();
    const wasOffline = sockets.size === 0;
    sockets.add(socketId);
    this.socketsByUser.set(userId, sockets);
    return wasOffline;
  }

  remove(socketId: string): { userId: string | null; nowOffline: boolean } {
    const userId = this.userBySocket.get(socketId) ?? null;
    if (!userId) {
      return { userId: null, nowOffline: false };
    }
    this.userBySocket.delete(socketId);
    const sockets = this.socketsByUser.get(userId);
    if (!sockets) {
      return { userId, nowOffline: true };
    }
    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.socketsByUser.delete(userId);
      return { userId, nowOffline: true };
    }
    return { userId, nowOffline: false };
  }

  isOnline(userId: string): boolean {
    return this.socketsByUser.has(userId);
  }

  onlineUsers(): string[] {
    return Array.from(this.socketsByUser.keys());
  }
}
