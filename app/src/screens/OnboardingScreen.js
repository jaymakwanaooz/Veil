import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Platform,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import OnboardingSlide from '../components/OnboardingSlide';
import OnboardingDots from '../components/OnboardingDots';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // ─── Top Bar ─────────────────────────────────────────
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 36,
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    skipText: {
        fontSize: 15,
        color: colors.primary,
        fontWeight: typography.weight.bold,
    },

    // ─── Slides ──────────────────────────────────────────
    slidesContent: {
        alignItems: 'center',
    },

    // ─── Footer ──────────────────────────────────────────
    footer: {
        paddingHorizontal: 28,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
        gap: 24,
        alignItems: 'center',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 18,
        width: '100%',
        ...shadows.md,
    },
    nextBtnText: {
        fontSize: 18,
        fontWeight: typography.weight.bold,
        color: '#fff',
    },

    // ─── Illustration Helpers ─────────────────────────────
    illustrationWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },

    // Slide 1 — Shield
    shieldOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
    keyBadge: {
        position: 'absolute',
        bottom: 10,
        right: width / 2 - 80,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },

    // Slide 2 — Username
    avatarCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary + '40',
    },
    idBadge: {
        position: 'absolute',
        bottom: 15,
        right: width / 2 - 75,
        width: 56,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },

    // Slide 3 — Matching
    phoneFrame: {
        width: 110,
        height: 140,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
    },
    linkIcon: {
        position: 'absolute',
        bottom: 10,
        right: width / 2 - 70,
    },
});

// ─── Slide Data ──────────────────────────────────────────
const SLIDES = [
    {
        key: 'e2e',
        icon: (
            <View style={styles.illustrationWrap}>
                <View style={styles.shieldOuter}>
                    <Ionicons name="shield-checkmark" size={72} color="#fff" />
                </View>
                <View style={styles.keyBadge}>
                    <Ionicons name="key" size={20} color={colors.primary} />
                </View>
            </View>
        ),
        title: 'E2E Encryption',
        body: "Your messages are secured with military-grade E2EE. Only the intended recipient can decipher your words.",
    },
    {
        key: 'username',
        icon: (
            <View style={styles.illustrationWrap}>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={48} color={colors.primary} />
                </View>
                <View style={styles.idBadge}>
                    <Ionicons name="finger-print-outline" size={28} color="#fff" />
                </View>
            </View>
        ),
        title: 'Pseudonym Identity',
        body: 'No phone numbers. No emails. Create a unique alias and jump into the shadows instantly.',
    },
    {
        key: 'matching',
        icon: (
            <View style={styles.illustrationWrap}>
                <View style={styles.phoneFrame}>
                    <Ionicons name="repeat-outline" size={56} color="#fff" />
                </View>
                <Ionicons
                    name="link"
                    size={30}
                    color={colors.warning}
                    style={styles.linkIcon}
                />
            </View>
        ),
        title: 'Anonymous Matching',
        body: 'Find matches across the network. Stay hidden until both sides choose to reveal their aliases.',
    },
];

export default function OnboardingScreen({ navigation, onComplete }) {
    const flatListRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNext = async () => {
        if (activeIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
            setActiveIndex(activeIndex + 1);
        } else {
            await markSeen();
        }
    };

    const handleSkip = async () => {
        await markSeen();
    };

    const markSeen = async () => {
        try {
            await SecureStore.setItemAsync('onboarding_seen', 'true');
        } catch (_) {}

        if (onComplete) {
            onComplete();
        } else {
            navigation.replace('Auth');
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* ─── Skip ────────────────────────────── */}
            <View style={styles.topBar}>
                {activeIndex > 0 && (
                    <TouchableOpacity onPress={() => {
                        flatListRef.current?.scrollToIndex({ index: activeIndex - 1 });
                        setActiveIndex(activeIndex - 1);
                    }}>
                        <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip Intro</Text>
                </TouchableOpacity>
            </View>

            {/* ─── Slides ──────────────────────────── */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.key}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <OnboardingSlide
                        icon={item.icon}
                        title={item.title}
                        body={item.body}
                    />
                )}
                style={{ flex: 1 }}
                contentContainerStyle={styles.slidesContent}
            />

            {/* ─── Footer: Dots + Button ───────────── */}
            <View style={styles.footer}>
                <OnboardingDots count={SLIDES.length} activeIndex={activeIndex} />

                <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextBtnText}>
                        {isLast ? 'Begin Session' : 'Continue'}
                    </Text>
                    {!isLast && (
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
