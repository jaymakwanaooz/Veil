import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
    const { login, register, accounts, switchAccount, error, isLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const handleAuth = async () => {
        setLocalError('');

        if (!username.trim() || !password.trim()) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (!isLogin && password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        const result = isLogin
            ? await login(username.trim(), password)
            : await register(username.trim(), password);

        if (!result.success) {
            setLocalError(result.message);
        }
    };

    const displayError = localError || error;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ─── Header ─────────────────────────────────── */}
                <View style={styles.header}>
                    <Image source={require('../../assets/veil_logo.png')} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.title}>Veil</Text>
                    <Text style={styles.subtitle}>Anonymous. Encrypted. Yours.</Text>
                </View>

                {/* ─── Form Card ──────────────────────────────── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                        {isLogin
                            ? 'Enter your credentials to continue'
                            : 'No email. No phone. Just a username.'}
                    </Text>

                    <Input
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Choose a username"
                        autoCapitalize="none"
                        icon={<Text style={styles.inputIcon}>👤</Text>}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
                        icon={<Text style={styles.inputIcon}>🔒</Text>}
                    />

                    {!isLogin && (
                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter password"
                            secureTextEntry
                            icon={<Text style={styles.inputIcon}>🔒</Text>}
                        />
                    )}

                    {displayError ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>⚠️ {displayError}</Text>
                        </View>
                    ) : null}

                    <Button
                        title={isLogin ? 'Sign In' : 'Create Account'}
                        onPress={handleAuth}
                        loading={isLoading}
                        size="lg"
                        style={styles.authButton}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            setIsLogin(!isLogin);
                            setLocalError('');
                        }}
                        style={styles.toggleContainer}
                    >
                        <Text style={styles.toggleText}>
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <Text style={styles.toggleLink}>
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Saved Accounts ─────────────────────────── */}
                {accounts.length > 0 && (
                    <View style={styles.savedSection}>
                        <Text style={styles.savedTitle}>Saved Accounts</Text>
                        {accounts.map((account) => (
                            <TouchableOpacity
                                key={account.userId}
                                style={styles.savedAccount}
                                onPress={() => switchAccount(account.userId)}
                            >
                                <View style={styles.savedAvatar}>
                                    <Text style={styles.savedAvatarText}>
                                        {account.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.savedInfo}>
                                    <Text style={styles.savedUsername}>{account.username}</Text>
                                    <Text style={styles.savedHint}>Tap to switch</Text>
                                </View>
                                <Text style={styles.switchIcon}>→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ─── E2EE Notice ────────────────────────────── */}
                <View style={styles.notice}>
                    <Text style={styles.noticeIcon}>🔐</Text>
                    <Text style={styles.noticeText}>
                        End-to-end encrypted. Your keys are generated locally and never leave this device.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: 80,
        paddingBottom: spacing.huge,
    },

    // ─── Header ──────────────────────────────────────────
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.size.display,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        letterSpacing: typography.letterSpacing.wider,
    },
    subtitle: {
        fontSize: typography.size.md,
        color: colors.textMuted,
        marginTop: spacing.sm,
        letterSpacing: typography.letterSpacing.wide,
    },

    // ─── Card ────────────────────────────────────────────
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xxl,
        padding: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.md,
    },
    cardTitle: {
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    cardSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xxl,
    },

    inputIcon: {
        fontSize: 18,
    },

    errorContainer: {
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.2)',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.sm,
        textAlign: 'center',
    },

    authButton: {
        marginTop: spacing.sm,
    },

    toggleContainer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    toggleText: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
    },
    toggleLink: {
        color: colors.primary,
        fontWeight: typography.weight.semibold,
    },

    // ─── Saved Accounts ─────────────────────────────────
    savedSection: {
        marginTop: spacing.xxxl,
    },
    savedTitle: {
        fontSize: typography.size.sm,
        color: colors.textMuted,
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
        marginBottom: spacing.md,
    },
    savedAccount: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    savedAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    savedAvatarText: {
        color: '#fff',
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
    },
    savedInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    savedUsername: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        fontWeight: typography.weight.medium,
    },
    savedHint: {
        color: colors.textMuted,
        fontSize: typography.size.xs,
        marginTop: 2,
    },
    switchIcon: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: typography.weight.bold,
    },

    // ─── Notice ──────────────────────────────────────────
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xxxl,
        paddingHorizontal: spacing.lg,
    },
    noticeIcon: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    noticeText: {
        flex: 1,
        color: colors.textMuted,
        fontSize: typography.size.xs,
        lineHeight: 16,
    },
});
