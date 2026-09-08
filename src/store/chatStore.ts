import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY_MS = 1000;

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: () => {
    const { socket: existingSocket } = get();
    // If already connected, do nothing
    if (existingSocket?.connected) return;
    // If a socket exists but is disconnected, clean it up first
    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://glunity.onrender.com';

    let reconnectAttempts = 0;

    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      // Let the library handle reconnection with sensible defaults
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: BASE_RECONNECT_DELAY_MS,
      reconnectionDelayMax: BASE_RECONNECT_DELAY_MS * 16,
    });

    newSocket.on('connect', () => {
      reconnectAttempts = 0;
      set({ isConnected: true });
    });

    newSocket.on('disconnect', (reason) => {
      set({ isConnected: false });
      // If the server forcefully closed, the library won't auto-reconnect for
      // 'io server disconnect'. Manually reconnect in that case.
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      reconnectAttempts++;
      set({ isConnected: false });

      // If the error is auth-related (e.g. expired token), try refreshing
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.warn('[ChatSocket] Max reconnect attempts reached, giving up.', err.message);
        newSocket.disconnect();
      }
    });

    // Note: Event listeners for 'chat:message', 'chat:read', etc., 
    // will be handled inside components or Query invalidators to update server state.

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));

// --- Auto-reconnect when auth token changes ---
// When the user logs in / token refreshes, reconnect the socket with the new token.
let previousToken: string | null = null;
useAuthStore.subscribe((state) => {
  const currentToken = state.accessToken;
  if (currentToken && currentToken !== previousToken) {
    previousToken = currentToken;
    // Disconnect old socket (if any) and connect with fresh token
    const { socket, connect, disconnect } = useChatStore.getState();
    if (socket) {
      disconnect();
    }
    connect();
  } else if (!currentToken && previousToken) {
    // User logged out — disconnect
    previousToken = null;
    useChatStore.getState().disconnect();
  }
});
