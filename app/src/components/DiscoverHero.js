import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

/**
 * DiscoverHero — "Meet Someone New" hero panel.
 * Props:
 *   isSearching  {boolean}   Whether a match search is in progress
 *   onFindMatch  {function}  Called when primary CTA is pressed
 *   onAddByName  {function}  Called when secondary CTA is pressed
 */
export default function DiscoverHero({ isSearching, onFindMatch, onAddByName }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            {/* ─── Circular Illustration ─────────── */}
            <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.iconRing}>
                    <Ionicons
                        name={isSearching ? 'time-outline' : 'earth-outline'}
                        size={52}
                        color={colors.primary}
                    />
                </View>
                <Text style={styles.circleTitle}>
                    {isSearching ? 'Searching...' : 'Meet Someone New'}
                </Text>
                <Text style={styles.circleSubtitle}>
                    {isSearching
                        ? 'Finding someone for you'
                        : 'Connect instantly with people around the world safely and anonymously.'}
                </Text>
            </Animated.View>

            {/* ─── Primary CTA ───────────────────── */}
            <TouchableOpacity
                style={[styles.primaryBtn, isSearching && styles.primaryBtnSearching]}
                onPress={onFindMatch}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.85}
            >
                <Ionicons
                    name={isSearching ? 'close-circle-outline' : 'people-outline'}
                    size={18}
                    color="#fff"
                    style={styles.btnIcon}
                />
                <Text style={styles.primaryBtnText}>
                    {isSearching ? 'Cancel Search' : 'Find an Anonymous'}
                </Text>
            </TouchableOpacity>

            {/* ─── Secondary CTA ─────────────────── */}
            <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onAddByName}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="person-add-outline"
                    size={18}
                    color={colors.textSecondary}
                    style={styles.btnIcon}
                />
                <Text style={styles.secondaryBtnText}>Add an Anonymous</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xxl,
        gap: spacing.md,
    },

    // ─── Hero Circle ─────────────────────────────────────
    circle: {
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.md,
    },
    iconRing: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primaryGlow,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: colors.primary + '20',
    },
    circleTitle: {
        fontSize: 22,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    circleSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },

    // ─── Buttons ─────────────────────────────────────────
    primaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 18,
        width: '100%',
        ...shadows.md,
    },
    primaryBtnSearching: {
        backgroundColor: colors.error,
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: typography.weight.bold,
    },
    secondaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingVertical: 16,
        width: '100%',
        borderWidth: 1.5,
        borderColor: colors.primary,
        marginTop: spacing.sm,
    },
    secondaryBtnText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: typography.weight.bold,
    },
    btnIcon: {
        marginRight: spacing.sm,
    },
});
