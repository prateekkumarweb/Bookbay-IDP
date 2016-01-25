var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var multer = require('multer');
var fs = require('fs');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: 'smtp.iith.co.in',
    port: 25,
    auth: {
        user: 'noreply@iith.co.in',
        pass: 'xrPY*p#1'
    }
});

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

var common = require("./common");
function isSignin(user, callback) {
  common.signInStatus(user, conn, callback);
}

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

//res.header("Access-Control-Allow-Origin", "*");




router.get('/signin', function(req, res){
    isSignin(req, function(status, user){
        if (status) {
            res.send(user);
        } else {
            res.clearCookie('user');
            res.send();
        }
    });
});

router.post('/signin', function(req, res){
    userDetails = [req.body.username, req.body.password];
    url = req.body.url;
    isSignin(userDetails, function(status, user){
        if (status) {
            res.cookie('user', common.encrypt(req.body.username + 'username-password' + req.body.password), { signed: true });
            res.redirect(url);
        } else {
            res.clearCookie('user');
            res.render('index', {type: 'signinerror', signedIn: false, user: [], url: url});
        }
    });
})





router.post('/signup', function(req, res){
    if (req.signedCookies.user) {
        res.send({status: false, message: 'Signout first'});
    } else {
        var fullname = req.body.fullname;
        var username = req.body.username;
        var password = req.body.password;
        var rndm = common.generateRandomString();
        if (password != "" && fullname != "" && username != "" ) {
            var z = common.verifyUsername(username);
            if (z[0]) {
              conn.query("select * from userProfile where profilename=?", [z[1]], function(err, rows, fields){
                  if (err) {
                    console.log(err);
                    res.render('index', {type: 'signup', signedIn: false, user: [], message: 'There was a temperory error. Please try again later.'});
                    //res.send({status: false, message: err});
                  } else if (rows.length != 0) {
                    res.render('index', {type: 'signup', signedIn: false, user: [], message: 'User has already registered.'});
                    //res.send({status: false, message: 'User has already registered'});
                  } else {
                      conn.query("select * from users where username=?", [z[1]], function(err, rows, fields){
                        if (err) {
                          console.log(err);
                          res.render('index', {type: 'signup', signedIn: false, user: [], message: 'There was a temperory error. Please try again later.'});
                          //res.send({status: false, message: err});
                        } else if (rows.length === 0) {
                            conn.query("insert into users (fullname, username, password, verify) values (?, ?, ?, ?)", [fullname, z[1], common.hash(password), rndm], function(err){
                                if (err){
                                    console.log(err);
                                    res.render('index', {type: 'signup', signedIn: false, user: [], message: 'There was a temperory error. Please try again later.'});
                                    //res.send({status: false, message: err});
                                }
                                else {
                                    res.cookie('user', common.encrypt(req.body.username + 'username-password' + req.body.password), { signed: true });
                                    var t = "To verify your account go to https://lib.iith.co.in/u/verify/"+rndm+" ";
                                    var h = "<a href='https://lib.iith.co.in/u/verify/"+rndm+"'>Click here to verify Account</a>";
                                    sendEmail(z[1].toLowerCase()+"@iith.ac.in", "Verification of Account at Bookbay", t, h, function(a){

                                    });
                                    res.render('index', {type: 'signupverify', signedIn: false, user: [], message: 'Username signed in'});
                                    //res.send({status: true, message: 'Username signed in'});
                                }
                            });
                        } else {
                            conn.query("update users set fullname=?,password=?,verify=? where username=?", [fullname, common.hash(password), rndm, z[1]], function(err){
                                if (err){
                                    console.log(err);
                                    res.render('index', {type: 'signup', signedIn: false, user: [], message: 'There was a temperory error. Please try again later.'});
                                    //res.send({status: false, message: err});
                                }
                                else {
                                    res.cookie('user', common.encrypt(req.body.username + 'username-password' + req.body.password), { signed: true });
                                    var t = "To verify your account go to https://lib.iith.co.in/u/verify/"+rndm+" ";
                                    var h = "<a href='https://lib.iith.co.in/u/verify/"+rndm+"'>Click here to verify Account</a>";
                                    sendEmail(z[1].toLowerCase()+"@iith.ac.in", "Verification of Account at Bookbay", t, h, function(a){

                                    });
                                    res.render('index', {type: 'signupverify', signedIn: false, user: [], message: 'Username signed in'});
                                    //res.send({status: true, message: 'Username signed in'});
                                }
                            });
                        }
                      });
                  }
              });
            }
            else {
              res.render('index', {type: 'signup', signedIn: false, user: [], message: 'Only IITH emails are accepted.'});
              //  res.send({status: false, message: 'Only IITH emails are accepted'});
            }
        } else {
          res.render('index', {type: 'signup', signedIn: false, user: [], message: 'All fields are compulsory.'});
          //res.send({status: false, message: 'Passwords do not match'});
        }
    }
});

