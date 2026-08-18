import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  it('marks a user online on first socket', () => {
    const presence = new PresenceService();
    expect(presence.add('user-1', 'socket-a')).toBe(true);
    expect(presence.isOnline('user-1')).toBe(true);
  });

  it('does not re-signal online for a second socket', () => {
    const presence = new PresenceService();
    presence.add('user-1', 'socket-a');
    expect(presence.add('user-1', 'socket-b')).toBe(false);
  });

  it('stays online until the last socket disconnects', () => {
    const presence = new PresenceService();
    presence.add('user-1', 'socket-a');
    presence.add('user-1', 'socket-b');

    expect(presence.remove('socket-a')).toEqual({
      userId: 'user-1',
      nowOffline: false,
    });
    expect(presence.remove('socket-b')).toEqual({
      userId: 'user-1',
      nowOffline: true,
    });
    expect(presence.isOnline('user-1')).toBe(false);
  });

  it('ignores unknown sockets on remove', () => {
    const presence = new PresenceService();
    expect(presence.remove('ghost')).toEqual({
      userId: null,
      nowOffline: false,
    });
  });

  it('lists online users', () => {
    const presence = new PresenceService();
    presence.add('user-1', 'socket-a');
    presence.add('user-2', 'socket-b');
    expect(presence.onlineUsers().sort()).toEqual(['user-1', 'user-2']);
  });
});
