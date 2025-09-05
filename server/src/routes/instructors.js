const express = require("express");
const router = express.Router();
const pool = require("../database");
const { validateClassInput, validateIdParam } = require("../middleware/validateInput");

// Register a class
router.post("/class", validateClassInput, async (req, res) => {
  const {
    class_start_date,
    class_end_date,
    class_final_evaluation_date,
    class_number,
    class_total_hours,
    class_total_days,
    user_id,
    training_location_id,
    cso_id,
    course_id,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO class (
        class_start_date, class_end_date, class_final_evaluation_date,
        class_number, class_total_hours, class_total_days,
        user_id, training_location_id, cso_id, course_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING class_id`,
      [
        class_start_date,
        class_end_date,
        class_final_evaluation_date,
        class_number,
        class_total_hours,
        class_total_days,
        user_id,
        training_location_id,
        cso_id,
        course_id,
      ]
    );

    res.status(201).json({
      class_id: result.rows[0].class_id,
      message: "Class created",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Retrieve a class
router.get("/class/active/:id", validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM user_classes_view c WHERE c.user_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Conclude a class
router.put("/class/:id/conclude", validateIdParam, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE class 
       SET is_concluded = TRUE, updated_at = NOW()
       WHERE class_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ message: "Class successfully concluded", class: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
