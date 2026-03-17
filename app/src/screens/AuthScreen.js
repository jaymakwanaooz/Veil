import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
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
            behavior="height"
        >
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ─── Header ─────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/veil_logo_v2.png')} style={styles.logo} resizeMode="contain" />
                    </View>
                    <Text style={styles.title}>VEIL</Text>
                    <Text style={styles.subtitle}>Secure Anonymous Messaging</Text>
                </View>

                {/* ─── Form Card ──────────────────────────────── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                            {isLogin ? 'Login to Veil' : 'Join the Shadows'}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {isLogin
                                ? 'Encrypted credentials required'
                                : 'No personal data. Just identity.'}
                        </Text>
                    </View>

                    <Input
                        label="Username"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="your_alias"
                        autoCapitalize="none"
                        icon={<Feather name="user" size={18} color={colors.textMuted} />}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry
                        icon={<Feather name="lock" size={18} color={colors.textMuted} />}
                    />

                    {!isLogin && (
                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="••••••••"
                            secureTextEntry
                            icon={<Feather name="shield" size={18} color={colors.textMuted} />}
                        />
                    )}

                    {displayError ? (
                        <View style={styles.errorContainer}>
                            <Feather name="alert-circle" size={14} color={colors.error} />
                            <Text style={styles.errorText}>{displayError}</Text>
                        </View>
                    ) : null}

                    <Button
                        title={isLogin ? 'Sign In' : 'Create Identity'}
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
                            {isLogin ? "New here? " : 'Known identity? '}
                            <Text style={styles.toggleLink}>
                                {isLogin ? 'Create Account' : 'Login Proceed'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Saved Accounts ─────────────────────────── */}
                {accounts.length > 0 && isLogin && (
                    <View style={styles.savedSection}>
                        <Text style={styles.savedTitle}>SECURE VAULT</Text>
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
                                    <Text style={styles.savedHint}>Ready for session</Text>
                                </View>
                                <Feather name="corner-down-right" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ─── E2EE Notice ────────────────────────────── */}
                <View style={styles.notice}>
                    <Feather name="shield" size={14} color={colors.textMuted} />
                    <Text style={styles.noticeText}>
                        End-to-end encrypted. All data is routed through secure tunnels.
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
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: spacing.md,
        ...shadows.sm,
        marginBottom: spacing.lg,
    },
    logo: {
        width: 60,
        height: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: typography.size.sm,
        color: colors.textMuted,
        marginTop: 4,
        fontWeight: typography.weight.medium,
    },

    // ─── Card ────────────────────────────────────────────
    card: {
        backgroundColor: colors.surface,
        borderRadius: 32,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.lg,
    },
    cardHeader: {
        marginBottom: spacing.xl,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '10',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.error + '20',
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.sm,
        marginLeft: spacing.sm,
        flex: 1,
    },

    authButton: {
        marginTop: spacing.md,
        borderRadius: borderRadius.xl,
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
        fontWeight: typography.weight.bold,
    },

    // ─── Saved Accounts ─────────────────────────────────
    savedSection: {
        marginTop: spacing.xxxl,
    },
    savedTitle: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: typography.weight.heavy,
        letterSpacing: 1.5,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    savedAccount: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xxl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    savedAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    savedAvatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: typography.weight.bold,
    },
    savedInfo: {
        flex: 1,
        marginLeft: spacing.lg,
    },
    savedUsername: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
    },
    savedHint: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: 2,
    },

    // ─── Notice ──────────────────────────────────────────
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xxxl,
        opacity: 0.6,
    },
    noticeText: {
        color: colors.textMuted,
        fontSize: 12,
        marginLeft: spacing.sm,
    },
});
