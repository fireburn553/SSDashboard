const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database"); // Adjust if your db export is different

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(
      `SELECT u.user_id, u.user_email, u.user_password,
              r.role_name AS role, r.role_id, 
              u.user_fname, u.user_lname,
              s.account_status_name, u.account_status_id
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       JOIN account_status s ON u.account_status_id = s.account_status_id
       WHERE u.user_email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // Check if account is approved
    if (
      user.account_status_name == "Pending" &&
      user.account_status_name == "Suspended"
    ) {
      return res.status(403).json({
        message: `Account not approved. Current status: ${user.account_status_name}`,
      });
    }

    // Validate password
    const valid = await bcrypt.compare(password, user.user_password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.user_email,
        role: user.role,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ user: { ...user, user_password: undefined } }); // don’t send password back
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
});

router.post("/register", async (req, res) => {
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
  } = req.body;

  // Force instructor role_id (replace 2 with the actual value in your roles table)
  const instructorRoleId = 2;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        user_fname, user_mname, user_lname, user_bday, user_complete_address,
        user_region, user_province, user_submunicipality, user_municipality_city,
        user_barangay, user_email, user_password, user_authority_number,
        role_id, gender_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING user_id`,
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
        instructorRoleId, // ✅ FIXED
        gender_id,
      ]
    );

    res.status(201).json({
      user_id: result.rows[0].user_id,
      message: "Instructor account created (pending approval)",
    });
  } catch (err) {
    if (err.code === "23505") {
      // unique_violation (duplicate email)
      res.status(409).json({ message: "Email already exists" });
    } else {
      console.error("Registration error:", err); // 👈 log real error
      res.status(500).json({ message: "Server error" });
    }
  }
});

router.get("/check-auth", (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
