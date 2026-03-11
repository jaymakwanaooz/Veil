import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { conversationsAPI } from '../api/client';
import ConversationItem from '../components/ConversationItem';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import * as SecureStore from 'expo-secure-store';

export default function InboxScreen({ navigation }) {
    const { user } = useAuth();
    const { conversations, setConversations } = useChat();
    const [refreshing, setRefreshing] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [pinnedChats, setPinnedChats] = React.useState([]);

    useEffect(() => {
        const loadPinned = async () => {
            try {
                const stored = await SecureStore.getItemAsync('pinned_chats');
                if (stored) setPinnedChats(JSON.parse(stored));
            } catch (e) { console.log('Failed to load pinned chats'); }
        };
        loadPinned();
    }, []);

    const togglePin = async (chatId) => {
        let updated;
        if (pinnedChats.includes(chatId)) {
            updated = pinnedChats.filter(id => id !== chatId);
        } else {
            updated = [...pinnedChats, chatId];
        }
        setPinnedChats(updated);
        try {
            await SecureStore.setItemAsync('pinned_chats', JSON.stringify(updated));
        } catch (e) { console.log('Failed to save pinned chats'); }
    };

    const fetchConversations = useCallback(async () => {
        try {
            const response = await conversationsAPI.getAll();
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchConversations();
        setRefreshing(false);
    };

    const handleConversationPress = (conversation) => {
        const otherUser = conversation.participants?.find(
            (p) => p._id !== user._id
        );

        navigation.navigate('Chat', {
            roomId: conversation.roomId,
            conversationId: conversation._id,
            partnerPublicKey: otherUser?.publicKey,
            partnerId: otherUser?._id,
            partnerName: conversation.type === 'friend' ? otherUser?.username : 'Stranger',
            isAnonymous: conversation.type === 'anonymous',
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>

            {/* ─── Search Bar ───────────────────────────────── */}
            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search conversations..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            <Text style={styles.sectionTitle}>Messages</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
                Go to Discover to find someone to chat with!
            </Text>
        </View>
    );

    const filteredAndSortedConversations = React.useMemo(() => {
        let filtered = conversations;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = conversations.filter(conversation => {
                const otherUser = conversation.participants?.find(p => p._id !== user?._id);
                const name = conversation.type === 'anonymous' ? 'Stranger' : (otherUser?.username || '');
                return name.toLowerCase().includes(query) || 
                       (conversation.lastMessage?.text || '').toLowerCase().includes(query);
            });
        }
        
        return filtered.sort((a, b) => {
            const aPinned = pinnedChats.includes(a._id);
            const bPinned = pinnedChats.includes(b._id);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            
            // Fallback to timestamp sort
            const tA = new Date(a.lastMessage?.timestamp || 0).getTime();
            const tB = new Date(b.lastMessage?.timestamp || 0).getTime();
            return tB - tA;
        });
    }, [conversations, searchQuery, pinnedChats, user]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <FlatList
                data={filteredAndSortedConversations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ConversationItem
                        conversation={item}
                        currentUserId={user?._id}
                        onPress={handleConversationPress}
                        onLongPress={() => togglePin(item._id)}
                        isPinned={pinnedChats.includes(item._id)}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    { paddingBottom: 120 }, // Always clear the floating tab bar
                    conversations.length === 0 ? styles.emptyList : undefined,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // ─── Header ──────────────────────────────────────────
    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
    },

    // ─── Search ──────────────────────────────────────────
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: typography.size.md,
        paddingVertical: 0,
    },

    sectionTitle: {
        fontSize: typography.size.sm,
        color: colors.textMuted,
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
    },

    // ─── Empty State ─────────────────────────────────────
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxxl,
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
