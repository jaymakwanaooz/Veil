import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Avatar component with online indicator
 */
export default function Avatar({
    username = 'U',
    size = 48,
    isOnline = false,
    showBorder = true,
    imageUrl = null,
    style,
}) {
    // Generate a consistent color based on username
    const getColor = (name) => {
        const avatarColors = [
            '#6C5CE7', '#A29BFE', '#00D2FF', '#00E676',
            '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF',
            '#FF78C4', '#9B59B6', '#E74C3C', '#1ABC9C',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return avatarColors[Math.abs(hash) % avatarColors.length];
    };

    const bgColor = getColor(username);
    const initial = username.charAt(0).toUpperCase();

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>
            <View
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: bgColor,
                        borderWidth: showBorder ? 2 : 0,
                    },
                ]}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
                ) : (
                    <Text
                        style={[
                            styles.initial,
                            { fontSize: size * 0.4 },
                        ]}
                    >
                        {initial}
                    </Text>
                )}
            </View>

            {isOnline && (
                <View
                    style={[
                        styles.onlineIndicator,
                        {
                            width: size * 0.28,
                            height: size * 0.28,
                            borderRadius: size * 0.14,
                            borderWidth: size * 0.06,
                            right: 0,
                            bottom: 0,
                        },
                    ]}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.primaryLight,
    },
    initial: {
        color: colors.textPrimary,
        fontWeight: typography.weight.bold,
    },
    onlineIndicator: {
        position: 'absolute',
        backgroundColor: colors.online,
        borderColor: colors.background,
    },
});
