import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';

// Screens
import AuthScreen from '../screens/AuthScreen';
import InboxScreen from '../screens/InboxScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ChatScreen from '../screens/ChatScreen';
import AccountSwitcherScreen from '../screens/AccountSwitcherScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab Icons ─────────────────────────────────────────
function TabIcon({ label, emoji, focused }) {
    return (
        <View style={styles.tabIconContainer}>
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
                {emoji}
            </Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
            </Text>
        </View>
    );
}

// ─── Main Tabs ─────────────────────────────────────────
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
            }}
        >
            <Tab.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon label="Inbox" emoji="💬" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon label="Discover" emoji="🌐" focused={focused} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// ─── App Navigator ─────────────────────────────────────
function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
                name="AccountSwitcher"
                component={AccountSwitcherScreen}
                options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
    );
}

// ─── Loading Screen ────────────────────────────────────
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingLogo}>🕶️</Text>
            <Text style={styles.loadingText}>Veil</Text>
        </View>
    );
}

// ─── Root Navigator ────────────────────────────────────
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: colors.primary,
                    background: colors.background,
                    card: colors.surface,
                    text: colors.textPrimary,
                    border: colors.border,
                    notification: colors.primary,
                },
            }}
        >
            {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    // ─── Tab Bar ─────────────────────────────────────────
    tabBar: {
        backgroundColor: colors.surface,
        borderTopColor: colors.divider,
        borderTopWidth: 1,
        height: 85,
        paddingBottom: 20,
        paddingTop: 10,
        elevation: 0,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabEmoji: {
        fontSize: 22,
        marginBottom: 4,
        opacity: 0.5,
    },
    tabEmojiActive: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: typography.size.xs,
        color: colors.textMuted,
        fontWeight: typography.weight.medium,
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: typography.weight.semibold,
    },

    // ─── Loading ─────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingLogo: {
        fontSize: 80,
        marginBottom: spacing.lg,
    },
    loadingText: {
        fontSize: typography.size.xxxl,
        fontWeight: typography.weight.heavy,
        color: colors.textPrimary,
        letterSpacing: typography.letterSpacing.wider,
    },
});
