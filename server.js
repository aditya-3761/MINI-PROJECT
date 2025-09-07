const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public')); // serve static files from public

// POST route to handle email submission
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).send('Email is required.');

    const filePath = path.join(__dirname, 'subscribers.xlsx');
    let data = [];

    // If file exists, read existing data
    if (fs.existsSync(filePath)) {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(sheet);
    }

    // Check for duplicates
    if (data.find(entry => entry.Email === email)) {
        return res.status(409).send('Already subscribed.');
    }

    // Append new email
    data.push({ Email: email });

    // Convert to worksheet and write
    const worksheet = XLSX.utils.json_to_sheet(data);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Subscribers');
    XLSX.writeFile(newWorkbook, filePath);

    return res.status(200).send('Subscribed successfully!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
