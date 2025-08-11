
const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async function(req, res, next) {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(payload.id).select('-password');
    next();
  } catch(err) { return res.status(401).json({ error: 'Invalid token' }); }
};
