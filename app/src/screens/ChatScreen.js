import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Alert,
    Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { conversationsAPI } from '../api/client';
import {
    joinRoom,
    leaveRoom,
    sendMessage as socketSendMessage,
    startTyping,
    stopTyping,
    addFriend as socketAddFriend,
    endChat,
} from '../services/socket';
import { encryptMessage, decryptMessage } from '../crypto/e2ee';
import ChatBubble from '../components/ChatBubble';
import ChatHeader from '../components/ChatHeader';
import ChatDateDivider from '../components/ChatDateDivider';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function ChatScreen({ route, navigation }) {
    const {
        roomId,
        conversationId,
        partnerPublicKey,
        partnerId,
        partnerName = 'Stranger',
        isAnonymous = false,
    } = route.params;

    const { user, secretKey } = useAuth();
    const { messages, loadMessages, typingUsers, clearActiveChat } = useChat();

    const [inputText, setInputText] = useState('');
    const [decryptedMessages, setDecryptedMessages] = useState([]);
    const [friendRequested, setFriendRequested] = useState(false);
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Join room on mount
    useEffect(() => {
        joinRoom(roomId);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        fetchMessages();
        return () => {
            leaveRoom(roomId);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    // Decrypt messages when they change
    useEffect(() => {
        const convMessages = messages[conversationId] || [];
        const decrypted = convMessages.map((msg) => {
            try {
                const isSent = msg.senderId === user._id;
                const senderPubKey = isSent ? null : partnerPublicKey;
                const recipientSecKey = secretKey;

                let text;
                if (isSent) {
                    text = msg._localPlaintext || '[Encrypted message]';
                } else {
                    text = decryptMessage(msg.ciphertext, msg.nonce, senderPubKey, recipientSecKey);
                }
                return { ...msg, decryptedText: text, isSent };
            } catch (error) {
                return { ...msg, decryptedText: '🔐 Unable to decrypt', isSent: msg.senderId === user._id };
            }
        });
        setDecryptedMessages(decrypted);
    }, [messages, conversationId]);

    const fetchMessages = async () => {
        try {
            const response = await conversationsAPI.getMessages(conversationId);
            loadMessages(conversationId, response.data.messages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        try {
            const plaintext = inputText.trim();
            const { ciphertext, nonce } = encryptMessage(plaintext, partnerPublicKey, secretKey);
            socketSendMessage(roomId, ciphertext, nonce);

            const tempMsg = {
                _id: `local_${Date.now()}`,
                conversationId,
                senderId: user._id,
                ciphertext,
                nonce,
                _localPlaintext: plaintext,
                createdAt: new Date().toISOString(),
                decryptedText: plaintext,
                isSent: true,
            };
            setDecryptedMessages((prev) => [...prev, tempMsg]);
            setInputText('');
            stopTyping(roomId);
        } catch (error) {
            Alert.alert('Encryption Error', 'Failed to encrypt message. Please try again.');
            console.error('Send error:', error);
        }
    };

    const handleTyping = (text) => {
        setInputText(text);
        if (text.length > 0) {
            startTyping(roomId);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => stopTyping(roomId), 2000);
        } else {
            stopTyping(roomId);
        }
    };

    const handleAddFriend = () => {
        socketAddFriend(roomId);
        setFriendRequested(true);
    };

    const handleEndChat = () => {
        Alert.alert('End Chat', 'Are you sure you want to end this conversation?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End',
                style: 'destructive',
                onPress: () => {
                    endChat(roomId);
                    clearActiveChat();
                    navigation.goBack();
                },
            },
        ]);
    };

    const isPartnerTyping = typingUsers[partnerId];

    const renderMessage = ({ item, index }) => {
        // Determine if we need a date divider before this message
        const prevItem = index > 0 ? decryptedMessages[index - 1] : null;
        const prevDate = prevItem ? new Date(prevItem.createdAt).toDateString() : null;
        const currDate = new Date(item.createdAt).toDateString();
        const showDivider = !prevItem || prevDate !== currDate;

        const showTail =
            index === decryptedMessages.length - 1 ||
            decryptedMessages[index + 1]?.isSent !== item.isSent;

        const isToday = currDate === new Date().toDateString();
        const isYesterday = currDate === new Date(Date.now() - 86400000).toDateString();
        const dividerLabel = isToday ? 'Today' : isYesterday ? 'Yesterday' : currDate;

        return (
            <>
                {showDivider && <ChatDateDivider label={dividerLabel} />}
                <ChatBubble
                    message={item.decryptedText}
                    isSent={item.isSent}
                    timestamp={item.createdAt}
                    showTail={showTail}
                />
            </>
        );
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <StatusBar style="light" />

            {/* ─── Header ─────────────────────────────── */}
            <ChatHeader
                partnerName={partnerName}
                isTyping={isPartnerTyping}
                isAnonymous={isAnonymous}
                friendRequested={friendRequested}
                onBack={() => navigation.goBack()}
                onAddFriend={handleAddFriend}
                onEndChat={handleEndChat}
            />

            {/* ─── E2EE Badge ─────────────────────────── */}
            <View style={styles.e2eeBadge}>
                <Text style={styles.e2eeText}>🔐 Messages are end-to-end encrypted</Text>
            </View>

            {/* ─── Messages ───────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
            behavior="padding"
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={flatListRef}
                    data={decryptedMessages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Text style={styles.emptyChatIcon}>👋</Text>
                            <Text style={styles.emptyChatText}>Say hello to {partnerName}!</Text>
                        </View>
                    }
                />

                {/* ─── Typing Indicator ───────────────── */}
                {isPartnerTyping && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                            <Text style={styles.typingDots}>● ● ●</Text>
                        </View>
                    </View>
                )}

                {/* ─── Input Bar ──────────────────────── */}
                <View style={styles.inputBar}>
                    {/* + attachment button */}
                    <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
                        <Text style={styles.attachIcon}>＋</Text>
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={handleTyping}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            maxLength={2000}
                            selectionColor={colors.primary}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Text style={styles.sendIcon}>▶</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // ─── E2EE Badge ──────────────────────────────────────
    e2eeBadge: {
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: colors.primaryGlow,
        borderBottomWidth: 1,
        borderColor: colors.primary + '10',
    },
    e2eeText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: typography.weight.bold,
        letterSpacing: 0.5,
    },

    // ─── Chat Area ───────────────────────────────────────
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
    },

    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 140,
        opacity: 0.6,
    },
    emptyChatIcon: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    emptyChatText: {
        color: colors.textSecondary,
        fontSize: 15,
        fontWeight: typography.weight.medium,
    },

    // ─── Typing Indicator ────────────────────────────────
    typingContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.sm,
    },
    typingBubble: {
        backgroundColor: colors.background,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    typingDots: {
        color: colors.textMuted,
        fontSize: 12,
        letterSpacing: 3,
    },

    // ─── Input Bar ───────────────────────────────────────
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        gap: spacing.md,
    },
    attachBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    attachIcon: {
        color: colors.textSecondary,
        fontSize: 24,
        fontWeight: '300',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 120,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
    },
    textInput: {
        color: colors.textPrimary,
        fontSize: 16,
        lineHeight: 20,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        ...shadows.md,
    },
    sendButtonDisabled: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    sendIcon: {
        color: '#fff',
        fontSize: 18,
    },
});
