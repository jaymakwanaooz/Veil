import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

/**
 * OnboardingDots — Stepping dot indicators.
 * Props:
 *   count       {number}   Total number of slides
 *   activeIndex {number}   Currently active slide (0-based)
 */
export default function OnboardingDots({ count, activeIndex }) {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === activeIndex ? styles.dotActive : styles.dotInactive,
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: '#42A5F5',
    },
    dotInactive: {
        width: 8,
        backgroundColor: '#C8D6E5',
    },
});
