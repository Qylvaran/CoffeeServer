function fillTable(){
  var tablef = document.createElement('tbody');
  $.getJSON('month/', function (monthList) {
    $.each(monthList, function (index, mon) {
      $.getJSON('month/' + mon, function (mdata) {
        for(var i:number = 0; i < mdata.length; i++) {
          var row = document.createElement('tr');
          $(row).append('<td>' + mon + ' ' + mdata[i].date + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[0].name + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[0].phone + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[0].email + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[1].name + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[1].phone + '</td>');
          $(row).append('<td>' + mdata[i].volunteers[1].email + '</td>');
          $(tablef).append(row);
        }
      });
    });
  });
  $('#bigtable').append(tablef);
};

function addEmailModifier(){

};

$(function(){
  fillTable();
});
