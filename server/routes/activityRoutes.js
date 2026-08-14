const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.route('/')
  .get(activityController.getActivityLogs)
  .post(activityController.createActivityLog);

module.exports = router;
