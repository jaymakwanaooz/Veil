import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

/**
 * ChatDateDivider — Renders a "TODAY" / date separator between messages.
 * Props:
 *   label {string}  The label to display (e.g. "Today", "Yesterday", "Mar 10")
 */
export default function ChatDateDivider({ label = 'Today' }) {
    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    label: {
        fontSize: typography.size.xs,
        color: colors.textMuted,
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        marginHorizontal: spacing.md,
    },
});
