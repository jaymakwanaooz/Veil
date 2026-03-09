import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { conversationsAPI } from '../api/client';
import ConversationItem from '../components/ConversationItem';
import Avatar from '../components/Avatar';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function InboxScreen({ navigation }) {
    const { user, logout, accounts, switchAccount } = useAuth();
    const { conversations, setConversations } = useChat();
    const [refreshing, setRefreshing] = React.useState(false);

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
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{user?.username || 'User'}</Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.navigate('AccountSwitcher')}
                    >
                        <Text style={styles.headerButtonIcon}>👤</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={logout}
                    >
                        <Text style={styles.headerButtonIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Search Bar (decorative) ────────────────── */}
            <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <Text style={styles.searchPlaceholder}>Search conversations...</Text>
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

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ConversationItem
                        conversation={item}
                        currentUserId={user?._id}
                        onPress={handleConversationPress}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={
                    conversations.length === 0 ? styles.emptyList : undefined
                }
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
    },
    username: {
        fontSize: typography.size.xxxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerButtonIcon: {
        fontSize: 18,
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
    searchPlaceholder: {
        color: colors.textMuted,
        fontSize: typography.size.md,
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
