
const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  type: String,
  start: Date,
  end: Date,
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Event', eventSchema);

// const mongoose=require('mongoose');
// const eventSchema=new mongoose.Schema({
//   userId:{
//     type:mongoose.Schema.Types.ObjectId,ref:'User'
//   },
//   type:String,
//   start:Date,
//   end:Date,
//   meta:Object,
//   createdAt:{
//     type:Date,
//     default:Date.now
//   },
// });
// module.exports=mongoose.model('Event',eventSchema);