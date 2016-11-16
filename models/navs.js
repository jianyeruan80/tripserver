var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var picturesSchema=new mongoose.Schema({ 
  name:String,
  title:String,
  href:String,
  click:String,
})
var vediosSchema=new mongoose.Schema({ 
  name:String,
  title:String
 href:String,
  click:String,
})
var navsSchema = new Schema({
  merchantId:String,	
  name:String,
  abbr:String,
  descript:String,
  order:Number,
  href:String,
  click:String,
  mode:String,
  pictures:[pictureSchema],
  vedios:[vediosSchema],
  parent:{
  	  id:{type: mongoose.Schema.Types.ObjectId,ref: 'navsSchema'},
  	  name:{type:String,default:null}
  }
 })

navsSchema.index({ merchantId:1,name: 1}, { unique: true,sparse:true});
module.exports = mongoose.model('navs', navsSchema);