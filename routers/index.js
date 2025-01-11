

const express = require("express");
const router = express.Router();
const cors = require("cors");
router.use(cors());

// Import employee routes
const employeeRoutes = require("./emplyeeroutes");

// Register the employee routes
router.use("/employee", employeeRoutes);

// 404 handler (placed last)
router.use((req, res) => {
    console.log("Route not found:", req.originalUrl); // Log the missing route
    res.status(404).json({ message: "Route not found" });
});

module.exports = router;
