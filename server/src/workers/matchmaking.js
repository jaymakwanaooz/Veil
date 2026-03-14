const { v4: uuidv4 } = require('uuid');
const redis = require('../config/redis');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Redis key for the matchmaking queue
const QUEUE_KEY = 'veil:matchmaking:queue';

/**
 * Matchmaking Worker
 * Manages the Redis-based FIFO queue for pairing anonymous users.
 *
 * Flow:
 * 1. User taps "Find a Match" → client emits 'find_match'
 * 2. Server adds userId to Redis queue
 * 3. Worker polls the queue and pairs users
 * 4. Creates a Conversation with a unique roomId
 * 5. Emits 'match_found' to both users with roomId + partner's publicKey
 */
class MatchmakingWorker {
    constructor(io) {
        this.io = io;
        this.isRunning = false;
        this.pollInterval = 1000; // 1 second
        this.userSocketMap = new Map(); // userId -> socketId
    }

    /**
     * Start the matchmaking poll loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🎯 Matchmaking worker started');
        this._poll();
    }

    /**
     * Stop the worker
     */
    stop() {
        this.isRunning = false;
        console.log('🛑 Matchmaking worker stopped');
    }

    /**
     * Register a user's socket for matchmaking
     */
    registerSocket(userId, socketId) {
        this.userSocketMap.set(userId, socketId);
    }

    /**
     * Remove a user's socket mapping
     */
    unregisterSocket(userId) {
        this.userSocketMap.delete(userId);
    }

    /**
     * Add a user to the matchmaking queue
     */
    async addToQueue(userId, socketId) {
        try {
            // Check if user is already in queue
            const queueMembers = await redis.lrange(QUEUE_KEY, 0, -1);
            if (queueMembers.includes(userId)) {
                console.log(`⏳ User ${userId} already in queue`);
                return false;
            }

            // Register socket mapping and add to queue
            this.registerSocket(userId, socketId);
            await redis.rpush(QUEUE_KEY, userId);
            console.log(`➕ User ${userId} added to queue`);
            return true;
        } catch (error) {
            console.error('Add to queue error:', error);
            return false;
        }
    }

    /**
     * Remove a user from the matchmaking queue
     */
    async removeFromQueue(userId) {
        try {
            await redis.lrem(QUEUE_KEY, 0, userId);
            this.unregisterSocket(userId);
            console.log(`➖ User ${userId} removed from queue`);
        } catch (error) {
            console.error('Remove from queue error:', error);
        }
    }

    /**
     * Main polling loop — attempts to pair two users
     */
    async _poll() {
        while (this.isRunning) {
            try {
                await this._tryMatch();
            } catch (error) {
                console.error('Matchmaking poll error:', error);
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
        }
    }

    /**
     * Try to pair two users from the queue
     */
    async _tryMatch() {
        const queueLength = await redis.llen(QUEUE_KEY);

        if (queueLength < 2) return;

        // Atomically pop two users
        const user1Id = await redis.lpop(QUEUE_KEY);
        const user2Id = await redis.lpop(QUEUE_KEY);

        if (!user1Id || !user2Id) return;

        // Get socket IDs
        const socket1Id = this.userSocketMap.get(user1Id);
        const socket2Id = this.userSocketMap.get(user2Id);

        // If either user disconnected, re-queue the other
        if (!socket1Id) {
            await redis.lpush(QUEUE_KEY, user2Id);
            return;
        }
        if (!socket2Id) {
            await redis.lpush(QUEUE_KEY, user1Id);
            return;
        }

        // Verify sockets are still connected
        const socket1 = this.io.sockets.sockets.get(socket1Id);
        const socket2 = this.io.sockets.sockets.get(socket2Id);

        if (!socket1) {
            await redis.lpush(QUEUE_KEY, user2Id);
            this.unregisterSocket(user1Id);
            return;
        }
        if (!socket2) {
            await redis.lpush(QUEUE_KEY, user1Id);
            this.unregisterSocket(user2Id);
            return;
        }

        // Create the match!
        await this._createMatch(user1Id, user2Id, socket1, socket2);
    }

    /**
     * Create a match between two users
     */
    async _createMatch(user1Id, user2Id, socket1, socket2) {
        try {
            const roomId = `veil_${uuidv4()}`;

            // Get user public keys for E2EE key exchange
            const [user1, user2] = await Promise.all([
                User.findById(user1Id),
                User.findById(user2Id),
            ]);

            if (!user1 || !user2) {
                console.error('Match creation failed: user not found');
                return;
            }

            // Create anonymous conversation
            const conversation = await Conversation.create({
                participants: [user1Id, user2Id],
                type: 'anonymous',
                roomId,
                isActive: true,
            });

            // Join both sockets to the room
            socket1.join(roomId);
            socket2.join(roomId);

            // Emit match_found to both users with partner's public key
            socket1.emit('match_found', {
                roomId,
                conversationId: conversation._id,
                partnerPublicKey: user2.publicKey,
                partnerId: user2Id,
            });

            socket2.emit('match_found', {
                roomId,
                conversationId: conversation._id,
                partnerPublicKey: user1.publicKey,
                partnerId: user1Id,
            });

            // Clean up socket mappings
            this.unregisterSocket(user1Id);
            this.unregisterSocket(user2Id);

            console.log(`🤝 Match created: ${user1.username} <-> ${user2.username} in room ${roomId}`);
        } catch (error) {
            console.error('Create match error:', error);
        }
    }
}

module.exports = MatchmakingWorker;
