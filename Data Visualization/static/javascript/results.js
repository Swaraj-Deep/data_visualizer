$(document).ready(function () {
    function show_alert(id, message, alert_type) {
        $(`#${id}`).html(`<div class="alert ${alert_type} alert-dismissable">${message}<button class="close" type="button" aria-hidden="true" data-dismiss="alert">&times;</button></div>`);
        $(".alert").fadeTo(5000, 500).slideUp(500, function () {
            $(".alert").remove();
        });
    }

    function get_data(url, data) {
        return fetch(`${window.origin}/${url}`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(data),
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        });
    }
    var data = JSON.parse(localStorage.getItem('data_packet'));
    get_data('__return_filter_data__', data).then(function (response) {
        if (response.status !== 200) {
            show_alert(`alert-wrapper`, `Some error occured. Please reload the page.`, `alert-danger`);
            return false;
        } else if (response.status === 200) {
            response.json().then(function (data) {
                let col = data['col'];
                let row = data['row'];
                if (row == 0 || col == 0) {
                    show_alert(`alert-wrapper`, 'Your data responded with an empty dataset when we tried to apply this filter.', 'alert-danger');
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
            });
        } else {
            show_alert(`alert-wrapper`, `Opps! It's our fault.`, `alert-danger`);
            return false;
        }
    });

});