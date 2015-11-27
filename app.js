var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs_mate = require('ejs-mate');

var app = express();
//set view directory
app.set('views', path.join(__dirname, 'views'));
//set view engine
app.set('view engine', 'html');
app.engine('html', ejs_mate);
app.locals._layoutFile = 'layout.html';
//set middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//set static path
app.use('/webapp/wallet/res', express.static(path.join(__dirname, 'res')));

//catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers
// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }
// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

//set http handler
// app.get('/webapp/wallet/:action',function(req, res, next){
//   var action = req.params.action;

//     res.render(action, {});
// });

var routes = require('./routes/wallet');

app.use('/webapp/wallet', routes);

module.exports = app;
