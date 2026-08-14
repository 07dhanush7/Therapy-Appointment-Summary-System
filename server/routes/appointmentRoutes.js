const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.route('/')
  .get(appointmentController.getAllAppointments)
  .post(appointmentController.createAppointment);

router.route('/:id')
  .get(appointmentController.getAppointmentById)
  .put(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

router.route('/therapist/:therapistId')
  .get(appointmentController.getAppointmentsByTherapist);

module.exports = router;
