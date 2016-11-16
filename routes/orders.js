
var express = require('express'),
    router = express.Router(),
    log = require('../modules/logs'),
    security = require('../modules/security'),
    tools = require('../modules/tools'),
    seqs = require('../models/seqs'),
    
    util = require('util'),
    orders = require('../models/orders'),
    bills = require('../models/bills'),
    stores = require('../models/stores');
    
router.get('/',  security.ensureAuthorized,function(req, res, next) {
    
        var info=req.query;
         var query={"merchantId":req.token.merchantId}
         if(info.status){query.status=info.status;}
         if(info.startDate){
            var startDate=new Date(info.startDate);
            startDate=new Date(startDate.getUTCFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
            query.createdAt={"$gte":startDate};
         }
         if(info.endtDate){
          var endtDate=new Date(info.endtDate);
              endtDate=new Date(endtDate.getUTCFullYear(), endtDate.getMonth(), endtDate.getDate(), 23, 59, 59, 999);
              query.createdAt={"$lte":endtDate};
         }   

    orders.aggregate([
    {
      $match:query
    },
    {
      $lookup:
        {
          from: "bills",
          localField: "_id",
          foreignField: "order",
          as: "bills"
        }
   },
    {
      $lookup:
        {
          from: "customers",
          localField: "customer.id",
          foreignField: "_id",
          as: "customers"
        }
   }
]).exec(function(err,data){


res.json(data);


})


})
/**
[
{_id:xx,min:20}
]
**/
router.post('/updateTimer',  security.ensureAuthorized,function(req, res, next) {
    var info=req.query;
    var len=info.length;
     for(var i=0;i<len;i++){
         var query={"_id":info[i]._id};
          var timer=new Date(),min=info[i].min;
           var update={"timer":null};
              if(min>0){
	         
              timer.setTime(timer.getTime() + min*60*1000);
               update.timer=timer;
     }
         
         orders.findOneAndUpdate(query,update,{},function (err, data) {
               if (err) return next(err);
               if(i>=len){
                res.json(data);  
                }
                
               
        })
     }
})
router.post('/timer',  security.ensureAuthorized,function(req, res, next) {
    var alertDate=new Date();

    var query={
      $and:[
           {
             "status":{ "$in":["Unpaid","Paid"]}
           },
            {"timer":{ "$lte":alertDate}  },
           {
	    "timer":{"$ne" : [null] } 
           }
        ]
}
orders.aggregate([
    {
      $match:query
    },
    {
      $lookup:
        {
          from: "bills",
          localField: "_id",
          foreignField: "order",
          as: "bills"
        }
   },
    {
      $lookup:
        {
          from: "customers",
          localField: "customer.id",
          foreignField: "_id",
          as: "customers"
        }
   }
]).exec(function(err,data){
res.json(data);
})
})
router.post('/invoice/:id',  security.ensureAuthorized,function(req, res, next) {
       
       var id=req.params.id;
       var query={
           $and:[
            {"merchantId":req.token.merchantId},
            {
              $or:[
                      {"invoiceNo":{$regex:id,$options: "i"}}
                     
                ] 
            }
           ]
       }       
       orders.find(query, function (err, data) {
        if (err) return next(err);
         res.json(data);
      });
})
router.get('/bills',  security.ensureAuthorized,function(req, res, next) {
        var info=req.query;
         var query={"merchantId":req.token.merchantId};
        if(info.status){query.status=info.status;}

        bills.find(query).sort({orderNo: 1, _id:1 }).exec(function(err,data){
           if (err) return next(err);
           res.json(data);
        })
})
router.put('/void/:id',  security.ensureAuthorized,function(req, res, next) {
       var query={"_id":req.params.id}
        var info=req.body;
        var upData={status:"void"};
            upData.reason=info.reason || "";
        orders.findOneAndUpdate(query,info,{},function (err, data) {
               if (err) return next(err);
               query={"order":req.params.id};
               info={"status":"void"};
               bills.findOneAndUpdate(query,info,{},function (err, data) {
                if (err) return next(err);
                 res.json(data);
                })
        })
})
router.put('/billvoid/:id',  security.ensureAuthorized,function(req, res, next) {
	 var query={"_id":req.params.id}
        var info={status:"void"}
        bills.findOneAndUpdate(query,info,{},function (err, billData) {
               if (err) return next(err);
          /*   var billData=billData;
                             console.log("1111111111111111111111111111");
                     console.log(billData);
                     console.log("3333333333333333333333333333333333333");*/
                        bills.aggregate([
                               { $match: { "order": billData.order,"status":"Paid" } },
                               {
                                $project:
                                {
                                   order:1,receiveTotal:1,tip:1,
                                   change:{$cond: [ { $gte: [ "$change", 0 ] }, "$change", 0 ]}
                                }
                               },
                               {  $group: {
                                  _id: "$order", 
                                  receiveTotal: { $sum: "$receiveTotal" } ,
                                  change: { $sum:"$change"}   ,
                                  tip: { $sum: "$tip" } ,

                                } 
                               }
                               
                             
                           ]).exec(function(err,billResult){
                              if (err) return next(err);
                            /*         console.log("444444444444444444444444");
                     console.log(billData);
                     console.log("6666666666666666666666666666666666666666666666");*/
                               var billResult=billResult?billResult[0]:null;
                                
                                var orderQuery={"_id":billData.order};
                                 var orderUpdata={};
                                    orderUpdata.status="Unpaid";
                                     orderUpdata.uppaid=billData.grandTotal;
                                     
                               if(billResult){
                                orderUpdata.status="Demi-Paid";
                                orderUpdata.uppaid=toFixed(billData.grandTotal-(billResult.receiveTotal-billResult.change-billResult.tip),2);
                               }
                           
                                 orders.findOneAndUpdate(orderQuery,orderUpdata,{},function (err, orderData) {
                                             if (err) return next(err);
                                             var initOrder={
                                               subTotal:0,
                                               tax:0,
                                                taxRate:0,
                                                tip:0,
                                                tipRate:0,
                                                discount:0,
                                                discountRate:0,
                                                grandTotal:0,
                                               receiveTotal:0,
                                               orderDetails:[]
                                             };
                                             res.json(initOrder);
                                          })
                   

                           })
              /* query={"_id":data.order};
               info={"status":"unpaid"};
               orders.findOneAndUpdate(query,info,{},function (err, data) {
                if (err) return next(err);
                 res.json(data);
                })*/
        })
})

router.get('/:id',  security.ensureAuthorized,function(req, res, next) {
        var info=req.query;
         var query={"_id":req.params.id};
        

        orders.findOne(query).sort({orderNo: 1, _id:1 }).exec(function(err,data){
           if (err) return next(err);
           res.json(data);
        })


})
router.post('/pay',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
   var name="orderNo";
   info.merchantId=req.token.merchantId; 
   var query={"merchantId":info.merchantId,"name":name};
   info.operator={};
   info.operator.id=req.token.id;
   info.operator.user=req.token.user;
   info.createdBy=info.operator;
   var d=new Date();
   info.createdAt=d;//new Date();
   info.updatedAt=d;//new Date();
   info.status="Unpaid"; //paid ,void

   if(info._id){
        orders.findOneAndUpdate({"_id":info._id},info,{},function (err, orderData) {
             if (err) return next(err);
              info.order=orderData._id;
              info.status="Paid";
              delete info["_id"];
              var b=new bills(info);

              b.save(function (err, billData) {
                              if (err) return next(err);
                                
                               bills.aggregate([
                               { $match: { "order": billData.order,"status":"Paid" } },
                                  {
                                $project:
                                {
                                   order:1,receiveTotal:1,tip:1,
                                   change:{$cond: [ { $gte: [ "$change", 0 ] }, "$change", 0 ]}
                                }
                               },
                               {  $group: {
                                  _id: "$order", 
                                  receiveTotal: { $sum: "$receiveTotal" } ,
                                  change: { $sum:"$change"}   ,
                                  tip: { $sum: "$tip" } ,

                                } 
                               }
                               
                             
                           ]).exec(function(err,billData){
                               
                              var billData=billData[0];

                               var orderQuery={"_id":billData._id};

                               var orderUpdata={};

                               
                               orderUpdata.uppaid=toFixed(orderData.grandTotal-(billData.receiveTotal-billData.change-billData.tip),2);
                               orderUpdata.status="Paid";
                               if(orderUpdata.uppaid>0){
                                orderUpdata.status="Demi-Paid";   
                                  
                               }
                                 orders.findOneAndUpdate(orderQuery,orderUpdata,{},function (err, orderData) {
                                             if (err) return next(err);
                                             var initOrder={
                                               subTotal:0,
                                               tax:0,
                                                taxRate:0,
                                                tip:0,
                                                tipRate:0,
                                                discount:0,
                                                discountRate:0,
                                                grandTotal:0,
                                               receiveTotal:0,
                                               orderDetails:[]
                                             };
                                             res.json(initOrder);
                                          })
                   

                           })
                    })
         
               })
        
    return false;
   } 
  
   var p1=tools.getNextSequence(query);
   p1.then(function(n){
   info.orderNo=n.seqNo;
    var pre=d.getMonth()+1+""+d.getDate()+(""+d.getFullYear()).substr(2,2);
   info.invoiceNo=pre+n.seqNo;
   var arvind = new orders(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
      seqs.findOneAndUpdate(query,n.updateData,{},function (err, seqData) {
                   if (err) return next(err);
                         
                          info.order=data._id;
                          info.status="Paid";
                          delete info["_id"];
                          var b=new bills(info);
                           b.save(function (err, billData) {
                              
                               bills.aggregate([
                               { $match: { "order": billData.order,"status":"Paid" } },
                               {
                                $project:
                                {
                                   order:1,receiveTotal:1,tip:1,
                                   change:{$cond: [ { $gte: [ "$change", 0 ] }, "$change", 0 ]}
                                }
                               },
                               {  $group: {
                                  _id: "$order", 
                                  receiveTotal: { $sum: "$receiveTotal" } ,
                                  change: { $sum:"$change"}   ,
                                  tip: { $sum: "$tip" } ,

                                } 
                               }
                               
                             
                           ]).exec(function(err,billData){
                             
                          var billData=billData[0];

                               var orderQuery={"_id":billData._id};

                               var orderUpdata={};

                               orderUpdata.uppaid=toFixed(data.grandTotal-(billData.receiveTotal-billData.change-billData.tip),2);
                               orderUpdata.status="Paid";
                               if(orderUpdata.uppaid>0){
                                orderUpdata.status="Demi-Paid";   
                                  
                               }
                                 orders.findOneAndUpdate(orderQuery,orderUpdata,{},function (err, orderData) {
                                             if (err) return next(err);
                                             var initOrder={
                                               subTotal:0,
                                               tax:0,
                                                taxRate:0,
                                                tip:0,
                                                tipRate:0,
                                                discount:0,
                                                discountRate:0,
                                                grandTotal:0,
                                               receiveTotal:0,
                                               orderDetails:[]
                                             };
                                             res.json(initOrder);
                                          })
                   

                           })
                           })

                  }) 
 });
}, function(n) {
  res.json({"code":"90005"});
});
})
router.post('/',  security.ensureAuthorized,function(req, res, next) {
   var info=req.body;
   var name="orderNo";
   info.merchantId=req.token.merchantId; 
   var query={"merchantId":info.merchantId,"name":name};
   info.operator={};
   info.operator.id=req.token.id;
   info.operator.user=req.token.user;
   info.createdBy=info.operator;
   var d=new Date();
   info.createdAt=d;//new Date();
   info.updatedAt=d;//new Date();
   info.status="Unpaid"; //paid ,void
   info.uppaid=info.grandTotal;
   var p1=tools.getNextSequence(query);
   p1.then(function(n){
   info.orderNo=n.seqNo;
    var pre=d.getMonth()+1+""+d.getDate()+(""+d.getFullYear()).substr(2,2);
   info.invoiceNo=pre+n.seqNo;
   var arvind = new orders(info);
   arvind.save(function (err, data) {
   if (err) return next(err);
      seqs.findOneAndUpdate(query,n.updateData,{},function (err, data2) {
                   if (err) return next(err);
                          res.json(data);  
                         
                    }) 
 });
}, function(n) {
  res.json({"code":"90005"});
});
})

