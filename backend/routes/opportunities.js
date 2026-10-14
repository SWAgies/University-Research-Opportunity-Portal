const express = require("express");
const pool = require("../db");

const router = express.Router();
const REQUIRED_FIELDS = [
  "title",
  "description",
  "research_area",
  "faculty_name",
  "department",
  "required_skills",
  "positions",
  "deadline",
];

function validate(body) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || String(body[field]).trim() === "") {
      errors.push(`${field} is required`);
    }
  }

  if (body.positions !== undefined && (!Number.isInteger(Number(body.positions)) || Number(body.positions) < 1)) {
    errors.push("positions must be a whole number of at least 1");
  }

  if (body.deadline && isNaN(Date.parse(body.deadline))) {
    errors.push("deadline must be a valid date (YYYY-MM-DD)");
  }

  if (body.status && !["Open", "Closed"].includes(body.status)) {
    errors.push("status must be Open or Closed");
  }

  return errors;
}

// CREATE
router.post("/", async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    title, description, research_area, faculty_name,
    department, required_skills, positions, deadline,
  } = req.body;
  const status = req.body.status || "Open";

  try {
    const [result] = await pool.query(
      `INSERT INTO opportunities
       (title, description, research_area, faculty_name, department, required_skills, positions, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, research_area, faculty_name, department, required_skills, positions, deadline, status]
    );

    const [rows] = await pool.query("SELECT * FROM opportunities WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating opportunity" });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM opportunities ORDER BY id DESC");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching opportunities" });
  }
});
// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM opportunities WHERE id = ?", [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching opportunity" });
  }
});
// UPDATE
router.put("/:id", async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const {
    title, description, research_area, faculty_name,
    department, required_skills, positions, deadline,
  } = req.body;
  const status = req.body.status || "Open";

  try {
    const [result] = await pool.query(
      `UPDATE opportunities
       SET title=?, description=?, research_area=?, faculty_name=?, department=?,
           required_skills=?, positions=?, deadline=?, status=?
       WHERE id=?`,
      [title, description, research_area, faculty_name, department, required_skills, positions, deadline, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const [rows] = await pool.query("SELECT * FROM opportunities WHERE id = ?", [req.params.id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating opportunity" });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM opportunities WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting opportunity" });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM opportunities WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting opportunity" });
  }
});
// CLOSE (change only the status)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["Open", "Closed"].includes(status)) {
    return res.status(400).json({ errors: ["status must be Open or Closed"] });
  }

  try {
    const [result] = await pool.query(
      "UPDATE opportunities SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    const [rows] = await pool.query("SELECT * FROM opportunities WHERE id = ?", [req.params.id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating status" });
  }
});
module.exports = router;