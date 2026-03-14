import * as SecureStore from 'expo-secure-store';

/**
 * Veil Secure Storage Service
 *
 * Uses expo-secure-store for sensitive data (JWT tokens, secret keys).
 * Supports multi-account by storing accounts as a JSON array.
 */

const KEYS = {
    ACCOUNTS: 'veil_accounts',        // JSON array of account objects
    ACTIVE_ACCOUNT: 'veil_active',    // Currently active account ID
};

/**
 * Account shape:
 * {
 *   userId: string,
 *   username: string,
 *   token: string,
 *   publicKey: string,
 *   secretKey: string,
 * }
 */

// ─── Account Management ──────────────────────────────────

/**
 * Get all stored accounts
 */
export async function getAccounts() {
    try {
        const data = await SecureStore.getItemAsync(KEYS.ACCOUNTS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to get accounts:', error);
        return [];
    }
}

/**
 * Save or update an account
 */
export async function saveAccount(account) {
    try {
        const accounts = await getAccounts();
        const index = accounts.findIndex((a) => a.userId === account.userId);

        if (index >= 0) {
            accounts[index] = { ...accounts[index], ...account };
        } else {
            accounts.push(account);
        }

        await SecureStore.setItemAsync(KEYS.ACCOUNTS, JSON.stringify(accounts));
        return true;
    } catch (error) {
        console.error('Failed to save account:', error);
        return false;
    }
}

/**
 * Remove an account
 */
export async function removeAccount(userId) {
    try {
        const accounts = await getAccounts();
        const filtered = accounts.filter((a) => a.userId !== userId);
        await SecureStore.setItemAsync(KEYS.ACCOUNTS, JSON.stringify(filtered));

        // If we removed the active account, clear it
        const activeId = await getActiveAccountId();
        if (activeId === userId) {
            await SecureStore.deleteItemAsync(KEYS.ACTIVE_ACCOUNT);
        }

        return true;
    } catch (error) {
        console.error('Failed to remove account:', error);
        return false;
    }
}

// ─── Active Account ──────────────────────────────────────

/**
 * Get active account ID
 */
export async function getActiveAccountId() {
    try {
        return await SecureStore.getItemAsync(KEYS.ACTIVE_ACCOUNT);
    } catch {
        return null;
    }
}

/**
 * Set the active account
 */
export async function setActiveAccount(userId) {
    try {
        await SecureStore.setItemAsync(KEYS.ACTIVE_ACCOUNT, userId);
        return true;
    } catch (error) {
        console.error('Failed to set active account:', error);
        return false;
    }
}

/**
 * Get the currently active account object
 */
export async function getActiveAccount() {
    try {
        const activeId = await getActiveAccountId();
        if (!activeId) return null;

        const accounts = await getAccounts();
        return accounts.find((a) => a.userId === activeId) || null;
    } catch {
        return null;
    }
}

/**
 * Clear all stored data (full logout)
 */
export async function clearAllData() {
    try {
        await SecureStore.deleteItemAsync(KEYS.ACCOUNTS);
        await SecureStore.deleteItemAsync(KEYS.ACTIVE_ACCOUNT);
        return true;
    } catch (error) {
        console.error('Failed to clear data:', error);
        return false;
    }
}

export default {
    getAccounts,
    saveAccount,
    removeAccount,
    getActiveAccountId,
    setActiveAccount,
    getActiveAccount,
    clearAllData,
};
