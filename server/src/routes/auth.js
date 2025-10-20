const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Use bcryptjs for consistency
const jwt = require("jsonwebtoken");
const pool = require("../database");
const authenticateToken = require("../middleware/auth"); // Assuming you have this middleware

// IMPORTANT: The frontend calls '/signin', so we match that here.
router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  
  // --- Start of Debugging Logs ---
  console.log(`[AUTH LOG] Received login request for email: ${email}`);

  try {
    const userQuery = `
      SELECT u.user_id, u.user_email, u.user_password,
             r.role_name AS role, u.user_fname,
             s.account_status_name
      FROM users u
      JOIN role r ON u.role_id = r.role_id
      JOIN account_status s ON u.account_status_id = s.account_status_id
      WHERE u.user_email = $1`;
      
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      console.error(`[AUTH LOG] FAILED: No user found for email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = userResult.rows[0];
    console.log(`[AUTH LOG] SUCCESS: Found user ID ${user.user_id} for email: ${email}`);

    // Check account status
    const disallowedStatuses = ["Pending", "Suspended", "Rejected", "Disabled"];
    if (disallowedStatuses.includes(user.account_status_name)) {
        console.error(`[AUTH LOG] FAILED: Account for user ${user.user_id} has disallowed status: ${user.account_status_name}`);
        return res.status(403).json({ message: `Your account is currently ${user.account_status_name}. Please contact an administrator.` });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
      console.error(`[AUTH LOG] FAILED: Password mismatch for user: ${user.user_id}`);
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    console.log(`[AUTH LOG] SUCCESS: Password verified for user: ${user.user_id}`);

    // Create JWT Payload that matches the frontend's expectation
    const payload = {
      user: {
        id: user.user_id,
        fname: user.user_fname,
        role: user.role,
      },
    };

    // Sign token and send it in the response body (NOT as a cookie)
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        console.log(`[AUTH LOG] SUCCESS: Token generated for user: ${user.user_id}`);
        // This is what the frontend expects
        res.json({ token, user: payload.user }); 
      }
    );
  } catch (err) {
    console.error("[AUTH LOG] FATAL ERROR during signin process:", err);
    next(err);
  }
});

// This route is for verifying a token on page load
router.get("/user-details", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userResult = await pool.query(
      "SELECT u.user_id, u.user_fname, r.role_name as role FROM users u JOIN role r ON u.role_id = r.role_id WHERE u.user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error("Error in /user-details:", err.message);
    res.status(500).send("Server Error");
  }
});


// ... keep your /register route as is, it looks fine ...
router.post("/register", async (req, res) => {
    // ... your existing registration code ...
});

module.exports = router;
