'use client';

import { useEffect, useRef } from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
      {messages.map((message) => {
        const mine = message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md rounded-lg px-3 py-2 text-sm ${
                mine ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
              }`}
            >
              {message.body}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