router.get('/verify/:r', function(req, res){
    var r = req.params.r;
    if (r.length == 64) {
        conn.query("select * from users where verify=?", [r], function(err, rows, fields){
            if (err) res.send("Couldnot verify user. There was a temperory error.");
            else {
                if (rows.length === 0) res.send(404);
                else {
                    conn.query("insert into userProfile (profilename, fullname) values (?, ?)", [rows[0].username, rows[0].fullname], function(errr){
                        if (errr) res.redirect("/u/user");
                        else {
                            conn.query("update users set verify=? where verify=?", ['verified'+rows[0].username, r], function(){
                                res.send("You have successfully verified your email. <a href='/u/user'>Go to Home</a>");
                            });
                        }
                    });
                }
            }
        });
    } else res.sned(404);
});

router.post('/signout', function(req, res){
    res.clearCookie('user');
    res.send();
});

router.post('/changepassword', function(req, res){
    isSignin(req, function(status, user){
        if (status) {
            var oldpassword = req.body.oldpassword;
            var newpassword = req.body.newpassword;
            var cnewpassword = req.body.cnewpassword;
            if (newpassword != cnewpassword) {
                res.send({status: false, message: 'Passwords do not match'});
            } else if (common.hash(oldpassword) === user.password) {
                conn.query('UPDATE users SET password=? WHERE username=?', [common.hash(newpassword), user.username], function(err, rows, fields){
                    if (err) {
                        res.send({status: false, message: 'Try Again later'});
                    } else {
                        res.cookie('user', common.encrypt(user.username + 'username-password' + newpassword), { signed: true });
                        res.send({status: true, message: 'Password changed'});
                    }
                });
            } else {
                res.send({status: false, message: 'Invalid password'});
            }
        } else {
            res.send({status: false, message: 'User not signed in'});
        }
    });
});

router.post('/forgotpassword', function(req, res){
    var u = req.body.username;
    u = common.verifyUsername(u);
    s = u[0];
    if (s) {
        u = u[1];
        var rndm = common.generateRandomString();
        conn.query("UPDATE users SET verify=? WHERE username=?", [rndm, u], function(err, rows, fields){
            if (err) res.send("An error occured. Please try again.");
            else {
                var t = "To change your password go to https://lib.iith.co.in/u/forgotpassword/"+rndm+" ";
                var h = "<a href='https://lib.iith.co.in/u/forgotpassword/"+rndm+"'>Click here to change your password</a>";
                sendEmail(u+"@iith.ac.in", "Forgot password", t, h, function(a){
                    res.send("Check your email.");
                });

            }
        });
    } else res.send({status: false});
});

router.get('/forgotpassword/:r', function(req, res){
    var r = req.params.r;
    if (r.length == 64) {
        conn.query("select * from users where verify=?", [r], function(err, rows, fields){
            if (err) res.send("Couldnot verify user. There was a temperory error.");
            else {
                if (rows.length === 0) res.send(404);
                else {
                    res.render('forgotpassword', {verify: r, error: ''});
                    //res.send("Now you can change your password");
                }
            }
        });
    }
});

