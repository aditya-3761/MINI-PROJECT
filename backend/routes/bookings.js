const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    getAllBookings,
} = require('../controllers/bookingController');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');

router.post('/',            optionalAuth, createBooking);
router.get('/my',           protect,      getMyBookings);
router.get('/:id',          protect,      getBookingById);
router.patch('/:id/cancel', protect,      cancelBooking);
router.get('/',             protect, adminOnly, getAllBookings);

module.exports = router;
