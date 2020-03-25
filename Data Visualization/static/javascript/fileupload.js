$(document).ready(function () {

    function show_alert(message, alert_type) {
        $('#alert_wrapper').html(`<div class="alert ${alert_type} alert-dismissable">${message}<button class="close" type="button" aria-hidden="true" data-dismiss="alert">&times;</button></div>`);
        $(".alert").fadeTo(5000, 500).slideUp(500, function () {
            $(".alert").remove();
        });
    }

    function send_response(url, data) {
        return fetch(`${window.origin}/${url}`, {
            method: "POST",
            credentials: "include",
            body: data,
            cache: "no-cache"
        });
    }

    $('.custom-file-input').on({
        change: function (element) {
            var file_object = element.target.files[0];
            var allowed_file_size = 1024 * 1024 * 4;
            if (file_object !== undefined) {
                var file_name = file_object.name;
                var file_size = file_object.size;
                if (file_size > allowed_file_size) {
                    show_alert('File is too big to handle', 'alert-warning');
                    return false;
                }
                if (file_name.indexOf('.') > -1) {
                    extension = file_name.split('.').pop();
                    if (extension !== 'csv') {
                        show_alert('This file extension is not allowed.', 'alert-warning');
                        return false;
                    }
                    $(this).next('.custom-file-label').html(file_name);
                    $('#title').html("");
                    $("#data_row").html("");
                    $('.alert').remove();
                } else {
                    show_alert('This file extension is not allowed.', 'alert-warning');
                }
            }
        }
    });

    $('#upload_btn').on({
        click: function () {
            var fileUpload = $("#file_input").get(0);
            const files = fileUpload.files[0];
            if (files === undefined) {
                show_alert(`Select a file first.`, `alert-danger`);
                return false;
            }
            const file = new FormData();
            file.append("file", files, files.filename);
            send_response('__verify_upload__', file).then(function (response) {
                if (response.status !== 200) {
                    show_alert(`Could not save the file. Please try after some time.`, `alert-danger`);
                } else if (response.status === 200) {
                    response.json().then(function (data) {
                        let col = data['col'];
                        let row = data['row'];
                        if (row == 0 || col == 0) {
                            show_alert('We cannot read the file or you uploaded an empty file.', 'alert-warning');
                            return false;
                        }
                        const content = data['data']
                        const title = data['titles'];
                        let table_head;
                        for (var i = 0; i < title.length; i++) {
                            table_head += `<th scope="col">${title[i]} </th>`;
                        }
                        $('#title').html(table_head);
                        let table_row;
                        for (var i = 0; i < row; i++) {
                            table_row += `<tr>`;
                            for (var j = 0; j < col; j++) {
                                table_row += `<td> ${content[j][i]} </td>`;
                            }
                            table_row += `</tr>`;
                        }
                        $("#data_row").html(table_row);
                        $("#exampleModalCenter").modal('show');
                    });
                } else if (response.status === 500) {
                    show_alert(`Opps! It's our fault.`, `alert-danger`);
                }
            });
        }
    });

    $("#datamodalclose").on({
        click: function () {
            $("#file_input").val("");
            window.location.href = `${window.origin}/fileuploadcomplete`;
        }
    });

});
