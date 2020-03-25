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

    let data = {
        'data': 'Send Titles'
    };
    get_data('__return_titles__', data).then(function (response) {
        if (response.status !== 200) {
            show_alert(`alert-wrapper`, `Some error occured. Please reload the page.`, `alert-danger`);
            return false;
        } else if (response.status === 200) {
            response.json().then(function (data) {
                let dropdown_list = ``;
                let titles = data['titles'];
                // titles_main = titles;
                for (var i = 0; i < titles.length; i++) {
                    dropdown_list += `<div class="custom-checkbox form-check form-check-inline my-2 font-weight-bold">
                    <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" value="${titles[i]}">${titles[i]}
                    </label>
                    </div>`;
                }
                $("#sel_col").html(dropdown_list);
            });
        } else {
            show_alert(`alert-wrapper`, `Opps! It's our fault.`, `alert-danger`);
            return false;
        }
    });

    data = {
        'data': 'Send Data'
    };

    get_data('__return_data__', data).then(function (response) {
        if (response.status !== 200) {
            show_alert(`alert-wrapper`, `Some error occured. Please reload the page.`, `alert-danger`);
            return false;
        } else if (response.status === 200) {
            response.json().then(function (data) {
                for (keys in data) {
                    titles = data[keys];
                    let dropdown_list = `<select class="custom-select my-2" multiple="multiple">`;
                    dropdown_list += `<option selected>${keys}</option>`;
                    for (var i = 0; i < titles.length; i++) {
                        dropdown_list += `<option value="${i}">${titles[i]}</option>`;
                    }
                    dropdown_list += `</select>`;
                    $("#filter_single_row").append(dropdown_list);
                }
                let button = `<button class="btn btn-outline-primary container-fluid text-center my-2" id="filter_row_btn">
                    Filter
                </button>`;
                $("#filter_single_row").append(button);
                for (keys in data) {
                    let content = `<div class="input-group">`;
                    content += `<div class="custom-checkbox form-check font-weight-bold mx-2 my-2">
                    <label class="form-check-label">
                    <input type="checkbox" value="${keys}" class="form-check-input">${keys}
                    </label>
                    </div>`;
                    i++;
                    content += `<div class="input-group-append container-fluid">`;
                    content += `<select class="custom-select my-2 mx-2">
                    <option selected>Select Operator</option>
                    <option value="1">Greater than (>)</option>
                    <option value="2">Greater than equal to (>=)</option>
                    <option value="3">Less than (<)</option>
                    <option value="4">Less than equal to (<=)</option>
                    <option value="5">Not equal to (!=)</option>
                    <option value="6">Between</option>
                    </select>`;
                    content += `<select class="custom-select my-2" multiple="multiple">`;
                    content += `<option selected>${keys}</option>`;
                    titles = data[keys];
                    for (var i = 0; i < titles.length; i++) {
                        content += `<option value="${i}">${titles[i]}</option>`;
                    }
                    content += `</select></div></div>`;
                    $("#filter_comparing_row").append(content);
                }
                button = `<button class="btn btn-outline-primary container-fluid text-center my-2" id="filter_row_comparing_btn">
                    Filter
                </button>`;
                $("#filter_comparing_row").append(button);
            });
        } else {
            show_alert(`alert-wrapper`, `Opps! It's our fault.`, `alert-danger`);
            return false;
        }
    });

    $('#filter_single_row').on('click', '#filter_row_btn', function () {
        let div_elem = $("#filter_single_row :input");
        let selected = [];
        let data = {};
        for (var i = 0; i < div_elem.length; i++) {
            if (div_elem[i].nodeName.toLowerCase() == "select") {
                let sel_elem = div_elem[i];
                for (var j = 0, len = sel_elem.options.length; j < len; j++) {
                    let options = sel_elem.options[j];
                    if (options.selected) {
                        selected.push(options.text);
                    }
                }
                data[`${sel_elem.options[0].text}`] = selected;
                selected = [];
            }
        }
        if (check_data(data) == false) {
            show_alert(`alert-filter-single-row`, `Choose some filter criteria.`, `alert-danger`);
            return false;
        }
        let titles_div = $("#sel_col :input");
        let columns = get_checked_boxes(titles_div);
        if (columns.length == 0) {
            show_alert(`alert-filter-single-row`, `No Columns selected. Please select some columns.`, `alert-danger`);
            return false;
        }
        packet = {
            'data': data,
            'titles': columns,
            'filter': 'no-comparing'
        };
        localStorage.setItem('data_packet', JSON.stringify(packet));
        window.open('/results');
    });

    $('#filter_comparing_row').on('click', '#filter_row_comparing_btn', function () {
        let div_elem = $("#filter_comparing_row :input");
        let selected = [];
        let data = {};
        var i = 0;
        var len = div_elem.length;
        while (i < len) {
            if (div_elem[i].nodeName.toLowerCase() == "input") {
                var check_elem = div_elem[i];
                if (check_elem.checked) {
                    i += 1;
                    var sel_single = div_elem[i];
                    selected.push(get_options(sel_single));
                    i += 1;
                    var sel_multiple = div_elem[i];
                    selected.push(get_options(sel_multiple));
                    data[`${check_elem.value}`] = selected;
                    selected = [];
                }
            }
            i += 1;
        }
        if (check_data(data) == false) {
            show_alert(`alert-filter-comparing-row`, `Choose some filter criteria.`, `alert-danger`);
            return false;
        }
        let titles_div = $("#sel_col :input");
        let columns = get_checked_boxes(titles_div);
        if (columns.length == 0) {
            show_alert(`alert-filter-comparing-row`, `No Columns selected. Please select some columns.`, `alert-danger`);
            return false;
        }
        packet = {
            'data': data,
            'titles': columns,
            'filter': 'comparing'
        };
        localStorage.setItem('data_packet', JSON.stringify(packet));
        window.open('/results');
    });

    function get_options(sel_elem) {
        let selected = [];
        var len = sel_elem.options.length;
        for (var j = 0; j < len; j++) {
            var option = sel_elem.options[j];
            if (option.selected) {
                selected.push(option.text);
            }
        }
        return selected;
    }

    function get_checked_boxes(titles_div) {
        let checked = [];
        var len = titles_div.length;
        for (var j = 0; j < len; j++) {
            var candidate = titles_div[j];
            if (candidate.checked) {
                checked.push(candidate.value);
            }
        }
        return checked;
    }

    function check_data(data) {
        if (data.length == 0) {
            return false;
        } else {
            for (keys in data) {
                var selected = data[keys];
                if (selected.length > 1) {
                    return true;
                } else {
                    if (selected[0] != keys) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

});