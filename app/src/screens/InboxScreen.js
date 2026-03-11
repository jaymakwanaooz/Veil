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
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function InboxScreen({ navigation }) {
    const { user, logout, accounts, switchAccount } = useAuth();
    const { conversations, setConversations } = useChat();
    const [refreshing, setRefreshing] = React.useState(false);
    const [profileImage, setProfileImage] = React.useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
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
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={pickImage} style={styles.profileSection} activeOpacity={0.8}>
                    <View style={styles.avatarWrapper}>
                        <Avatar username={user?.username || 'User'} size={50} imageUrl={profileImage} />
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>✏️</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Hello,</Text>
                        <Text style={styles.username}>{user?.username || 'User'}</Text>
                    </View>
                </TouchableOpacity>

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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatarWrapper: {
        position: 'relative',
    },
    editBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.surface,
        borderRadius: 12,
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.background,
    },
    editBadgeText: {
        fontSize: 10,
        marginLeft: 1, // small generic optical centering
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
