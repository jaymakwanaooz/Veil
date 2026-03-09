const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const config = require('./config');
const connectDB = require('./config/database');
const redis = require('./config/redis');
const { authenticateSocket } = require('./middleware/auth');
const socketHandlers = require('./socket/handlers');
const MatchmakingWorker = require('./workers/matchmaking');
const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: '*', // In production, restrict this
        methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── REST Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Veil server is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ─── Socket.IO ───────────────────────────────────────────────
// Initialize matchmaking worker
const matchmaker = new MatchmakingWorker(io);

// Socket authentication middleware
io.use(authenticateSocket);

io.on('connection', async (socket) => {
    // Update user online status
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });

    // Set up event handlers
    socketHandlers(io, socket);

    // ─── Matchmaking events ──────────────────────────────────
    socket.on('find_match', async () => {
        const userId = socket.user._id.toString();
        const added = await matchmaker.addToQueue(userId, socket.id);

        if (added) {
            socket.emit('queue_joined', {
                message: 'Looking for a match...',
                timestamp: new Date(),
            });
        } else {
            socket.emit('queue_status', {
                message: 'Already in queue',
                timestamp: new Date(),
            });
        }
    });

    socket.on('cancel_match', async () => {
        const userId = socket.user._id.toString();
        await matchmaker.removeFromQueue(userId);
        socket.emit('queue_left', {
            message: 'Matchmaking cancelled',
            timestamp: new Date(),
        });
    });

    // Clean up on disconnect
    socket.on('disconnect', async () => {
        const userId = socket.user._id.toString();
        await matchmaker.removeFromQueue(userId);
        matchmaker.unregisterSocket(userId);
    });
});

// ─── Start Server ────────────────────────────────────────────
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Connect to Redis
        await redis.connect();

        // Start matchmaking worker
        matchmaker.start();

        // Start HTTP server
        server.listen(config.port, () => {
            console.log(`\n🕶️  Veil server running on port ${config.port}`);
            console.log(`   Environment: ${config.nodeEnv}`);
            console.log(`   API: http://localhost:${config.port}/api`);
            console.log(`   WebSocket: ws://localhost:${config.port}\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
