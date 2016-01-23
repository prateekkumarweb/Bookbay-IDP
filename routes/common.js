var crypto = require('crypto'), algorithm = 'aes-256-ctr', password = 'idptwentyfifteensixteensecretkey';

router = {
  encrypt: function(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt: function(text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  },

  hash: function(text) {
      var h = crypto.createHash('sha256').update(text).digest("hex");
      return h;
  },

  verifyUsername: function(username) {
      var z = username.toUpperCase().split('@');
      var c = (z.length === 1 || (z.length === 2 && z[1] === 'IITH.AC.IN'));
      return [c, z[0]];
  },

  generateRandomString: function(m) {
    var m = m || 64; s = '', r = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  	for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
  	return s;
  },

  signInStatus: function(req, conn, callback) {
    if (req.signedCookies) var user = req.signedCookies.user;
    else var user = req;
    if (user === undefined || user === null) callback(false, []);
    else {
      if (typeof(user) === "string") {
        user = this.decrypt(user)
        user = user.split('username-password');
      }
      var z = this.verifyUsername(user[0]);
      if (z[0]) {
        conn.query("select * from users where username=? and password=?", [z[1], this.hash(user[1])], function(err, rows, fields){
            if (err) {
                callback(false, []);
            }
            else if (!rows[0]) {
                callback(false, []);
            }
            else {
                u = {}
                for (var i in rows[0]) {
                    u[i] = rows[0][i];
                }
                callback(true, u);
            }
        });
      } else callback(false, []);
    }
  }
}

module.exports = router;
