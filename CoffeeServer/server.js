var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var fs = require('fs');
var moonAdder = require('./moonAdder.js');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var app = express();
var port = process.env.port || 1337;

jsonfile.spaces = '\t';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var transporterFile = 'tpfile.json';
var transporterObj = jsonfile.readFileSync(transporterFile);
var transporter = nodemailer.createTransport(transporterObj);

var dataFile = 'dbase.json';
var liveDB;
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

fs.stat(dataFile, function (err, stat) {
    //create json database if missing
    if (err) {
        var now = new Date();
        var monthString = '' + now.getFullYear() + '-' + monthNames[now.getMonth()];
        var startDB = {};
        startDB[monthString] = moonAdder(now);
        console.log('Database not present. Initializing with ' + monthString);
        jsonfile.writeFileSync(dataFile, startDB);
    }
    liveDB = jsonfile.readFileSync(dataFile);
});

var j = schedule.scheduleJob('0 8 * * 4', function () {
    var d = new Date();
    d.setDate(d.getDate() + 3);
    var thisMonthDB = liveDB[d.getFullYear() + '-' + d.getMonth()];
    if (d.getDay() != 0) {
        console.log('Wrong day of the week: ' + d.getDay());
    }
    var i = 0;
    while (i < thisMonthDB.length) {
        if (thisMonthDB[i].date == d.getDate()) { break; }
    }
    if (thisMonthDB[i].date != d.getDate()) {
        console.log('Failed to find correct Sunday in DB.');
    }
    var nxtSun = thisMonthDB[i];
    var mailOptions = {
        from: 'OPPC Fellowship <joseph.a.nichols@gmail.com>', // sender address
        to: '', // list of receivers
        subject: d.getMonth() + ' ' + d.getDate() + ' Coffee Hour Service', // Subject line
        text: 'Thank you for volunteering to help serve coffee and cookies this Sunday. Please arrive by 9:30 am to help set up, and bring a total of 8-10 dozen cookies to serve (if two households have signed up, you may each bring 4-5 dozen. If you have any questions, feel free to reply to this email.', // plaintext body
    };
    var emails = [];
    for (var k = 0; k < nxtSun.volunteers.length; k++) {
        if (nxtSun.volunteers[k].email != '') {
            emails.push(nxtSun.volunteers[k].email);
        }
    }
    mailOptions.to = emails.join(', ');
    if (mailOptions.to == '') {
        console.log('No Volunteers! Panic!')
    }
    transporter.sendMail(mailOptions);
});

app.post('/volunteer/:month/:week/:v', function (req, res) {
    //update a volunteer
    console.log('Update requested to ' + req.params.month + ' week ' + req.params.week + ', volunteer ' + req.params.v + '.');
    console.log(req.body);
    liveDB[req.params.month][req.params.week].volunteers[req.params.v] = req.body;
    res.sendStatus(200);
    jsonfile.writeFile(dataFile, liveDB);
});

app.post('/unvolunteer/:month/:week/:v', function (req, res) {
    //Remove a volunteer entry from the database
    console.log('Request to remove existing volunteer from ' + req.params.month + ' week ' + req.params.week + ', volunteer ' + req.params.v + '.');
    var removeData = liveDB[req.params.month][req.params.week].volunteers[req.params.v];
    console.log(removeData);
    liveDB[req.params.month][req.params.week].volunteers[req.params.v] = { "name": "", "phone": "", "email": "" };
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
    //start listening
    console.log("Server listening on port %s", port);
});