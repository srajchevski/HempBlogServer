var express    = require('express');
var path = require('path');
var fs = require('fs');
//parser for data sent to the server
//available through req.body
var bodyParser = require('body-parser');
//cookie parser
var cookieParser = require('cookie-parser');
//library for session
var session = require('express-session');
//mongoose for mongodb
var mongoose=require("mongoose");
//create app with express
var app        = express();         // our app
//port num
var port = process.env.PORT || 8080;

//connect to db
mongoose.connect("mongodb://srajchevski:S121R@ds013405.mlab.com:13405/hempmedico_blog");
//callback model ES6
mongoose.Promise = global.Promise;

var staticRoot = path.join(__dirname, 'public');
app.set('port', port);
app.use(express.static(staticRoot));

//app.use(function()) is used at every request
app.use(bodyParser.json()); // library for parsing json
app.use(bodyParser.urlencoded({ extended: true })); // library for parsing url encoding
app.use(function(req, res, next){
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk){ req.text += chunk });
        req.on('end', next);
    } else {
        next();
    }
});
app.use(cookieParser()); //parsanje piškotkov



//app.use(express.static('server/images'));
//http://expressjs-book.com/index.html%3Fp=128.html
app.use(session({secret: "MojeGeslo",saveUninitialized: true,resave: true}));
//now we're able to use req.session to store session data

//example func. executed on every request
/*app.use(function(req,res,next){
    var accept = req.accepts('html', 'css', 'json', 'xml');
    if(accept !== 'html'){
        return next();
    }

    // if the request has a '.' assume that it's for a file, move along
    var ext = path.extname(req.path);
    if (ext !== ''){
        return next();
    }
    fs.createReadStream(staticRoot + 'index.html').pipe(res);
});*/

//other domain requests
app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    //res.header("Access-Control-Allow-Origin", "http://164.8.230.121:5555");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "PUT,GET,DELETE,POST");//GET, POST, OPTIONS, PUT, PATCH, DELETE
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});



//our controller address
var post=require('./server/routes/post');
app.use('/posts', post);
var comment=require('./server/routes/comments');
app.use('/comments', comment);
var question=require('./server/routes/questions');
app.use('/questions', question);
var book=require('./server/routes/book');
app.use('/books', book);
var products=require('./server/routes/products');
app.use('/products', products);
var testimony=require('./server/routes/testimonies');
app.use('/testimonies', testimony);

// LISTEN
// =============================================================================
app.listen(port);
console.log('Server running on: ' + port);