router.post('/newpassword', function(req, res){
    var v = req.body.verify;
    var r = req.body.r.toUpperCase();
    var a = req.body.a;
    var b = req.body.b;
    if (a!=b || v.length != 64) res.render('forgotpassword', {verify: r, error: 'Passwords do not match'});
    else {
        conn.query("select * from users where verify=?", [v], function(err, rows, fields){
            if (err) res.send("Couldnot verify user. There was a temperory error.");
            else if (rows[0].username != r) res.send("There was an error.");
            else {
                conn.query("update users set password=? where verify=? and username=?", [common.hash(a), v, r], function(err, rows, fields){
                    if (err) res.send("Couldnot verify user. There was a temperory error.");
                    else res.send("Now you can login with your new password.");
                    conn.query("update users set verify=? where username=?", ['verify'+r, r], function(err){
                        if (err) console.log(err);
                    });
                });
            }
        });
    }
});
/*router.get('/email',  function(req, res) {
    var mailOptions = {
        from: "Bookbay - IITH <noreply@bookbayatiith.com>", // sender address
        to: "Help <pksingh1023@gmail.com>", // list of receivers
        subject: "Hello", // Subject line
        text: "Hello world", // plaintext body
        html: "<b>Hello world</b>" // html body
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.send('failure');
        }else{
            console.log("Message sent: " + response.message);
            res.send('success');
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
});*/

function verifyProfile(user, callback) {
    isSignin(user, function(status, us) {
        if(status) {
            conn.query("select * from userProfile where profilename=?", [us.username], function(err, rows, fields){
                if (err) callback(true, false, []);
                else if (rows.length === 0) callback(true, false, us);
                else {
                    callback(true, true, rows[0]);
                }
            });
        } else {
            callback(false, false, []);
        }
    });
}

//profile page scripts starts here
router.get('/user*', function(req, res, next) {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    verifyProfile(req, function(a, b, user){
        if (a) {
            if (b) next();
            else res.render('index', {type: 'signupverify', signedIn: false, user: [], message: 'Username signed in'});
        } else res.render('index', {type: 'signin', signedIn: false, user: [], url: '/u' + encodeURI(req.url)});
    });
});

router.get('/vemail', function(req, res){
    verifyProfile(req, function(a, b, user){
        if (a) {
            if (b) res.send(false);
            else {
                var rndm = user.verify;
                var t = "To verify your account go to https://lib.iith.co.in/u/verify/"+rndm+" ";
                var h = "<a href='https://lib.iith.co.in/u/verify/"+rndm+"'>Click here to verify Account</a>";
                sendEmail(user.username.toLowerCase()+"@iith.ac.in", "Verification of Account at Bookbay", t, h, function(ab){
                    res.send(ab);
                });
            }
        } else res.send(false);
    });
});

router.post('/user*', function(req, res, next) {
    verifyProfile(req, function(a, b, user){
        if (a) {
            if (b) next();
            else res.send(false);
        } else res.send(false);
    });
});

router.get('/user', function(req, res){
    res.render('profile');
});

// stuff related to books

router.get('/book/download/:id/:name', function(req, res){
  var id = req.params.id;
  conn.query('select url from books where id=?', [id], function(err, rows, fields){
    if (err) res.send(404);
    else if (rows.length === 0) {
      res.send(404)
    }
    else {
      var http = require('http');
      var url = require('url');
      var l = rows[0].url;
      var link = url.parse(l);
      var options = {
        method: 'GET',
        host: link.host,
        port: 80,
        path: link.path
      };

      var request = http.request(options, function(response) {

        response.on('data', function(chunk) {
          res.write(chunk);
        });

        response.on('end', function() {
            if (req.signedCookies.user) {
              verifyProfile(req, function(a, b, user){
                  if (a && b) {
                      var username = user.profilename.toUpperCase();
                      var bookid = id;
                      conn.query("insert into bookdownloads (bookid, username) values (?, ?)", [bookid, username], function(err, rows, fields){
                          download();
                      });
                  } else download();
              });
          } else download();
          function download() {
              res.end();
          }

      });
      });

      request.end();

    }
  });

});

