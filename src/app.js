var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var layouts = require('ejs-layouts');
var methodOverride = require('method-override');

//setting the view engine, choosing the port, choosing a folder for the views
app.set('port', process.env.PORT || 8080);
app.set('views', appPath + '/views');
app.set('view engine', 'ejs');

//defining what the server will use as default settings
app.use(layouts.express);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(expressSession({
  secret: 'r409l4210u',
  resave: false,
  saveUninitialized: true,
  cookie : {
    httpOnly : true,
    secure : true,
    maxAge : null
  }
}));
app.use('/', express.static(appPath + '/public'));
app.use('/modules', express.static(appPath + '/node_modules'));

module.exports = app;
