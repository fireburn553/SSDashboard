const fs = require("fs");
const path = require("path");
const pool = require("./src/database");
const { buildCertificateHTML } = require("./src/utils/certificateTemplate");

async function generatePreview() {
  const classId = 8; // Get ID from command line, e.g., "node preview.js 8"

  if (!classId) {
    console.error(
      "❌ Error: Please provide a Class ID. Usage: node preview.js <class_id>"
    );
    return;
  }

  console.log(`⏳ Generating certificate preview for Class ID: ${classId}...`);

  try {
    const result = await pool.query(
      `SELECT * FROM report_full_class_details WHERE class_id = $1`, // Use the correct, new view
      [classId]
    );

    if (result.rows.length === 0) {
      console.error(`❌ Error: No class found with ID: ${classId}`);
      return;
    }

    const classData = result.rows[0];

    // === 1. CHECK IF THERE ARE ANY PARTICIPANTS ===
    if (!classData.participants || classData.participants.length === 0) {
      console.error(
        `❌ Error: No participants found in class ID: ${classId} to generate a preview for.`
      );
      return;
    }

    // === 2. SELECT THE FIRST PARTICIPANT FOR THE PREVIEW ===
    const previewParticipant = classData.participants[0];
    console.log(
      `ℹ️  Using participant "${previewParticipant.pax_fname} ${previewParticipant.pax_lname}" for preview.`
    );

    // === 3. PASS BOTH ARGUMENTS TO THE FUNCTION ===
    const html = buildCertificateHTML(classData, previewParticipant);

    fs.writeFileSync("certificatePreview.html", html); // Use a different name to avoid conflicts

    console.log("✅ Preview generated successfully: certificatePreview.html");
  } catch (err) {
    console.error("🔥 An error occurred:", err);
  }
}

generatePreview();
