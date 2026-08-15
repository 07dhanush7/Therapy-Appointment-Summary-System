const db = require('../config/db');
const { AppError } = require('../middleware/errorHandler');
const fs = require('fs');
const { uploadToCloudinary } = require('../services/cloudinary');

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
    console.log('[Create Therapist Request Body]', req.body);
    console.log('[Create Therapist Request File]', req.file);

    const { name, therapist_name, specialization, email, description, biography, profile_image, profileImage, experience_years } = req.body;

    const finalName = (therapist_name || name || '').trim();
    const finalSpec = (specialization || '').trim();
    const finalEmail = (email || '').trim();
    const finalDesc = (biography || description || '').trim();

    // 1. Validation: Required and not whitespace-only
    if (!finalName) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!finalSpec) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Specialty is required' });
    }

    // 2. Duplicate Validation (Case-insensitive check before Cloudinary upload)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?)',
      [finalName]
    );
    if (duplicate.length > 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'A therapist with this name already exists' });
    }

    const expVal = experience_years !== undefined ? parseInt(experience_years) : 5;

    // 3. Image Upload Handling (Cloudinary with local fallback)
    let profileImageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file.path);
        if (cloudinaryUrl) {
          profileImageUrl = cloudinaryUrl;
          // Delete local file after upload
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temp file:', err);
          });
        } else {
          // Fallback to local uploads path if Cloudinary is not configured
          profileImageUrl = '/uploads/' + req.file.filename;
        }
      } catch (err) {
        // Cleanup file on upload error
        fs.unlink(req.file.path, () => {});
        return next(err);
      }
    } else if (profileImage) {
      profileImageUrl = profileImage;
    } else if (profile_image) {
      profileImageUrl = profile_image;
    }

    console.log('Database insert started...');
    const result = await db.query(
      'INSERT INTO therapists (therapist_name, specialization, email, description, profile_image, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
      [finalName, finalSpec, finalEmail, finalDesc, profileImageUrl, expVal]
    );

    console.log('Database insert successful. Result:', result);

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
        description: finalDesc,
        profile_image: profileImageUrl,
        experience_years: expVal
      }
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error(error);
    next(error);
  }
};

/**
 * Update a therapist profile.
 * PUT /api/therapists/:id
 */
exports.updateTherapist = async (req, res, next) => {
  try {
    console.log('[Update Therapist Request Body]', req.body);
    console.log('[Update Therapist Request File]', req.file);

    const { id } = req.params;
    const { name, therapist_name, specialization, email, description, biography, profile_image, profileImage, experience_years } = req.body;

    // Verify therapist exists
    const therapists = await db.query('SELECT * FROM therapists WHERE therapist_id = ?', [id]);
    if (therapists.length === 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return next(new AppError(`Therapist with ID ${id} not found`, 404));
    }

    const existing = therapists[0];
    const nameVal = therapist_name !== undefined ? therapist_name : (name !== undefined ? name : existing.therapist_name);
    const specVal = specialization !== undefined ? specialization : existing.specialization;
    const emailVal = email !== undefined ? email : existing.email;
    const descVal = biography !== undefined ? biography : (description !== undefined ? description : existing.description);
    const expVal = experience_years !== undefined ? parseInt(experience_years) : existing.experience_years;

    // 1. Validation: Required and not whitespace-only
    if (!nameVal || typeof nameVal !== 'string' || nameVal.trim() === '') {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!specVal || typeof specVal !== 'string' || specVal.trim() === '') {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'Specialty is required' });
    }

    const trimmedName = nameVal.trim();
    const trimmedSpec = specVal.trim();
    const trimmedEmail = emailVal ? emailVal.trim() : '';
    const trimmedDesc = descVal ? descVal.trim() : '';

    // 2. Duplicate Validation (Case-insensitive check before Cloudinary upload)
    const duplicate = await db.query(
      'SELECT * FROM therapists WHERE LOWER(therapist_name) = LOWER(?) AND therapist_id != ?',
      [trimmedName, id]
    );
    if (duplicate.length > 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: 'A therapist with this name already exists' });
    }

    // 3. Image Upload Handling (Cloudinary with local fallback)
    let profileImageUrl = existing.profile_image;
    if (req.file) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file.path);
        if (cloudinaryUrl) {
          profileImageUrl = cloudinaryUrl;
          // Delete local file after upload
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temp file:', err);
          });
        } else {
          // Fallback to local uploads path if Cloudinary is not configured
          profileImageUrl = '/uploads/' + req.file.filename;
        }
      } catch (err) {
        // Cleanup file on upload error
        fs.unlink(req.file.path, () => {});
        return next(err);
      }
    } else if (profileImage !== undefined) {
      profileImageUrl = profileImage;
    } else if (profile_image !== undefined) {
      profileImageUrl = profile_image;
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
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error(error);
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
