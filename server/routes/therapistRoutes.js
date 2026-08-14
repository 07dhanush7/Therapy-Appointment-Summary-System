const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const upload = require('../middleware/upload');

router.route('/')
  .get(therapistController.getAllTherapists)
  .post(upload.single('profile_image'), therapistController.createTherapist);

router.route('/:id')
  .get(therapistController.getTherapistById)
  .put(upload.single('profile_image'), therapistController.updateTherapist)
  .delete(therapistController.deleteTherapist);

module.exports = router;
