const express = require("express");
const router = express.Router();
const pool = require("../database");
const {
  validateClassInput,
  validateIdParam,
} = require("../utils/validateInput");
const crypto = require("crypto");

async function getFullClassDetailsById(id) {
  const result = await pool.query(
    `SELECT * FROM full_class_details_view WHERE class_id = $1`,
    [id]
  );
  return result.rows[0];
}
// Register a class
// Register a class (More Secure Version)
router.post("/class", async (req, res, next) => {
  // Changed to use 'next' for error handling
  const {
    class_start_date,
    class_end_date,
    class_final_evaluation_date,
    class_number,
    class_total_hours,
    class_total_days,
    // user_id is now ignored from the body
    training_location_id,
    cso_id,
    course_id,
    instructors = [], // additional instructors
  } = req.body;

  // --- SECURITY FIX ---
  // Always use the user ID from the authenticated token, not the request body.
  const mainInstructorId = req.user.user_id;

  try {
    const check = await pool.query(
      "SELECT 1 FROM class WHERE class_number = $1",
      [class_number]
    );
    if (check.rowCount > 0) {
      return res.status(409).json({ message: "Class number already exists" });
    }

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
        mainInstructorId, // Use the secure ID from the token
        training_location_id,
        cso_id,
        course_id,
      ]
    );

    const classId = result.rows[0].class_id;

    // Insert additional instructors into class_instructors
    for (const instructorId of instructors) {
      await pool.query(
        `INSERT INTO class_instructors (class_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [classId, instructorId]
      );
    }

    res.status(201).json({
      class_id: classId,
      message: "Class created successfully",
    });
  } catch (err) {
    next(err); // Pass errors to your centralized error handler
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
router.put("/class/:id/conclude", validateIdParam, async (req, res, next) => {
  const { id } = req.params;
  try {
    // First, perform the update
    const updateResult = await pool.query(
      `UPDATE class SET is_concluded = TRUE, updated_at = NOW() WHERE class_id = $1`,
      [id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    // Then, fetch the complete data using our new function
    const fullClassDetails = await getFullClassDetailsById(id);
    if (!fullClassDetails) {
      return res.status(404).json({
        message: "Could not retrieve full class details after update.",
      });
    }

    // Finally, send the complete object back
    res.json({
      message: "Class successfully concluded",
      class: fullClassDetails,
    });
  } catch (err) {
    next(err); // Pass errors to your centralized error handler
  }
});
// POST /api/instructor/class/:classId/participants
// Manually add a participant to a specific class
router.post("/class/:classId/participants", async (req, res, next) => {
  const { classId } = req.params;
  const {
    first_name,
    middle_name,
    last_name,
    nickname,
    birthday,
    birthplace,
    address,
    region,
    province,
    municipality_city,
    submunicipality,
    barangay,
    email,
    telephone,
    cellphone_number,
    civil_status,
    blood_type,
    maab_number,
    profession_occupation,
    highest_educational_attainment_id,
    gender_id,
    company_school_organization_id,
  } = req.body;

  try {
    // You could add a check here to ensure the logged-in instructor (req.user.user_id)
    // is actually an instructor for this classId, for extra security.

    const result = await pool.query(
      `INSERT INTO participant (
        pax_fname, pax_mname, pax_lname, pax_nickname, pax_bday, pax_birthplace, pax_address,
        pax_region, pax_province, pax_submunicipality, pax_city, pax_barangay, pax_email,
        pax_telephone, pax_number, pax_civil_status, pax_bloodtype, pax_maab_no,
        pax_profession_occupation, hea_id, gender_id, cso_id, class_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *`, // Return the new participant
      [
        first_name,
        middle_name,
        last_name,
        nickname,
        birthday,
        birthplace,
        address,
        region,
        province,
        submunicipality,
        municipality_city,
        barangay,
        email,
        telephone,
        cellphone_number,
        civil_status,
        blood_type,
        maab_number,
        profession_occupation,
        highest_educational_attainment_id,
        gender_id,
        company_school_organization_id,
        classId,
      ]
    );

    res.status(201).json({
      message: "Participant added successfully.",
      participant: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
});
//generate link for the frontend
router.post("/class/:id/invite-link", async (req, res, next) => {
  const { id: classId } = req.params;

  try {
    // Check if a link already exists for this class
    let result = await pool.query(
      `SELECT token FROM class_invitations WHERE class_id = $1`,
      [classId]
    );

    let token;
    if (result.rows.length > 0) {
      // If a token exists, use that one
      token = result.rows[0].token;
    } else {
      // If not, create a new one
      token = crypto.randomBytes(32).toString("hex");
      await pool.query(
        `INSERT INTO class_invitations (class_id, token, is_active) VALUES ($1, $2, TRUE)`,
        [classId, token]
      );
    }

    const link = `${process.env.FRONTEND_URL}/register/invite/${token}`;
    res.json({ link });
  } catch (err) {
    next(err);
  }
});

router.put("/class/:id/invite-status", async (req, res, next) => {
  const { id: classId } = req.params;
  const { isActive } = req.body; // Frontend will send { "isActive": true } or { "isActive": false }

  if (typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ message: "Invalid 'isActive' value provided." });
  }

  try {
    const result = await pool.query(
      `UPDATE class_invitations SET is_active = $1 WHERE class_id = $2 RETURNING is_active`,
      [isActive, classId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No invitation link found for this class to update.",
      });
    }

    res.json({
      message: `Registration is now ${isActive ? "OPEN" : "CLOSED"}.`,
      isActive: result.rows[0].is_active,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/class/:id", async (req, res, next) => {
  try {
    const fullClassDetails = await getFullClassDetailsById(req.params.id);
    if (!fullClassDetails) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(fullClassDetails);
  } catch (err) {
    next(err);
  }
});

// GET all available courses for the dropdown
router.get("/courses", async (req, res, next) => {
  try {
    const result = await pool.query(`
        SELECT 
            course_id, 
            course_name, 
            course_acronym, 
            course_duration AS total_days,
            (course_duration * 8) AS total_hours -- Assuming 8 hours per day
        FROM course 
        ORDER BY course_name
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});
// POST a new training location
router.post("/locations", async (req, res, next) => {
  const {
    establishment_name,
    address,
    region,
    province,
    municipality_city,
    submunicipality,
    barangay,
  } = req.body;
  // Basic validation
  if (!establishment_name || !address || !municipality_city) {
    return res
      .status(400)
      .json({ message: "Establishment, address, and city are required." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO training_location (establishment_name, address, region,province, municipality_city, submunicipality,barangay)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING training_location_id, establishment_name`,
      [
        establishment_name,
        address,
        region,
        province,
        municipality_city,
        submunicipality,
        barangay,
      ]
    );
    res.status(201).json(result.rows[0]); // Return the new location
  } catch (err) {
    next(err);
  }
});

// GET all available training locations for the dropdown
router.get("/locations", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT training_location_id, establishment_name FROM training_location ORDER BY establishment_name"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET all available CSOs for the dropdown
router.get("/csos", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT cso_id, cso_name FROM cso ORDER BY cso_name"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET all approved instructors (to select as additional instructors)
router.get("/approved-instructors", async (req, res, next) => {
  try {
    // Uses the view you already created in your schema!
    const result = await pool.query(
      "SELECT user_id, user_fname, user_lname FROM approved_instructors ORDER BY user_lname, user_fname"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ... (other imports and routes)

// POST a new CSO (Company/School/Organization)
router.post("/csos", async (req, res, next) => {
  const { cso_name, cso_type } = req.body;

  // Basic validation
  if (!cso_name || !cso_type) {
    return res.status(400).json({ message: "CSO name and type are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cso (cso_name, cso_type)
       VALUES ($1, $2) 
       RETURNING cso_id, cso_name, cso_type`,
      [cso_name, cso_type]
    );
    // Return the newly created CSO object
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Handle the case where the CSO name already exists
    if (err.code === "23505") {
      // unique_violation
      return res
        .status(409)
        .json({ message: "A CSO with this name already exists." });
    }
    next(err); // Pass other errors to the central handler
  }
});

// GET all classes for the currently logged-in instructor (main or co-instructor)
router.get("/my-classes", async (req, res, next) => {
  const instructorId = req.user.user_id; // Get the user ID from the auth token

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT
        c.class_id,
        c.class_number,
        co.course_name,
        c.class_start_date,
        c.is_concluded
      FROM class c
      JOIN course co ON c.course_id = co.course_id
      LEFT JOIN class_instructors ci ON c.class_id = ci.class_id
      WHERE c.user_id = $1 OR ci.user_id = $1
      ORDER BY c.class_start_date DESC;
      `,
      [instructorId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Reactivate a class (set is_concluded to false)
router.put("/class/:id/reactivate", async (req, res, next) => {
  const { id } = req.params;
  try {
    // First, perform the update
    const updateResult = await pool.query(
      `UPDATE class SET is_concluded = FALSE, updated_at = NOW() WHERE class_id = $1`,
      [id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    // Then, fetch the complete data using our new function
    const fullClassDetails = await getFullClassDetailsById(id);
    if (!fullClassDetails) {
      return res.status(404).json({
        message: "Could not retrieve full class details after update.",
      });
    }
    // Finally, send the complete object back
    res.json({
      message: "Class successfully reactivated",
      class: fullClassDetails,
    });
  } catch (err) {
    next(err);
  }
});

router.put("/class/:id/invite-status", async (req, res, next) => {
  const { id: classId } = req.params;
  const { isActive } = req.body; // Frontend will send { "isActive": true } or { "isActive": false }

  if (typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ message: "Invalid 'isActive' value provided." });
  }

  try {
    const result = await pool.query(
      `UPDATE class_invitations SET is_active = $1 WHERE class_id = $2 RETURNING is_active`,
      [isActive, classId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No invitation link found for this class to update.",
      });
    }

    res.json({
      message: `Registration link is now ${isActive ? "ACTIVE" : "INACTIVE"}.`,
      isActive: result.rows[0].is_active,
    });
  } catch (err) {
    next(err);
  }
});
router.get("/dashboard-summary", async (req, res, next) => {
  const instructorId = req.user.user_id;

  try {
    // We'll run multiple queries at once for efficiency
    const [statsResult, passFailResult, coursesResult] = await Promise.all([
      // Query 1: Get general stats
      pool.query(
        `SELECT
          COUNT(DISTINCT c.class_id) AS total_classes,
          COUNT(DISTINCT CASE WHEN c.is_concluded = FALSE THEN c.class_id END) AS active_classes,
          -- Only count participants from concluded classes
          COUNT(p.pax_id) FILTER (WHERE c.is_concluded = TRUE) AS total_participants
         FROM class c
         LEFT JOIN participant p ON c.class_id = p.class_id
         WHERE c.user_id = $1 OR c.class_id IN (SELECT class_id FROM class_instructors WHERE user_id = $1)`,
        [instructorId]
      ),
      // Query 2: Get pass/fail counts for a pie chart
      pool.query(
        `SELECT
          pax_remarks,
          COUNT(pax_id) as count
         FROM participant p
         JOIN class c ON p.class_id = c.class_id
         WHERE (c.user_id = $1 OR c.class_id IN (SELECT class_id FROM class_instructors WHERE user_id = $1))
         AND p.pax_remarks IN ('passed', 'failed', 'drop')
         AND c.is_concluded = TRUE -- ADD THIS LINE
         GROUP BY pax_remarks`,
        [instructorId]
      ),
      // Query 3: Get participant counts per course for a bar chart
      pool.query(
        `SELECT
          co.course_name,
          COUNT(p.pax_id) as participant_count
         FROM participant p
         JOIN class c ON p.class_id = c.class_id
         JOIN course co ON c.course_id = co.course_id
         WHERE (c.user_id = $1 OR c.class_id IN (SELECT class_id FROM class_instructors WHERE user_id = $1))
         AND c.is_concluded = TRUE -- ADD THIS LINE
         GROUP BY co.course_name
         ORDER BY participant_count DESC`,
        [instructorId]
      ),
    ]);

    // Combine the results into a single JSON object
    const summary = {
      stats: statsResult.rows[0],
      passFailDistribution: passFailResult.rows,
      courseDistribution: coursesResult.rows,
    };

    res.json(summary);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
