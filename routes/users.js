var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

var conn = mysql.createConnection({
  	host     : process.env.RDS_HOSTNAME || 'localhost',
  	user     : process.env.RDS_USERNAME || 'root',
  	password : process.env.RDS_PASSWORD || 'pk-mysql-db',
 	  port     : process.env.RDS_PORT || '3306',
    database : 'idp'
});
conn.connect(function(err){
    if (err) console.log(err)
})

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('users/index');
});
router.post('/', function(req, res){
    key = req.body.key;
    if (key === 'pk-login') {
        res.render('users/mysql')
    }
    else res.render('users/index');
})
router.post('/mysql', function(req, res){
    key = req.body.key;
    if (key === 'pk-login') {
        q = req.body.mysql;
        conn.query(q, function(err, rows, fields){
            if (err) res.send(err);
            res.send(rows);
        })
    } else {
        res.render('users/index');
    }
});

var s3 = new AWS.S3();
s3.listBuckets(function(err, data) {
  if (err) { console.log("Error:", err); }
  else {
    for (var index in data.Buckets) {
      var bucket = data.Buckets[index];
      console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
    }
  }
});

module.exports = router;
