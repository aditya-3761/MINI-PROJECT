const Support = require('../models/Support');

const createTicket = async (req, res) => {
    try {
        const { name, email, message, subject, type, bookingId, issueType, priority } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email and message are required' });
        }

        const ticket = await Support.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            message: message.trim(),
            subject: subject || 'General Query',
            type: type || 'general',
            bookingId: bookingId || '',
            issueType: issueType || '',
            priority: priority || 'low',
        });

        res.status(201).json({
            message: `Your message has been received! Ticket: ${ticket.ticketRef}. We will respond within 24 hours.`,
            ticketRef: ticket.ticketRef,
        });
    } catch (err) {
        console.error('Support error:', err);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Support.find().sort({ createdAt: -1 });
        res.status(200).json({ count: tickets.length, tickets });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createTicket, getAllTickets };
