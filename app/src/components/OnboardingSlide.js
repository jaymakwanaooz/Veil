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
        height: 220,
        borderRadius: 20,
        backgroundColor: '#D4EEF7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 36,
        overflow: 'hidden',
    },
    textBlock: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A2340',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.3,
    },
    body: {
        fontSize: 15,
        color: '#5A6A8A',
        textAlign: 'center',
        lineHeight: 22,
    },
});
