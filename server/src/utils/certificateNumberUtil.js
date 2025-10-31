const pool = require('../database'); // This 'db' is your 'pool'

const ensureCertificateNumbers = async (classId) => {
  try {

    // Step A: Get the Class End Date (from the 'class' table)
    const classResult = await pool.query(
      'SELECT class_end_date FROM class WHERE class_id = $1',
      [classId]
    );

    if (!classResult.rows[0]?.class_end_date) {
      throw new Error(`Class ${classId} does not have an end date set.`);
    }

    const endDate = new Date(classResult.rows[0].class_end_date);
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const year = String(endDate.getFullYear()).slice(-2);
    const day = String(endDate.getDate()).padStart(2, '0');
    const datePart = `${month}${year}-${day}`; // "1025-31"

    // Step B: Find the next available sequence number
    const countResult = await pool.query(
      'SELECT COUNT(*) as existing_certs FROM participant WHERE class_id = $1 AND certificate_number IS NOT NULL',
      [classId]
    );

    let counter = parseInt(countResult.rows[0].existing_certs, 10) + 1;

    // Step C: Find all passed participants who DON'T have a number
    // FIX: Using lowercase 'passed' to match your code
    const newPassers = await pool.query(
      `SELECT pax_id
       FROM participant
       WHERE class_id = $1 
         AND pax_remarks = 'passed' 
         AND certificate_number IS NULL
       ORDER BY
         pax_lname, pax_fname, pax_id`, // Stable order is essential
      [classId]
    );

    // Step D: Loop and UPDATE the database
    if (newPassers.rows.length > 0) {
      console.log(`Issuing ${newPassers.rows.length} new certificates for class ${classId}.`);
      for (const participant of newPassers.rows) {
        const sequenceNumber = String(counter).padStart(2, '0');
        // This format matches your example: CC-1025-3101
        const certNumber = `CC-${datePart}${sequenceNumber}`;

        await pool.query(
          'UPDATE participant SET certificate_number = $1 WHERE pax_id = $2',
          [certNumber, participant.pax_id]
        );
        counter++;
      }
    }

    await pool.query('COMMIT'); // All good! Save the changes.

    // Step E: Return the FULL list of passed participants
    const allPassedParticipants = await pool.query(
      `SELECT *
       FROM participant
       WHERE class_id = $1 AND pax_remarks = 'passed'
       ORDER BY
         pax_lname, pax_fname, pax_id`,
      [classId]
    );

    return allPassedParticipants.rows;

  } catch (err) {
    console.error('Error in ensureCertificateNumbers:', err);
    res.status(500).json({ message: 'Server error during certificate number assignment.' });
  }
};

module.exports = { ensureCertificateNumbers };