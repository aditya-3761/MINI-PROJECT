const Booking = require('../models/Booking');
const User = require('../models/User');

const createBooking = async (req, res) => {
    try {
        const { carModel, pickupDate, returnDate, name, email, phone, location } = req.body;

        if (!carModel || !pickupDate || !returnDate || !name || !email) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const pickup  = new Date(pickupDate);
        const returnD = new Date(returnDate);
        const today   = new Date();
        today.setHours(0, 0, 0, 0);

        if (pickup < today) {
            return res.status(400).json({ message: 'Pickup date cannot be in the past' });
        }
        if (returnD <= pickup) {
            return res.status(400).json({ message: 'Return date must be after pickup date' });
        }

        const bookingData = {
            carModel,
            pickupDate: pickup,
            returnDate: returnD,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone || '',
            location: location || '',
        };

        if (req.user) {
            bookingData.user = req.user._id;
        }

        const booking = await Booking.create(bookingData);

        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $push: { bookings: booking._id },
            });
        }

        res.status(201).json({
            message: `Booking confirmed! Reference: ${booking.bookingRef}`,
            booking: {
                id: booking._id,
                bookingRef: booking.bookingRef,
                carModel: booking.carModel,
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                durationDays: booking.durationDays,
                ratePerDay: booking.ratePerDay,
                totalAmount: booking.totalAmount,
                status: booking.status,
                name: booking.name,
                email: booking.email,
            },
        });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('payment');
        res.status(200).json({ bookings });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('payment');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.status(200).json({ booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ message: `Booking is already ${booking.status}` });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json({ message: 'Booking cancelled successfully', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .populate('user', 'fullname email')
            .populate('payment');
        res.status(200).json({ count: bookings.length, bookings });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings };
