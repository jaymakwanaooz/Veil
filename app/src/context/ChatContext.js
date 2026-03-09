import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // { roomId, conversationId, partnerPublicKey, partnerId }
    const [messages, setMessages] = useState({});        // { [conversationId]: Message[] }
    const [typingUsers, setTypingUsers] = useState({});  // { [roomId]: boolean }
    const [isSearching, setIsSearching] = useState(false);

    // Set up socket listeners when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = getSocket();
        if (!socket) return;

        // ─── Match Events ──────────────────────────────────
        socket.on('match_found', (data) => {
            setIsSearching(false);
            setActiveChat({
                roomId: data.roomId,
                conversationId: data.conversationId,
                partnerPublicKey: data.partnerPublicKey,
                partnerId: data.partnerId,
                isAnonymous: true,
            });
        });

        socket.on('queue_joined', () => {
            setIsSearching(true);
        });

        socket.on('queue_left', () => {
            setIsSearching(false);
        });

        // ─── Message Events ────────────────────────────────
        socket.on('new_message', (message) => {
            setMessages((prev) => {
                const convMessages = prev[message.conversationId] || [];
                // Prevent duplicates
                if (convMessages.find((m) => m._id === message._id)) return prev;
                return {
                    ...prev,
                    [message.conversationId]: [...convMessages, message],
                };
            });
        });

        // ─── Typing Events ────────────────────────────────
        socket.on('typing_indicator', ({ userId: typingId, isTyping }) => {
            setTypingUsers((prev) => ({
                ...prev,
                [typingId]: isTyping,
            }));
        });

        // ─── Friend Events ─────────────────────────────────
        socket.on('friend_update', (data) => {
            if (data.isFriend && data.conversation) {
                // Conversation upgraded to friend — add to inbox
                setConversations((prev) => {
                    const exists = prev.find((c) => c._id === data.conversation._id);
                    if (exists) {
                        return prev.map((c) =>
                            c._id === data.conversation._id ? data.conversation : c
                        );
                    }
                    return [data.conversation, ...prev];
                });
            }
        });

        // ─── Chat End Events ───────────────────────────────
        socket.on('chat_ended', () => {
            setActiveChat(null);
        });

        socket.on('user_offline', ({ userId: offlineId }) => {
            if (activeChat?.partnerId === offlineId) {
                // Partner disconnected
            }
        });

        return () => {
            socket.off('match_found');
            socket.off('queue_joined');
            socket.off('queue_left');
            socket.off('new_message');
            socket.off('typing_indicator');
            socket.off('friend_update');
            socket.off('chat_ended');
            socket.off('user_offline');
        };
    }, [isAuthenticated, activeChat]);

    /**
     * Add messages for a conversation (from API fetch)
     */
    const loadMessages = useCallback((conversationId, msgs) => {
        setMessages((prev) => ({
            ...prev,
            [conversationId]: msgs,
        }));
    }, []);

    /**
     * Clear active chat
     */
    const clearActiveChat = useCallback(() => {
        setActiveChat(null);
    }, []);

    const value = {
        conversations,
        setConversations,
        activeChat,
        setActiveChat,
        messages,
        setMessages,
        loadMessages,
        typingUsers,
        isSearching,
        setIsSearching,
        clearActiveChat,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
