const express = require('express');
const router = express.Router();
const therapistController = require('../controllers/therapistController');

router.route('/')
  .get(therapistController.getAllTherapists)
  .post(therapistController.createTherapist);

router.route('/:id')
  .get(therapistController.getTherapistById)
  .put(therapistController.updateTherapist)
  .delete(therapistController.deleteTherapist);

module.exports = router;
