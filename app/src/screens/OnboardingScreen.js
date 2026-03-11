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
        backgroundColor: '#F0F4F9',
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
        color: '#42A5F5',
        fontWeight: '600',
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
        backgroundColor: '#42A5F5',
        borderRadius: 14,
        paddingVertical: 16,
        width: '100%',
        shadowColor: '#42A5F5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: '700',
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
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#5DADE2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyBadge: {
        position: 'absolute',
        bottom: 20,
        right: 48,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 4,
    },

    // Slide 2 — Username
    avatarCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#B3D9ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    idBadge: {
        position: 'absolute',
        bottom: 22,
        right: 44,
        width: 48,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#5DADE2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Slide 3 — Matching
    phoneFrame: {
        width: 100,
        height: 120,
        borderRadius: 18,
        backgroundColor: '#5DADE2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkIcon: {
        position: 'absolute',
        bottom: 20,
        right: 42,
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
                    <Ionicons name="key" size={20} color="#42A5F5" />
                </View>
            </View>
        ),
        title: 'E2E Encryption',
        body: "Your messages and calls are secured with end-to-end encryption. Only you and the person you're communicating with can read or listen to them.",
    },
    {
        key: 'username',
        icon: (
            <View style={styles.illustrationWrap}>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={48} color="#5DADE2" />
                </View>
                <View style={styles.idBadge}>
                    <Ionicons name="id-card-outline" size={28} color="#fff" />
                </View>
            </View>
        ),
        title: 'Username-only Auth',
        body: 'No phone number or email required. Stay anonymous and join conversations instantly with just a unique username.',
    },
    {
        key: 'matching',
        icon: (
            <View style={styles.illustrationWrap}>
                <View style={styles.phoneFrame}>
                    <Ionicons name="phone-portrait-outline" size={56} color="#fff" />
                </View>
                <Ionicons
                    name="link"
                    size={30}
                    color="#F0B429"
                    style={styles.linkIcon}
                />
            </View>
        ),
        title: 'Anonymous Matching',
        body: 'Meet new people safely and securely. Your identity remains private until you choose to reveal it to your match.',
    },
];

export default function OnboardingScreen({ navigation }) {
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
        navigation.replace('Auth');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const isLast = activeIndex === SLIDES.length - 1;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F0F4F9" />

            {/* ─── Skip ────────────────────────────── */}
            <View style={styles.topBar}>
                {activeIndex > 0 && (
                    <TouchableOpacity onPress={() => {
                        flatListRef.current?.scrollToIndex({ index: activeIndex - 1 });
                        setActiveIndex(activeIndex - 1);
                    }}>
                        <Ionicons name="arrow-back" size={22} color="#5A6A8A" />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
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
                        {isLast ? 'Get Started' : 'Next'}
                    </Text>
                    {!isLast && (
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