router.get('/user/books/recent', function(req, res){
  verifyProfile(req, function(a, b, user){
      if (a && b) {
          conn.query('select bookdownloads.*, books.pic from bookdownloads inner join books on bookdownloads.bookid=books.id where bookdownloads.username=? order by id desc', [user.username || user.profilename], function(err, rows, fields){
            if (err) res.send();
            else res.send(rows);
          });
      } else res.send();
  });
});

router.post('/user/book/comment', function (req, res) {
    verifyProfile(req, function (a, b, user) {
        if (a && b) {
            var username = user.profilename.toUpperCase();
            var bookid = req.body.bookid;
            var comment = req.body.comment;
            conn.query("insert into commentsOnBooks (username, bookid, comment) values (?, ?, ?)", [username, bookid, comment], function (err, rows, fields) {
                if (err) {console.log(err); res.send(false);}
                else res.send(true);
            });
        } else res.send(false);
    });
});

router.get('/book/comments', function (req, res) {
    var i = req.query.bookid;
    conn.query("select commentsOnBooks.*, users.fullname from commentsOnBooks inner join users on commentsOnBooks.username=users.username where commentsOnBooks.bookid=? order by commentsOnBooks.id DESC", [i], function(err, rows, fields){
        if (err) res.send();
        else res.send(rows);
    });
});

router.get('/book/comment/votesandreplies', function (req, res) {
    var i = req.query.commentid;
    var r = [];
    conn.query("select count(*) as upvotes from votesOnComments where vote=1 and commentid=?", [i], function(err, rows, fields){
        if (err) res.send();
        else {
            r = r.concat(rows);
            conn.query("select count(*) as downvotes from votesOnComments where vote=-1 and commentid=?", [i], function(err, rows, fields){
                if (err) res.send();
                else {
                    r = r.concat(rows);
                    conn.query("select * from commentsOnComments where commentid=?", [i], function(err, rows, fields) {
                        r = r.concat([rows]);
                        res.send(r);
                    });
                }
            });
        }
    });
});

router.post('/user/book/comment/reply', function (req, res) {
    verifyProfile(req, function (a, b, user) {
        if (a && b) {
            var username = user.profilename.toUpperCase();
            var commentid = req.body.commentid;
            var reply = req.body.reply;
            conn.query("insert into commentsOnComments (username, commentid, reply) values (?, ?, ?)", [username, commentid, reply], function (err, rows, fields) {
                if (err) {console.log(err); res.send(false);}
                else res.send(true);
            });
        } else res.send(false);
    });
});

router.post('/user/book/comment/vote', function (req, res) {
    verifyProfile(req, function (a, b, user) {
        if (a && b) {
            var username = user.profilename.toUpperCase();
            var commentid = req.body.commentid;
            var vote = req.body.vote;
            if (vote === 1 || vote === -1 || vote === '1' || vote === '-1') {
                var id = username+'|&$&|'+commentid;
                conn.query('select * from votesOnComments where id=?', [id], function (err, rows, fields) {
                    if (rows.length == 0) {
                        conn.query("insert into votesOnComments (id, commentid, vote) values (?, ?, ?)", [id, commentid, vote], function (err, rows, fields) {
                            if (err) {console.log(err); res.send(false);}
                            else res.send(true);
                        });
                    } else {
                        conn.query("update votesOnComments set vote=? where id=?", [vote, id], function (err, rows, fields) {
                            if (err) {console.log(err); res.send(false);}
                            else res.send(true);
                        });
                    }
                });

            } else res.send(false);
        } else res.send(false);
    });
});


// Courses

