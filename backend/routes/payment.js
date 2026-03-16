const express = require('express');
const router = express.Router();
const { processPayment, processQrPayment } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/',    optionalAuth, processPayment);
router.post('/qr',  optionalAuth, processQrPayment);

module.exports = router;
