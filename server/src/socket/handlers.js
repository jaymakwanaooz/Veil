const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Set up all Socket.IO event handlers for a connected socket.
 */
module.exports = (io, socket) => {
    const userId = socket.user._id.toString();

    console.log(`🔌 User connected: ${socket.user.username} (${userId})`);

    /**
     * Join a conversation room
     */
    socket.on('join_room', async ({ roomId }) => {
        try {
            // Verify user is a participant
            const conversation = await Conversation.findOne({
                roomId,
                participants: socket.user._id,
            });

            if (!conversation) {
                socket.emit('error', { message: 'You are not a participant in this room.' });
                return;
            }

            socket.join(roomId);
            console.log(`📍 ${socket.user.username} joined room ${roomId}`);

            // Notify others in the room
            socket.to(roomId).emit('user_joined', {
                userId,
                timestamp: new Date(),
            });
        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('error', { message: 'Failed to join room.' });
        }
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_room', ({ roomId }) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user_left', {
            userId,
            timestamp: new Date(),
        });
        console.log(`🚪 ${socket.user.username} left room ${roomId}`);
    });

    /**
     * Send an encrypted message
     * The server only routes ciphertext — it never decrypts.
     */
    socket.on('send_message', async ({ roomId, ciphertext, nonce, type = 'text' }) => {
        try {
            if (!roomId || !ciphertext || !nonce) {
                socket.emit('error', { message: 'Missing required message fields.' });
                return;
            }

            // Find conversation
            const conversation = await Conversation.findOne({
                roomId,
                participants: socket.user._id,
            });

            if (!conversation) {
                socket.emit('error', { message: 'Conversation not found.' });
                return;
            }

            // Save encrypted message to DB
            const message = await Message.create({
                conversationId: conversation._id,
                senderId: socket.user._id,
                ciphertext,
                nonce,
                type,
                readBy: [socket.user._id],
            });

            // Update last message preview on conversation
            conversation.lastMessage = {
                text: '[Encrypted]', // Server never sees plaintext
                senderId: socket.user._id,
                timestamp: new Date(),
            };
            await conversation.save();

            // Broadcast to room (including sender for confirmation)
            io.to(roomId).emit('new_message', {
                _id: message._id,
                conversationId: conversation._id,
                senderId: userId,
                ciphertext,
                nonce,
                type,
                createdAt: message.createdAt,
            });
        } catch (error) {
            console.error('Send message error:', error);
            socket.emit('error', { message: 'Failed to send message.' });
        }
    });

    /**
     * Typing indicator
     */
    socket.on('typing_start', ({ roomId }) => {
        socket.to(roomId).emit('typing_indicator', {
            userId,
            isTyping: true,
        });
    });

    socket.on('typing_stop', ({ roomId }) => {
        socket.to(roomId).emit('typing_indicator', {
            userId,
            isTyping: false,
        });
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_read', async ({ roomId, messageIds }) => {
        try {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { readBy: socket.user._id } }
            );

            socket.to(roomId).emit('messages_read', {
                userId,
                messageIds,
            });
        } catch (error) {
            console.error('Mark read error:', error);
        }
    });

    /**
     * Add friend request via socket (real-time notification)
     */
    socket.on('add_friend', async ({ roomId }) => {
        try {
            const conversation = await Conversation.findOne({
                roomId,
                participants: socket.user._id,
            });

            if (!conversation) return;

            if (!conversation.friendRequests.includes(socket.user._id)) {
                conversation.friendRequests.push(socket.user._id);
            }

            const allRequested = conversation.participants.every((p) =>
                conversation.friendRequests.includes(p)
            );

            if (allRequested) {
                conversation.type = 'friend';
            }

            await conversation.save();
            await conversation.populate('participants', 'username publicKey avatar isOnline lastSeen');

            // Notify the room of the friend request / acceptance
            io.to(roomId).emit('friend_update', {
                conversationId: conversation._id,
                requestedBy: userId,
                isFriend: allRequested,
                conversation: allRequested ? conversation : null,
            });
        } catch (error) {
            console.error('Add friend socket error:', error);
        }
    });

    /**
     * End anonymous chat
     */
    socket.on('end_chat', async ({ roomId }) => {
        try {
            const conversation = await Conversation.findOne({
                roomId,
                participants: socket.user._id,
            });

            if (conversation && conversation.type === 'anonymous') {
                conversation.isActive = false;
                await conversation.save();
            }

            socket.to(roomId).emit('chat_ended', {
                userId,
                timestamp: new Date(),
            });

            socket.leave(roomId);
        } catch (error) {
            console.error('End chat error:', error);
        }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', async () => {
        console.log(`⚡ User disconnected: ${socket.user.username}`);

        try {
            // Update user online status
            const User = require('../models/User');
            await User.findByIdAndUpdate(socket.user._id, {
                isOnline: false,
                lastSeen: new Date(),
            });

            // Notify all rooms this user was in
            const rooms = Array.from(socket.rooms);
            rooms.forEach((room) => {
                if (room !== socket.id) {
                    socket.to(room).emit('user_offline', {
                        userId,
                        timestamp: new Date(),
                    });
                }
            });
        } catch (error) {
            console.error('Disconnect handler error:', error);
        }
    });
};
