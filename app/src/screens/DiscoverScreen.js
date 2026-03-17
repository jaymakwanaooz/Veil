import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    ScrollView,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../context/ChatContext';
import { findMatch, cancelMatch } from '../services/socket';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import DiscoverHero from '../components/DiscoverHero';
import ProTipCard from '../components/ProTipCard';

export default function DiscoverScreen({ navigation }) {
    const { isSearching, activeChat } = useChat();

    // Username search state
    const [addSectionOpen, setAddSectionOpen] = useState(false);
    const [searchUsername, setSearchUsername] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');

    const handleAddByUsername = async () => {
        const trimmed = searchUsername.trim();
        if (!trimmed) return;
        setSearchLoading(true);
        setSearchResult(null);
        setSearchError('');
        await new Promise(r => setTimeout(r, 800));
        setSearchLoading(false);
        setSearchError(`User "${trimmed}" not found. Backend not connected yet.`);
    };

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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="height"
        >
            <StatusBar style="light" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* ─── Page Header ─────────────────────── */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Discover</Text>
                    <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                        <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* ─── Hero: Meet Someone New ───────────── */}
                <DiscoverHero
                    isSearching={isSearching}
                    onFindMatch={handleFindMatch}
                    onAddByName={() => setAddSectionOpen(v => !v)}
                />

                {/* ─── Add by Username (Collapsible) ────── */}
                {addSectionOpen && (
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
                                    <Text style={styles.resultAvatarText}>
                                        {searchResult.username.charAt(0).toUpperCase()}
                                    </Text>
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
                )}

                {/* ─── Pro Tip Card — pinned near bottom ────── */}
                <ProTipCard
                    label="PRO TIP"
                    text="Complete your bio to get matched with people who share your interests."
                    icon="information-circle"
                />
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
        paddingBottom: 140,
    },

    // ─── Header ──────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: typography.weight.bold,
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    notifBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Add by Username ─────────────────────────────────
    addSection: {
        marginHorizontal: spacing.xl,
        marginTop: spacing.xl,
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
});
