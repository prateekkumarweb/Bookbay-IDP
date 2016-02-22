var express = require('express');
var app = express.Router();
var mysql = require('mysql');

var conn = mysql.createConnection({
	host     : process.env.RDS_HOSTNAME || 'localhost',
	user     : process.env.RDS_USERNAME || 'root',
	password : process.env.RDS_PASSWORD || 'pk-mysql-db',
	  port     : process.env.RDS_PORT || '3306',
  database : 'idp'
});
conn.connect(function(err){
  if (err) console.log(err)
});

app.get('/', function(req, res) {
	res.render('api');
});

app.get('/search', function(req, res) {
  var q = req.body.q;
  conn.query("select id, name, author, course, description, url, pic from books where match (id, name, author, course) against (? in natural language mode)",[q] , function(err, rows, fields) {

          if(err) rows = [];
        res.send(rows);

  });
});
/*app.get('/book/:id/comments', function(req, res) {

});-*/

app.get('/book', function(req, res) {
	var id = req.query.id;
	conn.query("select id, name, author, course, description from books where id=?", [id], function(err, rows, fields){
			if (err) rows = [];
			else res.send(rows);
	});
});
module.exports = app;
