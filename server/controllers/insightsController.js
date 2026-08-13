const db = require('../config/db');

/**
 * Get aggregated therapy center insights.
 * GET /api/insights
 */
exports.getInsights = async (req, res, next) => {
  try {
    // 1. Total Therapists count
    const totalTherapistsResult = await db.query('SELECT COUNT(*) AS count FROM therapists');
    const totalTherapists = totalTherapistsResult[0]?.count || 0;

    // 2. Total Appointments count
    const totalAppointmentsResult = await db.query('SELECT COUNT(*) AS count FROM appointments');
    const totalAppointments = totalAppointmentsResult[0]?.count || 0;

    // 3. Average appointments per therapist
    const averageAppointmentsPerTherapist = totalTherapists === 0
      ? 0
      : parseFloat((totalAppointments / totalTherapists).toFixed(2));

    // 4. Latest therapist added
    const latestTherapistResult = await db.query(
      'SELECT therapist_name FROM therapists ORDER BY therapist_id DESC LIMIT 1'
    );
    const latestTherapist = latestTherapistResult[0]?.therapist_name || null;

    // 5. Latest appointment title added
    const latestAppointmentResult = await db.query(
      'SELECT appointment_title FROM appointments ORDER BY appointment_id DESC LIMIT 1'
    );
    const latestAppointment = latestAppointmentResult[0]?.appointment_title || null;

    // 6. Top therapist with the highest appointment count
    const topTherapistResult = await db.query(`
      SELECT t.therapist_name, COUNT(a.appointment_id) AS appointment_count
      FROM therapists t
      INNER JOIN appointments a ON t.therapist_id = a.therapist_id
      GROUP BY t.therapist_id, t.therapist_name
      ORDER BY appointment_count DESC, t.therapist_id DESC
      LIMIT 1
    `);
    const topTherapist = topTherapistResult[0]?.therapist_name || null;
    const topTherapistAppointmentCount = topTherapistResult[0]?.appointment_count || 0;

    res.status(200).json({
      success: true,
      data: {
        totalTherapists,
        totalAppointments,
        averageAppointmentsPerTherapist,
        latestTherapist,
        latestAppointment,
        topTherapist,
        topTherapistAppointmentCount,
        aiStatus: 'Pending'
      }
    });
  } catch (error) {
    next(error);
  }
};
