const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const processPayment = async (req, res) => {
    try {
        const { name, cardNumber, expiration, cvv, bookingId, method } = req.body;

        if (!name || !cardNumber || !expiration) {
            return res.status(400).json({ error: 'Please fill all payment fields' });
        }

        const cleanCard = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleanCard)) {
            return res.status(400).json({ error: 'Please enter a valid card number' });
        }
        if (cvv && !/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({ error: 'Please enter a valid CVV' });
        }

        let booking = null;
        if (bookingId) {
            booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            if (booking.status === 'paid') {
                return res.status(400).json({ error: 'This booking has already been paid' });
            }
        }

        const payment = await Payment.create({
            cardholderName: name.trim(),
            cardLastFour: cleanCard.slice(-4),
            amount: booking ? booking.totalAmount : 0,
            currency: 'INR',
            method: method || 'card',
            status: 'success',
            booking: booking ? booking._id : null,
            user: req.user ? req.user._id : null,
        });

        if (booking) {
            booking.status = 'paid';
            booking.payment = payment._id;
            await booking.save();
        }

        res.status(200).json({
            message: 'Payment successful! Your booking is confirmed.',
            transactionRef: payment.transactionRef,
            amount: payment.amount,
            bookingRef: booking ? booking.bookingRef : null,
        });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ error: 'Payment processing failed. Please try again.' });
    }
};

const processQrPayment = async (req, res) => {
    try {
        const { qrData, bookingId } = req.body;

        let booking = null;
        if (bookingId) {
            booking = await Booking.findById(bookingId);
        }

        const payment = await Payment.create({
            cardholderName: 'QR Payment',
            cardLastFour: '0000',
            amount: booking ? booking.totalAmount : 0,
            currency: 'INR',
            method: 'qr',
            status: 'success',
            booking: booking ? booking._id : null,
            user: req.user ? req.user._id : null,
        });

        if (booking) {
            booking.status = 'paid';
            booking.payment = payment._id;
            await booking.save();
        }

        res.status(200).json({
            message: 'QR Payment successful! Your booking is confirmed.',
            transactionRef: payment.transactionRef,
            bookingRef: booking ? booking.bookingRef : null,
        });
    } catch (err) {
        console.error('QR payment error:', err);
        res.status(500).json({ error: 'QR payment failed. Please try again.' });
    }
};

module.exports = { processPayment, processQrPayment };
