import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function AccountSwitcherScreen({ navigation }) {
    const { user, accounts, switchAccount, deleteAccount, logout } = useAuth();

    const handleSwitch = async (account) => {
        if (account.userId === user?._id) return; // Already active
        await switchAccount(account.userId);
        navigation.goBack();
    };

    const handleDelete = (account) => {
        Alert.alert(
            'Remove Account',
            `Remove "${account.username}" from this device? You can always log back in.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => deleteAccount(account.userId),
                },
            ]
        );
    };

    const renderAccount = ({ item }) => {
        const isActive = item.userId === user?._id;

        return (
            <TouchableOpacity
                style={[styles.accountCard, isActive && styles.accountCardActive]}
                onPress={() => handleSwitch(item)}
                onLongPress={() => handleDelete(item)}
                activeOpacity={0.7}
            >
                <Avatar username={item.username} size={48} />

                <View style={styles.accountInfo}>
                    <Text style={styles.accountUsername}>{item.username}</Text>
                    <Text style={styles.accountHint}>
                        {isActive ? '● Currently active' : 'Tap to switch'}
                    </Text>
                </View>

                {isActive && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* ─── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Accounts</Text>
                <View style={styles.placeholder} />
            </View>

            {/* ─── Account List ───────────────────────────── */}
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.userId}
                renderItem={renderAccount}
                contentContainerStyle={styles.list}
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Button
                            title="Add Another Account"
                            variant="outline"
                            onPress={() => {
                                logout();
                            }}
                            icon={<Text style={{ fontSize: 18 }}>+</Text>}
                            style={styles.addButton}
                        />

                        <Text style={styles.footerHint}>
                            Long press an account to remove it from this device
                        </Text>
                    </View>
                }
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
        paddingTop: 60,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        color: colors.textPrimary,
        fontSize: 24,
    },
    title: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    placeholder: {
        width: 36,
    },

    // ─── List ────────────────────────────────────────────
    list: {
        padding: spacing.xl,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    accountCardActive: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(108, 92, 231, 0.08)',
    },
    accountInfo: {
        flex: 1,
        marginLeft: spacing.lg,
    },
    accountUsername: {
        color: colors.textPrimary,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
    },
    accountHint: {
        color: colors.textMuted,
        fontSize: typography.size.sm,
        marginTop: 2,
    },
    activeBadge: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.full,
    },
    activeBadgeText: {
        color: '#fff',
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
    },

    // ─── Footer ──────────────────────────────────────────
    footer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    addButton: {
        width: '100%',
    },
    footerHint: {
        color: colors.textMuted,
        fontSize: typography.size.xs,
        marginTop: spacing.lg,
        textAlign: 'center',
    },
});
