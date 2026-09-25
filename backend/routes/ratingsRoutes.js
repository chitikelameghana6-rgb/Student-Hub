
const express = require("express");

const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();


// Add or Update Rating
router.post("/:resourceId", authenticateToken, (req, res) => {

    const resourceId = req.params.resourceId;
    const userId = req.user.id;
    const { rating } = req.body;


    // Validate rating
    if (!rating) {

        return res.status(400).json({
            message: "Rating is required"
        });

    }


    if (rating < 1 || rating > 5) {

        return res.status(400).json({
            message: "Rating must be between 1 and 5"
        });

    }


    // Check whether resource exists and is approved

    const resourceQuery = `
        SELECT id
        FROM resources
        WHERE id = ?
        AND status = 'approved'
    `;


    db.query(
        resourceQuery,
        [resourceId],
        (err, results) => {

            if (err) {

                console.log(
                    "Resource check error:",
                    err.message
                );

                return res.status(500).json({
                    message: "Database error"
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Approved resource not found"
                });

            }


            // Check existing rating

            const checkRatingQuery = `
                SELECT id
                FROM ratings
                WHERE user_id = ?
                AND resource_id = ?
            `;


            db.query(
                checkRatingQuery,
                [userId, resourceId],
                (err, ratingResults) => {

                    if (err) {

                        console.log(
                            "Rating check error:",
                            err.message
                        );

                        return res.status(500).json({
                            message:
                                "Database error"
                        });

                    }


                    // Update existing rating

                    if (ratingResults.length > 0) {

                        const updateQuery = `
                            UPDATE ratings
                            SET rating = ?
                            WHERE user_id = ?
                            AND resource_id = ?
                        `;


                        db.query(
                            updateQuery,
                            [rating, userId, resourceId],
                            (err) => {

                                if (err) {

                                    console.log(
                                        "Rating update error:",
                                        err.message
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to update rating"
                                    });

                                }


                                res.status(200).json({
                                    message:
                                        "Rating updated successfully"
                                });

                            }
                        );


                    } else {

                        // Add new rating

                        const insertQuery = `
                            INSERT INTO ratings
                            (user_id, resource_id, rating)
                            VALUES (?, ?, ?)
                        `;


                        db.query(
                            insertQuery,
                            [userId, resourceId, rating],
                            (err) => {

                                if (err) {

                                    console.log(
                                        "Rating insert error:",
                                        err.message
                                    );

                                    return res.status(500).json({
                                        message:
                                            "Failed to add rating"
                                    });

                                }


                                res.status(201).json({
                                    message:
                                        "Rating added successfully"
                                });

                            }
                        );

                    }

                }
            );

        }
    );

});



// Get My Ratings

router.get(
    "/my-ratings",
    authenticateToken,
    (req, res) => {

        const userId = req.user.id;


        const query = `
            SELECT
                ratings.id,
                ratings.resource_id,
                ratings.rating,
                ratings.created_at,
                resources.title,
                resources.subject,
                resources.category
            FROM ratings
            JOIN resources
                ON ratings.resource_id = resources.id
            WHERE ratings.user_id = ?
            ORDER BY ratings.created_at DESC
        `;


        db.query(
            query,
            [userId],
            (err, results) => {

                if (err) {

                    console.log(
                        "My ratings database error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch your ratings"
                    });

                }


                res.status(200).json({

                    message:
                        "Your ratings fetched successfully",

                    ratings: results

                });

            }
        );

    }
);



// Get Average Rating

router.get(
    "/:resourceId",
    authenticateToken,
    (req, res) => {

        const resourceId =
            req.params.resourceId;


        const query = `
            SELECT
                COUNT(*) AS total_ratings,
                COALESCE(AVG(rating), 0)
                    AS average_rating
            FROM ratings
            WHERE resource_id = ?
        `;


        db.query(
            query,
            [resourceId],
            (err, results) => {

                if (err) {

                    console.log(
                        "Get rating error:",
                        err.message
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch rating"
                    });

                }


                res.status(200).json({

                    resource_id: resourceId,

                    total_ratings:
                        results[0].total_ratings,

                    average_rating:
                        Number(
                            results[0].average_rating
                        )

                });

            }
        );

    }
);


module.exports = router;

