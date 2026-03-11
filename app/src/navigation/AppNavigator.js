import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';

// Screens
import AuthScreen from '../screens/AuthScreen';
import InboxScreen from '../screens/InboxScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import AccountSwitcherScreen from '../screens/AccountSwitcherScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab Icon — Stitch Circle Style ───────────────────
function TabIcon({ label, focused, iconName, iconNameOutline }) {
    return (
        <View style={styles.tabIconContainer}>
            {focused ? (
                <View style={styles.tabActiveCircle}>
                    <Ionicons name={iconName} size={20} color="#fff" />
                </View>
            ) : (
                <View style={styles.tabInactiveCircle}>
                    <Ionicons name={iconNameOutline} size={20} color={colors.textMuted} />
                </View>
            )}
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {label.toUpperCase()}
            </Text>
        </View>
    );
}

// ─── Main Tabs ─────────────────────────────────────────
function MainTabs() {
    const insets = useSafeAreaInsets();
    const BASE_HEIGHT = 100;
    const tabBarHeight = BASE_HEIGHT + insets.bottom;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    { height: tabBarHeight, paddingBottom: insets.bottom },
                ],
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarItemStyle: styles.tabBarItem,
            }}
        >
            <Tab.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            label="Inbox"
                            iconName="chatbubbles"
                            iconNameOutline="chatbubbles-outline"
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            label="Discover"
                            iconName="compass"
                            iconNameOutline="compass-outline"
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            label="Profile"
                            iconName="person-circle"
                            iconNameOutline="person-circle-outline"
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// ─── App Stack ─────────────────────────────────────────
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

// ─── Auth Stack (includes Onboarding for first-time users) ─
function AuthStack({ showOnboarding }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showOnboarding && (
                <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                    options={{ animation: 'fade' }}
                />
            )}
            <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
    );
}

// ─── Loading Screen ────────────────────────────────────
function LoadingScreen() {
    return <View style={styles.loadingContainer} />;
}

// ─── Root Navigator ────────────────────────────────────
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const [onboardingChecked, setOnboardingChecked] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check if user has already seen onboarding
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const seen = await SecureStore.getItemAsync('onboarding_seen');
                setShowOnboarding(!seen);
            } catch (_) {
                setShowOnboarding(true); // default to showing if check fails
            } finally {
                setOnboardingChecked(true);
            }
        };
        checkOnboarding();
    }, []);

    if (isLoading || !onboardingChecked) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer
            theme={{
                ...DefaultTheme,
                colors: {
                    ...DefaultTheme.colors,
                    primary: colors.primary,
                    background: colors.background,
                    card: colors.surface,
                    text: colors.textPrimary,
                    border: colors.border,
                    notification: colors.primary,
                },
            }}
        >
            {isAuthenticated
                ? <AppStack />
                : <AuthStack showOnboarding={showOnboarding} />
            }
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    // ─── Tab Bar — rounded card style ───────────────
    tabBar: {
        backgroundColor: colors.surface,
        borderTopWidth: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
    },
    tabBarItem: {
        paddingTop: 10,
        paddingBottom: 6,
        minWidth: 80,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minWidth: 80,
        marginTop: 18,
    },
    tabActiveCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 4,
    },
    tabInactiveCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
        letterSpacing: 0,
        textAlign: 'center',
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: '700',
    },

    // ─── Loading ─────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
