var jsonfile = require('jsonfile');
jsonfile.spaces = '\t';

var dataFile = 'dbase.json';
var outFile = 'dbase.json';
var liveDB = jsonfile.readFileSync(dataFile);

//a sunday of volunteers
var oneDay = {
    "date": 1,
    "volunteers": [
        {
            "name": "",
            "phone": "",
            "email": ""
        },
        {
            "name": "",
            "phone": "",
            "email": ""
        }
    ]
}

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//to become a list of sundays for the json object
var curMonthJ = [];

//date object of the month to populate curMonthJ with
var curMonthD = new Date(2015,11);
var curMonthS = '' + curMonthD.getFullYear() + '-' + monthNames[curMonthD.getMonth()];

console.log(curMonthS);
console.log(curMonthD.toDateString());

var iterD = new Date(curMonthD.toDateString());
iterD.setDate(1);

console.log(iterD.toDateString());
for (var m = curMonthD.getMonth(); m === iterD.getMonth(); iterD.setDate(iterD.getDate()+1)){
    if (iterD.getDay() === 0) {
        curMonthJ[curMonthJ.push(JSON.parse(JSON.stringify(oneDay))) - 1].date = iterD.getDate();
        console.log(iterD.getDate());
    };
};

liveDB[curMonthS] = curMonthJ;
jsonfile.writeFile(outFile, liveDB);