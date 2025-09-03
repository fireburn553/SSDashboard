const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database"); // Adjust if your db export is different

router.post("/instructor", async (req, res) => {
  const {
    user_fname,
    user_mname,
    user_lname,
    user_bday,
    user_complete_address,
    user_region,
    user_province,
    user_submunicipality,
    user_municipality_city,
    user_barangay,
    user_email,
    user_password,
    user_authority_number,
    gender_id,
    account_status_id,
  } = req.body;

  // Set instructor role_id (replace with actual value from your role table)
  const instructorRoleId = 2;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    const result = await pool.query(
      `INSERT INTO users (
                user_fname, user_mname, user_lname, user_bday, user_complete_address,
                user_region, user_province, user_submunicipality, user_municipality_city,
                user_barangay, user_email, user_password, user_authority_number,
                role_id, gender_id, account_status_id
            ) VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9,
                $10, $11, $12, $13,
                $14, $15, $16
            ) RETURNING user_id`,
      [
        user_fname,
        user_mname,
        user_lname,
        user_bday,
        user_complete_address,
        user_region,
        user_province,
        user_submunicipality,
        user_municipality_city,
        user_barangay,
        user_email,
        hashedPassword,
        user_authority_number,
        instructorRoleId,
        gender_id,
        account_status_id,
      ]
    );

    res.status(201).json({
      user_id: result.rows[0].user_id,
      message: "Instructor account created",
    });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation
      res.status(409).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});


router.get("/instructor", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users;");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
