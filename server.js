const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Excel file path
const excelFilePath = path.join(__dirname, 'data.xlsx');

async function initializeExcelFile() {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.readFile(excelFilePath);
  } catch (err) {
    const worksheet = workbook.addWorksheet('Users');
    worksheet.addRow(['Full Name', 'Email', 'Password', 'Date', 'Payment ID']);
    await workbook.xlsx.writeFile(excelFilePath);
  }
}
initializeExcelFile();

// Routes

// Root route serves index.html by default via static middleware, no need for explicit get('/')

// Signup POST handler
app.post('/signup', async (req, res) => {
  const { fullname, email, password, confpassword } = req.body;
  if (!fullname || !email || !password || !confpassword) {
    return res.status(400).send('All fields are required.');
  }
  if (password !== confpassword) {
    return res.status(400).send('Passwords do not match.');
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet('Users');
    worksheet.addRow([fullname, email, password, new Date().toLocaleString(), '']);
    await workbook.xlsx.writeFile(excelFilePath);

    res.send('Signup successful! <a href="/loginpage.html">Login here</a>.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/api/bookings', (req, res) => {
  const {  carModel, pickupDate, returnDate, name, email } = req.body; 
  if (!carModel || !pickupDate || !returnDate || !name || !email) { 
    return res.status(400).json({ message: 'All fields are required.' });

    }   
   
    // Here you can add code to save the booking data to a database or file

    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile(excelFilePath)
    .then(() => {
        const worksheet = workbook.getWorksheet('Bookings') || workbook.addWorksheet('Bookings');
        worksheet.addRow([carModel, pickupDate, returnDate, name, email, new Date().toLocaleString()]);
        return workbook.xlsx.writeFile(excelFilePath);
    })
    .then(() => {
        res.status(200).json({ message: 'Booking successful!' });
    })
    .catch((error) => {
        console.error('Error saving booking:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    });
    console.log('Booking received:', req.body);
    res.status(200).json({ message: 'Booking successful!' });
});

// Login POST handler
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet('Users');

    let isAuthenticated = false;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      if (row.getCell(2).value === email && row.getCell(3).value === password) {
        isAuthenticated = true;
      }
    });

    if (isAuthenticated) {
      res.send('Login successful!');
    } else {
      res.status(401).send('Invalid email or password.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Payment POST handler
app.post('/payment', async (req, res) => {
  const { fullname, email, paymentId } = req.body;
  if (!fullname || !email || !paymentId) {
    return res.status(400).send('All payment fields are required.');
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    const worksheet = workbook.getWorksheet('Users');

    let userFound = false;
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      if (row.getCell(2).value === email) {
        row.getCell(5).value = paymentId; // update payment id
        userFound = true;
      }
    });

    if (!userFound) {
      worksheet.addRow([fullname, email, '', new Date().toLocaleString(), paymentId]);
    }

    await workbook.xlsx.writeFile(excelFilePath);
    res.send('Payment information saved successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// 404 handler for any other route
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
