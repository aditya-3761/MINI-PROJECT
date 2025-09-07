# 🚘 Car Rental Website – Full Stack Project

A responsive **Car Rental Website** that allows users to sign up, log in, book premium cars, make payments (including via QR code), and contact customer support. Data is stored in structured **Excel files** using a **Node.js + Express** backend.

---

## ✨ Features

- ✅ User Signup & Login system
- ✅ Responsive Booking Page
- ✅ Booking with car model, pickup, return dates
- ✅ Payment Page with QR Code Scanner (Camera or Static)
- ✅ Contact Customer Support Form
- ✅ Excel-based data storage (`.xlsx`)
- ✅ Fully responsive for all devices
- ✅ Backend in Node.js + Express

---

## 🧑‍💻 Technologies Used

### Frontend:
- HTML5
- CSS3 (Custom + Media Queries)
- JavaScript (Vanilla)
- Google Fonts: Poppins
- [html5-qrcode](https://github.com/mebjas/html5-qrcode)

### Backend:
- Node.js
- Express.js
- xlsx (for Excel manipulation)
- body-parser
- fs (File System module)

---

## 📁 Project Structure


---

## 📊 Excel Data Storage

| File             | Data Stored                   |
|------------------|-------------------------------|
| `users.xlsx`     | Name, Email, Password (Signup)|
| `bookings.xlsx`  | Car Model, Name, Email, Dates |
| `payments.xlsx`  | Card Info, Name, Email, CVV   |

Backend writes to these `.xlsx` files using `xlsx` module.

---

## 🧠 QR Code Payment Integration

- 📷 Integrated using `html5-qrcode`
- Opens device camera (mobile or laptop)
- Reads and displays QR code message
- Simulates payment success message
- Alternatively, uses a static image `QRcode.jpg`

---

## 📸 Screenshots (Add your actual images later)

| Page | Preview |
|------|---------|
| **Signup** | `screenshots/signup.png` |
| **Booking** | `screenshots/booking.png` |
| **Payment (QR)** | `screenshots/payment.png` |

> 📂 Add these images under a `screenshots/` folder in your repo

---

## 🛠️ Setup & Run Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/aditya-3761/MINI-PROJECT.git
cd MINI-PROJECT
