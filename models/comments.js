var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentsSchema = new Schema({
author:{id:String,name:String},
content：String,
star:String,
createdAt: {type:Date,default:Date.now},
id:{type: mongoose.Schema.Types.ObjectId, ref: 'items' },
  
})
module.exports = mongoose.model('comments', commentsSchema);/**/