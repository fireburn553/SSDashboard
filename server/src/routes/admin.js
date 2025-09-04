// src/routes/admin.js
const express = require("express");
const pool = require("../database/index");
const router = express.Router();

// GET all instructor (admin only)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM instructors_view`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all pending instructors
router.get("/instructors/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, user_fname, user_lname, user_email, role_id, account_status_id
      FROM users
      WHERE role_id = 2 AND account_status_id = 1
    `); // role_id = 2 → instructor, account_status_id = 1 → pending
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/instructors/:id/approve
router.put("/instructors/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users 
       SET account_status_id = 2 -- approved
       WHERE user_id = $1 
       RETURNING user_id, user_fname, user_lname`,
      [id]
    );
    res.json({ message: "Instructor approved", instructor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/instructors/:id/reject
router.put("/instructors/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users 
       SET account_status_id = 3 -- rejected
       WHERE user_id = $1 
       RETURNING user_id, user_fname, user_lname`,
      [id]
    );
    res.json({ message: "Instructor rejected", instructor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
