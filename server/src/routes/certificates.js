const express = require("express");
const router = express.Router();
const pool = require("../database");
const { generateCertificatesPDF } = require("../utils/certificateGenerator"); // We will create this file next
const { ensureCertificateNumbers } = require("../utils/certificateNumberUtil");

router.get("/class/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    await ensureCertificateNumbers(id);
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
router.get("/participant/:pax_id", async (req, res, next) => {
  const { pax_id } = req.params;

  try {
    // 1. Find which class the participant belongs to
    const classLinkResult = await pool.query(
      `SELECT class_id FROM participant WHERE pax_id = $1`,
      [pax_id]
    );

    if (classLinkResult.rows.length === 0) {
      return res.status(404).send("Participant not found.");
    }
    const { class_id } = classLinkResult.rows[0];

    // 2. Fetch the full data for that class (which includes all participants)
    const classResult = await pool.query(
      `SELECT * FROM report_full_class_details WHERE class_id = $1`,
      [class_id]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).send("Associated class not found.");
    }
    const classData = classResult.rows[0];

    // 3. Find the specific participant's data from the class details
    const participant = classData.participants.find((p) => p.pax_id == pax_id);

    if (!participant || participant.pax_remarks !== "passed") {
      return res
        .status(400)
        .send(
          "This participant has not passed and cannot receive a certificate."
        );
    }

    // 4. Generate a PDF for just this one participant
    const pdfBuffer = await generateCertificatesPDF(classData, [participant]);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=certificate_${pax_id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
