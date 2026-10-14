const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors());           // allow frontend to call this API
app.use(express.json());   // read JSON sent in request body

const opportunityRoutes = require("./routes/opportunities");
app.use("/api/opportunities", opportunityRoutes);

// Test route: checks that the database is reachable
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM opportunities");
    res.status(200).json({ status: "ok", total_opportunities: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await pool.query("SELECT 1");
    console.log("Connected to database");
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
});