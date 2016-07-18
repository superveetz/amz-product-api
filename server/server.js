var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require('fs');
var amazon = require('amazon-product-api');

// middleware
var bodyParser = require('body-parser');
app.use(express.static(__dirname + '/../client/src'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '\\views');
// index
app.get('*', function (req, res) {
    res.render('index');
});

var allItems = [];

// amazon
var client = amazon.createClient({
  awsId: "AKIAIV3RK4Y2DG3UYBLQ",
  awsSecret: "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",
  awsTag: "aldivi-20"
});

app.post('/api/locale-options', function (req, res) {
    var readable = fs.createReadStream(__dirname + '/configs/ca-locale-item-search.json');
    readable.pipe(res);
});

// * Item Look-Up * - ...
app.post('/api/browse-node', function (req, res) {

    var options = req.body;
    console.log(req.body);
    
    var search = {};
    for(var key in options) {
        if (options[key]) search[key] = options[key];
    }

    var responseObj = {
        products: [],
        totalPages: ''
    };

    console.log(search);

    client.browseNodeLookup(search)
    .then(function(results) {
        console.log(JSON.stringify(results));
        res.send(results);
    }).catch(function(err) {
      console.log(err);
      res.send(err);
    });
});

// * Item Look-Up * - ...
app.post('/api/item-look-up', function (req, res) {

    var options = req.body;
    console.log(req.body);
    
    var search = {};
    for(var key in options) {
        if (options[key]) search[key] = options[key];
    }

    var responseObj = {
        products: [],
        totalPages: ''
    };

    console.log(search);

    client.itemLookup(search)
    .then(function(results) {
        console.log(JSON.stringify(results));
        res.send(results);
    }).catch(function(err) {
      console.log(err);
      res.send(err);
    });
});

// * Item Search * - Search item with body params
app.post('/api/item-search', function (req, res) {

    console.log('req.body', req.body);
    var options = req.body;
    
    var search = {};
    for(var key in options) {
        if (options[key]) search[key] = options[key];
    }

    var responseObj = {
        products: [],
        totalPages: ''
    };

    client.itemSearch(search, function(err, results, response) {
        // console.log(results);  // products 
        // console.log(response); // response (containing TotalPages, TotalResults, MoreSearchResultsUrl and so on)
        if (err) {
            var error;
            if (err[0] && err[0]['Error']) error = err[0]['Error']
            else if (err['Error']) error = err['Error']
            else error = err;
            error.statusCode = error.status || 500;
            res.status(error.statusCode).json(error[0]);
        } else {
            responseObj.products = results;
            responseObj.totalPages = parseInt(response['TotalPages']);
            res.send(responseObj);
        }
    });
});

var port = 3030;
var ip = 'localhost';
app.listen(port, ip, function () {
    console.log('listening on ' + ip + ":" + port);
});