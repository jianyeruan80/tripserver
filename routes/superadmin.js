

var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    admins = require('../models/admins'),
    seqs = require('../models/seqs'),
    security = require('../modules/security'),
    md5 = require('md5'),
    jwt = require('jsonwebtoken');

var permissions=admins.permissions; 
var roles=admins.roles; 
var users=admins.users; 
var chainStores=admins.chainStores; 
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Server is Running' });
})
router.post('/login', function(req, res, next) {
  log.debug(req.body);
   var query=req.body;
   query.password=security.encrypt(md5(query.password));
    users.findOne(query ,function (err, data) {
    if (err) return next(err);
    if (!data) return next({"code":"90002"});
     var json={};
     json.accessToken = jwt.sign({"type":query.type},req.app.get("superSecret"), {
          expiresIn: '10000m',
          algorithm: 'HS256'
        });
       res.json(json);
  });
});
router.get('/users', security.ensureAuthorized,function(req, res, next) {
      log.debug(req.token);
      var query=req.query;
       console.log(query);
   
      if(req.token.type=="SUPER"){
       users.find(query ,{}, {sort: {"_id": -1}}, function (err, data) {
        if (err) return next(err);

         res.json(data);
      });
     }
});
router.get('/seqs', security.ensureAuthorized,function(req, res, next) {
   var  info=req.body;
   
        seqs.find({},function (err, data) {
               if (err) return next(err);
                 res.json(data) ;
        })

 });
router.post('/seqs', security.ensureAuthorized,function(req, res, next) {
   var  info=req.body;
        info.updatedAt=new Date(); 


              var arvind = new seqs(info);
         arvind.save(function (err, data) {
         if (err) return next(err);
                res.json(data);
            });


 });
router.put('/seqs/:id', security.ensureAuthorized,function(req, res, next) {
   var  info=req.body;
        info.updatedAt=new Date(); 
        var query = {"_id": req.params.id};
        var options = {new: true};

 seqs.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });

 });
router.get('/perms', security.ensureAuthorized,function(req, res, next) {
 log.debug(req.token);
  if(req.token.type=="SUPER"){
         permissions.aggregate(
           [ { $group : {_id : "$permissionGroup",  order: { $min: "$order" },perms:{$push:{"subject":"$subject","action":"$action","perm":"$perm","status":"$status","value":"$_id","key":"$perm","order":"$order","merchantIds":"$merchantIds"} } } }
        ]
        ).sort({"order" : 1}).exec(function(err,data){
            if (err) return next(err);

            res.json(data);
        })
    }
});

router.post('/users',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
    info.password=security.encrypt(md5(info.password));
   try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
    var arvind = new users(info);
      arvind.save(function (err, data) {
      if (err) return next(err);
           res.json(data);
                    });
                        
  } 
})

router.put('/users/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
var options={"upsert":false,"multi":false};
       var id=req.params.id;
                     info.updated_at=new Date();
                     if(!info.password) delete info.password;
                     if(!!info.password) info.password=security.encrypt(md5(info.password));
                       try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
var query = {"_id": id};
var options = {new: true};
         users.findOneAndUpdate(query,info,options,function (err, data) {
                          if (err) return next(err);
                         
                             res.json(data);
                      });
                        
  } 
})




router.post('/perms', security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
 try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
 var arvind = new permissions(info);
            arvind.save(function (err, data) {
            if (err) return next(err);
                    res.json(data);
              });
        }
 
})

router.put('/perms/:id', security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
if(req.token.type=="SUPER"){
        var id=req.params.id;
        try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
        var options={"upsert":false,"multi":false};
                   info.updated_at=new Date();
                   permissions.update({"_id":id},info,options,function (err, data) {
                        if (err) return next(err);
                            
                            res.json(data);
                      });
                   
       
  }
 
})

router.put('/users/:id/perms', security.ensureAuthorized, function(req, res, next) {
     var info=req.body;
     log.debug(info);

     if(req.token.type=="SUPER"){
       var options={"upsert":false,"multi":false};
       var id=req.params.id;
       var options = {new: true};

        users.findOneAndUpdate({"_id":id},{"permissions":info.permissions},options,function (err, data) {
                          if (err) return next(err);
                         
                             res.json(data);
                      });
        
      }
 })

router.get('/perms/:id', security.ensureAuthorized, function(req, res, next) {
log.debug(req.body);
  var id=req.params.id;
  var query={"_id":id};
   if(req.token.type=="SUPER"){
      permissions.findOne(query, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
    }
})

router.get('/chainStores', function(req, res, next) {
     log.debug(req.token);
       chainStores.find({}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
     
});
router.get('/chainStores/:id', security.ensureAuthorized,function(req, res, next) {
     log.debug(req.token);
       chainStores.findById(req.params.id, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
     
});
router.post('/chainStores',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
   try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
   var arvind = new chainStores(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
          res.json(data);
      });
})
router.put('/chainStores/:id',  security.ensureAuthorized,function(req, res, next) {
var info=req.body;
log.debug(info);
var id=req.params.id;
info.updated_at=new Date();
var query = {"_id": id};
var options = {new: true};
 try{info.merchants=info.merchants?info.merchants.split(","):[]}catch(ex){}
 chainStores.findOneAndUpdate(query,info,options,function (err, data) {
          if (err) return next(err);
          res.json(data);
    });
})

router.delete('/chainStores/:id', security.ensureAuthorized,function(req, res, next) {
     chainStores.remove({"_id":req.params.id}, function (err, data) {
        if (err) return next(err);
          res.json(data);
      });
});

module.exports = router;

/*
info.merchantIds=!!info.merchantIds?info.merchantIds.split(","):[];
info.merchantIds=!!info.merchantIds?info.merchantIds.split(","):[];}catch(ex){}
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

