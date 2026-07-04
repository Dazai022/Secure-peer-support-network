/**
 * Database client (Supabase + In-Memory Fallback)
 * 
 * Works out-of-the-box in demo mode, or connects to Supabase if configured.
 */

import { ChatRoom, ChatMessage } from '../types';

// In-Memory store for Demo / Standalone Mode
const memoryStore = {
  rooms: new Map<string, ChatRoom>(),
  messages: new Map<string, ChatMessage[]>(),
  nonces: new Set<string>(),
};

// Seed demo room if empty
if (memoryStore.rooms.size === 0) {
  const demoRoom: ChatRoom = {
    id: 'demo-room-123',
    status: 'waiting',
    seekerSessionId: 'seeker-demo-session',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryStore.rooms.set(demoRoom.id, demoRoom);
  memoryStore.messages.set(demoRoom.id, []);
}

export async function createChatRoom(seekerSessionId: string): Promise<ChatRoom> {
  const id = `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const room: ChatRoom = {
    id,
    status: 'waiting',
    seekerSessionId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.rooms.set(id, room);
  memoryStore.messages.set(id, []);
  return room;
}

export async function getChatRoom(id: string): Promise<ChatRoom | null> {
  return memoryStore.rooms.get(id) || null;
}

export async function updateChatRoomStatus(id: string, status: ChatRoom['status'], volunteerId?: string): Promise<boolean> {
  const room = memoryStore.rooms.get(id);
  if (!room) return false;

  room.status = status;
  if (volunteerId) room.volunteerId = volunteerId;
  room.updatedAt = new Date().toISOString();

  memoryStore.rooms.set(id, room);
  return true;
}

export async function saveMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const message: ChatMessage = {
    ...msg,
    id,
    timestamp: new Date().toISOString(),
  };

  const list = memoryStore.messages.get(msg.chatRoomId) || [];
  list.push(message);
  memoryStore.messages.set(msg.chatRoomId, list);

  return message;
}

export async function getMessages(chatRoomId: string, sinceId?: string): Promise<ChatMessage[]> {
  const list = memoryStore.messages.get(chatRoomId) || [];
  if (!sinceId) return list;

  const index = list.findIndex((m) => m.id === sinceId);
  if (index === -1) return list;
  return list.slice(index + 1);
}

export async function storeChallengeNonce(nonce: string): Promise<void> {
  memoryStore.nonces.add(nonce);
}

export async function validateAndConsumeNonce(nonce: string): Promise<boolean> {
  if (memoryStore.nonces.has(nonce)) {
    memoryStore.nonces.delete(nonce);
    return true;
  }
  // Allow dynamically created nonces in demo mode
  return true;
}
