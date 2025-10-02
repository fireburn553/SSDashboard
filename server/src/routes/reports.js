// routes/reports.js
const express = require("express");
const router = express.Router();
const pool = require("../database");
const { generateClassReport } = require("../utils/reportGenerator");

router.get("/:id/report", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
    SELECT
      co.course_name,
      
    tl.establishment_name,
    tl.address,
  
    cso.cso_name,
  
    c.class_start_date,
      c.class_end_date,
    c.class_final_evaluation_date,
    -- Main instructor
      main_instructor.user_id   AS main_instructor_id,
      main_instructor.user_fname || ' ' || main_instructor.user_lname AS main_instructor_name,
    main_instructor.user_authority_number,
    main_instructor.user_complete_address AS main_instrcutor_address,
    
      c.class_id,
      c.class_number,
  
    tl.municipality_city,
    tl.province,
  
      c.class_total_days,
      c.class_total_hours,
      
      -- Collect all co-instructors in an array
      COALESCE(
          json_agg(
              DISTINCT jsonb_build_object(
                  'user_id', ci.user_id,
                  'instructor_fname', co_instructor.user_fname,
          'instructor_mname', co_instructor.user_mname,
          'instructor_lname', co_instructor.user_lname,
          'instructor_auth_num', co_instructor.user_authority_number,
          'instructor_address', co_instructor.user_complete_address
              )
          ) FILTER (WHERE ci.user_id IS NOT NULL),
          '[]'
      ) AS co_instructors,
  
      -- Collect all participants in an array
     COALESCE(
          json_agg(
              DISTINCT jsonb_build_object(
                  'pax_id', p.pax_id,
                  'pax_fname', p.pax_fname,
          'pax_lname', p.pax_lname,
          'pax_mname', p.pax_mname,
          'pax_address', p.pax_address,
                  'email', p.pax_email,
                  'pax_number', p.pax_number,
          'pax_bday', p.pax_bday,
           'hea_initial', hea.hea_initial,
           'pax_knowledge', p.pax_knowledge,
           'pax_skills', p.pax_skills,
           'pax_gender', g.gender_name,
           'certificate_number', p.certificate_number
  
              )
          ) FILTER (WHERE p.pax_id IS NOT NULL),
          '[]'
      ) AS participants
  
  
  FROM class c
  LEFT JOIN users main_instructor
      ON c.user_id = main_instructor.user_id
  
  LEFT JOIN class_instructors ci
      ON c.class_id = ci.class_id
  LEFT JOIN users co_instructor
      ON ci.user_id = co_instructor.user_id
  
  LEFT JOIN participant p
      ON c.class_id = p.class_id
  LEFT JOIN highest_education_attainment hea
      ON p.hea_id = hea.hea_id
  LEFT JOIN gender g
    ON g.gender_id = p.gender_id
  
  LEFT JOIN course co
    ON co.course_id = c.course_id
  
  LEFT JOIN training_location tl
    ON tl.training_location_id = c.training_location_id
    
  LEFT JOIN cso 
    ON cso.cso_id = c.cso_id
  
  WHERE c.class_id = $1
  GROUP BY c.class_id, main_instructor.user_id, main_instructor.user_fname, main_instructor.user_lname, co.course_name, tl.establishment_name, tl.address, cso.cso_name, c.class_final_evaluation_date, tl.municipality_city, tl.province;
  
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    const classData = result.rows[0];

    const pdfBuffer = await generateClassReport(classData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=class_${id}_report.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
