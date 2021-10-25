import json
import flask
from flask import request, send_from_directory
import requests
from postgres import postgres as postgres
from utils import * 
import os
import envReader

app = flask.Flask('bot_manager')
_postgres: postgres = None

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
        if 'ban_user' in request.form:
            user_id = request.form['user_id']
            client = request.form['client']
            _postgres.blockUser(user_id, client)
        elif 'unban_user' in request.form:
            user_id = request.form['user_id']
            client = request.form['client']
            _postgres.unblockUser(user_id, client)
            
        return flask.make_response(flask.redirect('block_manager'))

@app.route('/chat_filter_manager', methods=['POST', 'GET'])
def chat_filter_manager():
    if request.method == 'GET':
        half, max = _postgres.getChatFilterRatings()
        bad_words = _postgres.getBadWordsRatings()
        html = read_file('main.html')
        html += '<center>'
        html += '<h1>Chat Filter Manager</h1>'
        html += '<h2>Ratings: half - ' + str(half) + ' | max - ' + str(max) + '</h2>'
        html += '<form action="/chat_filter_manager" method="post" id="update_ratings">'
        html += '<label for="user_id">Half:</label><br>'
        html += '<input type="number" id="half" name="half" value="' + str(half) + '"><br>'
        html += '<label for="client">Max:</label><br>'
        html += '<input type="number" id="max" name="max" value="' + str(max) + '"><br><br>'
        html += '<input type="submit" name="update_ratings" value="Add Bad Word">'
        html += '</form>'
        html += '<h2>Add bad words</h2>'
        html += '<form action="/chat_filter_manager" method="post" id="add_bad_word">'
        html += '<label for="user_id">Word:</label><br>'
        html += '<input type="text" id="word" name="word" value=""><br>'
        html += '<label for="client">Rating:</label><br>'
        html += '<input type="text" id="rating" name="rating" value=""><br><br>'
        html += '<input type="submit" name="add_bad_word" value="Update Ratings">'
        html += '</form>'
        html += '<h4>Bad Words</h4>'
        html += '<table>'
        html += '<tr>'
        html += '<th>Word</th>'
        html += '<th>Rating</th>'
        html += '<th>Edit</th>'
        html += '<th>Remove</th>'
        html += '</tr>'
        for i in bad_words:
            html += '<tr>'
            html += '<td>' + str(i['key']) + '</td>'
            html += '<td>' + str(i['value']) + '</td>'
            html += '<td><form action="/chat_filter_manager" method="post" id="edit_bad_word">'
            html += '<input type="hidden" id="word" name="word" value="' + str(i['key']) + '">'
            html += '<input type="number" id="new_rating" name="new_rating" value="' + str(i['value']) + '">'
            html += '<input type="submit" name="edit_bad_word" value="Edit"></form></td>'
            html += '<td><form action="/chat_filter_manager" method="post" id="remove_bad_word">'
            html += '<input type="hidden" id="word" name="word" value="' + str(i['key']) + '">'
            html += '<input type="submit" name="remove_bad_word" value="Remove"></form></td>'
            html += '</tr>'
        html += '</table>'
        html += '</center>'
        html += '</body></html>'
        return html
    elif request.method == 'POST':
        if 'update_ratings' in request.form:
            half = request.form['half'].strip()
            max = request.form['max'].strip()
            _postgres.updateChatFilter(half, max) 
        if 'add_bad_word' in request.form:
            word = request.form['word'].strip()
            rating = request.form['rating'].strip()
            _postgres.addBadWord(word, rating)
        if 'remove_bad_word' in request.form:
            word = request.form['word'].strip()
            _postgres.removeBadWord(word)
        if 'edit_bad_word' in request.form:
            word = request.form['word'].strip()
            newRating = request.form['new_rating'].strip()
            _postgres.editBadWord(word, newRating)

        return flask.make_response(flask.redirect('chat_filter_manager'))

@app.route('/keyword_manager', methods=['POST', 'GET'])
def keyword_manager():
    if request.method == 'GET':
        keywords = _postgres.getKeywords()
        html = read_file('main.html')
        html += '<center>'
        html += '<h1>Keywords Manager</h1>'
        html += '<h2>Add keywords</h2>'
        html += '<form action="/keyword_manager" method="post" id="add_keyword">'
        html += '<label for="user_id">Word:</label><br>'
        html += '<input type="text" id="word" name="word" value=""><br>'
        html += '<label for="client">Count:</label><br>'
        html += '<input type="number" id="count" name="count" value=""><br>'
        html += '<label for="user_id">Agent:</label><br>'
        html += '<input type="text" id="agent" name="agent" value=""><br><br>'
        html += '<input type="submit" name="add_keyword" value="Add Keyword">'
        html += '</form>'
        html += '<h4>Replacent Rules, are used in order to replace certain words in the sentence if the keyword exists, <br>for example to remove hi from the phrase use (hi:,), to remove bad words: (bad_words:,), <br>if you want to replace the words rather than deleting use (hi:hey,)</h4>'
        html += '<h4>Keywords</h4>'
        html += '<table>'
        html += '<tr>'
        html += '<th>Word</th>'
        html += '<th>Count</th>'
        html += '<th>Agent</th>'
        html += '<th>Edit</th>'
        html += '<th>Remove</th>'
        html += '</tr>'
        for i in keywords:
            html += '<tr>'
            html += '<td>' + str(i['word']) + '</td>'
            html += '<td>' + str(i['count']) + '</td>'
            html += '<td>' + str(i['agent']) + '</td>'
            html += '<td><form action="/keyword_manager" method="post" id="edit_keyword">'
            html += '<label for="count">Count:</label>&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; '
            html += '<label for="agent">Agent:</label><br>'
            html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
            html += '<input type="number" id="count" name="count" value="' + str(i['count']) + '">'
            html += '<input type="text" id="agent" name="agent" value="' + str(i['agent']) + '"><br><br>'
            html += '<center><input type="submit" name="edit_keyword" value="Edit"></center></form></td>'
            html += '<td><form action="/keyword_manager" method="post" id="remove_keyword">'
            html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
            html += '<input type="hidden" id="agent" name="agent" value="' + str(i['agent']) + '">'
            html += '<input type="submit" name="remove_keyword" value="Remove"></form></td>'
            html += '</tr>'
        html += '</table>'
        html += '</center>'
        html += '</body></html>'
        return html
    elif request.method == 'POST':
        if 'add_keyword' in request.form:
            word = request.form['word'].strip()
            count = request.form['count'].strip()
            agent = request.form['agent'].strip()
            _postgres.addKeyword(word, count, agent)
        elif 'edit_keyword' in request.form:
            word = request.form['word'].strip()
            count = request.form['count'].strip()
            agent = request.form['agent'].strip()
            _postgres.editKeyword(word, count, agent)
        elif 'remove_keyword' in request.form:
            word = request.form['word'].strip()
            agent = request.form['agent'].strip()
            _postgres.removeKeyword(word, agent)

        return flask.make_response(flask.redirect('keyword_manager'))




if __name__ == '__main__':
    envReader.read()
    print('connecting to the database')
    _postgres = postgres()
    print('starting server')
    app.run(host=envReader.getValue('BOT_MANAGER_IP'), port=envReader.getValue('BOT_MANAGER_PORT'))