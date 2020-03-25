$(document).ready(function () {
    function show_alert(id, message, alert_type) {
        $(`#${id}`).html(`<div class="alert ${alert_type} alert-dismissable" id="alert">${message}<button class="close" type="button" aria-hidden="true" data-dismiss="alert">&times;</button></div>`);
        $("#alert").fadeTo(5000, 500).slideUp(500, function () {
            $("#alert").remove();
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

    data = {
        'data': 'send data'
    };

    get_data('__histogram__', data).then(function (response) {
        if (response.status === 400) {
            show_alert(`alert-histogram`, `Some error occured. Please reload the page.`, `alert-danger`);
            return false;
        } else if (response.status === 200) {
            response.json().then(function (data) {
                let titles = data['titles'];
                let options = ``;
                options += `<option selected value=${0}>${titles[0]}</option>`;
                for (let i = 1, len = titles.length; i < len; ++i) {
                    options += `<option value=${i}>${titles[i]}</option>`;
                }
                $("#x-axis").append(options);
                $("#x-axis_other").append(options);
                $("#y-axis_other").append(options);
            });
        } else {
            show_alert(`alert-histogram`, `Opps! It's our fault. We are working on it. Please visit after some time.`, `alert-danger`);
            return false;
        }
    });

    $("#histogram_btn").on({
        click: function () {
            let x = $("#x-axis")[0];
            let x_selected = ``, y_label = $("#y-label")[0].value, x_label = $("#x-label")[0].value;
            for (let i = 0, len = x.options.length; i < len; ++i) {
                let option = x.options[i];
                if (option.selected) {
                    x_selected = option.text;
                }
            }
            var graph_type = ``;
            var graph_sel = $("#graph_type_hist")[0];
            for (let i = 0, len = graph_sel.options.length; i < len; ++i) {
                let option = graph_sel.options[i];
                if (option.selected) {
                    graph_type = option.text;
                }
            }
            var data = {};
            if (!x_label || !y_label) {
                show_alert(`alert-histogram`, `X-Label and Y-Label required`, `alert-danger`);
                return false;
            }
            var title = `<div class="media float-left container h-100">
            <img class="align-self-center loader_hist_animation rounded float-left" src="/static/images/infinity.gif" alt="">
              <p class="font-weight-bold justify-content-center align-self-center">We got it. <br /> Processing...</p>
            </div>`;
            $("#loader_hist").html(title);
            data = {
                'x_selected': x_selected,
                'x_label': x_label,
                'y_label': y_label,
                'graph_type': graph_type
            };
            get_data('__draw_histogram__', data).then(function (response) {
                if (response.status === 400) {
                    show_alert(`alert-histogram`, `Some error occured. Please reload the page.`, `alert-danger`);
                    return false;
                } else if (response.status === 200) {
                    response.json().then(function (data) {
                        title = `<div class="media float-left">
                        <div class="media-body">
                          <p class="font-weight-bold">Done Redirecting</p>
                        </div>
                      </div>`;
                        $("#loader_hist").html(title);
                        setTimeout(function () {
                            $("#loader_hist").html(" ");
                            localStorage.setItem('name', data['name'])
                            window.open('/graph_result')
                        }, 2000);
                    });
                } else {
                    show_alert(`alert-histogram`, `Opps! It's our fault. We are working on it. Please visit after some time.`, `alert-danger`);
                    return false;
                }
            });
        }
    });

    $("#other-graph-btn").on({
        click: function () {
            var x_axis = $("#x-axis_other")[0];
            var y_axis = $("#y-axis_other")[0];
            var x_selected = ``, y_selected = ``;
            for (let i = 0, len = x_axis.options.length; i < len; ++i) {
                let option = x_axis.options[i];
                if (option.selected) {
                    x_selected = option.text;
                }
            }
            for (let i = 0, len = y_axis.options.length; i < len; ++i) {
                let option = y_axis.options[i];
                if (option.selected) {
                    y_selected = option.text;
                }
            }
            if (x_selected === y_selected) {
                show_alert('alert-other-graphs', `Both the axis can't be same.`, `alert-danger`);
                return false;
            }
            var x_label = $("#x-label_other")[0].value;
            var y_label = $("#y-label_other")[0].value;
            if (!x_label || !y_label) {
                show_alert(`alert-other-graphs`, `Please provide the X-axis and Y-axis label`, `alert-danger`);
                return false;
            }
            var graph_type = ``;
            var graph_sel = $("#graph_type")[0];
            for (let i = 0, len = graph_sel.options.length; i < len; ++i) {
                let option = graph_sel.options[i];
                if (option.selected) {
                    graph_type = option.text;
                }
            }
            var data = {
                'graph_type': graph_type,
                'x-axis': x_selected,
                'y-axis': y_selected,
                'x_label': x_label,
                'y_label': y_label
            };
            var title = `<div class="media float-left container h-100">
            <img class="align-self-center loader_hist_animation rounded float-left" src="/static/images/infinity.gif" alt="">
              <p class="font-weight-bold justify-content-center align-self-center">We got it. <br /> Processing...</p>
            </div>`;
            $("#loader_other").html(title);
            get_data('__draw_other_graphs__', data).then(function (response) {
                if (response.status === 400) {
                    show_alert(`alert-other-graphs`, `Some error occured. Please reload the page.`, `alert-danger`);
                    return false;
                } else if (response.status === 200) {
                    response.json().then(function (data) {
                        title = `<div class="media float-left">
                        <div class="media-body">
                          <p class="font-weight-bold">Done Redirecting</p>
                        </div>
                      </div>`;
                        $("#loader_other").html(title);
                        setTimeout(function () {
                            $("#loader_other").html(" ");
                            localStorage.setItem('name', data['name'])
                            window.open('/graph_result')
                        }, 2000);
                    });
                } else {
                    show_alert(`alert-other-graphs`, `Opps! It's our fault. We are working on it. Please visit after some time.`, `alert-danger`);
                    return false;
                }
            });
        }
    });

});