// src/routes/admin.js
const express = require("express");
const pool = require("../database/index");
const router = express.Router();

// GET all instructors with their status
router.get("/instructors", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.user_id, 
         u.user_fname, 
         u.user_lname, 
         u.user_email, 
         s.account_status_name as status
       FROM users u
       JOIN account_status s ON u.account_status_id = s.account_status_id
       WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'Instructor')`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET all users with a 'Pending' status
router.get("/instructors/pending", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT user_id, user_fname, user_lname, user_email 
       FROM users 
       WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'Instructor') 
       AND account_status_id = (SELECT account_status_id FROM account_status WHERE account_status_name = 'Pending')`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// UPDATE a user's account status (Approve or Deny)
router.put("/instructors/:id/status", async (req, res, next) => {
  const { id: userId } = req.params;
  const { status } = req.body;

  // --- CORRECTED VALIDATION ---
  // The array now includes all valid statuses from your screenshot.
  const validStatuses = [
    "Approved",
    "Rejected",
    "Suspended",
    "Disabled",
    "Active",
  ]; // Added "Active" for reactivating
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const statusResult = await pool.query(
      `SELECT account_status_id FROM account_status WHERE account_status_name = $1`,
      [status]
    );

    if (statusResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Database error: Status name not found." });
    }

    const newStatusId = statusResult.rows[0].account_status_id;

    const result = await pool.query(
      `UPDATE users SET account_status_id = $1 WHERE user_id = $2 RETURNING user_id`,
      [newStatusId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    res.json({
      message: `Instructor account has been updated to '${status}'.`,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/instructors/:id/approve
router.put("/instructors/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users 
       SET account_status_id = 2 -- approved
       WHERE user_id = $1 
       RETURNING user_id, user_fname, user_lname`,
      [id]
    );
    res.json({ message: "Instructor approved", instructor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/instructors/:id/reject
router.put("/instructors/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE users 
       SET account_status_id = 3 -- rejected
       WHERE user_id = $1 
       RETURNING user_id, user_fname, user_lname`,
      [id]
    );
    res.json({ message: "Instructor rejected", instructor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/instructors/overview", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Please provide start_date and end_date" });
    }

    const query = `SELECT
    u.user_id,
    u.user_fname || ' ' || u.user_lname AS instructor_name,

    -- total main classes (in range)
    COUNT(DISTINCT c.class_id) FILTER (
        WHERE c.class_start_date BETWEEN $1 AND $2
    ) AS total_classes_taught,

    -- active/concluded classes (in range)
    COUNT(DISTINCT c.class_id) FILTER (
        WHERE c.is_concluded = FALSE
          AND c.class_start_date BETWEEN $1 AND $2
    ) AS total_active_classes,
    COUNT(DISTINCT c.class_id) FILTER (
        WHERE c.is_concluded = TRUE
          AND c.class_start_date BETWEEN $1 AND $2
    ) AS total_concluded_classes,

    -- co-instructor roles (in range)
    COUNT(DISTINCT ci.class_id) FILTER (
        WHERE cls.class_start_date BETWEEN $1 AND $2
    ) AS total_co_instructor_roles,

    -- participant breakdown (only classes in range)
    COUNT(p.pax_id) FILTER (
        WHERE p.pax_remarks = 'passed'
          AND cls.class_start_date BETWEEN $1 AND $2
    ) AS total_passed,
    COUNT(p.pax_id) FILTER (
        WHERE p.pax_remarks = 'failed'
          AND cls.class_start_date BETWEEN $1 AND $2
    ) AS total_failed,
    COUNT(p.pax_id) FILTER (
        WHERE p.pax_remarks = 'drop'
          AND cls.class_start_date BETWEEN $1 AND $2
    ) AS total_dropped,

    -- class list (main + co-instructor) + participants (in range)
    COALESCE(
        json_agg(
            DISTINCT jsonb_build_object(
                'class_id', cls.class_id,
                'class_number', cls.class_number,
                'class_start_date', cls.class_start_date,
                'class_end_date', cls.class_end_date,
                'is_concluded', cls.is_concluded,
                'participants', (
                    SELECT json_agg(
                        jsonb_build_object(
                            'pax_id', p2.pax_id,
                            'name', p2.pax_fname || ' ' || p2.pax_lname,
                            'remarks', p2.pax_remarks
                        )
                    )
                    FROM participant p2
                    WHERE p2.class_id = cls.class_id
                )
            )
        ) FILTER (
            WHERE cls.class_id IS NOT NULL
              AND cls.class_start_date BETWEEN $1 AND $2
        ),
        '[]'
    ) AS classes

FROM users u
LEFT JOIN class c
    ON c.user_id = u.user_id
LEFT JOIN class_instructors ci
    ON ci.user_id = u.user_id
LEFT JOIN class cls
    ON cls.class_id = c.class_id OR cls.class_id = ci.class_id
LEFT JOIN participant p
    ON p.class_id = cls.class_id

GROUP BY u.user_id, u.user_fname, u.user_lname
ORDER BY u.user_fname, u.user_lname;
`;
    const result = await pool.query(query, [start_date, end_date]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructor overview:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/courses/summary", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ message: "Please provide start_date and end_date" });
    }

    const query = `SELECT 
    co.course_name,

    -- total trainings (date range)
    COUNT(*) FILTER (
        WHERE c.class_start_date BETWEEN $1 AND $2
    ) AS total_trainings,

    -- total concluded trainings
    COUNT(*) FILTER (
        WHERE c.is_concluded = TRUE 
          AND c.class_start_date BETWEEN $1 AND $2
    ) AS total_concluded,

    -- total not concluded trainings
    COUNT(*) FILTER (
        WHERE c.is_concluded = FALSE 
          AND c.class_start_date BETWEEN $1 AND $2
    ) AS total_not_concluded

FROM class c
JOIN course co 
    ON c.course_id = co.course_id
GROUP BY co.course_name
ORDER BY co.course_name;
`;
    const result = await pool.query(query, [start_date, end_date]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching course summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard-summary", async (req, res, next) => {
  try {
    const [statsResult, outcomesResult, coursesResult, instructorResult] =
      await Promise.all([
        // Query 1: Get high-level stats for the cards
        pool.query(
          `
SELECT
    -- Instructor Counts
    (SELECT COUNT(*) FROM users WHERE role_id = 2 AND account_status_id != 3) AS total_instructors,
    (SELECT COUNT(*) FROM users WHERE role_id = 2 AND account_status_id = 1) AS pending_instructors,
    (SELECT COUNT(*) FROM users WHERE role_id = 2 AND account_status_id = 2) AS approved_instructors,
    (SELECT COUNT(*) FROM users WHERE role_id = 2 AND account_status_id = 4) AS disabled_instructors,

    -- Class Counts
    (SELECT COUNT(*) FROM class) AS total_classes,
    (SELECT COUNT(*) FROM class WHERE is_concluded = TRUE) AS concluded_classes,
    (SELECT COUNT(*) FROM class WHERE is_concluded = FALSE) AS active_classes,

    -- Participant Count
    (SELECT COUNT(*) FROM participant) AS total_participants;`
        ),
        // Query 2: Get overall pass/fail distribution
        pool.query(
          `SELECT pax_remarks, COUNT(*) FROM participant WHERE pax_remarks IS NOT NULL GROUP BY pax_remarks`
        ),
        // Query 3: Get participant count by course
        pool.query(
          `SELECT
    co.course_name,
    COUNT(p.pax_id) AS participant_count,
    COUNT(DISTINCT c.class_id) AS training_count
FROM
    class c
JOIN
    course co ON c.course_id = co.course_id
JOIN
    participant p ON c.class_id = p.class_id
WHERE
    c.is_concluded = TRUE
GROUP BY
    co.course_name
ORDER BY
    participant_count DESC;
`
        ),
        // Query 4: Get top 5 instructors by number of classes taught
        pool.query(
          `SELECT
          CONCAT(u.user_fname, ' ', u.user_lname) as instructor_name,
          COUNT(c.class_id) as class_count
         FROM class c
         JOIN users u ON c.user_id = u.user_id
         WHERE c.is_concluded = TRUE
         GROUP BY instructor_name
         ORDER BY class_count DESC
         LIMIT 5`
        ),
      ]);

    res.json({
      stats: statsResult.rows[0],
      outcomes: outcomesResult.rows,
      courseDistribution: coursesResult.rows,
      topInstructors: instructorResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
