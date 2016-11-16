var mongoose = require('mongoose'),Schema = mongoose.Schema;

var billsSchema = new Schema({
merchantId:{type:String,lowercase: true, trim: true},
orderNo:String,
subTotal:Number,
taxRate:Number,
tax:Number,
tipRate:Number,
tip:Number,
discountRate:Number,
discount:Number,
grandTotal:Number,
   type:{type:String,default:"cash"},
   receiveTotal:Number,
   change:Number,
createdAt: {type:Date,default:Date.now},
updatedAt: Date,
status:String, //paid,void
operator:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	user:String
},
customer:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
	user:String
},
order:{type: mongoose.Schema.Types.ObjectId, ref: 'order'}
});

module.exports = mongoose.model('bills', billsSchema);

/*orderNo:String,
merchantId:String,

subTotal:Number,

taxRate:Number,
tax:Number,

tip:Number,
tipTotal:Number,
orderDetails:[orderDetailsSchema],

discountRate:Number,//-
discount:Number,//-

grandTotal:Number,

status:{type:String,default:"unpaid"},//uppaid,paid,close
createdAt: {type:Date,default:Date.now},
updatedAt: Date,*/
