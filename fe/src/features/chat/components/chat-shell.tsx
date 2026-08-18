'use client';

import { useAuth } from '@/features/auth/auth-context';
import { useChat } from '../use-chat';
import { RoomList } from './room-list';
import { MessageList } from './message-list';
import { Composer } from './composer';

export function ChatShell() {
  const { user, logout } = useAuth();
  const chat = useChat();

  const activeRoom = chat.rooms.find((room) => room.id === chat.activeRoomId);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-800">Chat</h1>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>{user?.displayName}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <RoomList
          rooms={chat.rooms}
          contacts={chat.contacts}
          activeRoomId={chat.activeRoomId}
          unread={chat.unread}
          onSelect={chat.selectRoom}
          onStartDirect={(id) => void chat.startDirect(id)}
        />
        <section className="flex flex-1 flex-col">
          {chat.activeRoomId ? (
            <>
              <div className="border-b border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                {activeRoom?.name ?? 'Direct message'}
                {chat.typing.length > 0 ? (
                  <span className="ml-2 text-xs text-slate-400">typing...</span>
                ) : null}
              </div>
              <MessageList messages={chat.messages} currentUserId={user?.id ?? ''} />
              <Composer
                disabled={false}
                onSend={chat.sendMessage}
                onTypingStart={chat.startTyping}
                onTypingStop={chat.stopTyping}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              Select a room to start chatting
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
