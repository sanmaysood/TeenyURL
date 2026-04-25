const redis = require("../config/redis");

const tokenBucketLimiter = (capacity, refillRatePerSec) => {
    return async (req, res, next) => {
        const ip = req.ip;
        const key = `bucket:${req.path}:${ip}`;
        const now = Date.now();

        try {
            let bucket = await redis.get(key);

            if (!bucket) {
                // First request → full bucket
                bucket = {
                    tokens: capacity - 1,
                    lastRefill: now
                };

                await redis.set(key, JSON.stringify(bucket), { ex: 3600 });
                return next();
            }

            if (typeof bucket === "string") {
                bucket = JSON.parse(bucket);
            }

            const timePassed = (now - bucket.lastRefill) / 1000;
            const tokensToAdd = timePassed * refillRatePerSec;

            bucket.tokens = Math.min(
                capacity,
                bucket.tokens + tokensToAdd
            );

            bucket.lastRefill = now;

            if (bucket.tokens >= 1) {
                bucket.tokens -= 1;

                await redis.set(key, JSON.stringify(bucket), { ex: 3600 });
                return next();
            } else {
                return res.status(429).send("Too many requests");
            }

        } catch (err) {
            console.error(err);
            return res.status(500).send("Rate limiter error");
        }
    };
};

module.exports = tokenBucketLimiter;