import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Chat bubble component
 * Renders sent messages on the right, received on the left
 */
export default function ChatBubble({
    message,       // decrypted text
    isSent,        // true if current user sent this
    timestamp,
    showTail = true,
}) {
    const time = timestamp
        ? new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
        : '';

    return (
        <View
            style={[
                styles.container,
                isSent ? styles.containerSent : styles.containerReceived,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isSent ? styles.bubbleSent : styles.bubbleReceived,
                    showTail && (isSent ? styles.tailSent : styles.tailReceived),
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        isSent ? styles.textSent : styles.textReceived,
                    ]}
                >
                    {message}
                </Text>

                <Text
                    style={[
                        styles.time,
                        isSent ? styles.timeSent : styles.timeReceived,
                    ]}
                >
                    {time}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
    },
    containerSent: {
        alignItems: 'flex-end',
    },
    containerReceived: {
        alignItems: 'flex-start',
    },

    bubble: {
        maxWidth: '80%',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
    },
    bubbleSent: {
        backgroundColor: colors.bubbleSent,
        borderBottomRightRadius: spacing.xs,
    },
    bubbleReceived: {
        backgroundColor: colors.bubbleReceived,
        borderBottomLeftRadius: spacing.xs,
    },

    tailSent: {
        borderBottomRightRadius: spacing.xs,
    },
    tailReceived: {
        borderBottomLeftRadius: spacing.xs,
    },

    text: {
        fontSize: typography.size.md,
        lineHeight: typography.size.md * typography.lineHeight.normal,
    },
    textSent: {
        color: colors.bubbleSentText,
    },
    textReceived: {
        color: colors.bubbleReceivedText,
    },

    time: {
        fontSize: typography.size.xs,
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    timeSent: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    timeReceived: {
        color: colors.textMuted,
    },
});
