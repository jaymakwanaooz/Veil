import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';

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
                <Text style={styles.label}>{label}</Text>
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
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: spacing.xl,
    },
    icon: {
        marginRight: spacing.md,
        marginTop: 1,
    },
    textBox: {
        flex: 1,
    },
    label: {
        fontSize: typography.size.xs,
        fontWeight: typography.weight.bold,
        color: colors.primary,
        letterSpacing: typography.letterSpacing.wider,
        marginBottom: 3,
    },
    body: {
        fontSize: typography.size.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});
