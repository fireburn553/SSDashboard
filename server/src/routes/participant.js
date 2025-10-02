const express = require("express");
const router = express.Router();
const pool = require("../database");

router.post("/register/:id", async (req, res) => {
  const { id } = req.params; //class_id
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
    const result = await pool.query(
      `INSERT INTO participant (
            "pax_fname",
            "pax_mname",
            "pax_lname",
            "pax_nickname",
            "pax_bday",
            "pax_birthplace",
            "pax_address",
            "pax_region",
            "pax_province",
            "pax_submunicipality",
            "pax_city",
            "pax_barangay",
            "pax_email",
            "pax_telephone",
            "pax_number",
            "pax_civil_status",
            "pax_bloodtype",
            "pax_maab_no",
            "pax_profession_occupation",
            "hea_id",
            "gender_id",
            "cso_id",
            "class_id"
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
            RETURNING pax_id`,
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
        id,
      ]
    );

    res.status(201).json({
      pax_id: result.rows[0].pax_id,
      message: "Participant Registered to the class",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
