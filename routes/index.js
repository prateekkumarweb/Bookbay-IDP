var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var mysql = require('mysql');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: 'smtp.iith.co.in',
    port: 25,
    auth: {
        user: 'noreply@iith.co.in',
        pass: 'xrPY*p#1'
    }
});
function sendEmail(toemail, sub, txt, htm, callback) {
    var mailOptions = {
        from: "Bookbay - IITH <noreply@iith.co.in>", // sender address
        to: toemail, // list of receivers
        subject: sub, // Subject line
        text: txt, // plaintext body
        html: htm // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            callback(false);
        }else{
            console.log("Message sent: " + response.message);
            callback(true);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

}


var conn = mysql.createConnection({
  	host     : process.env.RDS_HOSTNAME || 'localhost',
  	user     : process.env.RDS_USERNAME || 'root',
  	password : process.env.RDS_PASSWORD || 'pk-mysql-db',
 	port     : process.env.RDS_PORT || '3306',
    database : 'idp'
});
conn.connect(function(err){
    if (err) console.log(err);
});
var common = require('./common');
// GET home page.
router.get('/updatedatabasefromcreate', function(req, res, next) {
    conn.query("create table if not exists users (username varchar(255) primary key, password varchar(255) not null, fullname varchar(255) not null, verify varchar(64) not null unique)", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists courses (id varchar(255) primary key, name varchar(255) not null, start date not null, end date not null)", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists books (id varchar(255) primary key, name varchar(255) not null, author varchar(255), course varchar(255), description text, url text not null, pic text, userWhoAdded varchar(255), fulltext (id, name, author, course), foreign key (userWhoAdded) references users(username), foreign key (course) references courses(id))", function(err, rows, fields){
        if (err) res.send(err)
    });
    conn.query("create table if not exists userProfile (profilename varchar(255) primary key, fullname varchar(255) not null, foreign key (profilename) references users(username))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists userCourses (id bigint unsigned auto_increment primary key, username varchar(255) not null,  course varchar(255) not null, foreign key (username) references users(username), foreign key (course) references courses(id))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists commentsOnBooks (id bigint unsigned auto_increment primary key, time timestamp default current_timestamp, username varchar(255) not null, bookid varchar(255) not null, comment text not null, foreign key (username) references users(username), foreign key (bookid) references books(id))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists commentsOnComments (id bigint unsigned auto_increment primary key, time timestamp default current_timestamp, username varchar(255) not null, commentid bigint unsigned not null, reply text, foreign key (commentid) references commentsOnBooks(id), foreign key (username) references users(username))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists votesOnComments (id varchar(255) primary key, commentid bigint unsigned not null, vote smallint not null, foreign key (commentid) references commentsOnBooks(id))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists bookdownloads (id bigint unsigned auto_increment primary key, bookid varchar(255) not null, username varchar(255), foreign key (bookid) references books(id), foreign key (username) references users(username))", function(err, rows, fields){
        if (err) res.send(err);
    });
    conn.query("create table if not exists contactus (id bigint unsigned auto_increment primary key, email varchar(255) not null, message text not null)", function(err, rows, fields){
        if (err) res.send(err);
    });

    //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    //res.send('Updated');
});
//detect mobile
function isMobile(req) {
  var ua = req.headers['user-agent'].toLowerCase();
	if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
		return true;
	}
	else {
	  return false;
	}
}


router.get('/*', function(req, res, next){
    if (isMobile(req)) {
      res.send('You are using mobile. Mobile website is not ready. Switch to desktop.');
    }
    else next();
});
//

router.get('/', function(req, res){
    common.signInStatus(req, conn, function(st, u){
        res.render('home', {type: 'index', signedIn: st, user: u});
    });
});

router.get('/book', function(req, res) {
    var id = req.query.id;
    conn.query("select * from books where id=?", [id], function(err, rows, fields){
        common.signInStatus(req, conn, function(st, u){
            res.render('index', {type: 'book', signedIn: st, user: u, q: id, data: rows});
        });
    })
});

router.get('/search', function(req, res) {
    var q = req.query.q;
    conn.query("select * from books where match (id, name, author, course) against (? in natural language mode)",[q] , function(err, rows, fields) {
        if(err) rows = [];

        common.signInStatus(req, conn, function(st, u){
          if (req.query.page) {
              var page = req.query.page - 1;
          } else var page=0;
          var l = rows.length;
          var re = [];
          for (i=10*page; i<Math.min(l, (page*10+10)); i++) {
              re.push(rows[i]);
          }
          res.render('index', {type: 'search', signedIn: st, user: u, q: q, data: re, page: [l, page]});
        });
    });
});

router.get('/searchq', function(req, res) {
    var q = req.query.q;
    conn.query("select id, name, author, course, description, pic from books where match (id, name, author, course) against (? in natural language mode)",[q] , function(err, rows, fields) {

            if(err) rows = [];
          res.send(rows);

    });
});


var clientIp = require('client-ip');
router.get('/ip', function(req, res) {
	 res.send(clientIp(req));
});

router.get('/urltest', function(req, res){
    if (req.protocol == "http") res.send(req.protocol+'://'+req.hostname+req.url);
    else res.send('success');
});

router.post('/contact-us', function(req, res){
    var e = req.body.email;
    var m = req.body.message;
    if (e != '' && m != '') {
        conn.query("insert into contactus (email, message) values (?, ?)", [e, m], function(err){if (err) console.log(err)});
        //sendEmail("Bookbay Support<help@iith.co.in>", "Feedback from contact us form", "Email: "+e+" Message: "+m, "<h4>Email: "+e+" </h4><p>"+m+"</m>", function(){});
        res.render("message", {title: 'Thank You!', body: 'We will get back to you soon.'})
    }
});

router.get('/testing', function(req, res){res.send(process.env.TESTING)});

module.exports = router;
