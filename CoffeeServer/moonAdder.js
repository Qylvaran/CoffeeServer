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

module.exports = function (curMonthD) {
    //to become a list of sundays for the json object
    var curMonthJ = [];
    
    //date object of the month to populate curMonthJ with
    console.log(curMonthD.toDateString());
    
    var iterD = new Date(curMonthD.toDateString());
    iterD.setDate(1);
    
    console.log(iterD.toDateString());
    for (var m = curMonthD.getMonth(); m === iterD.getMonth(); iterD.setDate(iterD.getDate() + 1)) {
        if (iterD.getDay() === 0) {
            curMonthJ[curMonthJ.push(JSON.parse(JSON.stringify(oneDay))) - 1].date = iterD.getDate();
            console.log(iterD.getDate());
        };
    };
    return curMonthJ;
};