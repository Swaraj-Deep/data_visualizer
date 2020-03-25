from flask import Flask, render_template, request, redirect, session, make_response, jsonify, send_from_directory, abort
from decimal import Decimal
from werkzeug.utils import secure_filename
import matplotlib.pyplot as plt
import os
import os.path
import dataframe as df

app = Flask(__name__)
app.config['FILE_UPLOADS'] = os.getcwd() + '/static/uploads'
app.secret_key = 'kldjlkmxcvioermklxjos90873489*&86*&I09'
dataframe_object = df.Dataframe()


@app.route('/')
def dash_board() -> 'html':
    return render_template('dash_board.html', the_title='Dashboard')


@app.route('/upload')
def upload() -> 'html':
    return render_template('file_upload.html', the_title='Upload File')


@app.route('/__verify_upload__', methods=['POST'])
def verify_upload() -> 'json':
    uploaded_file = request.files['file']
    file_name = secure_filename(uploaded_file.filename)
    try:
        uploaded_file.save(os.path.join(app.config['FILE_UPLOADS'], file_name))
        session['filename'] = file_name
        dataframe_object.set_filename(file_name)
        dataframe_object.set_dataframe()
        dataframe = dataframe_object.get_dataframe(False)
        (row, col) = dataframe.shape
        titles = list(dataframe.columns)
        data = [list(dataframe[col])
                for col in dataframe.columns]
        response = {
            'titles': titles,
            'data': data,
            'col': col,
            'row': row
        }
    except Exception as e:
        print(e)
    return make_response(jsonify(response), 200)


@app.route('/fileuploadcomplete')
def fileuploadcomplete() -> 'html':
    if 'filename' in session:
        return render_template('file_upload_complete.html', the_title='Filter Here')
    else:
        return redirect('/upload')


@app.route('/__return_titles__', methods=['POST'])
def return_titles() -> 'json':
    req = request.get_json()
    if req['data'] == 'Send Titles':
        titles = dataframe_object.get_titles()
        data = {
            'titles': titles
        }
    return make_response(data, 200)


@app.route('/__return_data__', methods=['POST'])
def return_data() -> 'json':
    req = request.get_json()
    col_val = []
    titles = []
    if req['data'] == 'Send Data':
        col_val = dataframe_object.get_unique_col_val()
        titles = dataframe_object.get_titles()
    i = 0
    data = {}
    for items in col_val:
        data[titles[i]] = items
        i += 1
    return make_response(data, 200)


def generate_query(packet) -> 'query':
    data_type = dataframe_object.get_data_type()
    if (packet['filter'] == 'no-comparing'):
        data = packet['data']
        titles = packet['titles']
        columns = []
        for items in titles:
            columns.append(f"{items}")
        query = ""
        for keys, values in data.items():
            filter = values
            for item in filter:
                if item == keys:
                    filter.remove(keys)
            if len(filter) != 0:
                if data_type[keys] == 'object':
                    query += ' or '.join(keys + ' == "' + items +
                                         '"' for items in filter)
                    query += " and "
                else:
                    query += ' or '.join(keys + " == " + items
                                         for items in filter)
                    query += " and "
        query = query[:-5]
        dataframe = dataframe_object.get_original_dataframe()
        return dataframe.query(query).filter(columns)
    else:
        data = packet['data']
        titles = packet['titles']
        columns = []
        for items in titles:
            columns.append(f"{items}")
        query = ""
        for keys, values in data.items():
            operator = values[0][0]
            condition = values[1]
            for item in condition:
                if item == keys:
                    condition.remove(keys)
            if len(condition) != 0:
                if data_type[keys] == 'object':
                    if operator == 'Greater than (>)':
                        query += ' and '.join(keys + " > '" + items +
                                              "'" for items in condition)
                        query += " and "
                    if operator == 'Greater than equal to (>=)':
                        query += ' and '.join(keys + " >= '" + items +
                                              "'" for items in condition)
                        query += " and "
                    if operator == 'Less than (<)':
                        query += ' and '.join(keys + " < '" + items +
                                              "'" for items in condition)
                        query += " and "
                    if operator == 'Less than equal to (<=)':
                        query += ' and '.join(keys + " <= '" + items +
                                              "'" for items in condition)
                        query += " and "
                    if operator == 'Not equal to (!=)':
                        query += ' and '.join(keys + " != '" + items +
                                              "'" for items in condition)
                        query += " and "
                    if operator == 'Between':
                        if len(condition) < 2:
                            continue
                        else:
                            a = max(condition[0], condition[1])
                            b = min(condition[0], condition[1])
                            query += keys + " >= '" + \
                                b + "' and " + keys + \
                                " <= '" + a + "'"
                            query += " and "
                else:
                    if operator == 'Greater than (>)':
                        query += ' and '.join(keys + " > " +
                                              items for items in condition)
                        query += " and "
                    if operator == 'Greater than equal to (>=)':
                        query += ' and '.join(keys + " >= " +
                                              items for items in condition)
                        query += " and "
                    if operator == 'Less than (<)':
                        query += ' and '.join(keys + " < " +
                                              items for items in condition)
                        query += " and "
                    if operator == 'Less than equal to (<=)':
                        query += ' and '.join(keys + " <= " +
                                              items for items in condition)
                        query += " and "
                    if operator == 'Not equal to (!=)':
                        query += ' and '.join(keys + " != " +
                                              items for items in condition)
                        query += " and "
                    if operator == 'Between':
                        if len(condition) < 2:
                            continue
                        else:
                            a = str(
                                max(Decimal(condition[0]), Decimal(condition[1])))
                            b = str(
                                min(Decimal(condition[0]), Decimal(condition[1])))
                            query += keys + " >= " + \
                                b + " and " + keys + \
                                " <= " + a
                            query += " and "
        query = query[:-5]
        dataframe = dataframe_object.get_original_dataframe()
        return dataframe.query(query).filter(columns)


