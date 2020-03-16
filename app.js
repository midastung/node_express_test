var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var routes = require('./routes/index');
var users = require('./routes/users');
const session = require('express-session');

//DataBase
var mysql = require('mysql');
var con = mysql.createPool({
  host: 'kilincat.servebeer.com',
  port: '5271',
  user: 'firekilin',
  password: '5270', 
  database: 'washing_machine',
});

con.getConnection(function(err) {
  if (err) {
      console.log('connecting error');
      return;
  }
  console.log('connecting success');
});

// var query = function(sql, values) {
//   return new Promise((resolve, reject) => {
//     myPool.getConnection(function (err, connection) {
//       if (err) {
//         console.log(err);
//         reject(err);
//       }
//       else {
//         connection.query(sql, values, (err, rows) => {
//         if (err) {
//           console.log(err);
//           reject(err);
//         }
//         else resolve(rows);
//         connection.release();
//         });
//       }
//     });
//   });
// };

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// db state
app.use(function(req, res, next) {
  req.con = con;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
      message: err.message,
      error: {}
  });
});

module.exports = app;


