const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const otpStore = new Map(); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60000 });

  try {
    await transporter.sendMail({
      from: `"Sri Hatwa Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Master Security PIN OTP",
      html: `<h2>App Authorization</h2><p>Your verification OTP is: <strong>${otp}</strong></p>`
    });
    res.json({ success: true, message: "OTP Sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ error: "OTP expired or not requested" });
  if (Date.now() > record.expires) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }
  if (record.otp === otp) {
    otpStore.delete(email);
    return res.json({ success: true, message: "Verified successfully" });
  }
  res.status(400).json({ error: "Invalid OTP" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Secure Auth Server running on port ${PORT}`));