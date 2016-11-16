var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var lauguagesSchema = new Schema({
	"second":String,
	"third":String
})
var optionsSchema = new mongoose.Schema({ 
    name:String,
    description:String,
    price:Number,
    picture:String,
    order:{type:Number,default:1},
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
   
});

var optionsGroupsSchema = new mongoose.Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    group:{type: "String",default:"Default"},
    description:String,
    minimun:{type:Number,default:0},
    maximun:{type:Number,default:0},
    order:{type:Number,default:1},
    options:[optionsSchema],
    language:{
         group:lauguagesSchema,
         name:lauguagesSchema,
         description:lauguagesSchema
    }
   
});
var sizesSchema = new mongoose.Schema({ 
      name:String,
      price:Number,
       language:{
         name:lauguagesSchema,
        
    }
})
var itemsSchema = new mongoose.Schema({ 
    merchantId:{type:String,lowercase: true, trim: true},
    name:{type:String},
    globalOptions:[{type: mongoose.Schema.Types.ObjectId,ref: 'globalOptionGroups'}],
    customerOptions:[optionsGroupsSchema],
    size:[sizesSchema],
    status:{type:Boolean,default:false},
    category:{ type: mongoose.Schema.Types.ObjectId, ref: 'categorys',null: true },
    OrigPrice:Number,
    bodyPrice:Number,
    price:Number,
    discount:{type:Number,default:1},
    points:Number,
    picture:{type:String},
    status:{type:Boolean,default:true},
    description:String,
    order:{type:Number,default:1},
    oldPrice:Number,
    recommend:{type:Boolean,default:false},
    properties:[String],
    abbr:String,
    commentStatus:{type:Boolean,default:true},/*评论状态（open/closed）*/
    commentCount:{type:Number,default:0},
    operator:{
  id:{type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  user:String
},
    language:{
         name:lauguagesSchema,
         description:lauguagesSchema
    }
});
itemsSchema.index({ name: 1, merchantId: 1 }, { unique: true,sparse:true});
module.exports = mongoose.model('items', itemsSchema);
/*{ createdAt: { type: Date, expires: 3600, default: Date.now }}
OrderList.$.UserName","大叔2015-09-21
*/
