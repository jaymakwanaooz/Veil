const Redis = require('ioredis');
const config = require('./index');

const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    lazyConnect: true,
});

redis.on('connect', () => {
    console.log('🔴 Redis connected');
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

module.exports = redis;