router.get('/user/registeredcourses', function(req, res){
    verifyProfile(req, function(a, b, user){
      if (a && b) {
        conn.query("select userCourses.*, courses.name from userCourses inner join courses on userCourses.course=courses.id where userCourses.username=?", [user.profilename], function(err, rows){
          res.send(rows);
        });
      } else res.send([]);
    });
});

router.get('/user/notregisteredcourses', function(req, res){
    verifyProfile(req, function(a, b, user){
      if (a && b) {
        var r = [];
        conn.query("select * from courses order by id asc", function(err, rows){
          conn.query("select course from userCourses where username=?", [user.profilename], function(err1, rows1){
            var c = [];
            for (var i=0; i<rows1.length; i++) {
              c.push(rows1[i].course);
            }
            for (var i=0; i<rows.length; i++) {
              if (c.indexOf(rows[i].id) === -1) {
                r.push(rows[i]);
              }
            }
            res.send(r);
          });
        });
      } else res.send([]);
    });
});

router.get('/user/notregisteredcoursessearch', function(req, res){
    var q = req.query.q;
    verifyProfile(req, function(a, b, user){
      if (a && b) {
        var r = [];
        var p = "%"+q+"%";
        conn.query("select * from courses where (id like ? or name like ?) order by id asc", [p, p], function(err, rows){
          conn.query("select course from userCourses where username=?", [user.profilename], function(err1, rows1){
            var c = [];
            for (var i=0; i<rows1.length; i++) {
              c.push(rows1[i].course);
            }
            for (var i=0; i<rows.length; i++) {
              if (c.indexOf(rows[i].id) === -1) {
                r.push(rows[i]);
              }
            }
            res.send(r);
          });
        });
      } else res.send([]);
    });
});

router.post('/user/registercourse', function(req, res){
    verifyProfile(req, function(a, b, user){
      if (a&&b) {
        var c = req.body.course;
        var u = user.profilename;
        conn.query("select * from userCourses where username=? and course=?", [u, c], function(err, rows){
          if (err) res.send(false);
          else if (rows.length==0) {
            conn.query("insert into userCourses (username, course) values (?, ?)", [u, c], function(err, rows){
              if (err) res.send(false);
              else res.send(true);
            });
          } else res.send(false);
        });
      } else res.send(false);
    });
});

router.post('/user/deregistercourse', function(req, res){
    verifyProfile(req, function(a, b, user){
      if (a&&b) {
        var c = req.body.course;
        var u = user.profilename;
        conn.query("delete from userCourses where username=? and course=?", [u, c], function(err, rows){
          if (err) res.send(false);
          else res.send(true);
        });
      } else res.send(false);
    });
});

router.get('/user/recommendedbooks', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a&&b) {
      conn.query("select books.* from books inner join userCourses on books.course=userCourses.course where userCourses.username=?", [user.profilename], function(err, rows){
        if (err) res.send([]);
        else res.send(rows);
      });
    } else res.send([]);
  });
});

router.post('/user/book/request', function(req, res){
    var name=req.body.name;
    var course=req.body.course;
    var author=req.body.author;
    if (name != '' && course != '' && author != '') {
        verifyProfile(req, function(a, b, user){
          if (a&&b) {
              sendEmail("noreply@iith.co.in", "Request Book", 'User : '+user.profilename+' Book : '+name+' Author : '+author+' Course : '+course, 'User : '+user.profilename+'<br>Book : '+name+'<br>Author : '+author+'<br>Course : '+course, function(q){
                  if (q) res.send(true);
                  else res.send(false);
              });
          } else res.send(false);
        });

    }
    else res.send(false);
});

