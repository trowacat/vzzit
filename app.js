var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');
var clipboard = require('clipboard');

const HTTP_PORT = process.env.PORT || 3000;

// grab the url model
var Url = require('./models/url');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/api/shorten', function (req, res) {
  var longUrl = req.body.url;
  var shortUrl = '';

  // check if url already exists in database
  Url.findOne({ long_url: longUrl }, function (err, doc) {
    if (doc) {
      shortUrl = config.webhost + base58.encode(doc._id);

      // the document exists, so we return it without creating a new entry
      res.send({ 'shortUrl': shortUrl });
    } else {
      // since it doesn't exist, let's go ahead and create it:
      var newUrl = Url({
        long_url: longUrl
      });

      // save the new link
      newUrl.save(function (err) {
        if (err) {
          console.log(err);
        }

        shortUrl = config.webhost + base58.encode(newUrl._id);

        res.send({ 'shortUrl': shortUrl });
      });
    }

  });

});

app.get('/:encoded_id', function (req, res) {

  var base58Id = req.params.encoded_id;

  var id = base58.decode(base58Id);

  // check if url already exists in database
  Url.findOne({ _id: id }, function (err, doc) {
    if (doc) {
      if (!!doc.long_url && !!doc.long_url.trim()) { //Check if url is not blank
        doc.long_url = doc.long_url.trim(); //Removes blank spaces from start and end
        if (!/^(https?:)?\/\//i.test(doc.long_url)) { //Checks for if url doesn't match either of: http://example.com, https://example.com AND //example.com
          doc.long_url = 'http://' + doc.long_url; //Prepend http:// to the URL
        }
      } else {
        res.redirect(doc.long_url);
      }
    } else {
      res.redirect(config.webhost);
    }
  });

});

app.get('', function (req, res) {
  res.redirect('/');
})

var server = app.listen(HTTP_PORT, function () {
  console.log('Server listening on port: ' + HTTP_PORT);
});
