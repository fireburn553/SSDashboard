const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database");
const authenticateToken = require("../middleware/auth"); // Assuming you have this middleware

router.post("/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Received signin request for: ${email}`);

    const userResult = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (userResult.rows.length === 0) {
      console.error(`[AUTH] FAILED: User not found for email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const user = userResult.rows[0];
    console.log(`[AUTH] SUCCESS: Found user ID ${user.user_id}`);

    const validPassword = await bcrypt.compare(password, user.user_password);
    if (!validPassword) {
      console.error(`[AUTH] FAILED: Password mismatch for user ID ${user.user_id}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }
    console.log(`[AUTH] SUCCESS: Password verified for user ID ${user.user_id}`);
    
    // Fetch role for the payload
    const roleResult = await pool.query("SELECT role_name FROM role WHERE role_id = $1", [user.role_id]);
    const userRole = roleResult.rows[0]?.role_name || 'User';

    const payload = { user: { id: user.user_id, fname: user.user_fname, role: userRole } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Send token in the JSON body, not a cookie
    res.json({ token, user: payload.user });

  } catch (err) {
    console.error("[AUTH] FATAL ERROR during signin:", err);
    next(err);
  }
});


// This route verifies the token on page load
router.get("/user-details", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userResult = await pool.query(
      `SELECT u.user_id, u.user_fname, r.role_name as role FROM users u JOIN role r ON u.role_id = r.role_id WHERE u.user_id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ message: "User not found" });
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
