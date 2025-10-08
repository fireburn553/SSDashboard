const express = require("express");
const router = express.Router();
const pool = require("../database");
const { body, validationResult } = require("express-validator"); // For security

router.post(
  "/register/invite/:token",
  // Basic validation to protect your database
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
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
    } = req.body;

    try {
      // 1. Find the invitation and check if it's active
      const inviteResult = await pool.query(
        `SELECT class_id FROM class_invitations WHERE token = $1 AND is_active = TRUE`,
        [token]
      );

      if (inviteResult.rows.length === 0) {
        // This message is intentionally generic for security.
        return res.status(404).json({
          message:
            "Registration is closed or this link is not valid. Please contact the instructor.",
        });
      }

      const { class_id } = inviteResult.rows[0];

      // 2. Insert the participant's data into the participant table
      const insertSql = `
                INSERT INTO participant (
                    pax_fname, pax_mname, pax_lname, pax_nickname, pax_bday, pax_birthplace, pax_address,
                    pax_region, pax_province, pax_submunicipality, pax_city, pax_barangay, pax_email,
                    pax_telephone, pax_number, pax_civil_status, pax_bloodtype, pax_maab_no,
                    pax_profession_occupation, hea_id, gender_id, cso_id, class_id
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
                RETURNING pax_id
            `;
      const result = await pool.query(insertSql, [
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
        cellphone_number, // This correctly maps to `pax_number`
        civil_status,
        blood_type,
        maab_number, // This now correctly maps to `pax_maab_no`
        profession_occupation,
        highest_educational_attainment_id,
        gender_id,
        company_school_organization_id,
        class_id,
      ]);

      res.status(201).json({
        pax_id: result.rows[0].pax_id,
        message: "You have been successfully registered for the class!",
      });
    } catch (err) {
      // Add specific error handling for duplicate entries
      if (err.code === "23505") {
        // '23505' is the PostgreSQL code for a unique constraint violation
        if (err.constraint === "uq_participant_class_pax_number") {
          return res.status(409).json({
            message:
              "A participant with this cellphone number is already registered in this class.",
          });
        }
        if (err.constraint === "uq_participant_class_email") {
          return res.status(409).json({
            message:
              "A participant with this email is already registered in this class.",
          });
        }
      }
      next(err); // Pass other errors to your central handler
    }
  }
);
// It checks a token and returns basic class info if it's valid and active.
router.get("/invite/:token", async (req, res, next) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      `SELECT
         c.class_id,
         co.course_name
       FROM class_invitations inv
       JOIN class c ON inv.class_id = c.class_id
       JOIN course co ON c.course_id = co.course_id
       WHERE inv.token = $1 AND inv.is_active = TRUE`, // The crucial check
      [token]
    );

    if (result.rows.length === 0) {
      // If no row is found, the token is invalid or inactive.
      return res.status(404).json({
        message:
          "Registration is closed or this link is not valid. Please contact the instructor.",
      });
    }

    // If successful, send back the class details
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
// getting the CSO
router.get("/csos", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cso_id, cso_name FROM cso ORDER BY cso_name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// add new CSO
router.post("/csos", async (req, res) => {
  try {
    const { cso_name, cso_type } = req.body;
    const result = await pool.query(
      `INSERT INTO cso (cso_name, cso_type)
       VALUES ($1, $2) RETURNING cso_id, cso_name`,
      [cso_name, cso_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation
      res.status(409).json({ message: "CSO already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// get all HEA
router.get("/hea", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM highest_education_attainment`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
