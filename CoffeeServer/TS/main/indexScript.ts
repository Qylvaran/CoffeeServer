import vEntry = require('./volunteerEntry');
var setMonth = function (month: string) {
    $('.signUp').html('');
    var volunteers: vEntry[];
    volunteers = [];
    $.getJSON('month/' + month, function (mon) {
        for (var i = 0; i < mon.length; i++) {
            $('.signUp').append('<div class="list-group-item row"><div class="col-sm-2 text-right"><h2>' + month.slice(5) + ' ' + mon[i].date + ':</h2></div><div class="col-sm-10" id="vgrp' + i + '"></div></div>');
            $.each(mon[i].volunteers, function (j, vol) {
              if (j > 0) { $('#vgrp' + i).append('<br>'); }
              volunteers.push(new vEntry(month, i, j, vol));
            });
        }
    });
}
$(function () {
    $.getJSON('month', function (monthList) {
        $.each(monthList, function (index, mon) {
            $('#month select').append($('<option></option>').val(mon).html(mon));
        });
        setMonth($('#month select').val());
    });
    $('select').change(function () {
        setMonth($(this).val());
    })
});
