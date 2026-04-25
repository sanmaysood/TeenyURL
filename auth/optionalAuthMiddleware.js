const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    // No token → anonymous user
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.userId = null;
        return next();
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);

        req.userId = decoded.userId;
    } catch (err) {
        // Invalid token → treat as anonymous
        req.userId = null;
    }

    next();
}

module.exports = optionalAuth;