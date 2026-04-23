/**
 * Chat API — rooms & messages.
 *
 * Mock mode: in-memory + localStorage persistence.
 * Real mode: flip USE_MOCK to false.
 */

import { apiRequest } from './client';

const USE_MOCK = false;

// ── Mock storage ──────────────────────────────────────────────

function getMockRooms() {
  const raw = localStorage.getItem('mock_rooms');
  return raw ? JSON.parse(raw) : [];
}

function saveMockRooms(rooms) {
  localStorage.setItem('mock_rooms', JSON.stringify(rooms));
}

function getMockMessages() {
  const raw = localStorage.getItem('mock_messages');
  return raw ? JSON.parse(raw) : [];
}

function saveMockMessages(messages) {
  localStorage.setItem('mock_messages', JSON.stringify(messages));
}

function generateId() {
  return Math.random().toString(36).slice(2, 12);
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Helper: get user info for room display ────────────────────

function getMockUsers() {
  const raw = localStorage.getItem('mock_users');
  return raw ? JSON.parse(raw) : [];
}

// ── Public API ────────────────────────────────────────────────

export async function getRooms() {
  if (!USE_MOCK) {
    return apiRequest('/api/rooms');
  }

  await delay(150);
  const rooms = getMockRooms();
  return { rooms };
}

export async function getRoom(id) {
  if (!USE_MOCK) {
    return apiRequest(`/api/rooms/${id}`);
  }

  await delay(100);
  const rooms = getMockRooms();
  const room = rooms.find((r) => r.id === id);
  if (!room) throw new Error('Room not found');
  return { room };
}

export async function createRoom(memberIds, isGroup = false, name = '') {
  if (!USE_MOCK) {
    return apiRequest('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ member_ids: memberIds, is_group: isGroup, name }),
    });
  }

  await delay(200);
  const rooms = getMockRooms();
  const users = getMockUsers();

  // For 1:1, check if room already exists
  if (!isGroup && memberIds.length === 1) {
    const currentUserId = JSON.parse(atob(localStorage.getItem('token'))).userId;
    const existing = rooms.find(
      (r) =>
        !r.isGroup &&
        r.memberIds.includes(currentUserId) &&
        r.memberIds.includes(memberIds[0])
    );
    if (existing) return { room: existing };
  }

  const currentUserId = JSON.parse(atob(localStorage.getItem('token'))).userId;
  const allMemberIds = [currentUserId, ...memberIds];

  // Build display name for 1:1
  let roomName = name;
  if (!isGroup && !name) {
    const otherUser = users.find((u) => u.id === memberIds[0]);
    roomName = otherUser ? otherUser.username : 'Unknown';
  }

  const room = {
    id: generateId(),
    name: roomName,
    isGroup,
    memberIds: allMemberIds,
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    lastMessage: null,
  };

  rooms.push(room);
  saveMockRooms(rooms);

  return { room };
}

export async function getMessages(roomId, limit = 50, offset = 0) {
  if (!USE_MOCK) {
    return apiRequest(
      `/api/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  await delay(100);
  const allMessages = getMockMessages();
  const roomMessages = allMessages
    .filter((m) => m.roomId === roomId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return { messages: roomMessages.slice(offset, offset + limit) };
}

export async function sendMessage(roomId, content) {
  if (!USE_MOCK) {
    return apiRequest(`/api/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  await delay(100);
  const currentUserId = JSON.parse(atob(localStorage.getItem('token'))).userId;

  const message = {
    id: generateId(),
    roomId,
    senderId: currentUserId,
    content,
    createdAt: new Date().toISOString(),
  };

  const messages = getMockMessages();
  messages.push(message);
  saveMockMessages(messages);

  // Update room's lastMessage
  const rooms = getMockRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (room) {
    room.lastMessageAt = message.createdAt;
    room.lastMessage = content;
    saveMockRooms(rooms);
  }

  return { message };
}

/**
 * Get display name for a room.
 * For 1:1 rooms, shows the other person's name.
 */
export function getRoomDisplayName(room, currentUserId) {
  if (room.isGroup) return room.name;
  if (room.name) return room.name;

  if (!USE_MOCK) {
    return 'Chat';
  }

  const users = getMockUsers();
  const otherId = room.memberIds?.find((id) => id !== currentUserId);
  const otherUser = users.find((u) => u.id === otherId);
  return otherUser ? otherUser.username : 'Chat';
}

/**
 * Get user info by ID (for message sender display).
 */
export function getUserById(userId) {
  if (!USE_MOCK) {
    return { id: userId, username: 'User' };
  }
  const users = getMockUsers();
  return users.find((u) => u.id === userId) || { id: userId, username: 'Unknown' };
}