@app.route('/__return_filter_data__', methods=['POST'])
def filter_data() -> 'json':
    packet = request.get_json()
    dataframe = generate_query(packet)
    dataframe.insert(0, 'S.no', range(1, len(dataframe) + 1))
    (row, col) = dataframe.shape
    titles = list(dataframe.columns)
    data = [list(dataframe[col])
            for col in dataframe.columns]
    return_data = {
        'data': data,
        'row': row,
        'col': col,
        'titles': titles
    }
    return make_response(return_data, 200)


@app.route('/results')
def results() -> 'html':
    if 'filename' in session:
        return render_template('results.html', the_title='Results')
    else:
        return redirect('/upload')


@app.route('/graphs')
def graphs() -> 'html':
    if 'filename' in session:
        return render_template('graphs.html', the_title='Visualize')
    else:
        return redirect('/upload')


@app.route('/__histogram__', methods=['POST'])
def histogram() -> 'json':
    req = request.get_json()
    titles = dataframe_object.get_titles()
    data = {
        'titles': titles
    }
    return make_response(jsonify(data), 200)


@app.route('/__draw_histogram__', methods=['POST'])
def draw_histogram() -> 'json':
    req = request.get_json()
    path = os.getcwd() + '/static/graphs'
    intpart = len(os.listdir(path))
    filename = 'output' + str(intpart + 1)
    path = os.getcwd() + '/static/uploads/' + session['filename']
    if req['graph_type'] == 'Histogram':
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\nplt.figure(num=None, figsize=(20, 10), dpi=80, facecolor='w', edgecolor='k')\ndf['{req['x_selected']}'].sort_values().hist(bins=100)\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x_selected']}', fontsize=20)\nplt.xticks(rotation=45)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    elif req['graph_type'] == 'Box Plot':
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\ndf['{req['x_selected']}'].sort_values().plot.box(figsize=(20, 10))\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x_selected']}', fontsize=20)\nplt.xticks(rotation=0)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    else:
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\ndf['{req['x_selected']}'].sort_values().plot.kde(bw_method = 0.3, figsize=(10, 20))\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x_selected']}', fontsize=20)\nplt.xticks(rotation=0)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    return make_response(jsonify({'name': f'{filename}.png'}), 200)


@app.route('/graph_result')
def graph_result() -> 'html':
    if 'filename' in session:
        return render_template('graph_result.html', the_title='Graph')
    else:
        return redirect('/upload')


@app.route('/__draw_other_graphs__', methods=['POST'])
def draw_other_graphs() -> 'json':
    req = request.get_json()
    path = os.getcwd() + '/static/graphs'
    intpart = len(os.listdir(path))
    filename = 'output' + str(intpart + 1)
    path = os.getcwd() + '/static/uploads/' + session['filename']
    if req['graph_type'] == 'Line Chart':
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\ndf.plot.line(x='{req['x-axis']}', y='{req['y-axis']}', figsize=(20, 10))\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x-axis']} vs {req['y-axis']}', fontsize=20)\nplt.xticks(rotation=45)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    elif req['graph_type'] == 'Scatter Chart':
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\ndf.plot.scatter(x='{req['x-axis']}', y='{req['y-axis']}', figsize=(20, 10))\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x-axis']} vs {req['y-axis']}', fontsize=20)\nplt.xticks(rotation=45)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    else:
        contents = f"import pandas as pd\nimport matplotlib.pyplot as plt\ndf=pd.read_csv('{path}')\n\n\ndf.plot.hexbin(x='{req['x-axis']}', y='{req['y-axis']}', figsize=(20, 10))\nplt.xlabel('{req['x_label']}', fontsize=20)\nplt.ylabel('{req['y_label']}', fontsize=20)\nplt.title('Graph for {req['x-axis']} vs {req['y-axis']}', fontsize=20)\nplt.xticks(rotation=45)\n\n\nplt.savefig('static/graphs/{filename}.png')"
        hist = open("static/scripts/hist.py", "w")
        hist.write(contents)
        hist.close()
        try:
            os.system("static/scripts/eg.sh")
        except Exception as e:
            print(e)
    return make_response(jsonify({'name': f'{filename}.png'}), 200)


if __name__ == '__main__':
    app.run(debug=True)
    path = os.getcwd() + '/static/graphs/'
    for file_name in os.listdir(path):
        try:
            os.remove(path + file_name)
        except Exception as e:
            print(e)
