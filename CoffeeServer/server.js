var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var moonAdder = require('./moonAdder.js');
var app = express();
var port = process.env.port || 1337;

jsonfile.spaces = '\t';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var dataFile = 'dbase.json';
var liveDB;
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

fs.stat(dataFile, function (err, stat) {
    if (err) {
        var now = new Date();
        var monthString = '' + now.getFullYear() + '-' + monthNames[now.getMonth()];
        var startDB = {};
        startDB[monthString] = moonAdder(now);
        console.log(startDB);//debugging
        jsonfile.writeFileSync(dataFile, startDB);
    }
    liveDB = jsonfile.readFileSync(dataFile);
});

app.post('/volunteer/:month/:week/:v', function (req, res) {
    console.log(req.params.month + ' week ' + req.params.week + ', volunteer ' + req.params.v + ' update requested.');
    console.log(req.body);
    liveDB[req.params.month][req.params.week].volunteers[req.params.v] = req.body;
    res.sendStatus(200);
    jsonfile.writeFile(dataFile, liveDB);
});

app.post('/unvolunteer/:month/:week/:v', function (req, res) {
    //Remove a volunteer entry from the database
    liveDB[req.params.month][req.params.week].volunteers[req.params.v] = {"name": "", "phone": "", "email": ""};
    res.sendStatus(200);
    jsonfile.writeFile(dataFile, liveDB);
});

app.get('/month', function (req, res) {
    //List of valid months for dropdown
    res.send(Object.keys(liveDB));
});

app.get('/month/:m', function (req, res) {
    //One month's whole object
    res.send(liveDB[req.params.m]);
});

app.use(express.static(path.join(__dirname, 'static'))).listen(port, function () {
    console.log("Server listening on port %s", port);
});