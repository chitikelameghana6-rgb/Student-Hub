
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

console.log("LOGIN ROUTES FILE LOADED");

// Test GET Route
router.get("/test", (req, res) => {
    console.log("TEST ROUTE HIT");

    res.status(200).json({
        message: "Auth route is working!"
    });
});

// Test POST Route
router.post("/login-test", (req, res) => {
    console.log("LOGIN TEST ROUTE HIT");

    res.status(200).json({
        message: "Login POST route is working"
    });
});

// Protected Test Route
router.get("/secure-test", authenticateToken, (req, res) => {
    console.log("SECURE TEST ROUTE HIT");

    res.status(200).json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

// Register User
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const checkEmailQuery =
            "SELECT id FROM users WHERE email = ?";

        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.log("Database error:", err.message);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
            `;

            db.query(
                insertQuery,
                [name, email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.log(
                            "Registration error:",
                            err.message
                        );

                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.status(201).json({
                        message: "Registration successful",
                        user: {
                            id: result.insertId,
                            name: name,
                            email: email
                        }
                    });
                }
            );
        });

    } catch (error) {
        console.log("Server error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// Login User
router.post("/login", (req, res) => {
    console.log("LOGIN ROUTE HIT");

    const { email, password } = req.body;

    console.log("LOGIN EMAIL:", email);

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const query = `
        SELECT id, name, email, password, role
        FROM users
        WHERE email = ?
    `;

    db.query(query, [email], async (err, results) => {

        if (err) {
            console.log(
                "Login database error:",
                err.message
            );

            return res.status(500).json({
                message: "Database error"
            });
        }

        console.log("LOGIN DB RESULTS:", results);

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        console.log("USER FROM DATABASE:", {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.log(
            "ROLE BEING SENT IN JWT:",
            user.role
        );

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        console.log(
            "ROLE BEING SENT TO FRONTEND:",
            user.role
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

// Show Registered Routes
console.log(
    "REGISTERED ROUTES:",
    router.stack.map(route => ({
        path: route.route?.path,
        methods: route.route?.methods
    }))
);

module.exports = router;

