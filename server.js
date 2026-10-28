// server.js (Node.js Backend with Environment Variables & Fast Response)
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Root Route for Cron-Job.org Ping (Prevents "Cannot GET /" and keeps server awake)
app.get('/', (req, res) => {
  res.status(200).send("Sri Hatwa OTP Server is Online and Running Fast!");
});

// 2. Nodemailer Transporter using Render Environment Variables (Secure)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Fetches from Render Environment Variables
    pass: process.env.EMAIL_PASS  // Fetches from Render Environment Variables
  }
});

let otpStorage = {}; // Temporary memory storage for OTPs

// 3. Send OTP API
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  otpStorage[email] = otp;

  try {
    await transporter.sendMail({
      from: `"Sri Hatwa Gold Loans" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Security Master PIN OTP',
      text: `Your Master PIN verification OTP is: ${otp}. Do not share this with anyone.`
    });
    res.status(200).json({ success: true, message: 'OTP Sent Successfully' });
  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).json({ success: false, message: 'Mail Error / Check App Password' });
  }
});
// 4. Verify OTP API
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStorage[email] && otpStorage[email] === otp) {
    delete otpStorage[email]; // Clear OTP once verified
    res.status(200).json({ success: true, message: 'OTP Verified Successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running securely on port ${PORT}`));
