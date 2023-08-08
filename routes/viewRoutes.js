const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// overview
router.route('/').get(viewsController.getOverview);

// tour details
router.route('/tour').get(viewsController.getTour);

module.exports = router;
