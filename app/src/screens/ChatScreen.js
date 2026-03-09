import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
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
import Avatar from '../components/Avatar';
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

        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Load existing messages
        fetchMessages();

        return () => {
            leaveRoom(roomId);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Decrypt messages when they change
    useEffect(() => {
        const convMessages = messages[conversationId] || [];
        const decrypted = convMessages.map((msg) => {
            try {
                const isSent = msg.senderId === user._id;

                // Determine keys for decryption
                const senderPubKey = isSent ? null : partnerPublicKey;
                const recipientSecKey = secretKey;

                let text;
                if (isSent) {
                    // For sent messages, we can't decrypt with the same keys
                    // We need to store plaintext locally or re-encrypt for self
                    // Simplified: Show placeholder for own sent messages that we already know
                    text = msg._localPlaintext || '[Encrypted message]';
                } else {
                    text = decryptMessage(
                        msg.ciphertext,
                        msg.nonce,
                        senderPubKey,
                        recipientSecKey
                    );
                }

                return {
                    ...msg,
                    decryptedText: text,
                    isSent,
                };
            } catch (error) {
                return {
                    ...msg,
                    decryptedText: '🔐 Unable to decrypt',
                    isSent: msg.senderId === user._id,
                };
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

            // Encrypt message with partner's public key
            const { ciphertext, nonce } = encryptMessage(
                plaintext,
                partnerPublicKey,
                secretKey
            );

            // Send encrypted message via socket
            socketSendMessage(roomId, ciphertext, nonce);

            // Store plaintext locally for display
            // In production, you'd want a more robust local cache
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

            // Auto-stop typing after 2 seconds of inactivity
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(roomId);
            }, 2000);
        } else {
            stopTyping(roomId);
        }
    };

    const handleAddFriend = () => {
        socketAddFriend(roomId);
        setFriendRequested(true);
    };

    const handleEndChat = () => {
        Alert.alert(
            'End Chat',
            'Are you sure you want to end this conversation?',
            [
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
            ]
        );
    };

    const isPartnerTyping = typingUsers[partnerId];

    const renderMessage = ({ item, index }) => {
        const showTail =
            index === decryptedMessages.length - 1 ||
            decryptedMessages[index + 1]?.isSent !== item.isSent;

        return (
            <ChatBubble
                message={item.decryptedText}
                isSent={item.isSent}
                timestamp={item.createdAt}
                showTail={showTail}
            />
        );
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <StatusBar style="light" />

            {/* ─── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Avatar username={partnerName} size={36} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerName}>{partnerName}</Text>
                        <Text style={styles.headerStatus}>
                            {isPartnerTyping ? 'typing...' : 'Online'}
                        </Text>
                    </View>
                </View>

                <View style={styles.headerActions}>
                    {isAnonymous && (
                        <TouchableOpacity
                            style={[
                                styles.addFriendButton,
                                friendRequested && styles.addFriendButtonRequested,
                            ]}
                            onPress={handleAddFriend}
                            disabled={friendRequested}
                        >
                            <Text style={styles.addFriendText}>
                                {friendRequested ? '✓ Sent' : '+ Add'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {isAnonymous && (
                        <TouchableOpacity
                            style={styles.endButton}
                            onPress={handleEndChat}
                        >
                            <Text style={styles.endButtonIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ─── E2EE Badge ─────────────────────────────── */}
            <View style={styles.e2eeBadge}>
                <Text style={styles.e2eeText}>
                    🔐 Messages are end-to-end encrypted
                </Text>
            </View>

            {/* ─── Messages ───────────────────────────────── */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                            <Text style={styles.emptyChatText}>
                                Say hello to {partnerName}!
                            </Text>
                        </View>
                    }
                />

                {/* ─── Typing Indicator ───────────────────── */}
                {isPartnerTyping && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                            <Text style={styles.typingDots}>● ● ●</Text>
                        </View>
                    </View>
                )}

                {/* ─── Input Bar ──────────────────────────── */}
                <View style={styles.inputBar}>
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
                        style={[
                            styles.sendButton,
                            !inputText.trim() && styles.sendButtonDisabled,
                        ]}
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

    // ─── Header ──────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 55,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    backIcon: {
        color: colors.textPrimary,
        fontSize: 24,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerInfo: {
        marginLeft: spacing.md,
    },
    headerName: {
        color: colors.textPrimary,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
    },
    headerStatus: {
        color: colors.primaryLight,
        fontSize: typography.size.xs,
        marginTop: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    addFriendButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    addFriendButtonRequested: {
        backgroundColor: colors.success,
    },
    addFriendText: {
        color: '#fff',
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
    },
    endButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 82, 82, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endButtonIcon: {
        color: colors.error,
        fontSize: 14,
        fontWeight: typography.weight.bold,
    },

    // ─── E2EE Badge ──────────────────────────────────────
    e2eeBadge: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: 'rgba(108, 92, 231, 0.08)',
    },
    e2eeText: {
        color: colors.textMuted,
        fontSize: typography.size.xs,
    },

    // ─── Chat Area ───────────────────────────────────────
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingVertical: spacing.md,
    },

    emptyChat: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 120,
    },
    emptyChatIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyChatText: {
        color: colors.textSecondary,
        fontSize: typography.size.md,
    },

    // ─── Typing Indicator ───────────────────────────────
    typingContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xs,
    },
    typingBubble: {
        backgroundColor: colors.bubbleReceived,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        alignSelf: 'flex-start',
    },
    typingDots: {
        color: colors.textMuted,
        fontSize: typography.size.sm,
        letterSpacing: 2,
    },

    // ─── Input Bar ───────────────────────────────────────
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.xxl,
        paddingHorizontal: spacing.lg,
        paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
        marginRight: spacing.sm,
        maxHeight: 120,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    textInput: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    sendButtonDisabled: {
        backgroundColor: colors.surface,
        opacity: 0.5,
    },
    sendIcon: {
        color: '#fff',
        fontSize: 16,
    },
});
