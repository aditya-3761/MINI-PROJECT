require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/signup',   require('./routes/auth'));
// app.use('/api/login',    require('./routes/auth'));
// app.use('/api/me',       require('./routes/auth'));
app.use('/api', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payment',  require('./routes/payment'));
app.use('/api/support',  require('./routes/support'));

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Rento API is running',
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚗  Rento Backend running on http://localhost:${PORT}`);
    console.log(`📡  API health: http://localhost:${PORT}/api/health\n`);
});
