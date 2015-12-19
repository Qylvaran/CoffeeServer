function fillTable(){
  var tablef = document.createElement('tbody');
  $.getJSON('month/', function (monthList) {
    $.each(monthList, function (index, mon) {
      $.getJSON('month/' + mon, function (mdata) {
        for(var i:number = 0; i < mdata.length; i++) {
          var row = document.createElement('tr');
          $(row).attr({
            "class": "week",
            "data-month": mon,
            "data-week": i
          });
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

function addEmailModifier(m, w){
  console.log(m + ' ' + w);
  $.getJSON('admin/getmail/'+m+'/'+w, function(mailOptions){
    console.log(mailOptions);
    $('#eSubj').text(mailOptions.subject);
    $('#eAddr').text('To: '+mailOptions.to);
    $('#eTxt').val(mailOptions.text);
    $('#eForm').attr("action", "admin/setmail/"+m+"/"+w);
  });
};

$(function(){
  fillTable();
  $('#bigtable').on('click', 'tr.week', function(){
    var m = $(this).attr("data-month");
    var w = $(this).attr("data-week");
    addEmailModifier(m, w);
    $("#emailModal").modal();
  });
  $("#eForm").submit(function(event){
    $("#emailModal").modal("hide");
  });
});
