var mongoose = require('mongoose');
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
      description:String,
      language:{
         description:lauguagesSchema
    },
   location: {
    type:{type:String,default:'Point'},
    coordinates: [Number],
    
  }
  
});
var distanceFeeSchema = new Schema({ 
  distance:String,
  fee:Number
})
var picturesSchema=new Schema({ 
  path:String,
  title:String,
  active:{type:Boolean,default:true}
})
var vediosSchema=new Schema({ 
  path:String,
  title:String,
  active:{type:Boolean,default:true}
})
var storesSchema = new Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    name:String,
    addressInfo:addressSchema,
    phoneNum1:String,
    phoneNum2:String,
    webSite:String,
    email:String,
    password:String,
    tax:Number,
    about :String,
    createdAt: {type:Date,default:Date.now},
    updatedAt: Date,
    pictures:[picturesSchema],
    vedios:[vediosSchema],
    mode:String,//"A".B
    logo:String,
    fax:String,
    licenseKey:String,
    openTime:String,
    orderTime:String,
    qrcUrl:{type:String,lowercase:true},
    minPrice:Number,
    waitTime:String,
    deliveryFee:String,
    maxDistance:Number,
    DiffTimes:{type:Number,default:0},
    distanceFee:[distanceFeeSchema],
    expires:Date,
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    },
    operator:{
  id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  user:String,

},
});
storesSchema.index({ merchantId: 1},{unique: true,sparse:true });
//storesSchema.index({ qrcUrl: 1},{unique: true,sparse:true });
addressSchema.index({location: '2dsphere'});
module.exports = mongoose.model('stores', storesSchema);

/*{ createdAt: { type: Date, expires: 3600, default: Date.now }}
OrderList.$.UserName","大叔2015-09-21
*/