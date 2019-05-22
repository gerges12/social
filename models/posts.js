var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;
var mongoosePaginate = require('mongoose-paginate');
 


var schema = new Schema({
   
    body:{type:String, require: true} ,

    file:{type:String, require: true} , 
    date:  {type:Date, require: true} ,
    user:{ type: Schema.Types.ObjectId , ref:'User'} ,
    likes:[{ type: Schema.Types.ObjectId , ref:'User'} ],
    comments:  [{
        text: { type: String },
         date: { type: Date, default: Date.now },
         user:{ type: Schema.Types.ObjectId , ref:'User'} ,
     }] ,


    }) ;

schema.plugin(mongoosePaginate);




module.exports = mongoose.model('posts',schema) ;