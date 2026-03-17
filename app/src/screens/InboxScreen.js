import React, { useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { conversationsAPI } from '../api/client';
import ConversationItem from '../components/ConversationItem';
import ConversationFilter from '../components/ConversationFilter';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import * as SecureStore from 'expo-secure-store';

export default function InboxScreen({ navigation }) {
    const { user } = useAuth();
    const { conversations, setConversations } = useChat();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [pinnedChats, setPinnedChats] = React.useState([]);
    const [activeFilter, setActiveFilter] = React.useState('All');

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

    const filteredAndSortedConversations = React.useMemo(() => {
        let filtered = conversations;

        // Apply filter tab
        if (activeFilter === 'Unread') {
            filtered = filtered.filter(c => c.unreadCount > 0);
        } else if (activeFilter === 'Archived') {
            filtered = filtered.filter(c => c.archived);
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(conversation => {
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
            const tA = new Date(a.lastMessage?.timestamp || 0).getTime();
            const tB = new Date(b.lastMessage?.timestamp || 0).getTime();
            return tB - tA;
        });
    }, [conversations, searchQuery, pinnedChats, user, activeFilter]);

    const headerElement = (
        <View>
            {/* ─── Page Header ─────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Messages</Text>
                <TouchableOpacity style={styles.composeBtn} activeOpacity={0.7}>
                    <Ionicons name="create-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* ─── Search Bar ──────────────────────── */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
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

            {/* ─── Filter Tabs ─────────────────────── */}
            <ConversationFilter active={activeFilter} onChange={setActiveFilter} />
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>
                {activeFilter === 'Unread' ? 'No unread messages' :
                    activeFilter === 'Archived' ? 'No archived chats' :
                        'No conversations yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {activeFilter === 'All'
                    ? 'Go to Discover to find someone to chat with!'
                    : 'All caught up!'}
            </Text>
        </View>
    );

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
                ListHeaderComponent={headerElement}
                ListEmptyComponent={renderEmpty()}
                contentContainerStyle={[
                    { paddingBottom: 120 },
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    composeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },

    // ─── Search ──────────────────────────────────────────
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    searchIcon: {
        marginRight: spacing.md,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 16,
        paddingVertical: 0,
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
        paddingTop: 100,
    },
    emptyIcon: {
        fontSize: 72,
        marginBottom: spacing.xl,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
