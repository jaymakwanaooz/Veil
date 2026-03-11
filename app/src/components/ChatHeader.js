import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * ChatHeader — Full-width chat header matching the Stitch design.
 * Props:
 *   partnerName     {string}
 *   isTyping        {boolean}
 *   isAnonymous     {boolean}   Show Add Friend / End Chat menu options
 *   friendRequested {boolean}   Whether friend request was already sent
 *   onBack          {function}
 *   onAddFriend     {function}
 *   onEndChat       {function}
 */
export default function ChatHeader({
    partnerName = 'Stranger',
    isTyping = false,
    isAnonymous = false,
    friendRequested = false,
    onBack,
    onAddFriend,
    onEndChat,
}) {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <View style={styles.header}>
            {/* ─── Back Arrow ──────────────────────── */}
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* ─── Center: Avatar + Name + Status ──── */}
            <View style={styles.center}>
                <View style={styles.avatarWrap}>
                    <Avatar username={partnerName} size={34} />
                    {/* Online indicator dot */}
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.nameBlock}>
                    <Text style={styles.name} numberOfLines={1}>{partnerName}</Text>
                    <Text style={styles.status}>
                        {isTyping ? 'typing...' : 'Online'}
                    </Text>
                </View>
            </View>

            {/* ─── Overflow Menu Button ─────────────── */}
            <TouchableOpacity
                style={styles.menuBtn}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* ─── Dropdown Menu Modal ──────────────── */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.dropdown}>
                        {isAnonymous && (
                            <TouchableOpacity
                                style={[
                                    styles.menuItem,
                                    friendRequested && styles.menuItemDisabled,
                                ]}
                                onPress={() => {
                                    setMenuVisible(false);
                                    onAddFriend?.();
                                }}
                                disabled={friendRequested}
                            >
                                <Ionicons
                                    name="person-add-outline"
                                    size={18}
                                    color={friendRequested ? colors.textMuted : colors.primary}
                                />
                                <Text style={[styles.menuItemText, friendRequested && styles.menuItemTextMuted]}>
                                    {friendRequested ? 'Friend Request Sent ✓' : 'Add Friend'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {isAnonymous && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    onEndChat?.();
                                }}
                            >
                                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                                <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>
                                    End Chat
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => setMenuVisible(false)}
                        >
                            <Ionicons name="close-outline" size={18} color={colors.textMuted} />
                            <Text style={[styles.menuItemText, { color: colors.textMuted }]}>
                                Dismiss
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 55 : 38,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },

    // ─── Back ────────────────────────────────────────
    backBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Center ──────────────────────────────────────
    center: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing.sm,
    },
    avatarWrap: {
        position: 'relative',
        marginRight: spacing.sm,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.online,
        borderWidth: 2,
        borderColor: colors.surface,
    },
    nameBlock: {
        alignItems: 'flex-start',
    },
    name: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    status: {
        fontSize: typography.size.xs,
        color: colors.online,
        marginTop: 1,
    },

    // ─── Menu Button ─────────────────────────────────
    menuBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Dropdown ────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'ios' ? 110 : 90,
        paddingRight: 16,
    },
    dropdown: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        minWidth: 200,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    menuItemDisabled: {
        opacity: 0.5,
    },
    menuItemText: {
        fontSize: typography.size.md,
        color: colors.textPrimary,
        fontWeight: typography.weight.medium,
    },
    menuItemTextDestructive: {
        color: colors.error,
    },
    menuItemTextMuted: {
        color: colors.textMuted,
    },
});
