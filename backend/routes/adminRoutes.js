const express = require("express");

const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// =========================
// GET PENDING RESOURCES
// =========================

router.get("/pending", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        r.id,
        r.title,
        r.description,
        r.subject,
        r.category,
        r.file_name,
        r.file_type,
        r.file_size,
        r.created_at,
        u.name AS uploaded_by
    FROM resources r
    JOIN users u ON r.uploaded_by = u.id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Pending resources database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch pending resources"
        });
    }

    res.status(200).json({
        message: "Pending resources fetched successfully",
        resources: results
    });
});


});

// =========================
// GET ALL RESOURCES
// =========================

router.get("/resources", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        r.id,
        r.title,
        r.description,
        r.subject,
        r.category,
        r.file_name,
        r.file_type,
        r.file_size,
        r.status,
        r.download_count,
        r.created_at,
        u.name AS uploaded_by
    FROM resources r
    JOIN users u ON r.uploaded_by = u.id
    ORDER BY r.created_at DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("All resources database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch resources"
        });
    }

    res.status(200).json({
        message: "Resources fetched successfully",
        resources: results
    });
});


});

// =========================
// GET APPROVED RESOURCES
// =========================

router.get("/approved", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        r.id,
        r.title,
        r.description,
        r.subject,
        r.category,
        r.file_name,
        r.file_type,
        r.file_size,
        r.status,
        r.download_count,
        r.created_at,
        u.name AS uploaded_by
    FROM resources r
    JOIN users u ON r.uploaded_by = u.id
    WHERE r.status = 'approved'
    ORDER BY r.created_at DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Approved resources database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch approved resources"
        });
    }

    res.status(200).json({
        message: "Approved resources fetched successfully",
        resources: results
    });
});


});

// =========================
// GET REJECTED RESOURCES
// =========================

router.get("/rejected", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        r.id,
        r.title,
        r.description,
        r.subject,
        r.category,
        r.file_name,
        r.file_type,
        r.file_size,
        r.status,
        r.created_at,
        u.name AS uploaded_by
    FROM resources r
    JOIN users u ON r.uploaded_by = u.id
    WHERE r.status = 'rejected'
    ORDER BY r.created_at DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Rejected resources database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch rejected resources"
        });
    }

    res.status(200).json({
        message: "Rejected resources fetched successfully",
        resources: results
    });
});


});

// =========================
// DASHBOARD STATISTICS
// =========================

router.get("/stats", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        COUNT(*) AS total_resources,

        SUM(
            CASE
                WHEN status = 'pending' THEN 1
                ELSE 0
            END
        ) AS pending_resources,

        SUM(
            CASE
                WHEN status = 'approved' THEN 1
                ELSE 0
            END
        ) AS approved_resources,

        SUM(
            CASE
                WHEN status = 'rejected' THEN 1
                ELSE 0
            END
        ) AS rejected_resources

    FROM resources
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Admin stats database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }

    res.status(200).json({
        message: "Dashboard statistics fetched successfully",
        stats: results[0]
    });
});


});

// =========================
// GET USERS
// =========================

router.get("/users", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        id,
        name,
        email,
        role
    FROM users
    ORDER BY id DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Users database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }

    res.status(200).json({
        message: "Users fetched successfully",
        users: results
    });
});


});

// =========================
// GET RATINGS
// =========================

router.get("/ratings", authenticateToken, adminOnly, (req, res) => {


const query = `
    SELECT
        rt.id,
        rt.rating,
        rt.created_at,
        r.title AS resource_title,
        u.name AS user_name,
        u.email AS user_email
    FROM ratings rt
    JOIN resources r ON rt.resource_id = r.id
    JOIN users u ON rt.user_id = u.id
    ORDER BY rt.created_at DESC
`;

db.query(query, (err, results) => {

    if (err) {
        console.log("Ratings database error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch ratings"
        });
    }

    res.status(200).json({
        message: "Ratings fetched successfully",
        ratings: results
    });
});


});

// =========================
// APPROVE RESOURCE
// =========================

router.put("/approve/:id", authenticateToken, adminOnly, (req, res) => {


const resourceId = req.params.id;

console.log("APPROVE REQUEST RECEIVED. Resource ID:", resourceId);

const query = `
    UPDATE resources
    SET status = 'approved'
    WHERE id = ?
`;

db.query(query, [resourceId], (err, result) => {

    if (err) {
        console.log("Approve resource database error:", err.message);

        return res.status(500).json({
            message: "Failed to approve resource"
        });
    }

    console.log("APPROVE RESULT:", result);
    console.log("APPROVE AFFECTED ROWS:", result.affectedRows);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Resource not found"
        });
    }

    console.log("RESOURCE APPROVED SUCCESSFULLY. ID:", resourceId);

    res.status(200).json({
        message: "Resource approved successfully",
        resource_id: resourceId
    });
});


});

// =========================
// REJECT RESOURCE
// =========================

router.put("/reject/:id", authenticateToken, adminOnly, (req, res) => {


const resourceId = req.params.id;

console.log("REJECT REQUEST RECEIVED. Resource ID:", resourceId);

const query = `
    UPDATE resources
    SET status = 'rejected'
    WHERE id = ?
`;

db.query(query, [resourceId], (err, result) => {

    if (err) {
        console.log("Reject resource database error:", err.message);

        return res.status(500).json({
            message: "Failed to reject resource"
        });
    }

    console.log("REJECT RESULT:", result);
    console.log("REJECT AFFECTED ROWS:", result.affectedRows);

    if (result.affectedRows === 0) {
        return res.status(404).json({
            message: "Resource not found"
        });
    }

    console.log("RESOURCE REJECTED SUCCESSFULLY. ID:", resourceId);

    res.status(200).json({
        message: "Resource rejected successfully",
        resource_id: resourceId
    });
});


});

module.exports = router;
