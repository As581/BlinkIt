const { createClient } = require('redis');

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-16605.c62.us-east-1-4.ec2.redns.redis-cloud.com:16605',
        port: 16605,
        connectTimeout: 10000 // 10 seconds timeout
    }
});

// Connect to Redis with callback
client.connect()
    .then(() => console.log("Connected to Redis"))
    .catch((err) => console.error("Redis connection error:", err));
    


module.exports = client;
