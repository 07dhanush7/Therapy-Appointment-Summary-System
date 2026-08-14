const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all therapists.
 * GET /api/therapists
 */
exports.getAllTherapists = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM therapists ORDER BY therapist_id ASC';
    console.log('[Database Query Executing]', sql);
    const therapists = await db.query(sql);
    console.log('[Database Query Returned Rows]', therapists);
    console.log('[Database Query Row Count]', therapists.length);
    
    // Map response to include aliases for both frontend (therapist_id) and standard formats (id)
    const mapped = therapists.map(t => ({
      ...t,
      id: t.therapist_id,
      name: t.therapist_name
    }));

    res.status(200).json({
      success: true,
      data: mapped
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

    const t = therapists[0];
    const mapped = {
      ...t,
      id: t.therapist_id,
      name: t.therapist_name
    };

    res.status(200).json({
      success: true,
      data: mapped
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
    console.log('Request received to create therapist. Body:', req.body);
    if (req.file) {
      console.log('Uploaded image file details:', req.file);
    }

    const { name, therapist_name, specialization, email, description, profile_image, experience_years } = req.body;

    // Use name as fallback for therapist_name, and vice versa
    const finalName = (therapist_name || name || '').trim();
    const finalSpec = (specialization || '').trim();
    const finalEmail = (email || '').trim();

    console.log(`Data validated. Name: "${finalName}", Specialization: "${finalSpec}", Email: "${finalEmail}"`);

    // Validation: Required and not whitespace-only
    if (!finalName) {
      console.warn('Validation failed: Name is empty or invalid.');
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!finalSpec) {
      console.warn('Validation failed: Specialization is empty or invalid.');
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedDesc = description ? description.trim() : '';
    const expVal = experience_years !== undefined ? parseInt(experience_years) : 5;

    // Image Upload Handling
    let profileImageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
    if (req.file) {
      profileImageUrl = '/uploads/' + req.file.filename;
    } else if (profile_image) {
      profileImageUrl = profile_image;
    }

    // Check for duplicate therapist name (case-insensitive)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?)',
      [finalName]
    );
    if (duplicate.length > 0) {
      console.warn(`Validation failed: Duplicate therapist name "${finalName}" found.`);
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    console.log('Database insert started...');
    const result = await db.query(
      'INSERT INTO therapists (therapist_name, specialization, email, description, profile_image, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
      [finalName, finalSpec, finalEmail, trimmedDesc, profileImageUrl, expVal]
    );

    console.log('Database insert successful. Result:', result);
    console.log('Insert ID returned:', result.insertId);

    // Log Activity
    await db.logActivity('Therapist Added', 'Therapist Added');

    res.status(201).json({
      success: true,
      message: 'Therapist created successfully',
      data: {
        id: result.insertId,
        therapist_id: result.insertId,
        name: finalName,
        therapist_name: finalName,
        specialization: finalSpec,
        email: finalEmail,
        description: trimmedDesc,
        profile_image: profileImageUrl,
        experience_years: expVal
      }
    });
  } catch (error) {
    console.error('Error creating therapist:', error);
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
    const { name, therapist_name, specialization, email, description, profile_image, experience_years } = req.body;

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [id]);
    if (therapists.length === 0) {
      return next(new AppError(`Therapist with ID ${id} not found`, 404));
    }

    const existing = therapists[0];
    const nameVal = therapist_name !== undefined ? therapist_name : (name !== undefined ? name : existing.therapist_name);
    const specVal = specialization !== undefined ? specialization : existing.specialization;
    const emailVal = email !== undefined ? email : existing.email;
    const descVal = description !== undefined ? description : existing.description;
    const expVal = experience_years !== undefined ? parseInt(experience_years) : existing.experience_years;

    // Image Upload Handling
    let profileImageUrl = existing.profile_image;
    if (req.file) {
      profileImageUrl = '/uploads/' + req.file.filename;
    } else if (profile_image !== undefined) {
      profileImageUrl = profile_image;
    }

    // Validation: Required and not whitespace-only
    if (!nameVal || typeof nameVal !== 'string' || nameVal.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }
    if (!specVal || typeof specVal !== 'string' || specVal.trim() === '') {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    const trimmedName = nameVal.trim();
    const trimmedSpec = specVal.trim();
    const trimmedEmail = emailVal ? emailVal.trim() : '';
    const trimmedDesc = descVal ? descVal.trim() : '';

    // Check for duplicate therapist name for a different ID (case-insensitive)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?) AND therapist_id != ?',
      [trimmedName, id]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation error' });
    }

    await db.query(
      'UPDATE therapists SET therapist_name = ?, specialization = ?, email = ?, description = ?, profile_image = ?, experience_years = ? WHERE therapist_id = ?',
      [trimmedName, trimmedSpec, trimmedEmail, trimmedDesc, profileImageUrl, expVal, id]
    );

    // Log Activity
    await db.logActivity('Therapist Updated', 'Therapist Updated');

    res.status(200).json({
      success: true,
      message: 'Therapist updated successfully',
      data: {
        id: parseInt(id),
        therapist_id: parseInt(id),
        name: trimmedName,
        therapist_name: trimmedName,
        specialization: trimmedSpec,
        email: trimmedEmail,
        description: trimmedDesc,
        profile_image: profileImageUrl,
        experience_years: expVal
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
