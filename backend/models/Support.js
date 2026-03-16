const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema(
    {
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
        subject: {
            type: String,
            trim: true,
            default: 'General Query',
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['general', 'booking', 'feedback'],
            default: 'general',
        },
        bookingId: {
            type: String,
            default: '',
        },
        issueType: {
            type: String,
            default: '',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved', 'closed'],
            default: 'open',
        },
        ticketRef: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

supportSchema.pre('save', function (next) {
    if (!this.ticketRef) {
        this.ticketRef = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    }
    next();
});

module.exports = mongoose.model('Support', supportSchema);
