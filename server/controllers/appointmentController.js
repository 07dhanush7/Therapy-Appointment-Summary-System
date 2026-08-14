const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all appointments.
 * GET /api/appointments
 */
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await db.query(
      'SELECT appointment_id, therapist_id, appointment_title, summary, DATE_FORMAT(appointment_date, "%Y-%m-%d") AS appointment_date, TIME_FORMAT(appointment_time, "%H:%i") AS appointment_time, status, created_at FROM appointments ORDER BY appointment_date DESC, appointment_time DESC'
    );
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all appointments belonging to a specific therapist.
 * GET /api/appointments/therapist/:therapistId
 */
exports.getAppointmentsByTherapist = async (req, res, next) => {
  try {
    const { therapistId } = req.params;

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [therapistId]);
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${therapistId} not found`, 404));
    }

    const appointments = await db.query(
      'SELECT appointment_id, therapist_id, appointment_title, summary, DATE_FORMAT(appointment_date, "%Y-%m-%d") AS appointment_date, TIME_FORMAT(appointment_time, "%H:%i") AS appointment_time, status, created_at FROM appointments WHERE therapist_id = ? ORDER BY appointment_date DESC, appointment_time DESC',
      [therapistId]
    );
    
    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single appointment by ID.
 * GET /api/appointments/:id
 */
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointments = await db.query(
      'SELECT appointment_id, therapist_id, appointment_title, summary, DATE_FORMAT(appointment_date, "%Y-%m-%d") AS appointment_date, TIME_FORMAT(appointment_time, "%H:%i") AS appointment_time, status, created_at FROM appointments WHERE appointment_id = ?',
      [id]
    );
    
    if (appointments.length === 0) {
      return next(new AppError(`Appointment with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: appointments[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment.
 * POST /api/appointments
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { therapist_id, appointment_title, summary, appointment_date, appointment_time, status } = req.body;

    // Validation: Required fields
    if (therapist_id === undefined || therapist_id === null) {
      return next(new AppError('therapist_id is required', 400));
    }

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [therapist_id]);
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${therapist_id} not found`, 404));
    }

    if (!appointment_title || typeof appointment_title !== 'string' || appointment_title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!summary || typeof summary !== 'string' || summary.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!appointment_date || typeof appointment_date !== 'string' || appointment_date.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!appointment_time || typeof appointment_time !== 'string' || appointment_time.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedTitle = appointment_title.trim();
    const trimmedSummary = summary.trim();
    const trimmedDate = appointment_date.trim();
    const trimmedTime = appointment_time.trim();
    const statusVal = status && typeof status === 'string' ? status.trim() : 'Scheduled';

    const result = await db.query(
      'INSERT INTO appointments (therapist_id, appointment_title, summary, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [therapist_id, trimmedTitle, trimmedSummary, trimmedDate, trimmedTime, statusVal]
    );

    // Log Activity
    await db.logActivity('Appointment Added', 'Appointment Added');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment_id: result.insertId,
        therapist_id: parseInt(therapist_id),
        appointment_title: trimmedTitle,
        summary: trimmedSummary,
        appointment_date: trimmedDate,
        appointment_time: trimmedTime,
        status: statusVal
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing appointment.
 * PUT /api/appointments/:id
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { therapist_id, appointment_title, summary, appointment_date, appointment_time, status } = req.body;

    // Verify appointment exists
    const appointments = await db.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    if (appointments.length === 0) {
      return next(new AppError(`Appointment with ID ${id} not found`, 404));
    }

    const existingAppointment = appointments[0];

    // Determine target values
    const newTherapistId = therapist_id !== undefined ? therapist_id : existingAppointment.therapist_id;
    const newTitle = appointment_title !== undefined ? appointment_title : existingAppointment.appointment_title;
    const newSummary = summary !== undefined ? summary : existingAppointment.summary;
    // Format existing dates/times in JS from Date object if returned as Date objects, but SQL format returns string.
    // However, the check `existingAppointment.appointment_date` might be date object if the verify query didn't format.
    // Let's make sure the verify query also formatted the date/time string so they are easy to fall back to:
    const dbApp = await db.query(
      'SELECT appointment_id, therapist_id, appointment_title, summary, DATE_FORMAT(appointment_date, "%Y-%m-%d") AS appointment_date, TIME_FORMAT(appointment_time, "%H:%i") AS appointment_time, status FROM appointments WHERE appointment_id = ?',
      [id]
    );
    const existingFormatted = dbApp[0];
    
    const newDate = appointment_date !== undefined ? appointment_date : existingFormatted.appointment_date;
    const newTime = appointment_time !== undefined ? appointment_time : existingFormatted.appointment_time;
    const newStatus = status !== undefined ? status : existingFormatted.status;

    // Validation
    if (newTherapistId === undefined || newTherapistId === null) {
      return next(new AppError('therapist_id is required', 400));
    }
    if (!newTitle || typeof newTitle !== 'string' || newTitle.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!newSummary || typeof newSummary !== 'string' || newSummary.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!newDate || typeof newDate !== 'string' || newDate.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!newTime || typeof newTime !== 'string' || newTime.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    // Verify therapist exists if therapist_id changed
    if (newTherapistId !== existingAppointment.therapist_id) {
      const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [newTherapistId]);
      if (therapists.length === 0) {
        return next(new AppError(`Therapist with ID ${newTherapistId} not found`, 404));
      }
    }

    const trimmedTitle = newTitle.trim();
    const trimmedSummary = newSummary.trim();
    const trimmedDate = newDate.trim();
    const trimmedTime = newTime.trim();
    const trimmedStatus = typeof newStatus === 'string' ? newStatus.trim() : 'Scheduled';

    await db.query(
      'UPDATE appointments SET therapist_id = ?, appointment_title = ?, summary = ?, appointment_date = ?, appointment_time = ?, status = ? WHERE appointment_id = ?',
      [newTherapistId, trimmedTitle, trimmedSummary, trimmedDate, trimmedTime, trimmedStatus, id]
    );

    // Log Activity
    await db.logActivity('Appointment Updated', 'Appointment Updated');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment_id: parseInt(id),
        therapist_id: parseInt(newTherapistId),
        appointment_title: trimmedTitle,
        summary: trimmedSummary,
        appointment_date: trimmedDate,
        appointment_time: trimmedTime,
        status: trimmedStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an appointment.
 * DELETE /api/appointments/:id
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify appointment exists
    const appointments = await db.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
    if (appointments.length === 0) {
      return next(new AppError(`Appointment with ID ${id} not found`, 404));
    }

    await db.query('DELETE FROM appointments WHERE appointment_id = ?', [id]);

    // Log Activity
    await db.logActivity('Appointment Deleted', 'Appointment Deleted');

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
