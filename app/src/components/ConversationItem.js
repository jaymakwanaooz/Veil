import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Avatar from './Avatar';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Conversation list item for Inbox
 */
export default function ConversationItem({
    conversation,
    currentUserId,
    onPress,
    onLongPress,
    isPinned,
}) {
    // Get the other participant
    const otherUser = conversation.participants?.find(
        (p) => p._id !== currentUserId
    );

    const displayName = conversation.type === 'anonymous'
        ? 'Stranger'
        : otherUser?.username || 'Unknown';

    const lastMessage = conversation.lastMessage;
    const timeAgo = lastMessage?.timestamp
        ? formatTimeAgo(new Date(lastMessage.timestamp))
        : '';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(conversation)}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <Avatar
                username={displayName}
                size={52}
                isOnline={otherUser?.isOnline}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {isPinned ? '📌 ' : ''}{displayName}
                    </Text>
                    <Text style={styles.time}>{timeAgo}</Text>
                </View>

                <Text style={styles.preview} numberOfLines={1}>
                    {lastMessage?.text || 'Start chatting...'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.surface,
    },
    content: {
        flex: 1,
        marginLeft: spacing.lg,
        paddingVertical: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: typography.weight.bold,
        flex: 1,
        marginRight: spacing.sm,
    },
    time: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: typography.weight.medium,
    },
    preview: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 18,
    },
});
