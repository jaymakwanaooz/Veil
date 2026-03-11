import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { colors, typography, spacing, borderRadius } from '../theme';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [profileImage, setProfileImage] = useState(null);

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
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                        <Avatar username={user?.username || 'User'} size={100} imageUrl={profileImage} />
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color={colors.surface} />
                        </View>
                    </TouchableOpacity>
                    
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.username}>{user?.username || 'User'}</Text>
                </View>

                <View style={styles.menuSection}>
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
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    scrollContent: {
        paddingBottom: 120, // Tab bar padding
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.background,
    },
    greeting: {
        fontSize: typography.size.lg,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    username: {
        fontSize: 32,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
    },
    menuSection: {
        paddingHorizontal: spacing.xl,
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '1A', // 10% opacity primary
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuItemText: {
        flex: 1,
        fontSize: typography.size.md,
        fontWeight: typography.weight.medium,
        color: colors.textPrimary,
    },
    menuItemDestructive: {
        backgroundColor: colors.surface,
    },
    menuIconContainerDestructive: {
        backgroundColor: '#ff44441A',
    },
    menuItemTextDestructive: {
        color: '#ff4444',
    },
});
