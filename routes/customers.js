
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
    customers = require('../models/customers');
    
router.get('/test',  function(req, res, next) {

       var info=req.query;
       var search=info.search || "";

       var query={
           $and:[
            {"merchantId":"fs4i"},
            {
              $or:[
                      {"email":{$regex:search,$options: "i"}},//'email':new RegExp("^"+req.body.email+"$", 'i'),
                      {"phoneNum1":{$regex:search,$options: "i"}},
                      {"phoneNum2":{$regex:search,$options: "i"}},
                      {"firstName":{$regex:search,$options: "i"}},
                      {"lastName":{$regex:search,$options: "i"}},
                ]
            }
           ]
       }

customers.aggregate(
   [ { $match: query },
      {$lookup:
     {
       from: "orders",
       localField:"_id" ,
       foreignField:"customer.id",
       as: "ordersDocs"
     }}

 ]).exec( function (err, data) {
        if (err) return next(err);
         res.json(data);
})
});
    
router.get('/', function(req, res, next) {
     log.debug(req.token);
       customers.find({}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});
router.get('/merchants/id', security.ensureAuthorized, function(req, res, next) {
     var query={"merchantId":req.token.merchantId};
       customers.find(query, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});

router.get('/query',  security.ensureAuthorized,function(req, res, next) {
       
       var info=req.query;
       var search=info.search || "";

       var query={
           $and:[
            {"merchantId":req.token.merchantId},
            {
              $or:[
                      {"email":{$regex:search,$options: "i"}},//'email':new RegExp("^"+req.body.email+"$", 'i'),
                      {"phoneNum1":{$regex:search,$options: "i"}},
                      {"phoneNum2":{$regex:search,$options: "i"}},
                      {"firstName":{$regex:search,$options: "i"}},
                      {"lastName":{$regex:search,$options: "i"}},
                ]  
            }
           ]
       }       

       //var query={"merchantId":req.token.merchantId};   
        //'email':new RegExp("^"+req.body.email+"$", 'i'),

       customers.find(query, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
})
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       customers.findById(req.params.id, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
     
});

router.post('/',  security.ensureAuthorized,function(req, res, next) {
  var info=req.body;

   
   info.merchantId=req.token.merchantId; 
      info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;

   var arvind = new customers(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
   info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
 customers.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})
router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
     customers.remove({"_id":req.params.id}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
});

module.exports = router;

/*
var PersonSchema = new Schema({
      name:{
        first:String,
        last:String
      }
    });
  PersonSchema.virtual('name.full').get(function(){
      return this.name.first + ' ' + this.name.last;
    });

Post.find({}).sort('test').exec(function(err, docs) { ... });
Post.find({}).sort({test: 1}).exec(function(err, docs) { ... });
Post.find({}, null, {sort: {date: 1}}, function(err, docs) { ... });
Post.find({}, null, {sort: [['date', -1]]}, function(err, docs) { ... });

db.inventory.aggregate( [ { $unwind: "$sizes" } ] )
db.inventory.aggregate( [ { $unwind: { path: "$sizes", includeArrayIndex: "arrayIndex" } } ] )
https://docs.mongodb.com/manual/reference/operator/aggregation/group/
[
   /*{ $project : { title : 1 , author : 1 } } addToSet*/
/*    { $match: { status: "A" } },*
 { $group : {_id : "$permission_group", perms:{$push:{"subject":"$subject","action":"$action","perm":"$perm","status":"$status","value":"$_id","key":"$perm"} } } }
  // _id : { month: "$permission_group", day: { $dayOfMonth: "$date" }, year: { $year: "$date" } }

  /*    {
        $group : {
          _id:{permissionGroup:"$permission_group",subjects:{$push:"$subject"}}
         
    sort({"order" : 1})
        }
      }*/
/*users.update({"_id":key},{"$addToSet":{"permissions":{"$each":info.value}}},function(err,data){*/

