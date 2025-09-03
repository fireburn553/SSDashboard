const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../database"); // Adjust if your db export is different

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(
      `SELECT u.user_id, u.user_email, r.role_name AS role, u.user_fname, u.user_lname
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_email  = $1`,
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Get password for validation
    const passwordResult = await pool.query(
      `SELECT user_password FROM users WHERE user_email = $1`,
      [email]
    );
    const valid = await bcrypt.compare(
      password,
      passwordResult.rows[0].user_password
    );
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = userResult.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Send token and user info (no password)
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  // For JWT, logout is handled client-side by deleting the token.
  // Optionally, you can implement token blacklisting here.
  res.json({
    message: "Logged out successfully. Please delete the token on the client.",
  });
});

module.exports = router;
