var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = module.exports = require('http');
var mongod = require('mongodb');
envconfig = require("./prodConfig.json");
var MongoClient = mongod.MongoClient;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var cronJob = require('./class/task');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//create a server object:
http.createServer(app).listen(9000); //the server object listens on port 8080
init();

// mongodb connection
async function init() {
  var url = 'mongodb+srv://' + envconfig.DB_USERNAME + ':' + envconfig.DB_PASSWORD + '@' + envconfig.DB_HOST + '/' + envconfig.DB_NAME + '?retryWrites=true&w=majority';

  dclient = module.exports = await new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  dclient.connect(err => {
    console.log('connected');
    db = module.exports = dclient.db(envconfig.DB_NAME);
    cronJob.setCronForEthereum();
  })
}

process.on('unhandledRejection', (reason, p) => {
  console.log(reason, ' ::::::: Unhandled Rejection at Promise ::::::: ', p);
});
process.on('uncaughtException', err => {
  console.log(err, ' :::::::: Uncaught Exception thrown :::::');
});
//connect to mongoDB
// const uri = 'mongodb://localhost:27017/zomato';

// const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   family: 4
// }

// const connectWithDB = () => {
//   mongoose.connect(uri, options, (err, db) => {
//     if (err) console.error(err);
//     else console.log("database connection")
//   })
// }

// connectWithDB()

module.exports = app;
