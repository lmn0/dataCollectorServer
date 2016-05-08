// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var request = require('request');
var json2csv = require('json2csv');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tjs:password@ds013971.mlab.com:13971/sensed';
// ===
var assert = require('assert');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', __dirname + '/');
app.engine('html', require('ejs').renderFile);

app.use("/api/", express.static(__dirname + "/"));
    app.use("/api/images", express.static(__dirname + "/images"));
    app.use("/api/js", express.static(__dirname + "/js"));
    app.use("/api/roboto", express.static(__dirname + "/roboto"));
console.log(__dirname + "/js/");

app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", ['GET','DELETE','PUT', 'POST']);
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			return next();
		});

var port = process.env.PORT || 8083;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.post('/tempMongoInsert',function(req,res){

    var addUser = function(db, callback) {
   var cursor =db.collection('mobileTemp').insertOne( { "userid":req.body.userId,"mobid": req.body.mobId,"temperature":req.body.temperature},function(err, result) {
      assert.equal(err, null);
      console.log(result);
      res.send(200);
   });
};
  var updateValue = function(db, callback) {
   var cursor =db.collection('mobileTemp').updateOne(
      { "userid" : req.body.userId,"mobid":req.body.mobId },
      {
        $set: { "temperature": req.body.temperature }
      },function(err, result) {
      assert.equal(err, null);
      console.log(result);
      res.send(200);
   });
};

var findUserMob = function(db, callback) {
    console.log(req.body.userId);
   var cursor =db.collection('mobileTemp').findOne( { "userid" : req.body.userId,"mobid":req.body.mobId } ,function(err, doc) {
      assert.equal(err, null);
      if(err!=null){

      }
      if (doc != null) {
        console.log(doc);
         updateValue(db,function(){db.close();});
      } else {
        console.log(doc);
        addUser(db,function(){db.close();})
      }
      //res.redirect('dashboard');
   });
};

  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // Get the documents collection
    findUserMob(db,function(){db.close();});
  }
  
});


});

router.get('/qrc',function(req,res){
  res.sendFile();
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
