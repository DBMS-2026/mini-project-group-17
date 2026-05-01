const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { protectRoute } = require('../middleware/authMiddleware');

router.post('/match', protectRoute, swapController.matchSwaps);
router.post('/commit', protectRoute, swapController.commitSwap);
router.get('/user/:userId', protectRoute, swapController.getUserSwaps);

module.exports = router;
