var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.port || 1337;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/volunteer/:year/:month/:day/:v', function (req, res) {
    console.log(req.params.year + '-' + req.params.month + '.json ' + req.params.day + ', volunteer ' + req.params.v + ' update requested.');
    console.log(req.body);
});

app.use(express.static(path.join(__dirname, 'static'))).listen(port, function () {
    console.log("Server listening on port %s", port);
});