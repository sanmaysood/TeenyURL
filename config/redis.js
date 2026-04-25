const { Redis } = require("@upstash/redis");
require('dotenv').config();

const redis = new Redis({
    url : process.env.UPSTASH_URL,
    token : process.env.UPSTASH_TOKEN,
});

module.exports = redis;