var mongoose = require('mongoose'),Schema = mongoose.Schema;


var orderDetailsSchema = new Schema({
merchantId:{type:String,lowercase: true, trim: true},
category:String,
price:Number,
qty:Number,
name:String,
currentPrice:Number,//-
discount:Number,//-
discountRate:Number,//-
qty:Number,
options:[],
properties:[],
item:{type: mongoose.Schema.Types.ObjectId, ref: 'items' }
});

var ordersSchema = new Schema({
orderNo:String,
invoiceNo:String, 
notes:String,
pickUpTime:Date,
timer:Date,
merchantId:{type:String,lowercase: true, trim: true},
subTotal:Number,

taxRate:Number,
tax:Number,

tip:Number,
tipTotal:Number,
orderDetails:[orderDetailsSchema],

discountRate:Number,//-
discount:Number,//-

grandTotal:Number,
uppaid:Number,
reason:String,
status:{type:String,default:"Unpaid"},//uppaid,paid,close
createdAt: {type:Date,default:Date.now},
updatedAt: Date,
createdBy:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	user:String
},
operator:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	user:String
},
customer:{
	id:{type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
	user:String
}
});

module.exports = mongoose.model('orders', ordersSchema);

/*  yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          time: { $dateToString: { format: "%H:%M:%S:%L", date: "$date" } }
{ "_id" : 1, "yearMonthDay" : "2014-01-01", "time" : "08:15:39:736" }
          */
