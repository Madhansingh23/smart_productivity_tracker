// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

const safeUser = (u)=>({
  id: u._id, firstName: u.firstName, lastName: u.lastName,
  username: u.username, email: u.email, phone: u.phone,
  profilePic: u.profilePic, age: u.age, dob: u.dob, address: u.address,
  emailVerified: u.emailVerified, phoneVerified: u.phoneVerified, points: u.points
});

// --- Signup ---
// --- Signup ---
router.post('/signup', async (req,res)=>{
  try{
    const { firstName, lastName, email, password, username, phone } = req.body;
    if(!email || !password || !username)
      return res.status(400).json({ error: 'username, email & password required' });

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if(emailExists) return res.status(400).json({ error: 'Email already registered' });

    const usernameExists = await User.findOne({ username: username.toLowerCase().trim() });
    if(usernameExists) return res.status(400).json({ error: 'Username already taken' });

    if(phone){
      const phoneExists = await User.findOne({ phone });
      if(phoneExists) return res.status(400).json({ error: 'Phone number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, lastName,
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      phone,
      password: hashed
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn:'7d' });
    res.json({ token, user: safeUser(user) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:'server error' });
  }
});

// --- Login ---
router.post('/login', async (req,res)=>{
  try{
    const { identifier, email, password } = req.body;
    const lookup = (identifier || email || '').toLowerCase().trim();
    const user = await User.findOne({ $or:[{email: lookup},{username: lookup}] });
    if(!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn:'7d' });
    res.json({ token, user: safeUser(user) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:'server error' });
  }
});

// --- Availability checks (username/email/phone) ---
router.get('/check-username', async (req, res) => {
  const username = String(req.query.username || '').toLowerCase().trim();
  if (!username) return res.json({ available: false, suggestions: [] });
  const exists = await User.findOne({ username });
  let suggestions = [];
  if (exists) {
    const base = username.replace(/[^a-z0-9]/g, '');
    suggestions = [
      `${base}${Math.floor(Math.random()*1000)}`,
      `${base}_${Math.floor(Math.random()*100)}`,
      `${base}${new Date().getFullYear()}`
    ];
  }
  res.json({ available: !exists, suggestions });
});

router.get('/check-email', async (req, res) => {
  const email = String(req.query.email || '').toLowerCase().trim();
  if (!email) return res.json({ available: false });
  const exists = await User.findOne({ email });
  res.json({ available: !exists });
});

router.get('/check-phone', async (req, res) => {
  const phone = String(req.query.phone || '').trim();
  if (!phone) return res.json({ available: false });
  const exists = await User.findOne({ phone });
  res.json({ available: !exists });
});
// --- Email OTP (can be sent before signup) ---
const tempOtps = new Map(); // { email: { code, expiry } }

router.post('/send-otp', async (req,res)=>{
  try {
    const { email } = req.body;
    const norm = String(email||'').toLowerCase().trim();
    if(!norm) return res.status(400).json({ error: 'Email required' });

    const code = '' + Math.floor(100000 + Math.random() * 900000);
    tempOtps.set(norm, { code, expiry: Date.now() + 5*60*1000 });

    await sendMail({
      to: norm,
      subject: 'Your Verification Code',
      html: `<h2>Verify your email</h2>
             <p>Your OTP is <b>${code}</b>. It expires in 5 minutes.</p>`
    });

    res.json({ sent:true });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req,res)=>{
  try {
    const { email, code } = req.body;
    const norm = String(email||'').toLowerCase().trim();
    const entry = tempOtps.get(norm);
    if(!entry) return res.status(400).json({ verified:false, error:'No OTP sent' });
    if(entry.code !== String(code) || Date.now() > entry.expiry)
      return res.status(400).json({ verified:false, error:'Invalid or expired OTP' });

    tempOtps.delete(norm);
    res.json({ verified:true });
  } catch(err){
    console.error(err);
    res.status(500).json({ verified:false, error:'Verification failed' });
  }
});

// --- Phone OTP (new; integrate your SMS provider) ---
router.post('/send-sms-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = '' + Math.floor(100000 + Math.random() * 900000);
    user.phoneOtp = code;
    user.phoneOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // TODO: integrate your SMS gateway here
    console.log('SMS OTP for', phone, '=>', code);

    res.json({ sent: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to send SMS OTP' }); }
});

router.post('/verify-sms-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = Date.now();
    if (!user.phoneOtp || !user.phoneOtpExpiry || String(user.phoneOtp) !== String(code) || now > new Date(user.phoneOtpExpiry).getTime())
      return res.status(400).json({ verified: false, error: 'Invalid or expired OTP' });

    user.phoneVerified = true;
    user.phoneOtp = null;
    user.phoneOtpExpiry = null;
    await user.save();

    res.json({ verified: true });
  } catch (e) { console.error(e); res.status(500).json({ verified: false, error: 'Verification failed' }); }
});

module.exports = router;
