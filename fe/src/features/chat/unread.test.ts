import { bumpUnread, clearUnread, totalUnread } from './unread';

describe('unread', () => {
  it('increments unread for an inactive room', () => {
    const result = bumpUnread({}, 'room-1', 'room-2');
    expect(result['room-1']).toBe(1);
  });

  it('does not increment for the active room', () => {
    const result = bumpUnread({ 'room-1': 2 }, 'room-1', 'room-1');
    expect(result['room-1']).toBe(2);
  });

  it('accumulates across messages', () => {
    let state = bumpUnread({}, 'room-1', null);
    state = bumpUnread(state, 'room-1', null);
    expect(state['room-1']).toBe(2);
  });

  it('clears unread for a room', () => {
    const result = clearUnread({ 'room-1': 3, 'room-2': 1 }, 'room-1');
    expect(result['room-1']).toBeUndefined();
    expect(result['room-2']).toBe(1);
  });

  it('sums total unread', () => {
    expect(totalUnread({ 'room-1': 2, 'room-2': 3 })).toBe(5);
  });
});
