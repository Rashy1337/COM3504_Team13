var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser'); // new body parser

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var plantsRouter = require('./routes/plants'); // new plants router

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images/uploads', express.static(path.join(__dirname, '/public/images/uploads')));
app.use(bodyParser.urlencoded({ extended: false })) // new body parser
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/plant', plantsRouter); // new plants router

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// server listening on port 3000
var port = `3000` || process.env.PORT;

app.set('port', port);

var server = app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
