import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useChat } from '../context/ChatContext';
import { findMatch, cancelMatch } from '../services/socket';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
    const { isSearching, activeChat } = useChat();

    // Username search state
    const [searchUsername, setSearchUsername] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null); // { found: bool, username }
    const [searchError, setSearchError] = useState('');

    const handleAddByUsername = async () => {
        const trimmed = searchUsername.trim();
        if (!trimmed) return;
        setSearchLoading(true);
        setSearchResult(null);
        setSearchError('');
        // Mock search — replace with real API call when backend is ready
        await new Promise(r => setTimeout(r, 800));
        // Simulate not-found for any username during dev mode
        setSearchLoading(false);
        setSearchError(`User "${trimmed}" not found. Backend not connected yet.`);
    };

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const ring1 = useRef(new Animated.Value(0)).current;
    const ring2 = useRef(new Animated.Value(0)).current;
    const ring3 = useRef(new Animated.Value(0)).current;

    // Continuous rotation for background gradient
    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="light" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

                {/* ─── Header ─────────────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.title}>Discover</Text>
                    <Text style={styles.subtitle}>
                        Find anonymous strangers to chat with
                    </Text>
                </View>

                {/* ─── Find a Match Button ─────────────────── */}
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
                    <View style={styles.buttonWrapper}>
                        <Animated.View style={[styles.gradientContainer, { transform: [{ rotate: spin }] }]}>
                            <LinearGradient
                                colors={['#8b5cf6', '#3b82f6', '#ec4899', '#8b5cf6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>

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
                    </View>

                    {isSearching && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => cancelMatch()}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ─── Add by Username ─────────────────────── */}
                <View style={styles.addSection}>
                    <Text style={styles.addSectionTitle}>ADD BY USERNAME</Text>
                    <Text style={styles.addSectionSubtitle}>Know someone? Find them directly.</Text>
                    <View style={styles.searchRow}>
                        <TextInput
                            style={styles.usernameInput}
                            placeholder="Enter username..."
                            placeholderTextColor={colors.textMuted}
                            value={searchUsername}
                            onChangeText={text => {
                                setSearchUsername(text);
                                setSearchError('');
                                setSearchResult(null);
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            onSubmitEditing={handleAddByUsername}
                        />
                        <TouchableOpacity
                            style={[styles.searchBtn, !searchUsername.trim() && styles.searchBtnDisabled]}
                            onPress={handleAddByUsername}
                            disabled={!searchUsername.trim() || searchLoading}
                        >
                            {searchLoading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={styles.searchBtnText}>Search</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {searchError ? (
                        <View style={styles.searchFeedback}>
                            <Text style={styles.searchErrorText}>⚠️ {searchError}</Text>
                        </View>
                    ) : null}

                    {searchResult?.found ? (
                        <View style={styles.resultCard}>
                            <View style={styles.resultAvatar}>
                                <Text style={styles.resultAvatarText}>{searchResult.username.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.resultUsername}>{searchResult.username}</Text>
                                <Text style={styles.resultHint}>Tap to start a conversation</Text>
                            </View>
                            <TouchableOpacity style={styles.addBtn}>
                                <Text style={styles.addBtnText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                {/* ─── Info Cards ──────────────────────────── */}
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
        paddingBottom: 120,
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
        paddingVertical: 50, // Added explicit padding to give the button room
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

    buttonWrapper: {
        width: 154,
        height: 154,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientContainer: {
        position: 'absolute',
        width: 154,
        height: 154,
        borderRadius: 77,
        overflow: 'hidden',
    },
    matchButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
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

    // ─── Add by Username ───────────────────────────
    addSection: {
        marginHorizontal: spacing.xl,
        marginBottom: 32, // Increased gap between this section and the info cards below
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xxl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    addSectionTitle: {
        fontSize: typography.size.xs,
        color: colors.textMuted,
        fontWeight: typography.weight.bold,
        letterSpacing: typography.letterSpacing.wider,
        textTransform: 'uppercase',
        marginBottom: spacing.xs,
    },
    addSectionSubtitle: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    searchRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    usernameInput: {
        flex: 1,
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        color: colors.textPrimary,
        fontSize: typography.size.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    searchBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 80,
    },
    searchBtnDisabled: {
        opacity: 0.5,
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: typography.weight.semibold,
        fontSize: typography.size.sm,
    },
    searchFeedback: {
        marginTop: spacing.md,
    },
    searchErrorText: {
        color: colors.error,
        fontSize: typography.size.sm,
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.md,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    resultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultAvatarText: {
        color: '#fff',
        fontWeight: typography.weight.bold,
        fontSize: typography.size.md,
    },
    resultUsername: {
        color: colors.textPrimary,
        fontWeight: typography.weight.semibold,
        fontSize: typography.size.md,
    },
    resultHint: {
        color: colors.textMuted,
        fontSize: typography.size.xs,
    },
    addBtn: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: typography.weight.bold,
        fontSize: typography.size.sm,
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
        marginBottom: spacing.md, // Increased gap between individual info cards
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
