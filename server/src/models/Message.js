const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Encrypted ciphertext — server NEVER sees plaintext
        ciphertext: {
            type: String,
            required: true,
        },
        // Nonce used for encryption (needed for decryption)
        nonce: {
            type: String,
            required: true,
        },
        // Message type for future extensibility
        type: {
            type: String,
            enum: ['text', 'image', 'file', 'system'],
            default: 'text',
        },
        // Read status
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Compound index for fetching messages in a conversation chronologically
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
