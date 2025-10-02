const express = require("express");
const router = express.Router();
const pool = require("../database");
const {
  validateClassInput,
  validateIdParam,
} = require("../utils/validateInput");

// Register a class
router.post("/class", async (req, res) => {
  const {
    class_start_date,
    class_end_date,
    class_final_evaluation_date,
    class_number,
    class_total_hours,
    class_total_days,
    user_id, // main instructor
    training_location_id,
    cso_id,
    course_id,
    instructors = [], // additional instructors
  } = req.body;

  try {
    const check = await pool.query(
      "SELECT 1 FROM class WHERE class_number = $1",
      [class_number]
    );
    if (check.rowCount > 0) {
      return res.status(400).json({ message: "Class number already exists" });
    }

    // Insert into class table (main instructor = user_id)
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

    const classId = result.rows[0].class_id;

    // Insert additional instructors into class_instructors
    for (const instructorId of instructors) {
      await pool.query(
        `INSERT INTO class_instructors (class_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`, // avoid duplicates
        [classId, instructorId]
      );
    }

    res.status(201).json({
      class_id: classId,
      message: "Class created with instructors",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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

    res.json({
      message: "Class successfully concluded",
      class: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
      return res
        .status(404)
        .json({
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

router.get("/class/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        co.course_name,
        tl.establishment_name,
        tl.address,
        cso.cso_name,
        c.class_start_date,
        c.class_end_date,
        c.class_final_evaluation_date,
        main_instructor.user_id AS main_instructor_id,
        main_instructor.user_fname || ' ' || main_instructor.user_lname AS main_instructor_name,
        main_instructor.user_authority_number AS main_instructor_auth_num,
        main_instructor.user_complete_address AS main_instructor_address,
        c.class_id,
        c.class_number,
        tl.municipality_city,
        tl.province,
        c.class_total_days,
        c.class_total_hours,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'user_id', ci.user_id,
                    'instructor_fname', co_instructor.user_fname,
                    'instructor_mname', co_instructor.user_mname,
                    'instructor_lname', co_instructor.user_lname,
                    'instructor_auth_num', co_instructor.user_authority_number,
                    'instructor_address', co_instructor.user_complete_address
                )
            ) FILTER (WHERE ci.user_id IS NOT NULL),
            '[]'
        ) AS co_instructors,
        COALESCE(
            json_agg(
                DISTINCT jsonb_build_object(
                    'pax_id', p.pax_id,
                    'pax_fname', p.pax_fname,
                    'pax_mname', p.pax_mname,
                    'pax_lname', p.pax_lname,
                    'pax_address', p.pax_address,
                    'email', p.pax_email,
                    'pax_number', p.pax_number,
                    'pax_bday', p.pax_bday,
                    'hea_initial', hea.hea_initial,
                    'pax_knowledge', p.pax_knowledge,
                    'pax_skills', p.pax_skills,
                    'pax_gender', g.gender_name,
                    'certificate_number', p.certificate_number
                )
            ) FILTER (WHERE p.pax_id IS NOT NULL),
            '[]'
        ) AS participants
      FROM class c
      LEFT JOIN users main_instructor ON c.user_id = main_instructor.user_id
      LEFT JOIN class_instructors ci ON c.class_id = ci.class_id
      LEFT JOIN users co_instructor ON ci.user_id = co_instructor.user_id
      LEFT JOIN participant p ON c.class_id = p.class_id
      LEFT JOIN highest_education_attainment hea ON p.hea_id = hea.hea_id
      LEFT JOIN gender g ON g.gender_id = p.gender_id
      LEFT JOIN course co ON co.course_id = c.course_id
      LEFT JOIN training_location tl ON tl.training_location_id = c.training_location_id
      LEFT JOIN cso ON cso.cso_id = c.cso_id
      WHERE c.class_id = $1
      GROUP BY c.class_id, main_instructor.user_id, main_instructor.user_fname, main_instructor.user_lname, co.course_name, tl.establishment_name, tl.address, cso.cso_name, c.class_final_evaluation_date, tl.municipality_city, tl.province
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
