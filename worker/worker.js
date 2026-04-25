require("dotenv").config({ path: "../.env" });
const pool = require("../config/db");
const redis = require("../config/redis");
const UAParser = require("ua-parser-js");

async function processQueue(){
    console.log("Worker started... 🚀");
    let data;

    while(true){
        try{
            const event = await redis.rpop("analytics_queue");

            if(!event){
                await new Promise(r => setTimeout(r,5000));
                continue;
            }

            data = typeof event === "string" ? JSON.parse(event) : event;

            const parser = new UAParser(data.userAgent);
            const ua = parser.getResult();
            const os = ua.os.name || "Unknown";
            const browser = ua.browser.name || "Unknown";
            const device = ua.device.type || "Desktop";

            await pool.query("INSERT INTO analytics(short_code, clicked_at, os, browser, device, ip) VALUES ($1, TO_TIMESTAMP($2 / 1000.0), $3, $4, $5, $6)", [data.short_code, data.timestamp, os, browser, device, data.ip]);

        } catch(err){
            console.error("Worker error: ", err);
        }
    }
}

processQueue();