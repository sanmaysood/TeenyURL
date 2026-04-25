const express = require("express");
const QRcode = require("qrcode");
const pool = require("./config/db");
const redis = require("./config/redis");
const encodeBase62 = require("./utils/base62");
const validateAlias = require("./utils/aliasValidator");
const { signup, login } = require("./auth/authController");
const authMiddleware = require("./auth/authMiddleware");
const optionalAuth = require("./auth/optionalAuthMiddleware");
const tokenBucketLimiter = require("./middleware/rateLimiter");
const cors = require("cors");
const app = express();
require('dotenv').config();
app.set("trust proxy", true);  // req.ip will now contain the client's IP address from x-forwarded-for
app.use(express.json());
app.use(cors());

const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running on port");
});

app.get("/", (req,res) => {
    res.send("Hello sanmay!");
});

app.post("/signup", signup);
app.post("/login", login);


const shortenLimiter = tokenBucketLimiter(5,5/60);

app.post("/shorten", optionalAuth, shortenLimiter, async (req, res) => {
    const { longUrl, customCode, expiryMinutes } = req.body;
    const clientId = req.headers["x-client-id"] || null;
    const userId = req.userId || null;

    try {
        const urlObj = new URL(longUrl);

        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            return res.status(400).json({ error: "Invalid URL" });
        }
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        let shortCode;
        let expiresAt = null;
        const { valid, alias, error } = validateAlias(customCode);

        if (!valid) {
            return res.status(400).json({ error });
        }

        if(expiryMinutes){
            expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
        }
        
        if (alias) {
            const existing = await pool.query(
                "SELECT * FROM urls WHERE short_code = $1",
                [alias]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({
                    error: "Custom alias already in use"
                });
            }

            shortCode = alias;

            await pool.query(
            "INSERT INTO urls (short_code, long_url, expires_at, user_id, client_id) VALUES ($1, $2, $3, $4, $5)",
            [shortCode, longUrl, expiresAt, userId, clientId]
            );

        } else {

            const result = await pool.query(
            "INSERT INTO urls (long_url, expires_at, user_id, client_id) VALUES ($1, $2, $3, $4) RETURNING id",
            [longUrl, expiresAt, userId, clientId]
            );

            const id = result.rows[0].id;
            shortCode = encodeBase62(id);

            await pool.query(
                "UPDATE urls SET short_code = $1 WHERE id = $2",
                [shortCode, id]
            );
        }

        const shortUrl = `${BASE_URL}/${shortCode}`;
        const qrCode = await QRcode.toDataURL(shortUrl);

        res.json({
            shortUrl: shortUrl,
            QRcode: qrCode,
            expiry: expiresAt
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving URL");
    }
});
 
//ANALYTICS API

app.get("/analytics/:code", async(req,res) =>{
    const code = req.params.code;
    try{
        const result = await pool.query("SELECT COUNT(*) AS cnt FROM analytics WHERE short_code = $1", [code]);
        res.json({
            shortCode: code,
            totalClicks: result.rows[0].cnt
        })
    } catch(err){
        console.error(err);
        res.status(500).send("Internal server error");
    }
});

app.get("/analytics/:code/timeseries", async (req, res) => {
    const code = req.params.code;

    try {
        const result = await pool.query(
            `SELECT DATE(clicked_at) as date, COUNT(*) as count
             FROM analytics
             WHERE short_code = $1
             GROUP BY DATE(clicked_at)
             ORDER BY date ASC`,
            [code]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching timeseries");
    }
});

app.get("/analytics/top", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT short_code, COUNT(*) as clicks
             FROM analytics
             GROUP BY short_code
             ORDER BY clicks DESC
             LIMIT 5`
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching top links");
    }
});

app.get("/analytics/:code/devices", async (req, res) => {
    const code = req.params.code;

    try {
        const result = await pool.query(
            `SELECT device, COUNT(*) as count
             FROM analytics
             WHERE short_code = $1
             GROUP BY device`,
            [code]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching device stats");
    }
});

app.get("/analytics/:code/browser", async (req, res) => {
    const code = req.params.code;

    try {
        const result = await pool.query(
            `SELECT browser, COUNT(*) as count
             FROM analytics
             WHERE short_code = $1
             GROUP BY browser`,
            [code]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching browser stats");
    }
});

app.get("/my-links", optionalAuth, async (req, res) => {
    const clientId = req.headers["x-client-id"] || null;
    const userId = req.userId || null;

    try {
        const result = await pool.query(
            `SELECT short_code, long_url 
             FROM urls 
             WHERE 
               (user_id IS NOT NULL AND user_id = $1)
               OR
               (user_id IS NULL AND client_id = $2)
             ORDER BY id DESC`,
            [userId, clientId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching links");
    }
});





// const redirectlimiter = tokenBucketLimiter(100, 100/60);

app.get("/:code", async (req, res) => {
    const code = req.params.code;

    try {
        const cachedUrl = await redis.get(code);
        let longUrl;

        if(cachedUrl){
            console.log("CACHE HIT");
            longUrl = cachedUrl;
        }

        else{
            console.log("CACHE MISS");
            const result = await pool.query(
                "SELECT long_url, expires_at FROM urls WHERE short_code = $1",
                [code]
            );

            if (result.rows.length === 0) {
                return res.status(404).send("URL not found");
            } 

            const { long_url, expires_at } = result.rows[0];
          
            longUrl = long_url;

            if (expires_at && new Date() > expires_at) {
                return res.status(410).send("Link has expired");
            }
                
            if(expires_at){
                const ttl = Math.floor((new Date(expires_at) - Date.now())/1000);
                if(ttl > 0){
                    await redis.set(code,long_url, {ex: ttl});
                }  
            }
            else{
                await redis.set(code,long_url, {ex: 86400});   // TTL set to 1 day  
            }
        }

        await redis.lpush("analytics_queue", JSON.stringify({
            short_code: code,
            timestamp: Date.now(),
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        }));

        res.redirect(longUrl);

    } catch (err) {
        console.error("Redirect error:", err);
        res.status(500).send("Error retrieving URL");
    }
});