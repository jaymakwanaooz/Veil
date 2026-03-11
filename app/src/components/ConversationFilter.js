import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

const FILTERS = ['All', 'Unread', 'Archived'];

/**
 * ConversationFilter — All / Unread / Archived tab row.
 * Props:
 *   active   {string}   Currently active filter label
 *   onChange {function} Called with new filter label on press
 */
export default function ConversationFilter({ active, onChange }) {
    return (
        <View style={styles.container}>
            {FILTERS.map((filter) => {
                const isActive = active === filter;
                return (
                    <TouchableOpacity
                        key={filter}
                        style={styles.tab}
                        onPress={() => onChange(filter)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {filter}
                        </Text>
                        {isActive && <View style={styles.underline} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        marginBottom: spacing.sm,
    },
    tab: {
        marginRight: spacing.xxl,
        paddingBottom: spacing.sm,
        position: 'relative',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.size.md,
        color: colors.textMuted,
        fontWeight: typography.weight.medium,
    },
    labelActive: {
        color: colors.textPrimary,
        fontWeight: typography.weight.bold,
    },
    underline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        borderRadius: 1,
        backgroundColor: colors.primary,
    },
});
