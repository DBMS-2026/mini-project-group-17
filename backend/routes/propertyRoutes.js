const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/', propertyController.getAllProperties);
router.post('/', protectRoute, propertyController.createProperty);
router.get('/user/:userId', propertyController.getUserProperties);
router.get('/:id/insights', propertyController.getPropertyInsights);

module.exports = router;
