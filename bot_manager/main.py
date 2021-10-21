import json
import flask
from flask import request, send_from_directory
import requests
from postgres import postgres as postgres
from utils import * 
import os

app = flask.Flask('bot_manager')
_postgres = None

@app.route('/', methods=['POST', 'GET', 'DELETE'])
def api():
    try:
        if request.method == 'POST':
            html = read_file('main.html')
            html += '</body></html>'
            return html
        elif request.method == 'GET':
            html = read_file('main.html')
            html += '</body></html>'
            return html
        elif request.method == 'DELETE':
            return json.dumps({'success':False}), 404, {'ContentType':'application/json'}
    except Exception as ex:
        print('error: ' + ex)
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}

@app.route('/block_manager', methods=['POST', 'GET'])
def block_manager():
    if request.method == 'GET':
        Blocked_users = _postgres.getBlockedUsers()
        html = read_file('main.html')
        html += '<center>'
        html += '<h1>Blocked User Management</h1>'
        html += '<h4>Block a user</h4>'
        html += '<form action="/block_manager" method="post" id="ban_user">'
        html += '<label for="user_id">User ID:</label><br>'
        html += '<input type="text" id="user_id" name="user_id" value=""><br>'
        html += '<label for="client">Client:</label><br>'
        html += '<input type="text" id="client" name="client" value=""><br><br>'
        html += '<input type="submit" name="ban_user" value="Block">'
        html +=  '</form> '
        html += '<h4>Blocked users</h4>'
        html += '<table>'
        html += '<tr>'
        html += '<th>User ID</th>'
        html += '<th>Client</th>'
        html += '<th>Action</th>'
        html += '</tr>'
        for i in Blocked_users:
            html += '<tr>'
            html += '<td>' + str(i['key']) + '</td>'
            html += '<td>' + str(i['value']) + '</td>'
            html += '<td><form action="/block_manager" method="post" id="unban_user">'   
            html += '<input type="hidden" id="client" name="client" value="' + str(i['value']) + '">'
            html += '<input type="hidden" id="user_id" name="user_id" value="' + str(i['key']) + '">'
            html += '<input type="submit" name="unban_user" value="Unblock">'
            html +=  '</form></td>'
            html += '</tr>'
        html += '</table></center>'
        html += '</body></html>'
        return html
    elif request.method == 'POST':
        if ('ban_user' in request.form):
            user_id = request.form['user_id']
            client = request.form['client']
            _postgres.blockUser(user_id, client)
        elif ('unban_user' in request.form):
            user_id = request.form['user_id']
            client = request.form['client']
            _postgres.unblockUser(user_id, client)
            
        return flask.make_response(flask.redirect('block_manager'))


if __name__ == '__main__':
    print('connecting to the database')
    _postgres = postgres()
    print('starting server')
    app.run(host='0.0.0.0', port=7777)