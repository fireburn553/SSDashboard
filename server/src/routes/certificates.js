const express = require("express");
const router = express.Router();
const pool = require("../database");
const { generateCertificatesPDF } = require("../utils/certificateGenerator"); // We will create this file next

router.get("/class/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Fetch the main class data from your view
    const classResult = await pool.query(
      `SELECT * FROM report_full_class_details WHERE class_id = $1`,
      [id]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    // The main class data (course name, instructor, etc.)
    const classData = classResult.rows[0];

    // 2. Filter out only the participants who passed
    const passedParticipants = classData.participants.filter(
      (p) => p.pax_remarks === "passed"
    );

    if (passedParticipants.length === 0) {
      return res
        .status(404)
        .next(
          "No participants have passed this class to receive certificates."
        );
    }

    // 3. Generate the multi-page PDF
    const pdfBuffer = await generateCertificatesPDF(
      classData,
      passedParticipants
    );

    // 4. Send the PDF to the browser for previewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=certificates_class_${classData.class_number}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
