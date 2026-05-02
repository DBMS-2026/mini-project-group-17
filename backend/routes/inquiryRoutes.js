const express = require('express');
const router = express.Router();
const { sendInquiry, getOwnerInquiries, getBuyerInquiries, updateInquiryStatus } = require('../controllers/inquiryController');

router.post('/', sendInquiry);
router.get('/owner/:userId', getOwnerInquiries);
router.get('/buyer/:userId', getBuyerInquiries);
router.patch('/:id', updateInquiryStatus);

module.exports = router;
