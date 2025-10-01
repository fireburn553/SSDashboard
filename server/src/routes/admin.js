// src/routes/admin.js
const express = require("express");
const pool = require("../database/index");
const router = express.Router();

// GET all instructor (admin only)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM instructors_view`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all pending instructors
router.get("/instructors/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, user_fname, user_lname, user_email, role_id, account_status_id
      FROM users
      WHERE role_id = 2 AND account_status_id = 1
    `); // role_id = 2 → instructor, account_status_id = 1 → pending
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = router;
