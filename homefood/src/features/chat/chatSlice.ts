import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, ChatSession, MessageStatus } from '../../utils/types';

interface ChatState {
  messages: { [orderId: string]: Message[] };
  chatSessions: ChatSession[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  typing: { [orderId: string]: string[] }; // кто печатает в чате
}

const initialState: ChatState = {
  messages: {},
  chatSessions: [],
  unreadCount: 0,
  loading: false,
  error: null,
  typing: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<{ orderId: string; messages: Message[] }>) {
      const { orderId, messages } = action.payload;
      state.messages[orderId] = messages;
    },
    addMessage(state, action: PayloadAction<{ orderId: string; message: Message }>) {
      const { orderId, message } = action.payload;
      if (!state.messages[orderId]) {
        state.messages[orderId] = [];
      }
      state.messages[orderId].push(message);
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{ orderId: string; messageId: string; status: MessageStatus }>
    ) {
      const { orderId, messageId, status } = action.payload;
      const messages = state.messages[orderId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      }
    },
    setChatSessions(state, action: PayloadAction<ChatSession[]>) {
      state.chatSessions = action.payload;
    },
    updateChatSession(state, action: PayloadAction<ChatSession>) {
      const session = action.payload;
      const index = state.chatSessions.findIndex(s => s.id === session.id);
      if (index !== -1) {
        state.chatSessions[index] = session;
      } else {
        state.chatSessions.push(session);
      }
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount += action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTyping(state, action: PayloadAction<{ orderId: string; userId: string; isTyping: boolean }>) {
      const { orderId, userId, isTyping } = action.payload;
      if (!state.typing[orderId]) {
        state.typing[orderId] = [];
      }
      if (isTyping) {
        if (!state.typing[orderId].includes(userId)) {
          state.typing[orderId].push(userId);
        }
      } else {
        state.typing[orderId] = state.typing[orderId].filter(id => id !== userId);
      }
    },
    clearChat(state, action: PayloadAction<string>) {
      const orderId = action.payload;
      delete state.messages[orderId];
      delete state.typing[orderId];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateMessageStatus,
  setChatSessions,
  updateChatSession,
  setUnreadCount,
  incrementUnreadCount,
  setLoading,
  setError,
  setTyping,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;

