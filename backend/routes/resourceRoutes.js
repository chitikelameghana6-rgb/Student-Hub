
console.log("RESOURCE ROUTES FILE LOADED");

const express = require("express");
const multer = require("multer");
const path = require("path");

const authenticateToken =
    require("../middleware/authMiddleware");

const adminOnly =
    require("../middleware/adminMiddleware");

const {
    uploadResource,
    uploadAdminResource,
    getApprovedResources,
    downloadResource,
    getMyResources,
    getDownloadHistory
} = require("../controllers/resourceController");

const router = express.Router();


// =========================
// MULTER STORAGE
// =========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            path.join(__dirname, "../uploads")
        );

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});


// =========================
// ALLOWED FILE TYPES
// =========================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        ".pdf",
        ".ppt",
        ".pptx",
        ".png",
        ".jpg",
        ".jpeg"
    ];

    const extension =
        path.extname(
            file.originalname
        ).toLowerCase();

    if (allowedTypes.includes(extension)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only PDF, PPT, PPTX, PNG, JPG and JPEG files are allowed"
            )
        );

    }

};


// =========================
// MULTER CONFIGURATION
// =========================

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


// =========================
// BROWSE APPROVED RESOURCES
// =========================

router.get(
    "/",
    authenticateToken,
    getApprovedResources
);


// =========================
// STUDENT UPLOAD
// =========================

router.post(
    "/upload",
    authenticateToken,
    upload.single("file"),
    uploadResource
);


// =========================
// ADMIN DIRECT UPLOAD
// =========================

router.post(
    "/admin-upload",
    authenticateToken,
    adminOnly,
    upload.single("file"),
    uploadAdminResource
);


// =========================
// DOWNLOAD RESOURCE
// =========================

router.get(
    "/download/:id",
    authenticateToken,
    downloadResource
);


// =========================
// MY UPLOADED RESOURCES
// =========================

router.get(
    "/my-resources",
    authenticateToken,
    getMyResources
);


// =========================
// MY DOWNLOAD HISTORY
// =========================

router.get(
    "/download-history",
    authenticateToken,
    getDownloadHistory
);


module.exports = router;

