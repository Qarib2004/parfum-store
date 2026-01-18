import { create } from 'zustand';
import { Message, Conversation } from '@/types';

interface MessageState {
  conversations: Conversation[];
  currentMessages: Message[];
  unreadCount: number;
  typingUsers: Set<string>;
  
  setConversations: (conversations: Conversation[]) => void;
  setCurrentMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  setUnreadCount: (count: number) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  clearCurrentMessages: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  currentMessages: [],
  unreadCount: 0,
  typingUsers: new Set(),

  setConversations: (conversations) =>
    set({ conversations }),

  setCurrentMessages: (messages) =>
    set({ currentMessages: messages }),

  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    })),

  markMessageAsRead: (messageId) =>
    set((state) => ({
      currentMessages: state.currentMessages.map((m) =>
        m.id === messageId ? { ...m, read: true } : m
      ),
    })),

  setUnreadCount: (count) =>
    set({ unreadCount: count }),

  setUserTyping: (userId, isTyping) =>
    set((state) => {
      const typingUsers = new Set(state.typingUsers);
      if (isTyping) {
        typingUsers.add(userId);
      } else {
        typingUsers.delete(userId);
      }
      return { typingUsers };
    }),

  clearCurrentMessages: () =>
    set({ currentMessages: [] }),
}));