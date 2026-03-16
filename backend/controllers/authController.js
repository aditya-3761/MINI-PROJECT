const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const signup = async (req, res) => {
    try {
        const { fullname, email, password, phone } = req.body;

        if (!fullname || !email || !password) {
            return res.status(400).json({ error: 'Full name, email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const user = await User.create({ fullname, email, password, phone: phone || '' });
        const token = generateToken(user._id);

        res.status(201).json({
            message: `Welcome to Rento, ${user.fullname}! Your account has been created.`,
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Signup error:', err);
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: `Welcome back, ${user.fullname}!`,
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('bookings');
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { signup, login, getMe };
