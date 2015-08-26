

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
