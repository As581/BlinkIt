const { createClient } = require('redis');

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-13221.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 13221,
        connectTimeout: 10000 // 10 seconds timeout
    }
});

// Connect to Redis with callback
client.connect()
    .then(() => console.log("Connected to Redis"))
    .catch((err) => console.error("Redis connection error:", err));
    


module.exports = client;
