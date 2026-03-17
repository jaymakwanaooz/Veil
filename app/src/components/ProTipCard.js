import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

/**
 * ProTipCard — Stitch-style informational callout card.
 * Props:
 *   label  {string}  Short header (default "PRO TIP")
 *   text   {string}  Body copy
 *   icon   {string}  Ionicon name (default "information-circle")
 */
export default function ProTipCard({
    label = 'PRO TIP',
    text = 'Complete your bio to get matched with people who share your interests.',
    icon = 'information-circle',
}) {
    return (
        <View style={styles.card}>
            <Ionicons name={icon} size={18} color={colors.primary} style={styles.icon} />
            <View style={styles.textBox}>
                <Text style={styles.label}>{label.toUpperCase()}</Text>
                <Text style={styles.body}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginHorizontal: spacing.xl,
        ...shadows.sm,
    },
    icon: {
        marginRight: spacing.md,
        marginTop: 2,
    },
    textBox: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: typography.weight.heavy,
        color: colors.primary,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    body: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
