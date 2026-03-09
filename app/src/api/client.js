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
    register: (username, password, publicKey) =>
        api.post('/auth/register', { username, password, publicKey }),

    login: (username, password) =>
        api.post('/auth/login', { username, password }),

    getMe: () =>
        api.get('/auth/me'),

    getPublicKey: (userId) =>
        api.get(`/auth/user/${userId}/public-key`),
};

// ─── Conversations API ───────────────────────────────────
export const conversationsAPI = {
    getAll: () =>
        api.get('/conversations'),

    getMessages: (conversationId, page = 1) =>
        api.get(`/conversations/${conversationId}/messages?page=${page}`),

    addFriend: (conversationId) =>
        api.post(`/conversations/${conversationId}/add-friend`),
};

export default api;
