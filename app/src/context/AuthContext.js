import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, setAuthToken } from '../api/client';
import { generateKeyPair } from '../crypto/e2ee';
import {
    getAccounts,
    saveAccount,
    removeAccount,
    getActiveAccount,
    setActiveAccount as setActiveAccountStorage,
} from '../services/storage';
import { connectSocket, disconnectSocket } from '../services/socket';

// ─── State ───────────────────────────────────────────────
const initialState = {
    user: null,
    token: null,
    secretKey: null,
    accounts: [],       // All stored accounts for multi-account switching
    isLoading: true,
    isAuthenticated: false,
    error: null,
};

// ─── Action Types ────────────────────────────────────────
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    SET_ACCOUNTS: 'SET_ACCOUNTS',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// ─── Reducer ─────────────────────────────────────────────
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return { ...state, isLoading: action.payload };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                secretKey: action.payload.secretKey,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...initialState,
                accounts: state.accounts,
                isLoading: false,
            };

        case AUTH_ACTIONS.SET_ACCOUNTS:
            return { ...state, accounts: action.payload };

        case AUTH_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, isLoading: false };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load saved session on app start
    useEffect(() => {
        loadSavedSession();
    }, []);

    /**
     * Load the last active account from secure storage
     */
    async function loadSavedSession() {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const accounts = await getAccounts();
            dispatch({ type: AUTH_ACTIONS.SET_ACCOUNTS, payload: accounts });

            const activeAccount = await getActiveAccount();
            if (activeAccount) {
                // Restore session
                setAuthToken(activeAccount.token);

                // Verify token is still valid
                try {
                    await authAPI.getMe();
                    connectSocket(activeAccount.token);

                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            // Use the stored account data so the username is always correct
                            user: { _id: activeAccount.userId, username: activeAccount.username },
                            token: activeAccount.token,
                            secretKey: activeAccount.secretKey,
                        },
                    });
                } catch {
                    // Token expired, clear
                    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        } catch (error) {
            console.error('Load session error:', error);
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
    }

    /**
     * Register a new account
     */
    async function register(username, password) {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            // Generate E2EE keypair on client
            const { publicKey, secretKey } = generateKeyPair();

            const response = await authAPI.register(username, password, publicKey);
            const { token, user } = response.data;

            // Save account to secure storage
            const account = {
                userId: user._id,
                username: user.username,
                token,
                publicKey,
                secretKey,
            };

            await saveAccount(account);
            await setActiveAccountStorage(user._id);

            // Set up API auth and socket
            setAuthToken(token);
            connectSocket(token);

            // Update accounts list
            const accounts = await getAccounts();
            dispatch({ type: AUTH_ACTIONS.SET_ACCOUNTS, payload: accounts });

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: { user, token, secretKey },
            });

            return { success: true };
        } catch (error) {
            const message = error.message || 'Registration failed';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }

    /**
     * Login to an existing account
     */
    async function login(username, password) {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
            dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

            const response = await authAPI.login(username, password);
            const { token, user } = response.data;

            // Check if we have the secret key locally
            const accounts = await getAccounts();
            let existingAccount = accounts.find((a) => a.userId === user._id);

            if (!existingAccount) {
                // First login on this device — we can't recover the secret key
                // User needs to re-register for E2EE to work
                // For now, generate a new keypair (this means old messages can't be decrypted)
                const { publicKey, secretKey } = generateKeyPair();
                existingAccount = {
                    userId: user._id,
                    username: user.username,
                    token,
                    publicKey,
                    secretKey,
                };
            } else {
                existingAccount.token = token;
            }

            await saveAccount(existingAccount);
            await setActiveAccountStorage(user._id);

            setAuthToken(token);
            connectSocket(token);

            const updatedAccounts = await getAccounts();
            dispatch({ type: AUTH_ACTIONS.SET_ACCOUNTS, payload: updatedAccounts });

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    user,
                    token,
                    secretKey: existingAccount.secretKey,
                },
            });

            return { success: true };
        } catch (error) {
            const message = error.message || 'Login failed';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    }

    /**
     * Switch to a different stored account
     */
    async function switchAccount(userId) {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const accounts = await getAccounts();
            const account = accounts.find((a) => a.userId === userId);

            if (!account) {
                throw new Error('Account not found');
            }

            // Disconnect current socket
            disconnectSocket();

            // Set new active account
            await setActiveAccountStorage(userId);
            setAuthToken(account.token);

            // Verify token
            try {
                const response = await authAPI.getMe();
                connectSocket(account.token);

                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: {
                        user: response.data.user,
                        token: account.token,
                        secretKey: account.secretKey,
                    },
                });
            } catch {
                // Token expired
                dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Session expired. Please login again.' });
                await removeAccount(userId);
                const updated = await getAccounts();
                dispatch({ type: AUTH_ACTIONS.SET_ACCOUNTS, payload: updated });
            }
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        }
    }

    /**
     * Logout from current account (keeps it in storage for switching)
     */
    function logout() {
        disconnectSocket();
        setAuthToken(null);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }

    /**
     * Remove an account permanently
     */
    async function deleteAccount(userId) {
        await removeAccount(userId);
        const accounts = await getAccounts();
        dispatch({ type: AUTH_ACTIONS.SET_ACCOUNTS, payload: accounts });

        if (state.user?._id === userId) {
            logout();
        }
    }

    const value = {
        ...state,
        register,
        login,
        logout,
        switchAccount,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
