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
    curMonthD.setDate(1);
    
    for (var m = curMonthD.getMonth(); m === curMonthD.getMonth(); curMonthD.setDate(curMonthD.getDate() + 1)) {
        if (curMonthD.getDay() === 0) {
            curMonthJ[curMonthJ.push(JSON.parse(JSON.stringify(oneDay))) - 1].date = curMonthD.getDate();
        };
    };
    return curMonthJ;
};