router.post('/user/book/upload', multer({ dest: 'public/uploads/' }).single('file'), function(req, res){
    var name=req.body.name;
    var course=req.body.course;
    var link=req.body.link;
    var file=req.file;
    if (file) {
        console.log(file);
        verifyProfile(req, function(a, b, user){
            if (a&&b) {
             // fs.readFile(file.path, function(err, data){
                    var mailOptions = {
                        from: "Bookbay - IITH <noreply@iith.co.in>", // sender address
                        to: "noreply@iith.co.in", // list of receivers
                        subject: "Upload book", // Subject line
                        text: 'User : '+user.profilename+' Book : '+name+' Course : '+course+' Link : '+link, // plaintext body
                        html: 'User : '+user.profilename+'<br>Book : '+name+'<br>Course : '+course+'<br>Link : '+link, // html body
                        attachments: [{fileName: encodeURIComponent(name)+'.pdf', streamSource: fs.createReadStream(file.path)}]
                    }
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error){
                            console.log(error);

                        }else{
                            console.log("Message sent: " + response.message);
                        }
                        fs.unlink(req.file.path, function(err){
                          if (err) console.log(err);
                        });
                        // if you don't want to use this transport object anymore, uncomment following line
                        //smtpTransport.close(); // shut down the connection pool, no more messages
                    });
                res.render("message", {title: 'Thank You!', body: '<b>Note:&nbsp;</b>Your upload will be verified by us and will be published only if the upload is legit'});
             // });

            } else {
              fs.unlink(file.path, function(err){
                  if (err) console.log(err);
                  res.send(false);
              });
          }
        });
    } else if (link != '') {
        verifyProfile(req, function(a, b, user){
          if (a&&b) {
            sendEmail("noreply@iith.co.in", "Upload Book", 'User : '+user.profilename+' Book : '+name+' Course : '+course+' Link : '+link, 'User : '+user.profilename+'<br>Book : '+name+'<br>Course : '+course+'<br>Link : '+link, function(q){
                if (q) res.render("message", {title: 'Thank You!', body: 'Your upload will be verified by us and will be published only if the upload is legit'});
                else res.send(false);
            });
          } else res.send(false);
        });
    } else {
        res.send(false);
    }
});


// Courses

// Add book in database

router.get('/booklist', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        conn.query("select * from books order by id desc", function(err, rows){
          res.render('u/booklist', {books: rows});
        });
      }
    } else res.send(403);
  });
});

router.get('/status', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        txt ='';
        conn.query("select count(*) from books where userWhoAdded=?", [admin[0]], function(err, rows){
          txt+=admin[0]+' : '+rows[0]["count(*)"]+'<br>';
          conn.query("select count(*) from books where userWhoAdded=?", [admin[1]], function(err, rows){
            txt+=admin[1]+' : '+rows[0]["count(*)"]+'<br>';
            conn.query("select count(*) from books where userWhoAdded=?", [admin[2]], function(err, rows){
              txt+=admin[2]+' : '+rows[0]["count(*)"]+'<br>';
              conn.query("select count(*) from books where userWhoAdded=?", [admin[3]], function(err, rows){
                txt+=admin[3]+' : '+rows[0]["count(*)"]+'<br>';
                conn.query("select count(*) from books where userWhoAdded=?", [admin[4]], function(err, rows){
                  txt+=admin[4]+' : '+rows[0]["count(*)"]+'<br>';
                  res.send(txt);
                });
              });
            });
          });
        });
      }
    } else res.send(403);
  });
});

router.get('/addbook', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        res.render('u/book');
      }
    } else res.send(403);
  });
});


router.post('/addbook', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id=Date.now();
        var name=req.body.name;
        var author=req.body.author;
        var description=req.body.description;
        var course=req.body.course.toUpperCase();
        var url=req.body.url;
        var pic=req.body.pic;
        var userWhoAdded=username;
        conn.query('insert into courses (id, name, start, end) values (?, ?, ?, ?)', [course, course, '2015-07-28', '2020-12-31'], function(err){
          if (err) console.log(err);
          conn.query('insert into books (id, name, author, course, description, url, pic, userWhoAdded) values (?, ?, ?, ?, ?, ?, ?, ?)', [id, name, author, course, description, url, pic, userWhoAdded], function(err){
            if (err) {
              console.log(err);
              res.send('Book could not be added. Try again.');
            }
            else res.send('Book successfully added <a href="/u/addbook">Add another Book</a>');
          });
        });
        //res.send(username);
      }
    } else res.send(403);
  });
});

