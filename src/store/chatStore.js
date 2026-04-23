import { create } from 'zustand';
import {
  getRooms as apiGetRooms,
  getMessages as apiGetMessages,
  sendMessage as apiSendMessage,
  createRoom as apiCreateRoom,
} from '../api/chat';
import { findUserByEmail } from '../api/auth';

const useChatStore = create((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messages: {}, // { [roomId]: Message[] }
  isLoadingRooms: false,
  isLoadingMessages: false,
  isSending: false,

  loadRooms: async () => {
    set({ isLoadingRooms: true });
    try {
      const { rooms } = await apiGetRooms();
      set({ rooms, isLoadingRooms: false });
    } catch (err) {
      console.error('Failed to load rooms:', err);
      set({ isLoadingRooms: false });
    }
  },

  selectRoom: async (roomId) => {
    set({ activeRoomId: roomId });

    // Load messages if not cached
    const cached = get().messages[roomId];
    if (!cached) {
      set({ isLoadingMessages: true });
      try {
        const { messages } = await apiGetMessages(roomId);
        set((state) => ({
          messages: { ...state.messages, [roomId]: messages },
          isLoadingMessages: false,
        }));
      } catch (err) {
        console.error('Failed to load messages:', err);
        set({ isLoadingMessages: false });
      }
    }
  },

  sendMessage: async (content) => {
    const roomId = get().activeRoomId;
    if (!roomId || !content.trim()) return;

    set({ isSending: true });
    try {
      const { message } = await apiSendMessage(roomId, content);
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: [...(state.messages[roomId] || []), message],
        },
        isSending: false,
        // Update room's last message in the list
        rooms: state.rooms.map((r) =>
          r.id === roomId
            ? { ...r, lastMessage: content, lastMessageAt: message.createdAt }
            : r
        ),
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      set({ isSending: false });
    }
  },

  addContact: async (email) => {
    const user = await findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Create a 1:1 room, pass the other user's name as the room name for 1:1
    const { room } = await apiCreateRoom([user.id], false, user.username);

    // Add to rooms list if not there
    set((state) => {
      const exists = state.rooms.find((r) => r.id === room.id);
      return {
        rooms: exists ? state.rooms : [room, ...state.rooms],
        activeRoomId: room.id,
      };
    });

    return room;
  },

  receiveMessage: (message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.roomId]: [
          ...(state.messages[message.roomId] || []),
          message,
        ],
      },
      rooms: state.rooms.map((r) =>
        r.id === message.roomId
          ? { ...r, lastMessage: message.content, lastMessageAt: message.createdAt }
          : r
      ),
    }));
  },
}));

export default useChatStore;
