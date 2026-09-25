console.log("SERVER.JS LOADED");

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ratingsRoutes = require("./routes/ratingsRoutes");

require("./config/db");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});

console.log("AUTH ROUTER IS BEING MOUNTED");
app.use("/api/auth", authRoutes);

console.log("RESOURCE ROUTER IS BEING MOUNTED");
app.use("/api/resources", resourceRoutes);

console.log("ADMIN ROUTER IS BEING MOUNTED");
app.use("/api/admin", adminRoutes);

console.log("RATINGS ROUTER IS BEING MOUNTED");
app.use("/api/ratings", ratingsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Student Hub Backend is running!"
    });
});

app.listen(PORT, () => {
    console.log(
        `Student Hub Backend is running on http://localhost:${PORT}`
    );
});