router.get('/updatebook', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id = req.query.id;
        conn.query("select * from books where id=?", [id], function(err, rows){
          if (err) res.send('Error occured');
          else if (rows.length == 0) res.send("Invalid id.");
          else res.render('u/updatebook', {book: rows[0]});
        });
      }
    } else res.send(403);
  });
});

router.post('/updatebook', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id=req.body.id;
        var name=req.body.name;
        var author=req.body.author;
        var description=req.body.description;
        var course=req.body.course.toUpperCase();
        var url=req.body.url;
        var pic=req.body.pic;
        var userWhoAdded=username;
        conn.query('insert into courses (id, name, start, end) values (?, ?, ?, ?)', [course, course, '2015-07-28', '2020-12-31'], function(err){
          if (err) console.log("err"+err);
          conn.query('update books set name=?, author=?, course=?, description=?, url=?, pic=?, userWhoAdded=? where id=?', [name, author, course, description, url, pic, userWhoAdded, id], function(err, rows, fields){
            if (err) {
              console.log(err);
              res.send('Book could not be updated. Try again.');
          } else res.send('Book successfully updated <a href="/u/booklist">Book list</a>');
          });
        });
        //res.send(username);
      }
    } else res.send(403);
  });
});

router.get('/courselist', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        conn.query("select * from courses order by id asc", function(err, rows){
            console.log(rows);
            res.render('u/courselist', {courses: rows});
        });
      }
    } else res.send(403);
  });
});

router.get('/updatecourse', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id = req.query.id;
        conn.query("select * from courses where id=?", [id], function(err, rows){
          if (err) res.send('Error occured');
          else if (rows.length == 0) res.send("Invalid id.");
          else {
              var c = rows[0];
              var d = c.start;
              try {c.start = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
              catch(err) {c.start = '';}
              var d = c.end;
              try {c.end = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
              catch(err) {c.end = '';}
              res.render('u/updatecourse', {course: c});
          }
        });
      }
    } else res.send(403);
  });
});

router.post('/updatecourse', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id=req.body.id;
        var name=req.body.name;
        var start = req.body.start;
        var end = req.body.end;
        conn.query('update courses set name=?, start=?, end=? where id=?', [name, start, end, id], function(err, rows, fields){
            if (err) {
              console.log(err);
              res.send('Course could not be updated. Try again.');
          } else res.send('Course successfully updated <a href="/u/courselist">Course list</a>');
        });

        //res.send(username);
      }
    } else res.send(403);
  });
});

router.get('/addcourse', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
          if (req.query.id && req.query.id != '') {
              var id = req.query.id;
              conn.query("select * from courses where id=?", [id], function(err, rows){
                if (err) res.send('Error occured');
                else if (rows.length != 0) res.send("Available<br>Name : "+rows[0].name+"<br><a href='/u/updatecourse?id="+id+"'>Update Course</a>");
                else res.send("Not Available");
              });
          }
          else res.render('u/addcourse');
      }
    } else res.send(403);
  });
});

router.post('/addcourse', function(req, res){
  verifyProfile(req, function(a, b, user){
    if (a && b) {
      var admin = ['CS15BTECH11031', 'CS15BTECH11018', 'ME15BTECH11024', 'EE15BTECH11016', 'CS15BTECH11043'];
      var username = user.profilename.toUpperCase();
      if (admin.indexOf(username) === -1) res.send(403);
      else {
        var id=req.body.id;
        var name=req.body.name;
        var start = '2015-07-28';
        var end = '2020-12-31';
        conn.query('insert into courses (id, name, start, end) values (?, ?, ?, ?)', [id, name, start, end], function(err, rows, fields){
            if (err) {
              console.log(err);
              res.send('Course could not be added. Try again.');
          } else res.send('Course successfully added <a href="/u/courselist">Course list</a>');
        });

        //res.send(username);
      }
    } else res.send(403);
  });
});












module.exports = router
