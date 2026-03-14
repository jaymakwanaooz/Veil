import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Styled text input with floating label feel
 */
export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    autoCapitalize = 'none',
    error,
    icon,
    style,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={secureTextEntry && !showPassword}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={colors.primary}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.togglePassword}
                    >
                        <Text style={styles.toggleText}>
                            {showPassword ? '🙈' : '👁️'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        color: colors.textSecondary,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
        marginBottom: spacing.sm,
        letterSpacing: typography.letterSpacing.wide,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        borderRadius: borderRadius.md,
        borderWidth: 1.5,
        borderColor: 'transparent',
        paddingHorizontal: spacing.lg,
        minHeight: 52,
    },
    inputFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(108, 92, 231, 0.08)',
    },
    inputError: {
        borderColor: colors.error,
    },
    iconContainer: {
        marginRight: spacing.md,
    },
    input: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: typography.size.md,
        paddingVertical: spacing.md,
    },
    togglePassword: {
        padding: spacing.sm,
    },
    toggleText: {
        fontSize: 18,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.size.xs,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
