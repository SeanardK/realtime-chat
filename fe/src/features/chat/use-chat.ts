'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { tokenStore } from '@/features/auth/token-store';
import { chatApi } from './api';
import { createChatSocket } from './socket';
import { bumpUnread, clearUnread } from './unread';
import { Contact, Message, Room } from './types';

export interface ChatState {
  rooms: Room[];
  contacts: Contact[];
  activeRoomId: string | null;
  messages: Message[];
  unread: Record<string, number>;
  online: string[];
  typing: string[];
  selectRoom: (roomId: string) => void;
  sendMessage: (body: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
  startDirect: (contactId: string) => Promise<void>;
}

export function useChat(): ChatState {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>(
    {},
  );
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [online, setOnline] = useState<string[]>([]);
  const [typingByRoom, setTypingByRoom] = useState<Record<string, string[]>>({});

  const socketRef = useRef<Socket | null>(null);
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeRoomId;

  useEffect(() => {
    void (async () => {
      setRooms(await chatApi.rooms());
      setContacts(await chatApi.contacts());
    })();

    const token = tokenStore.getAccess();
    if (!token) {
      return;
    }
    const socket = createChatSocket(token);
    socketRef.current = socket;

    socket.on('message:new', (message: Message) => {
      setMessagesByRoom((prev) => ({
        ...prev,
        [message.roomId]: [...(prev[message.roomId] ?? []), message],
      }));
      setUnread((prev) => bumpUnread(prev, message.roomId, activeRef.current));
    });

    socket.on(
      'presence:update',
      ({ userId, online: isOnline }: { userId: string; online: boolean }) => {
        setOnline((prev) =>
          isOnline
            ? Array.from(new Set([...prev, userId]))
            : prev.filter((id) => id !== userId),
        );
      },
    );

    socket.on(
      'typing:update',
      ({
        roomId,
        userId,
        typing,
      }: {
        roomId: string;
        userId: string;
        typing: boolean;
      }) => {
        setTypingByRoom((prev) => {
          const current = prev[roomId] ?? [];
          const next = typing
            ? Array.from(new Set([...current, userId]))
            : current.filter((id) => id !== userId);
          return { ...prev, [roomId]: next };
        });
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setUnread((prev) => clearUnread(prev, roomId));
    void (async () => {
      const page = await chatApi.history(roomId);
      const ordered = [...page.messages].reverse();
      setMessagesByRoom((prev) => ({ ...prev, [roomId]: ordered }));
      const last = ordered[ordered.length - 1];
      if (last) {
        await chatApi.markRead(roomId, last.id);
      }
    })();
  }, []);

  const sendMessage = useCallback((body: string) => {
    const roomId = activeRef.current;
    if (!roomId || !socketRef.current || body.trim().length === 0) {
      return;
    }
    socketRef.current.emit('message:send', { roomId, body });
  }, []);

  const startTyping = useCallback(() => {
    const roomId = activeRef.current;
    if (roomId) {
      socketRef.current?.emit('typing:start', { roomId });
    }
  }, []);

  const stopTyping = useCallback(() => {
    const roomId = activeRef.current;
    if (roomId) {
      socketRef.current?.emit('typing:stop', { roomId });
    }
  }, []);

  const startDirect = useCallback(async (contactId: string) => {
    const room = await chatApi.createDirect(contactId);
    setRooms((prev) =>
      prev.some((r) => r.id === room.id) ? prev : [room, ...prev],
    );
    setActiveRoomId(room.id);
    selectRoom(room.id);
  }, [selectRoom]);

  return {
    rooms,
    contacts,
    activeRoomId,
    messages: activeRoomId ? messagesByRoom[activeRoomId] ?? [] : [],
    unread,
    online,
    typing: activeRoomId ? typingByRoom[activeRoomId] ?? [] : [],
    selectRoom,
    sendMessage,
    startTyping,
    stopTyping,
    startDirect,
  };
}
