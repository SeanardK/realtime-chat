'use client';

import { Contact, Room } from '../types';

interface RoomListProps {
  rooms: Room[];
  contacts: Contact[];
  activeRoomId: string | null;
  unread: Record<string, number>;
  onSelect: (roomId: string) => void;
  onStartDirect: (contactId: string) => void;
}

export function RoomList({
  rooms,
  contacts,
  activeRoomId,
  unread,
  onSelect,
  onStartDirect,
}: RoomListProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Rooms
        </h2>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onSelect(room.id)}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                room.id === activeRoomId ? 'bg-slate-100 font-medium' : ''
              }`}
            >
              <span>{room.name ?? 'Direct message'}</span>
              {unread[room.id] ? (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                  {unread[room.id]}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <div className="border-t border-slate-200 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contacts
        </h2>
        <ul className="space-y-1">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                onClick={() => onStartDirect(contact.id)}
                className="w-full rounded px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {contact.displayName}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
