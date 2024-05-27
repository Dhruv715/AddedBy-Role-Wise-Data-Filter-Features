var mysql = require('mysql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'exam4'
});

conn.connect(function(err) {
    if (err) throw err;
    console.log('Database Connected');
});

// Middleware to store user info in the session
var session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Admin Login Form
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/', function(req, res) {
    var email = req.body.email;
    var pwd = req.body.password;
    var CheckData = "SELECT * FROM tbluser WHERE email = ? AND password = ?";
    conn.query(CheckData, [email, pwd], function(err, result) {
        if (err) throw err;

        if (result.length > 0) {
            // Store user info in session
            req.session.user = result[0];
            res.redirect('/dashboard');
        } else {
            res.send('Invalid Credentials');
        }
    });
});

// User/Dashboard
app.get('/dashboard', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var QueryData;
    if (req.session.user.role === 'admin' || req.session.user.role === 'Admin' ) {
        QueryData = "SELECT * FROM tbluser"; // Admin sees all users
    } else {
        QueryData = "SELECT * FROM tbluser WHERE addedby = ?"; // Non-admins see only users they added
    }
    
    conn.query(QueryData, req.session.user.role === 'Admin' ? [] : [req.session.user.email], function(err, result) {
        if (err) throw err;
        res.render('Dash', { result: result });
    });
});


app.post('/dashboard', function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }

    var name = req.body.name;
    var email = req.body.email;
    var pwd = req.body.password;
    var role = req.body.role;
    var addedby = req.session.user.email;
    
    var CheckData = "INSERT INTO tbluser (name, email, password, role, addedby) VALUES (?, ?, ?, ?, ?)";
    conn.query(CheckData, [name, email, pwd, role, addedby], function(err, result) {
        if (err) throw err;
        res.redirect('/dashboard');
    });
});

app.listen(3000, function() {
    console.log('Server Running at 3000 PORT');
});
