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

//send reminder emails Tuesday morning
var j = schedule.scheduleJob('30 10 * * 2', function () {
    var d = new Date();
    console.log('starting email section');
    d.setDate(d.getDate() + 3);
    var thisMonthDB = liveDB[d.getFullYear() + '-' + monthNames[d.getMonth()]];
    console.log(thisMonthDB);
    if (d.getDay() != 0) {
        console.log('Wrong day of the week: ' + d.getDay());
    }
    var i = 0;
    var index = 0;
    while (i < thisMonthDB.length) {
        if (thisMonthDB[i].date == d.getDate()) { index = i; }
        i++;
    }
    if (thisMonthDB[index].date != d.getDate()) {
        console.log('Failed to find correct Sunday in DB.');
    }
    var nxtSun = thisMonthDB[index];
    var emails = [];
    var voldata = [];
    var voldatum = [];
    for (var k = 0; k < nxtSun.volunteers.length; k++) {
        if (nxtSun.volunteers[k].name != '') {
            voldatum = [];
            for (var l in nxtSun.volunteers[k]) {
                voldatum.push(nxtSun.volunteers[k][l]);
            }
            voldata.push(voldatum.join('\n'));
        }
        if (nxtSun.volunteers[k].email != '') {
            emails.push(nxtSun.volunteers[k].email);
        }
    }
    if (voldata.length == 0) {
        console.log('No Volunteers! Panic!');
    } else {
        if (emails.length > 0) {
            var mailOptions = {
                from: 'OPPC Fellowship <oppccoffee@gmail.com>', // sender address
                to: emails.join(', '), // list of receivers
                subject: d.getMonth() + ' ' + d.getDate() + ' Coffee Hour Service', // Subject line
                text: 'Thank you for volunteering to help serve coffee and cookies this Sunday. Please arrive by 9:30 am to help set up, and bring a total of ' + 8 / voldata.length + '-' + 10 / voldata.length + ' dozen cookies to serve. If you have any questions, feel free to reply to this email.', // plaintext body
            };
            transporter.sendMail(MailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }
        var reportMailOptions = {
            from: 'OPPC Fellowship <oppccoffee@gmail.com>', // sender address
            to: 'xllei2009@gmail.com',
            subject: 'CoffeeServer Report',
            text: 'The following have signed up for coffee hour this upcoming Sunday:\n\n' + voldata.join('\n')
        }
        transporter.sendMail(reportMailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    }
});

app.post('/volunteer/:month/:week/:v', function (req, res) {
    //update a volunteer's information
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