var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

var convSchema = new Schema({
   
  messages: [{
    msgvalue: String,
    msgsender: String
  }],
  
  date: { type: Date, required: true, default: Date.now() } ,
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } ,
  reciever: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  } ,
}) ;
module.exports = mongoose.model('conversation',convSchema) ;