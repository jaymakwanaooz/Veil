import axios from 'axios';

// ⚠️ Change this to your server's IP/URL
// For Expo on same network, use your machine's local IP
const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'Network error';
        console.error('API Error:', message);
        return Promise.reject({ message, status: error.response?.status });
    }
);

// ─── Auth API ─────────────────────────────────────────────
export const authAPI = {
    register: async (username, password, publicKey) =>
        ({ data: { token: 'mock-token-123', user: { _id: 'mock-id', username } } }),

    login: async (username, password) =>
        ({ data: { token: 'mock-token-123', user: { _id: 'mock-id', username } } }),

    getMe: async () =>
        ({ data: { user: { _id: 'mock-id', username: 'Guest' } } }),

    getPublicKey: async (userId) =>
        ({ data: { publicKey: 'mock-public-key' } }),
};

// ─── Conversations API ───────────────────────────────────
export const conversationsAPI = {
    getAll: async () =>
        ({ data: { conversations: [] } }),

    getMessages: async (conversationId, page = 1) =>
        ({ data: { messages: [], pagination: {} } }),

    addFriend: async (conversationId) =>
        ({ data: { message: 'Friend added' } }),
};

export default api;
