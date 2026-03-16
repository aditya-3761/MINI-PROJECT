const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        cardholderName: {
            type: String,
            required: true,
            trim: true,
        },
        cardLastFour: {
            type: String,
            default: '****',
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        method: {
            type: String,
            enum: ['card', 'qr', 'upi'],
            default: 'card',
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'refunded'],
            default: 'success',
        },
        transactionRef: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

paymentSchema.pre('save', function (next) {
    if (!this.transactionRef) {
        this.transactionRef = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
