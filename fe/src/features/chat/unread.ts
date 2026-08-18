export const bumpUnread = (
  current: Record<string, number>,
  roomId: string,
  activeRoomId: string | null,
): Record<string, number> => {
  if (roomId === activeRoomId) {
    return current;
  }
  return { ...current, [roomId]: (current[roomId] ?? 0) + 1 };
};

export const clearUnread = (
  current: Record<string, number>,
  roomId: string,
): Record<string, number> => {
  if (!(roomId in current)) {
    return current;
  }
  const next = { ...current };
  delete next[roomId];
  return next;
};

export const totalUnread = (current: Record<string, number>): number =>
  Object.values(current).reduce((sum, count) => sum + count, 0);
