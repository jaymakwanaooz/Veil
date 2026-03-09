import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

/**
 * Premium button component with variants
 */
export default function Button({
    title,
    onPress,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
    size = 'md',          // 'sm' | 'md' | 'lg'
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle,
}) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        disabled && styles.textDisabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: spacing.sm,
    },

    // ─── Variants ────────────────────────────────────────
    primary: {
        backgroundColor: colors.primary,
        ...shadows.md,
    },
    secondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // ─── Sizes ───────────────────────────────────────────
    size_sm: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        minHeight: 36,
    },
    size_md: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        minHeight: 48,
    },
    size_lg: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        minHeight: 56,
    },

    // ─── Text ────────────────────────────────────────────
    text: {
        fontWeight: typography.weight.semibold,
        letterSpacing: typography.letterSpacing.wide,
    },
    text_primary: {
        color: '#FFFFFF',
    },
    text_secondary: {
        color: colors.textPrimary,
    },
    text_outline: {
        color: colors.primary,
    },
    text_ghost: {
        color: colors.primary,
    },

    textSize_sm: {
        fontSize: typography.size.sm,
    },
    textSize_md: {
        fontSize: typography.size.md,
    },
    textSize_lg: {
        fontSize: typography.size.lg,
    },

    // ─── States ──────────────────────────────────────────
    disabled: {
        opacity: 0.5,
    },
    textDisabled: {
        opacity: 0.7,
    },
});
