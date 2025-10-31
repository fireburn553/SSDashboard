const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database"); // Adjust if your db export is different
const { sanitizeString } = require("../utils/validateInput");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      `SELECT u.user_id, u.user_email, u.user_password,
              r.role_name AS role, r.role_id, 
              u.user_fname, u.user_mname, u.user_lname, u.user_complete_address
              s.account_status_name, u.account_status_id
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       JOIN account_status s ON u.account_status_id = s.account_status_id
       WHERE u.user_email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = userResult.rows[0];

    // --- THIS IS THE UPDATED LOGIC ---
    // Now checks for all inactive/disallowed statuses
    const disallowedStatuses = ["Pending", "Suspended", "Rejected", "Disabled"];

    if (disallowedStatuses.includes(user.account_status_name)) {
      // Send a specific message if the account is disabled or rejected
      if (
        user.account_status_name === "Disabled" ||
        user.account_status_name === "Rejected"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is currently disabled. Please contact an administrator.",
        });
      }
      // Send a different message for pending/suspended accounts
      return res.status(403).json({
        success: false,
        message:
          "Your account is currently inactive. Please contact an administrator.",
      });
    }

    // Validate password
    const valid = await bcrypt.compare(password, user.user_password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Generate JWT (No changes here)
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.user_email,
        role: user.role,
        role_id: user.role_id,
        user_fname: user.user_fname, // Include first name in token for header
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    console.log("🔐 Login successful for:", user.user_email);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Cookie being set:", {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ user: { ...user, user_password: undefined } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
    console.error("Registration error:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already exists" });
    }
    next(err);
  }
});

router.get("/check-auth", (req, res) => {
  console.log("🧾 Cookies received:", req.cookies);
  console.log("Origin of request:", req.headers.origin);

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
