const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all therapists.
 * GET /api/therapists
 */
exports.getAllTherapists = async (req, res, next) => {
  try {
    const therapists = await db.query('SELECT * FROM therapists ORDER BY therapist_id ASC');
    res.status(200).json({
      success: true,
      data: therapists
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single therapist by ID.
 * GET /api/therapists/:id
 */
exports.getTherapistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [id]);
    
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${id} not found`, 404));
    }

    res.status(200).json({
      success: true,
      data: therapists[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new therapist.
 * POST /api/therapists
 */
exports.createTherapist = async (req, res, next) => {
  try {
    const { therapist_name, specialization, description, profile_image, experience_years, location, availability_status } = req.body;

    // Validation: Required and not whitespace-only
    if (!therapist_name || typeof therapist_name !== 'string' || therapist_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!specialization || typeof specialization !== 'string' || specialization.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedName = therapist_name.trim();
    const trimmedSpec = specialization.trim();
    const trimmedDesc = description ? description.trim() : '';
    const trimmedImg = profile_image ? profile_image.trim() : '';
    const expVal = experience_years !== undefined ? parseInt(experience_years) : 5;
    const locVal = location && typeof location === 'string' ? location.trim() : 'Unknown';
    const availVal = availability_status && typeof availability_status === 'string' ? availability_status.trim() : 'Available Today';

    // Check for duplicate therapist name (case-insensitive)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?)',
      [trimmedName]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const result = await db.query(
      'INSERT INTO therapists (therapist_name, specialization, description, profile_image, experience_years, location, availability_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [trimmedName, trimmedSpec, trimmedDesc, trimmedImg, expVal, locVal, availVal]
    );

    // Log Activity
    await db.logActivity('Therapist Added', 'Therapist Added');

    res.status(201).json({
      success: true,
      message: 'Therapist created successfully',
      data: {
        therapist_id: result.insertId,
        therapist_name: trimmedName,
        specialization: trimmedSpec,
        description: trimmedDesc,
        profile_image: trimmedImg,
        experience_years: expVal,
        location: locVal,
        availability_status: availVal
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a therapist profile.
 * PUT /api/therapists/:id
 */
exports.updateTherapist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { therapist_name, specialization, description, profile_image, experience_years, location, availability_status } = req.body;

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [id]);
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${id} not found`, 404));
    }

    const existing = therapists[0];
    const nameVal = therapist_name !== undefined ? therapist_name : existing.therapist_name;
    const specVal = specialization !== undefined ? specialization : existing.specialization;
    const descVal = description !== undefined ? description : existing.description;
    const imgVal = profile_image !== undefined ? profile_image : existing.profile_image;
    const expVal = experience_years !== undefined ? parseInt(experience_years) : existing.experience_years;
    const locVal = location !== undefined ? location : existing.location;
    const availVal = availability_status !== undefined ? availability_status : existing.availability_status;

    // Validation: Required and not whitespace-only
    if (!nameVal || typeof nameVal !== 'string' || nameVal.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!specVal || typeof specVal !== 'string' || specVal.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedName = nameVal.trim();
    const trimmedSpec = specVal.trim();
    const trimmedDesc = descVal ? descVal.trim() : '';
    const trimmedImg = imgVal ? imgVal.trim() : '';
    const trimmedLoc = typeof locVal === 'string' ? locVal.trim() : 'Unknown';
    const trimmedAvail = typeof availVal === 'string' ? availVal.trim() : 'Available Today';

    // Check for duplicate therapist name for a different ID (case-insensitive)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?) AND therapist_id != ?',
      [trimmedName, id]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    await db.query(
      'UPDATE therapists SET therapist_name = ?, specialization = ?, description = ?, profile_image = ?, experience_years = ?, location = ?, availability_status = ? WHERE therapist_id = ?',
      [trimmedName, trimmedSpec, trimmedDesc, trimmedImg, expVal, trimmedLoc, trimmedAvail, id]
    );

    // Log Activity
    await db.logActivity('Therapist Updated', 'Therapist Updated');

    res.status(200).json({
      success: true,
      message: 'Therapist updated successfully',
      data: {
        therapist_id: parseInt(id),
        therapist_name: trimmedName,
        specialization: trimmedSpec,
        description: trimmedDesc,
        profile_image: trimmedImg,
        experience_years: expVal,
        location: trimmedLoc,
        availability_status: trimmedAvail
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a therapist.
 * DELETE /api/therapists/:id
 */
exports.deleteTherapist = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [id]);
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${id} not found`, 404));
    }

    // Delete query (cascading deletes appointments in DB automatically)
    await db.query('DELETE FROM therapists WHERE therapist_id = ?', [id]);

    // Log Activity
    await db.logActivity('Therapist Deleted', 'Therapist Deleted');

    res.status(200).json({
      success: true,
      message: 'Therapist deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
