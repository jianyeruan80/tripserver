
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
    stores = require('../models/stores'),
     licenses = require('../modules/license');
router.get('/', function(req, res, next) {
     log.debug(req.token);
       stores.findOne({}).sort({"_id":-1}).exec(function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});

router.post('/decrypt',  function(req, res, next) {
  var info=req.body;

  var key=licenses.decryptLicense(info.licenseKey);  
  try{
          var keyJSON=JSON.parse(key);
           console.log(keyJSON);
        console.log(keyJSON.merchantId);
        if(keyJSON.merchantId==info.merchantId && keyJSON.active==true){
            var currentDate=new Date();
            var expires=new Date(keyJSON.expires);
         
               keyJSON.expiresTotal=Math.ceil(new Date(currentDate-expires).getTime()/(24*60*60*1000));
   if(currentDate>expires){
               keyJSON.active=false;
               
             //  keyJSON.expiresTotal=Math.ceil(new Date(currentDate-expires).getTime()/(24*60*60*1000));
               res.json(keyJSON);
            }else{
             // keyJSON.expiresTotal=0;
              res.json(keyJSON);
            }
        }else{
             return next({"code":"90007"});
  }
  }catch(ex){
        return next({"code":"90007"});
  }
 

})
router.post('/active',  function(req, res, next) {
   var info=req.body;
   var query={
     "merchantId":info.merchantId
   }
   var update={};
    update.merchantId=info.merchantId;
    update.licenseKey=info.licenseKey;
    update.expires=new Date(info.expires);
    var options={
         "upsert": true,
         "new":true
    }
     stores.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    }
    );
})

router.get('/merchants/id', security.ensureAuthorized,function(req, res, next) {
   
     var query={"merchantId":req.token.merchantId};
     

       stores.findOne(query, function (err, data) {
        if (err) return next(err);
        console.log(data);
         
         res.json(data);
      });
     
});
router.get('/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       stores.findById(req.params.id, function (err, data) {
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

    
    if(info.addressInfo && info.addressInfo.location && info.addressInfo.location.coordinates){
      info.addressInfo.location.coordinates=info.addressInfo.location.coordinates.split(",");
    }
/*info.merchantIds=!!info.merchantIds?info.merchantIds.split(","):[];}catch(ex){}*/

   var arvind = new stores(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
var id=req.params.id;
info.updatedAt=new Date();
info.operator={};
info.operator.id=req.token.id;
info.operator.user=req.token.user;
 
var query = {"_id": id};
var options = {new: true};
delete info["expires"];
delete info["licenseKey"];
try{
  info.addressInfo.location.coordinates=info.addressInfo.location.coordinates?info.addressInfo.location.coordinates.split(","):[];}catch(ex){}

 stores.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})

router.delete('/:id', security.ensureAuthorized,function(req, res, next) {
     stores.remove({"_id":req.params.id}, function (err, data) {
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


