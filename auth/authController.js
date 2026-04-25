const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require('dotenv').config();
const SECRET = process.env.JWT_SECRET;


exports.signup = async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );

        res.send("Account created successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Signup failed");
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).send("User not found");
        }

        const user = result.rows[0];

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).send("Invalid password");
        }

        const token = jwt.sign(
            { userId: user.id },
            SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send("Login failed");
    }
};