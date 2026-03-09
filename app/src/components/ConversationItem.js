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
                        {displayName}
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
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    content: {
        flex: 1,
        marginLeft: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    name: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        flex: 1,
        marginRight: spacing.sm,
    },
    time: {
        color: colors.textMuted,
        fontSize: typography.size.xs,
    },
    preview: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
    },
});