router.put('/:id',  security.ensureAuthorized,function(req, res, next) {
     var info=req.body;
     info.operator={};
    info.operator.id=req.token.id;
    info.operator.user=req.token.user;
    info.updatedAt=new Date();
    var query={"_id":req.params.id};
      var options = {new: true};  
      orders.findOneAndUpdate(query,info,options,function (err, data) {
                   if (err) return next(err);
                         if(info.sign=="saveOrder") return res.json(data);  
                          info.order=data._id;
                          var b=new bills(info);
                           b.save(function (err, data3) {
                              if (err) return next(err);
                               query={"_id":data3.order};
                               var update={"status":"Paid"};
                               orders.findOneAndUpdate(query,update,{},function (err, data2) {
                                  if (err) return next(err);
                                  var initOrder={
                                    subTotal:0,
                                    tax:0,
                                     taxRate:0,
                                     tip:0,
                                     tipRate:0,
                                     discount:0,
                                     discountRate:0,
                                     grandTotal:0,
                                    receiveTotal:0,
                                    orderDetails:[]
                                  };
                                  res.json(initOrder);
                               })
                           })

                  }) 
    
});


module.exports = router;

var toFixed=function(num, s) {                        //00003
          var tempnum = num.toFixed(s+4);
      return Number(Math.round(tempnum+'e'+s)+'e-'+s);
}
