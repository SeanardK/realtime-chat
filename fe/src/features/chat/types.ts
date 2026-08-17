export interface Room {
  id: string;
  name: string | null;
  isDirect: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface HistoryPage {
  messages: Message[];
  nextCursor: string | null;
}
