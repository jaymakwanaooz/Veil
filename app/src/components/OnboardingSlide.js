import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * OnboardingSlide — A single fullscreen slide card.
 * Props:
 *   icon        {ReactNode}  Large illustration/icon area
 *   title       {string}     Bold heading
 *   body        {string}     Description paragraph
 */
export default function OnboardingSlide({ icon, title, body }) {
    return (
        <View style={styles.slide}>
            {/* ─── Illustration Panel ─────────────── */}
            <View style={styles.illustrationPanel}>
                {icon}
            </View>

            {/* ─── Text Block ─────────────────────── */}
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.body}>{body}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: 28,
        flex: 1,
    },
    illustrationPanel: {
        width: '100%',
        height: 240,
        borderRadius: 32,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.sm,
    },
    textBlock: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    body: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
