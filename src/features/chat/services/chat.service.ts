// 🎸 Chat Service
// 1:1 Chat & Messaging

import { get, post } from "@/shared/services/api.service";

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alle Chats des Users abrufen
 */
export async function getUserChats(): Promise<Chat[]> {
  return get<Chat[]>("/api/chat");
}

/**
 * Chat-Nachrichten abrufen
 */
export async function getChatMessages(
  chatId: string,
  limit: number = 50
): Promise<ChatMessage[]> {
  return get<ChatMessage[]>(`/api/chat/${chatId}/messages`, {
    params: { limit },
  });
}

/**
 * Nachricht senden
 */
export async function sendMessage(
  chatId: string,
  content: string
): Promise<ChatMessage> {
  return post<ChatMessage>(`/api/chat/${chatId}/messages`, { content });
}

/**
 * Neuen Chat erstellen oder bestehenden finden
 */
export async function createOrGetChat(recipientId: string): Promise<Chat> {
  return post<Chat>("/api/chat/create", { recipientId });
}

/**
 * Nachrichten als gelesen markieren
 */
export async function markMessagesAsRead(chatId: string): Promise<void> {
  return post(`/api/chat/${chatId}/read`, {});
}

/**
 * Ungelesene Nachrichten zählen
 */
export async function getUnreadCount(): Promise<number> {
  const response = await get<{ count: number }>("/api/chat/unread");
  return response.count;
}
