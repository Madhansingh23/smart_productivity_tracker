
const mongoose = require('mongoose');
const fbSchema = new mongoose.Schema({
  suggestionId: { type: mongoose.Schema.Types.ObjectId, ref:'Suggestion' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref:'User' },
  action: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Feedback', fbSchema);

// const mongoose=require('mongoose');
//   const fbSchema=new mongooseSchema({
//     suggestionId:{
//       type:mongoosde.Schema.Types.ObjectId,
//       ref:'Suggestion'
//     },
//     userId:{
//       type:mongoose.Schema.Types.ObjectId,
//       ref:'User'
//     },
//     action:String,
//     timeStamp:{
//       type:Date,
//       default:Date.now,
//     },
//   })
// );
// module.exports=mongoose.model('Feedback',fbSchema);