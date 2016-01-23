var express = require('express');
var router = express.Router();
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

router.get('/book', function(req, res){
    res.render('u/book');
});

router.post('/book', function(req, res){
    
});

router.post('/u', function(req, res){
    key = req.body.key;
    if (key === 'idp2015-16-$3cr37-k3y') {
        res.render('users/addbook');
    } else {
        res.send('Invalid security key.');
    }
});
router.post('/addbook', function(req, res){
    var key = req.body.key;
    if (key === 'idp2015-16-$3cr37-k3y') {
        var id = req.body.id.toUpperCase();
        var name = req.body.name;
        var author = req.body.author;
        var course = req.body.course;
        var description = req.body.description;
        var url = req.body.url;
        var pic = req.body.pic;
        var user = req.body.user;
        //var pic = req.file;
        if (id === '' || name === '' || url === '') res.send('Compulsory fields are empty.');
        else {
            conn.query('insert into books values (?, ?, ?, ?, ?, ?, ?, ?)', [id, name, author, course, description, url, pic, user], function(err, rows, fields){
                if (err) {
                    console.log(err)
                    res.send('Error occurred.')
                }
                else res.send('Successfully added a book.')
            })
        }
    } else {
        res.send('Invalid security key. Enter correct key.');
    }
});






module.exports = router;
