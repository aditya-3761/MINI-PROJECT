// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // serve static files

const USERS_FILE = path.join(__dirname, 'users.xlsx');
const PAYMENTS_FILE = path.join(__dirname, 'payments.xlsx');

async function createUsersFileIfNotExist() {
    if (!fs.existsSync(USERS_FILE)) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');
        worksheet.columns = [
            { header: 'Full Name', key: 'fullname', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Password', key: 'password', width: 30 },
            { header: 'Date Registered', key: 'date', width: 25 }
        ];
        await workbook.xlsx.writeFile(USERS_FILE);
        console.log('Created users.xlsx');
    }
}

async function createPaymentsFileIfNotExist() {
    if (!fs.existsSync(PAYMENTS_FILE)) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');
        worksheet.columns = [
            { header: 'Name on Card', key: 'name', width: 30 },
            { header: 'Card Number', key: 'cardNumber', width: 25 },
            { header: 'Expiration Date', key: 'expiration', width: 20 },
            { header: 'CVV', key: 'cvv', width: 10 },
            { header: 'Payment Date', key: 'date', width: 25 }
        ];
        await workbook.xlsx.writeFile(PAYMENTS_FILE);
        console.log('Created payments.xlsx');
    }
}

async function readUsers() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(USERS_FILE);
    const worksheet = workbook.getWorksheet('Users');
    const users = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        users.push({
            fullname: row.getCell(1).value,
            email: row.getCell(2).value,
            password: row.getCell(3).value,
            date: row.getCell(4).value
        });
    });
    return users;
}

async function addUser(user) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(USERS_FILE);
    const worksheet = workbook.getWorksheet('Users');
    worksheet.addRow(user);
    await workbook.xlsx.writeFile(USERS_FILE);
}

async function addPayment(payment) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(PAYMENTS_FILE);
    const worksheet = workbook.getWorksheet('Payments');
    worksheet.addRow(payment);
    await workbook.xlsx.writeFile(PAYMENTS_FILE);
}

// Routes

// Signup
app.post('/api/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    await createUsersFileIfNotExist();
    const users = await readUsers();

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: 'Email already registered.' });
    }

    await addUser({
        fullname,
        email,
        password, // Note: For production, hash passwords!
        date: new Date().toLocaleString()
    });

    res.json({ message: 'Signup successful!' });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    await createUsersFileIfNotExist();
    const users = await readUsers();

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ message: 'Login successful!', fullname: user.fullname });
});

// Payment
app.post('/api/payment', async (req, res) => {
    const { name, cardNumber, expiration, cvv } = req.body;

    if (!name || !cardNumber || !expiration || !cvv) {
        return res.status(400).json({ error: 'All payment fields are required.' });
    }

    await createPaymentsFileIfNotExist();

    await addPayment({
        name,
        cardNumber,
        expiration,
        cvv,
        date: new Date().toLocaleString()
    });

    res.json({ message: 'Payment successful!' });
});

// Serve index.html by default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
