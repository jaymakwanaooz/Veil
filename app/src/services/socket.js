import { io } from 'socket.io-client';

// ⚠️ Change this to your server's IP/URL
const SOCKET_URL = 'http://localhost:3001';

let socket = null;

/**
 * Initialize Socket.IO connection with auth token
 */
export function connectSocket(token) {
    if (socket?.connected) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 8000,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
        // Silenced — server may not be running in dev mode
        console.log('🔌 Socket unavailable:', error.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    return socket;
}

/**
 * Get current socket instance
 */
export function getSocket() {
    return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Join a conversation room
 */
export function joinRoom(roomId) {
    if (socket?.connected) {
        socket.emit('join_room', { roomId });
    }
}

/**
 * Leave a conversation room
 */
export function leaveRoom(roomId) {
    if (socket?.connected) {
        socket.emit('leave_room', { roomId });
    }
}

/**
 * Send encrypted message
 */
export function sendMessage(roomId, ciphertext, nonce) {
    if (socket?.connected) {
        socket.emit('send_message', { roomId, ciphertext, nonce });
    }
}

/**
 * Start/stop typing indicator
 */
export function startTyping(roomId) {
    if (socket?.connected) {
        socket.emit('typing_start', { roomId });
    }
}

export function stopTyping(roomId) {
    if (socket?.connected) {
        socket.emit('typing_stop', { roomId });
    }
}

/**
 * Find a random match
 */
export function findMatch() {
    if (socket?.connected) {
        socket.emit('find_match');
    }
}

/**
 * Cancel matchmaking
 */
export function cancelMatch() {
    if (socket?.connected) {
        socket.emit('cancel_match');
    }
}

/**
 * Add friend via socket
 */
export function addFriend(roomId) {
    if (socket?.connected) {
        socket.emit('add_friend', { roomId });
    }
}

/**
 * End anonymous chat
 */
export function endChat(roomId) {
    if (socket?.connected) {
        socket.emit('end_chat', { roomId });
    }
}

export default {
    connectSocket,
    getSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    findMatch,
    cancelMatch,
    addFriend,
    endChat,
};
