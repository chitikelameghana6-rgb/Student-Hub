
const db = require("../config/db");


// =========================
// UPLOAD RESOURCE - STUDENT
// =========================

const uploadResource = (req, res) => {

    try {

        const {
            title,
            description,
            subject,
            category
        } = req.body;

        if (!title || !subject || !category) {

            return res.status(400).json({
                message:
                    "Title, subject and category are required"
            });

        }

        if (!req.file) {

            return res.status(400).json({
                message: "File is required"
            });

        }

        const file = req.file;

        const query = `
            INSERT INTO resources
            (
                title,
                description,
                subject,
                category,
                file_name,
                file_path,
                file_type,
                file_size,
                uploaded_by,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        const values = [
            title,
            description || null,
            subject,
            category,
            file.filename,
            file.path,
            file.mimetype,
            file.size,
            req.user.id
        ];

        db.query(
            query,
            values,
            (err, result) => {

                if (err) {

                    console.log(
                        "Resource upload database error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to save resource"
                    });

                }

                res.status(201).json({

                    message:
                        "Resource uploaded successfully",

                    resource: {
                        id: result.insertId,
                        title: title,
                        fileName: file.filename,
                        status: "pending"
                    }

                });

            }
        );

    } catch (error) {

        console.log(
            "Resource upload error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =========================
// ADMIN UPLOAD RESOURCE
// =========================

const uploadAdminResource = (req, res) => {

    try {

        const {
            title,
            description,
            subject,
            category
        } = req.body;

        if (!title || !subject || !category) {

            return res.status(400).json({
                message:
                    "Title, subject and category are required"
            });

        }

        if (!req.file) {

            return res.status(400).json({
                message: "File is required"
            });

        }

        const file = req.file;

        const query = `
            INSERT INTO resources
            (
                title,
                description,
                subject,
                category,
                file_name,
                file_path,
                file_type,
                file_size,
                uploaded_by,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
        `;

        const values = [
            title,
            description || null,
            subject,
            category,
            file.filename,
            file.path,
            file.mimetype,
            file.size,
            req.user.id
        ];

        db.query(
            query,
            values,
            (err, result) => {

                if (err) {

                    console.log(
                        "Admin resource upload database error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to save admin resource"
                    });

                }

                res.status(201).json({

                    message:
                        "Admin resource uploaded and approved successfully",

                    resource: {
                        id: result.insertId,
                        title: title,
                        fileName: file.filename,
                        status: "approved"
                    }

                });

            }
        );

    } catch (error) {

        console.log(
            "Admin resource upload error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};


// =========================
// BROWSE APPROVED RESOURCES
// =========================

const getApprovedResources = (req, res) => {

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
            r.download_count,
            r.created_at,
            u.name AS uploaded_by
        FROM resources r
        JOIN users u
            ON r.uploaded_by = u.id
        WHERE r.status = 'approved'
        ORDER BY r.created_at DESC
    `;

    db.query(
        query,
        (err, results) => {

            if (err) {

                console.log(
                    "Browse resources database error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch resources"
                });

            }

            res.status(200).json({

                message:
                    "Approved resources fetched successfully",

                resources: results

            });

        }
    );

};


// =========================
// MY UPLOADED RESOURCES
// =========================

const getMyResources = (req, res) => {

    const userId = req.user.id;

    const query = `
        SELECT
            id,
            title,
            description,
            subject,
            category,
            file_name,
            file_type,
            file_size,
            status,
            download_count,
            created_at
        FROM resources
        WHERE uploaded_by = ?
        ORDER BY created_at DESC
    `;

    db.query(
        query,
        [userId],
        (err, results) => {

            if (err) {

                console.log(
                    "My resources database error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch your resources"
                });

            }

            res.status(200).json({

                message:
                    "Your resources fetched successfully",

                resources: results

            });

        }
    );

};


// =========================
// DOWNLOAD HISTORY
// =========================

const getDownloadHistory = (req, res) => {

    const userId = req.user.id;

    const query = `
        SELECT
            d.id,
            d.resource_id,
            r.title,
            r.subject,
            r.category,
            r.file_name,
            d.downloaded_at
        FROM downloads d
        JOIN resources r
            ON d.resource_id = r.id
        WHERE d.user_id = ?
        ORDER BY d.downloaded_at DESC
    `;

    db.query(
        query,
        [userId],
        (err, results) => {

            if (err) {

                console.log(
                    "Download history database error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch download history"
                });

            }

            res.status(200).json({

                message:
                    "Download history fetched successfully",

                downloads: results

            });

        }
    );

};


// =========================
// DOWNLOAD RESOURCE
// =========================

const downloadResource = (req, res) => {

    const resourceId = req.params.id;
    const userId = req.user.id;

    const query = `
        SELECT
            file_name,
            file_path
        FROM resources
        WHERE id = ?
        AND status = 'approved'
    `;

    db.query(
        query,
        [resourceId],
        (err, results) => {

            if (err) {

                console.log(
                    "Download resource database error:",
                    err.message
                );

                return res.status(500).json({
                    message:
                        "Failed to download resource"
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Approved resource not found"
                });

            }

            const file = results[0];

            const downloadQuery = `
                INSERT INTO downloads
                (user_id, resource_id)
                VALUES (?, ?)
            `;

            db.query(
                downloadQuery,
                [userId, resourceId],
                (downloadErr) => {

                    if (downloadErr) {

                        console.log(
                            "Download history error:",
                            downloadErr.message
                        );

                        return res.status(500).json({
                            message:
                                "Failed to record download"
                        });

                    }

                    const countQuery = `
                        UPDATE resources
                        SET download_count =
                            download_count + 1
                        WHERE id = ?
                    `;

                    db.query(
                        countQuery,
                        [resourceId],
                        (countErr) => {

                            if (countErr) {

                                console.log(
                                    "Download count error:",
                                    countErr.message
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to update download count"
                                });

                            }

                            res.download(
                                file.file_path,
                                file.file_name,
                                (downloadError) => {

                                    if (downloadError) {

                                        console.log(
                                            "File download error:",
                                            downloadError.message
                                        );

                                    }

                                }
                            );

                        }
                    );

                }
            );

        }
    );

};


module.exports = {

    uploadResource,
    uploadAdminResource,
    getApprovedResources,
    getMyResources,
    getDownloadHistory,
    downloadResource

};

