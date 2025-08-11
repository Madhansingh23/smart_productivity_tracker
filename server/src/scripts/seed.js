
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_prod';
async function run(){ await mongoose.connect(MONGO, {useNewUrlParser:true, useUnifiedTopology:true}); await User.deleteMany({}); await Task.deleteMany({}); await Event.deleteMany({}); const hashed = await bcrypt.hash('demo123', 10); const user = new User({ name:'Demo User', email:'demo@example.com', password:hashed }); await user.save(); console.log('Created demo user demo@example.com / demo123'); await Task.insertMany([{ userId:user._id, title:'Plan project', description:'Create outline', estimatedMinutes:120 }, { userId:user._id, title:'Daily standup', description:'Team sync', estimatedMinutes:15 }]); await Event.insertMany([{ userId:user._id, type:'calendar', start:new Date(Date.now()-2*24*3600*1000), end:new Date(Date.now()-2*24*3600*1000+60*60000), meta:{category:'meeting'} }, { userId:user._id, type:'focus', start:new Date(Date.now()-24*3600*1000), end:new Date(Date.now()-24*3600*1000+90*60000), meta:{note:'Deep work'} }]); console.log('Seeded tasks and events'); process.exit(0); } run().catch(e=>{ console.error(e); process.exit(1); });
