import json
import flask
from flask import request, send_from_directory
import requests
from utils import *

app = flask.Flask('communicator')

@app.route('/', methods=['POST', 'GET', 'DELETE'])
def api():
    try:
        if request.method == 'POST':
            response = flask.make_response(flask.redirect('communicator'))
        elif request.method == 'GET':
            response = flask.make_response(flask.redirect('communicator'))
            return response
        elif request.method == 'DELETE':
            return json.dumps({'success':False}), 404, {'ContentType':'application/json'}
    except Exception as ex:
        print('error: ' + ex)
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/communicator', methods=['POST', 'GET'])
def communicator():
    if request.method == 'GET':
        html = read_file('base_communicator.html')
        html += '<h1>Main</h1><p>Enter Data!</p>'
        html += '<form action="/communicator" method="post" id="communicator">'
        html += '<button type="submit">Submit</button></form>'
        html += '<br><textarea rows="30" cols="175" name="communicator" form="communicator"></textarea>'
        html += '</body></html>'
        return html
    elif request.method == 'POST':
        data = request.form['communicator']
        try:
            json.loads(data)
        except ValueError as ex:
            return json.dumps({'message':'invalid json format'}), 404, {'ContentType':'application/json'}
        f = open("data.json", "a")
        f.write(data)
        f.close()
        return flask.make_response(flask.redirect('communicator'))

if __name__ == '__main__':
    print('starting server')
    app.run(host='0.0.0.0', port=7777)