const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database"); // Adjust if your db export is different

//register a class
// POST /api/instructors/class
router.put("/class", async (req, res) => {
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
      `INSERT INTO users (
      class_start_date, class_end_date, class_final_evaluation_date, class_number, class_total_hours, class_total_days, user_id, training_location_id, cso_id, course_id) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING class_id`,
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

//retrieve a class

module.exports = router;
