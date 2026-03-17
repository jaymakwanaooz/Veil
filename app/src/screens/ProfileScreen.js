import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const insets = useSafeAreaInsets();

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

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* ─── Header ──────────────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ─── Avatar + Name + Bio ─────────────── */}
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                        <Avatar username={user?.username || 'User'} size={100} imageUrl={profileImage} />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color={colors.surface} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{user?.username || 'User'}</Text>

                    {/* ─── Bio subtitle from Stitch design ── */}
                    <Text style={styles.bio}>Securing the digital frontier.</Text>
                </View>

                {/* ─── Menu Items ──────────────────────── */}
                <View style={styles.menuSection}>

                    {/* Switch Account */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('AccountSwitcher')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuIconContainer}>
                            <Feather name="users" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Switch Account</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* Add Account */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('AccountSwitcher')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>Add Account</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>

                    {/* Log Out */}
                    <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemDestructive]}
                        onPress={logout}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.menuIconContainer, styles.menuIconContainerDestructive]}>
                            <Feather name="log-out" size={20} color="#ff4444" />
                        </View>
                        <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    scrollContent: {
        paddingBottom: 120,
    },

    // ─── Profile Section ─────────────────────────────────
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: colors.surface,
        marginHorizontal: spacing.xl,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.xl,
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: colors.primary,
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
        ...shadows.sm,
    },
    greeting: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: typography.weight.medium,
        marginBottom: 2,
    },
    username: {
        fontSize: 28,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: colors.textMuted,
        fontWeight: typography.weight.medium,
    },

    // ─── Menu ────────────────────────────────────────────
    menuSection: {
        paddingHorizontal: spacing.xl,
        marginTop: spacing.xxl,
        gap: spacing.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    menuItemDestructive: {
        borderColor: colors.error + '20',
    },
    menuIconContainerDestructive: {
        backgroundColor: colors.error + '08',
        borderColor: colors.error + '20',
    },
    menuItemTextDestructive: {
        color: colors.error,
    },
});
