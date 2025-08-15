const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function safeUser(u){
  return { id: u._id, email: u.email, name: u.name, username: u.username, profilePic: u.profilePic, points: u.points };
}

router.post('/signup', async (req,res)=>{
  try{
    const { name, email, password, username } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'email & password required' });
    let existing = await User.findOne({ $or:[{email},{username}] });
    if(existing) return res.status(400).json({ error: 'Email or username already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, username, password: hashed });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn:'7d' });
    res.json({ token, user: safeUser(user) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:'server error' });
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { identifier, email, password } = req.body;
    const lookup = identifier || email;
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

module.exports = router;
