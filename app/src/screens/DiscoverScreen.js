import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../context/ChatContext';
import { findMatch, cancelMatch } from '../services/socket';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
    const { isSearching, activeChat } = useChat();

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;
    const ring3 = useRef(new Animated.Value(0)).current;

    // Pulse animation for the main button
    useEffect(() => {
        if (isSearching) {
            // Pulsing rings animation
            const createRingAnimation = (anim, delay) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 2000,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            const animations = Animated.parallel([
                createRingAnimation(ring1, 0),
                createRingAnimation(ring2, 600),
                createRingAnimation(ring3, 1200),
            ]);

            animations.start();

            return () => {
                animations.stop();
                ring1.setValue(0);
                ring2.setValue(0);
                ring3.setValue(0);
            };
        }
    }, [isSearching]);

    // Navigate to chat when match is found
    useEffect(() => {
        if (activeChat) {
            navigation.navigate('Chat', {
                roomId: activeChat.roomId,
                conversationId: activeChat.conversationId,
                partnerPublicKey: activeChat.partnerPublicKey,
                partnerId: activeChat.partnerId,
                partnerName: 'Stranger',
                isAnonymous: true,
            });
        }
    }, [activeChat]);

    const handleFindMatch = () => {
        if (isSearching) {
            cancelMatch();
        } else {
            findMatch();
        }
    };

    const renderRing = (animValue, size) => {
        const scale = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2.5],
        });

        const opacity = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 0],
        });

        return (
            <Animated.View
                style={[
                    styles.ring,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            />
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* ─── Header ─────────────────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.title}>Discover</Text>
                <Text style={styles.subtitle}>
                    Find anonymous strangers to chat with
                </Text>
            </View>

            {/* ─── Center Content ─────────────────────────── */}
            <View style={styles.center}>
                {/* Animated Rings */}
                {isSearching && (
                    <View style={styles.ringsContainer}>
                        {renderRing(ring1, 140)}
                        {renderRing(ring2, 140)}
                        {renderRing(ring3, 140)}
                    </View>
                )}

                {/* Main Button */}
                <TouchableOpacity
                    style={[
                        styles.matchButton,
                        isSearching && styles.matchButtonSearching,
                    ]}
                    onPress={handleFindMatch}
                    activeOpacity={0.8}
                >
                    <Text style={styles.matchButtonIcon}>
                        {isSearching ? '⏳' : '🌐'}
                    </Text>
                    <Text style={styles.matchButtonText}>
                        {isSearching ? 'Searching...' : 'Find a Match'}
                    </Text>
                </TouchableOpacity>

                {isSearching && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => cancelMatch()}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ─── Info Cards ─────────────────────────────── */}
            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>🕶️</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Stay Anonymous</Text>
                        <Text style={styles.infoDescription}>
                            Your identity is hidden until you choose to reveal it
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>🔐</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>E2E Encrypted</Text>
                        <Text style={styles.infoDescription}>
                            Messages are encrypted — only you and your match can read them
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoIcon}>🤝</Text>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Add Friends</Text>
                        <Text style={styles.infoDescription}>
                            Like your match? Both tap "Add Friend" to save the conversation
                        </Text>
                    </View>
                </View>
            </View>
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
        paddingTop: 70,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography.size.xxxl,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.size.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },

    // ─── Center ──────────────────────────────────────────
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringsContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: colors.primary,
    },

    matchButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.glow,
    },
    matchButtonSearching: {
        backgroundColor: colors.primaryDark,
    },
    matchButtonIcon: {
        fontSize: 36,
        marginBottom: spacing.xs,
    },
    matchButtonText: {
        color: '#fff',
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.letterSpacing.wide,
    },

    cancelButton: {
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
    },
    cancelText: {
        color: colors.error,
        fontSize: typography.size.md,
        fontWeight: typography.weight.medium,
    },

    // ─── Info Section ────────────────────────────────────
    infoSection: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    infoIcon: {
        fontSize: 24,
        marginRight: spacing.lg,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        color: colors.textPrimary,
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        marginBottom: 2,
    },
    infoDescription: {
        color: colors.textMuted,
        fontSize: typography.size.sm,
        lineHeight: 18,
    },
});
