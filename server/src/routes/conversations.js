const express = require('express');
const { authenticate } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/conversations
 * Get all conversations for the authenticated user.
 * Only returns 'friend' type conversations (saved to Inbox).
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
            type: 'friend',
        })
            .populate('participants', 'username publicKey avatar isOnline lastSeen')
            .sort({ 'lastMessage.timestamp': -1 });

        res.json({
            success: true,
            data: { conversations },
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching conversations.',
        });
    }
});

/**
 * GET /api/conversations/:conversationId/messages
 * Get paginated messages for a conversation.
 */
router.get('/:conversationId/messages', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify user is a participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id,
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found.',
            });
        }

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Return in chronological order
        messages.reverse();

        res.json({
            success: true,
            data: {
                messages,
                page: parseInt(page),
                hasMore: messages.length === parseInt(limit),
            },
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching messages.',
        });
    }
});

/**
 * POST /api/conversations/:conversationId/add-friend
 * Request to add the other user as a friend.
 * When both parties have tapped "Add Friend", the conversation type changes to 'friend'.
 */
router.post('/:conversationId/add-friend', authenticate, async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id,
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found.',
            });
        }

        // Check if user already sent a friend request
        if (conversation.friendRequests.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'Friend request already sent.',
            });
        }

        // Add the friend request
        conversation.friendRequests.push(req.user._id);

        // If both participants have sent friend requests, upgrade to 'friend'
        const allParticipantsRequested = conversation.participants.every((p) =>
            conversation.friendRequests.includes(p)
        );

        if (allParticipantsRequested) {
            conversation.type = 'friend';
        }

        await conversation.save();

        // Populate participants for response
        await conversation.populate('participants', 'username publicKey avatar isOnline lastSeen');

        res.json({
            success: true,
            message: allParticipantsRequested
                ? 'You are now friends! Conversation saved to Inbox.'
                : 'Friend request sent. Waiting for the other user.',
            data: {
                conversation,
                isFriend: allParticipantsRequested,
            },
        });
    } catch (error) {
        console.error('Add friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error.',
        });
    }
});

module.exports = router;
