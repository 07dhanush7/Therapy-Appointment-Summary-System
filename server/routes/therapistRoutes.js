const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');
const upload = require('../middleware/upload');

router.route('/')
  .get(therapistController.getAllTherapists)
  .post(upload.single('profileImage'), therapistController.createTherapist);

router.route('/:id')
  .get(therapistController.getTherapistById)
  .put(upload.single('profileImage'), therapistController.updateTherapist)
  .delete(therapistController.deleteTherapist);

module.exports = router;
