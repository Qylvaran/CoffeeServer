var addEntryLine = function (id, month, week, volunteer) {
    $('#' + id).html('<form class="form-inline" role="form">' +
        '<div class="form-group col-sm-3"><label class="sr-only" for="name' + id + '">Name:</label><input type="text" name="name" class="form-control" placeholder="Name" id="name' + id + '"></div>' +
        '<div class="form-group col-sm-3"><label class="sr-only" for="phone' + id + '">Phone:</label><input type="tel" name="phone" class="form-control" placeholder="Phone Number" id="phone' + id + '"></div>' +
        '<div class="form-group col-sm-3"><label class="sr-only" for="email' + id + '">E-mail:</label><input type="email" name="email" class="form-control" placeholder="Email" id="email' + id + '"></div>' +
        '<div class="col-sm-2"><button type="submit" class="btn btn-success btn-block"><span class="glyphicon glyphicon-heart"></span> Volunteer</button></div>' +
        '</form>');
    $('#' + id + ' form').one('submit', function (event) {
        event.preventDefault();
        var formData = {};
        $.each($('#' + id + ' form').serializeArray(), function (index, pair) {
            formData[pair.name] = pair.value;
        });
        $.post('volunteer/' + month + '/' + week + '/' + volunteer, formData, function (data, status) {
            console.log(formData);
            console.log(status);
            if (status === 'success') {
                addDisplayLine(id, month, week, volunteer, formData);
            }
        });
    });
}
var addDisplayLine = function (id, month, week, volunteer, volobj) {
    $('#' + id).html('<form class="form-inline"><div class="col-sm-9 text-left"><strong>' + volobj.name + '</strong></div><div class="col-sm-2"><button type="submit" class="btn btn-danger btn-block"><span class="glyphicon glyphicon-remove"></span> Cancel</button></div></form>');
    $('#' + id + ' form').one('submit', function (event) {
        event.preventDefault();
        $.post('unvolunteer/' + month + '/' + week + '/' + volunteer, function (data, status) {
            console.log(status);
            if (status === 'success') {
                addEntryLine(id, month, week, volunteer);
            }
        });
    });
}
