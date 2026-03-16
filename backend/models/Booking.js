const mongoose = require('mongoose');

const CAR_PRICES = {
    'Rolls-Royce': 4000,
    'Macan 4': 3000,
    'Cayenne S E-Hybrid': 2800,
    'Nissan GT-R': 4500,
    'Panamera Turbo': 5000,
    'Nissan Ariyan': 4500,
    'Canyenne Turbo': 3800,
    '718 Boxster S': 4200,
    'Taycan S': 2000,
    'Taycan v': 2200,
    'Taycan Turbo': 2500,
    'Taycan twin': 2800,
};

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        carModel: {
            type: String,
            required: [true, 'Car model is required'],
        },
        pickupDate: {
            type: Date,
            required: [true, 'Pickup date is required'],
        },
        returnDate: {
            type: Date,
            required: [true, 'Return date is required'],
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        durationDays: {
            type: Number,
            default: 1,
        },
        ratePerDay: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'paid', 'completed', 'cancelled'],
            default: 'pending',
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null,
        },
        bookingRef: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

bookingSchema.pre('save', function (next) {
    if (!this.bookingRef) {
        this.bookingRef = 'RNT-' + Math.floor(100000 + Math.random() * 900000);
    }
    if (this.pickupDate && this.returnDate) {
        const ms = new Date(this.returnDate) - new Date(this.pickupDate);
        this.durationDays = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    }
    const rate = CAR_PRICES[this.carModel] || 0;
    this.ratePerDay = rate;
    this.totalAmount = rate * this.durationDays;
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
