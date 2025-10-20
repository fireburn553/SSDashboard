const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database");
const authenticateToken = require("../middleware/auth"); // Assuming you have this middleware

router.post("/signin", async (req, res, next) => {
  console.log("--- [AUTH LOG] New Sign-In Attempt ---");
  try {
    const { email, password } = req.body;
    console.log(`[AUTH LOG] 1. Received request for email: ${email}`);
    
    const userResult = await pool.query(
      `SELECT u.user_id, u.user_email, u.user_password,
              r.role_name AS role, u.user_fname,
              s.account_status_name
       FROM users u
       JOIN role r ON u.role_id = r.role_id
       JOIN account_status s ON u.account_status_id = s.account_status_id
       WHERE u.user_email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`[AUTH LOG] 2. FAILED: No user found for email: ${email}.`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = userResult.rows[0];
    console.log(`[AUTH LOG] 2. SUCCESS: Found user with ID: ${user.user_id}`);
    
    const disallowedStatuses = ["Pending", "Suspended", "Rejected", "Disabled"];
    if (disallowedStatuses.includes(user.account_status_name)) {
      console.error(`[AUTH LOG] 3. FAILED: Account for user ${user.user_id} has a disallowed status: '${user.account_status_name}'`);
      return res.status(403).json({ message: `Your account is currently ${user.account_status_name}. Please contact an administrator.` });
    }
    console.log(`[AUTH LOG] 3. SUCCESS: Account status is active ('${user.account_status_name}').`);

    const validPassword = await bcrypt.compare(password, user.user_password);
    if (!validPassword) {
      console.error(`[AUTH LOG] 4. FAILED: Password validation failed for user: ${user.user_id}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }
    console.log(`[AUTH LOG] 4. SUCCESS: Password validated for user: ${user.user_id}`);
    // Create the user payload for the token
    const payload = {
      user: {
        id: user.user_id,
        fname: user.user_fname,
        role: user.role,
      },
    };

    // Create the token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
    console.log(`[AUTH LOG] 5. SUCCESS: JWT token generated for user: ${user.user_id}`);
    res.json({
        token, // This is what the frontend needs
        user: payload.user
    });

  } catch (err) {
    console.error("[AUTH LOG] 6. FATAL ERROR: An unexpected error occurred during the signin process.", err);
    next(err);
  }
});

// It uses the authenticateToken middleware which reads the Bearer Token.
router.get("/user-details", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userResult = await pool.query(
      `SELECT u.user_id, u.user_fname, r.role_name as role
       FROM users u JOIN role r ON u.role_id = r.role_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
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
