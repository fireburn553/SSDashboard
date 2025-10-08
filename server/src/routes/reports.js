// routes/reports.js
const express = require("express");
const router = express.Router();
const pool = require("../database");
const { generateClassReport } = require("../utils/reportGenerator");

router.get("/:id/report", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM report_full_class_details WHERE class_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const classData = result.rows[0];

    const pdfBuffer = await generateClassReport(classData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=class_${id}_report.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
