const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { authMiddleware } = require("./middleware");
const { Model } = require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", mainRouter);

// Example API endpoint with authentication middleware
app.get("/info", authMiddleware, async (req, res) => {
    try {
        const account = await Model.findOne({
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }

        res.json({
            Username: account.firstName
        });
    } catch (error) {
        console.error("Error fetching account:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
