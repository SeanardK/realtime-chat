import { apiClient } from '@/shared/api/client';
import { Contact, HistoryPage, Room } from './types';

export const chatApi = {
  rooms() {
    return apiClient.request<Room[]>('/rooms');
  },
  contacts() {
    return apiClient.request<Contact[]>('/users/contacts');
  },
  createDirect(contactId: string) {
    return apiClient.request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ isDirect: true, memberIds: [contactId] }),
    });
  },
  createGroup(name: string, memberIds: string[]) {
    return apiClient.request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ isDirect: false, name, memberIds }),
    });
  },
  history(roomId: string, before?: string) {
    const query = before ? `?before=${encodeURIComponent(before)}` : '';
    return apiClient.request<HistoryPage>(`/rooms/${roomId}/messages${query}`);
  },
  markRead(roomId: string, messageId: string) {
    return apiClient.request<{ read: boolean }>(`/rooms/${roomId}/messages/read`, {
      method: 'POST',
      body: JSON.stringify({ messageId }),
    });
  },
};
