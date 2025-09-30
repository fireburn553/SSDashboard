// routes/grades.js
const express = require("express");
const router = express.Router();
const pool = require("../database");

// Instructor enters grades
router.put("/:pax_id/grades", async (req, res) => {
  const { pax_id } = req.params;
  const { knowledge, skills, remarks } = req.body;

  const validRemarks = ["passed", "failed", "drop"];
  if (!validRemarks.includes(remarks)) {
    return res.status(400).json({ message: "Invalid remarks value" });
  }

  try {
    const result = await pool.query(
      `UPDATE participant
       SET pax_knowledge = $1,
           pax_skills = $2,
           pax_remarks = $3::pax_result, -- enforce ENUM type
           updated_at = NOW()
       WHERE pax_id = $4
       RETURNING pax_id, pax_fname, pax_lname, pax_knowledge, pax_skills, pax_remarks`,
      [knowledge, skills, remarks, pax_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Participant not found" });
    }

    res.json({
      message: "Grades updated successfully",
      participant: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating grades:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
