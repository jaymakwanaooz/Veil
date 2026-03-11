import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing } from '../theme';

// Screens
import AuthScreen from '../screens/AuthScreen';
import InboxScreen from '../screens/InboxScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import AccountSwitcherScreen from '../screens/AccountSwitcherScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import { Ionicons } from '@expo/vector-icons';

// ─── Tab Icons ─────────────────────────────────────────
function TabIcon({ label, focused, iconName }) {
    return (
        <View style={styles.tabIconContainer}>
            <Ionicons name={iconName} size={24} color={focused ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
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
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                },
            }}
        >
            <Tab.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon label="Chats" iconName={focused ? "chatbubbles" : "chatbubbles-outline"} focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon label="Discover" iconName={focused ? "compass" : "compass-outline"} focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon label="Profile" iconName={focused ? "person-circle" : "person-circle-outline"} focused={focused} />
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
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.loadingContainer}>
            <View style={styles.loadingWrapper}>
                <Animated.View style={[styles.loadingGradientContainer, { transform: [{ rotate: spin }] }]}>
                    <LinearGradient
                        colors={['#8b5cf6', '#3b82f6', '#ec4899', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
                <Image source={require('../../assets/veil_logo.png')} style={styles.loadingLogo} resizeMode="contain" />
            </View>
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
                ...DarkTheme,
                colors: {
                    ...DarkTheme.colors,
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
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 28 : 20,
        left: 20,
        right: 20,
        height: 64,
        paddingBottom: 0, // Critical: stops RN safe area logic from pushing tabs up
        paddingTop: 0,
        borderRadius: 32,
        backgroundColor: colors.surface,
        borderTopWidth: 0,
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 48, 
        marginTop: 8,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        color: colors.textMuted,
        fontWeight: typography.weight.medium,
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: typography.weight.bold,
    },

    // ─── Loading ─────────────────────────────────────────
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingWrapper: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingGradientContainer: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        overflow: 'hidden',
    },
    loadingLogo: {
        width: 120,
        height: 120,
        zIndex: 2,
    },
});
