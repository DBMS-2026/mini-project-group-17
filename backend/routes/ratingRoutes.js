const express = require('express');
const router = express.Router();
const { submitRating, getPropertyRating } = require('../controllers/ratingController');

router.post('/', submitRating);
router.get('/:propertyId', getPropertyRating);

module.exports = router;
