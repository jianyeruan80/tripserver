var mongoose = require('mongoose');
require('mongoose-schematypes-extend')(mongoose);
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
    "second":String,
    "third":String
})

var addressSchema = new Schema({
      address: String,
      city: String,
      state: String,
      zipcode: String,
      description:String
});
var creditCardsSchema=new Schema({
   cardNo:String,
   holderName:String,
   expirationYear:String,
   expirationMonth:String,
   ccv:String,
   cardType:String,
   
})

var customersSchema = new mongoose.Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    account:String,
    firstName:String,
  	lastName:String,
	  birthDay:Date,
	  addressInfo:[addressSchema],
	  phoneNum1:String,
	  phoneNum2:String,
	  email:{type:String,lowercase:true},
    password:String,
    creditCard:[creditCardsSchema],
    token:String,
	  facebook:String,
  	wechat:String,
	  twitter:String,
	  password:String,
    fax:String,
  	createdAt: {type:Date,default:Date.now},
    updatedAt: Date,
    description:String,
    status:{ type: Boolean, default: true },
    operator:{
    id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    user:String
    },
    memberships:[{type: mongoose.Schema.Types.ObjectId, ref: 'memberships'}],
     language:{
         description:lauguagesSchema
    },
});
customersSchema.index({ email: 1 ,merchantId:1}, { unique: true,sparse:true });

module.exports = mongoose.model('customers', customersSchema);

