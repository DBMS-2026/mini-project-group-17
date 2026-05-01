const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getAllProperties);
router.post('/', propertyController.createProperty);
router.get('/user/:userId', propertyController.getUserProperties);
router.get('/:id/insights', propertyController.getPropertyInsights);

module.exports = router;
