const { createClient } = require('redis');

const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: 'redis-16605.c62.us-east-1-4.ec2.redns.redis-cloud.com', // ✅ only hostname
    port: 16605, // ✅ port alag se likho
    connectTimeout: 10000
  }
});

client.connect()
  .then(() => console.log("✅ Connected to Redis"))
  .catch(err => console.error("❌ Redis connection error:", err));

module.exports = client;
