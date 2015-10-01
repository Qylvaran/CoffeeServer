/// <reference path="./volunteerLine.ts" />

var setMonth = function (month) {
    $('.signUp').html('');
    $.getJSON('month/' + month, function (mon) {
        for (var i = 0; i < mon.length; i++) {
            $('.signUp').append('<div class="list-group-item row"><div class="col-sm-2 text-right"><h2>' + month.slice(5) + ' ' + mon[i].date + ':</h2></div><div class="col-sm-10" id="vgrp' + i + '"></div></div>');
            $.each(mon[i].volunteers, function (j, vol) {
                var thisId = 'line' + i + '-' + j;
                if (j > 0) { $('#vgrp' + i).append('<br>'); }
                $('#vgrp' + i).append($('<div></div>').attr({ "id": thisId, "class": "row" }));
                if (vol.name === '') {
                    //place form here
                    addEntryLine(thisId, month, i, j);
                } else {
                    //place data here
                    addDisplayLine(thisId, month, i, j, vol);
                }
            });
        }
    });
}