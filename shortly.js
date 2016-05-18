var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Use the session middleware 
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
 

app.get('/', function(req, res, next) {
  if (req.sessionID) {
    // console.log('this is inside the if statement !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    // console.log(req.session.id, 'this is undefined but why???????????????');
    // console.log(req.session, 'this is this is req.session but why???????????????');
    res.render('index');
  } else {
    res.redirect('/login');
  }
});

app.get('/create', function(req, res) {
  res.redirect('/login');
  // res.render('index');
});

app.get('/links', function(req, res) {
  res.redirect('/login');
  // res.render('index');
  // Links.reset().fetch().then(function(links) {
  //   res.status(200).send(links.models);
  // });
});





app.post('/links', function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.redirect('/');
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', (req, res) => {

  res.render('login');
});


app.post('/login', (req, res) => {
  new User({ username: req.body.username }).fetch().then(function(userInfo) {
    if (userInfo) {
      bcrypt.compare((req.body.password), userInfo.get('password'), function(err, isUser) {
        if (err) {
          return console.log('not in database');
        }
        if (!isUser) {
          res.redirect('/login');
        } else {
          req.session.regenerate(function() {
            req.session.user = req.body.username;
          });
          res.redirect('/');
        }
      });
    } else {
      res.redirect('/login');
    }
  });
});






app.get('/signup', (req, res) => {

  res.render('signup');
});



app.post('/signup', (req, res) => {

  bcrypt.hashAsync(req.body.password, null, null)
    .then (hash => {
      Users.create({
        username: req.body.username,
        password: hash
      });
    })
    .then(function(userInfo) {
      res.redirect('/');
      // response.redirect('/restricted');
    });
});

app.get('/logout', (req, res) => {
  console.log('i am post request!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  req.session.destroy(err => err);
  res.end();
  // res.render('login');
  res.redirect('/');
});

  // console.log(req.body.username, '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
  //   console.log(req.body.password, '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  // res.render('signup');
  // new User({ username: req.body.username }).fetch().then(function(found) {
  //   if (false) { //found
  //     res.redirect('/login');
  //     // res.status(200).send(found.attributes);
  //   } else {
  //     Users.create({
  //       username: req.body.username,
  //       password: req.body.password
  //     })
  //     .then(function(pies) {
  //       res.status(200).end('urMomBakesPies');
  //     });
  //   }
  // });
  // res.end('do you hear me');



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 1600 ');
app.listen(1600);
