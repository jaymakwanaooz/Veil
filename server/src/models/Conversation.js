const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        // Type: 'anonymous' = from Global Discover (Stranger mode)
        // Type: 'friend' = saved / added as friend
        type: {
            type: String,
            enum: ['anonymous', 'friend'],
            default: 'anonymous',
        },
        // The Socket.IO room ID
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
        // Track who has sent a friend request
        friendRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        // Last message preview for Inbox
        lastMessage: {
            text: { type: String, default: '' },
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
        },
        // Whether the conversation is currently active (for anonymous chats)
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient user conversation lookups
conversationSchema.index({ participants: 1 });
conversationSchema.index({ roomId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
