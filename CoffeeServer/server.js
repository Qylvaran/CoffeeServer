﻿var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
// var multer = require('multer');
// var upload = multer();
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
var arcFile = 'dbArchive.json';
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

fs.stat(arcFile, function (err, stat) {
    //create archive file if missing
    if (err) {
        var startArc = {};
        console.log('Archive not present. Initializing.');
        jsonfile.writeFileSync(arcFile, startArc);
    }
});

//send reminder emails Tuesday morning
var j = schedule.scheduleJob('30 10 * * 2', function () {
    var d = new Date();
    console.log('starting email section');
    d.setDate(d.getDate() + 5);
    var m = d.getFullYear() + '-' + monthNames[d.getMonth()];
    if (d.getDay() != 0) {
        console.log('Wrong day of the week: ' + d.getDay());
    }
    var i = 0;
    var index = 0;
    while (i < liveDB[m].length) {
        if (liveDB[m][i].date == d.getDate()) { index = i; }
        i++;
    }
    if (liveDB[m][index].date != d.getDate()) {
        console.log('Failed to find correct Sunday in DB.');
    }
    var nxtSun = liveDB[m][index];
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
    }
    var mailOptions = prepMail(m, index);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
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
});

function prepMail(m, w){
  var thisSun = liveDB[m][w];
  var emails = [];
  var volcount = 0;
  for (var k = 0; k < thisSun.volunteers.length; k++) {
      if (thisSun.volunteers[k].name != '') {
        volcount++;
      }
      if (thisSun.volunteers[k].email != '') {
          emails.push(thisSun.volunteers[k].email);
      }
  }
  emails.push('xllei2009@gmail.com');
  var mailText = '';
  if (thisSun.mailOverride) {
    mailText = thisSun.mailOverride;
  } else {
    mailText = 'Hello, and thank you for volunteering to help serve coffee and cookies this Sunday. Please arrive by 9:30 am to help set up, and bring a total of ' + 8 / ((volcount>0)? volcount:1) + '-' + 10 / ((volcount>0)? volcount:1) + ' dozen cookies to serve. You will also be helping to clean up afterwards. \n\nPlease reply to this email to confirm that you have received it, and so that I may answer any questions you have.\n\nBlessings,\nLaurel'
  }
  return {
      from: 'OPPC Fellowship <oppccoffee@gmail.com>', // sender address
      to: emails.join(', '), // list of receivers
      subject: m.slice(5) + ' ' + thisSun.date + ' Coffee Hour Service', // Subject line
      text: mailText // plaintext body
  };
}

app.get('/admin/getmail/:month/:week', function (req, res) {
  res.send(prepMail(req.params.month, req.params.week));
});

app.post('/admin/setmail/:month/:week', function (req, res) {
  //Override weekly email
  console.log(req.body);
  liveDB[req.params.month][req.params.week].mailOverride = req.body.emailText;
  res.sendStatus(204);
  jsonfile.writeFile(dataFile, liveDB);
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

app.post('/archive', function (req, res) {
  //Retire oldest month in db to archives
  var oldMonth = Object.keys(liveDB)[0];
  console.log('Removing ' + oldMonth + ' from database.');
  var arcData = liveDB[oldMonth];
  jsonfile.readFile(arcFile, function(err, obj) {
    obj[oldMonth] = arcData;
    jsonfile.writeFileSync(arcFile, obj);
    delete liveDB[oldMonth];
    jsonfile.writeFile(dataFile, liveDB);
  });
  res.sendStatus(205);
});

app.post('/addmonth', function (req, res) {
  var dbMonths = Object.keys(liveDB);
  var dbMLast = dbMonths[dbMonths.length - 1];
  var monthEnd = new Date(dbMLast.slice(0,4), monthNames.indexOf(dbMLast.slice(5)) + 1, 1);
  var monthString = '' + monthEnd.getFullYear() + '-' + monthNames[monthEnd.getMonth()];
  liveDB[monthString] = moonAdder(monthEnd);
  res.sendStatus(205);
  jsonfile.writeFile(dataFile, liveDB);
})

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
