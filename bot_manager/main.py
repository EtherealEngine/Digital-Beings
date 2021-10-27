import json
from flask import Flask, session, request
import flask
from postgres import postgres as postgres
from utils import * 
import envReader


app = Flask('bot_manager')
_postgres: postgres = None
ais = []

@app.route('/', methods=['POST', 'GET', 'DELETE'])
def api():
    try:
        if request.method == 'POST':
            if 'loggin' in request.form:
                username = request.form['username']
                password = request.form['password']
                if envReader.getValue('MANAGER_USERNAME') == username and envReader.getValue('MANAGER_PASSWORD') == password:
                    session['logged_in'] = True
                
            return flask.make_response(flask.redirect('block_manager'))
        elif request.method == 'GET':
            if session.get('logged_in') == None or session.get('logged_in') == False:
                session['logged_in'] = False
                html = read_file('loggin.html')
                html += '<center>'
                html += '<h4>Login</h4>'
                html += '<form action="/" method="post" id="loggin">'
                html += '<label for="username">Username:</label><br>'
                html += '<input type="text" id="username" name="username" value=""><br>'
                html += '<label for="client">Password:</label><br>'
                html += '<input type="text" id="password" name="password" value=""><br><br>'
                html += '<input type="submit" name="loggin" value="Login">'
                html += '</center></body></html>'
                return html
            else:
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return flask.make_response(flask.redirect('/'))
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return json.dumps({'logged_in':False}), 404, {'ContentType':'application/json'}
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return flask.make_response(flask.redirect('/'))
        half, max = _postgres.getChatFilterRatings()
        bad_words = _postgres.getBadWordsRatings()
        html = read_file('main.html')
        html += '<center>'
        html += '<h1>Chat Filter Manager (For Users)</h1>'
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return json.dumps({'logged_in':False}), 404, {'ContentType':'application/json'}
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return flask.make_response(flask.redirect('/'))
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
        html += '<label for="client">Agent:</label><br>'
        html += '<select name="agent" id="agent" multiple>'
        for ai in ais:
            html += '<option value="' + ai + '">' + ai + '</option>'
        html += '</select><br>'
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
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return json.dumps({'logged_in':False}), 404, {'ContentType':'application/json'}
        if 'add_keyword' in request.form:
            word = request.form['word'].strip()
            count = request.form['count'].strip()
            data = list(request.form.listvalues())
            agents = []
            if len(data) >= 3:
                agents = data[2]
            for agent in agents:
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

@app.route('/chat_filter_manager_ai', methods=['POST', 'GET'])
def chat_filter_manager_ai():
    if request.method == 'GET':
        count = str(_postgres.getAIMaxLoopCount())
        c1, c2, c3, c4 = _postgres.getAIChatFilter()
        html = read_file('main.html')
        html += '<center>'
        html += '<h1>Chat Filter (For AI)</h1>'
        html += '<h2>Max Loop Count</h2>'
        html += '<form action="/chat_filter_manager_ai" method="post" id="max_loop_count">'
        html += '<label for="count">Count:</label><br>'
        html += '<input type="number" id="count" name="count" value="' + count + '"><br>'
        html += '<input type="submit" name="max_loop_count" value="Update">'
        html += '</form>'
        html += '<h2>Add Bad Word</h2>'
        html += '<form action="/chat_filter_manager_ai" method="post" id="add_bad_word">'
        html += '<label for="word">Word:</label>'
        html += '<input type="text" id="word" name="word" value=""><br>'
        html += '<label for="age">Age:</label>'
        html += '<input type="checkbox" id="age12" name="age12"> <label for="unlimited">1-12</label>'
        html += '<input type="checkbox" id="age16" name="age16"> <label for="unlimited">12-16</label>'
        html += '<input type="checkbox" id="age18" name="age18"> <label for="unlimited">16+</label>'
        html += '<input type="checkbox" id="agexxx" name="agexxx"> <label for="unlimited">XXX</label><br>'
        html += '<label for="client">Agent:</label><br>'
        html += '<select name="agent" id="agent" multiple>'
        for ai in ais:
            html += '<option value="' + ai + '">' + ai + '</option>'
        html += '</select><br>'
        html += '<input type="checkbox" id="unlimited" name="unlimited"> <label for="unlimited">Unlimited</label><br><br>'
        html += '<input type="submit" name="add_bad_word" value="Add">'
        html += '</form>'
        if (len(c1) > 0):
            html += '<h4>Bad Words - Age 1-12</h4>'
            html += '<table>'
            html += '<tr>'
            html += '<th>Word</th>'
            html += '<th>Agent</th>'
            html += '<th>Remove</th>'
            html += '</tr>'
            for i in c1:
                html += '<tr>'
                html += '<td>' + str(i['word']) + '</td>'
                html += '<td>' + str(i['agent']) + '</td>'
                html += '<td><form action="/chat_filter_manager_ai" method="post" id="remove_keyword">'
                html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
                html += '<input type="hidden" id="age" name="age" value="' + str(i['age']) + '">'
                html += '<input type="hidden" id="agent" name="agent" value="' + str(i['agent']) + '">'
                html += '<input type="submit" name="remove_bad_word" value="Remove"></form></td>'
                html += '</tr>'
            html += '</table>'
        if (len(c2) > 0):
            html += '<h4>Bad Words - Age 12-16</h4>'
            html += '<table>'
            html += '<tr>'
            html += '<th>Word</th>'
            html += '<th>Agent</th>'
            html += '<th>Remove</th>'
            html += '</tr>'
            for i in c2:
                html += '<tr>'
                html += '<td>' + str(i['word']) + '</td>'
                html += '<td>' + str(i['agent']) + '</td>'
                html += '<td><form action="/chat_filter_manager_ai" method="post" id="remove_keyword">'
                html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
                html += '<input type="hidden" id="age" name="age" value="' + str(i['age']) + '">'
                html += '<input type="hidden" id="agent" name="agent" value="' + str(i['agent']) + '">'
                html += '<input type="submit" name="remove_bad_word" value="Remove"></form></td>'
                html += '</tr>'
            html += '</table>'
        if (len(c3) > 0):
            html += '<h4>Bad Words - Age 16+</h4>'
            html += '<table>'
            html += '<tr>'
            html += '<th>Word</th>'
            html += '<th>Agent</th>'
            html += '<th>Remove</th>'
            html += '</tr>'
            for i in c3:
                html += '<tr>'
                html += '<td>' + str(i['word']) + '</td>'
                html += '<td>' + str(i['agent']) + '</td>'
                html += '<td><form action="/chat_filter_manager_ai" method="post" id="remove_keyword">'
                html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
                html += '<input type="hidden" id="age" name="age" value="' + str(i['age']) + '">'
                html += '<input type="hidden" id="agent" name="agent" value="' + str(i['agent']) + '">'
                html += '<input type="submit" name="remove_bad_word" value="Remove"></form></td>'
                html += '</tr>'
            html += '</table>'
        if (len(c4) > 0):
            html += '<h4>Bad Words - Age XXX</h4>'
            html += '<table>'
            html += '<tr>'
            html += '<th>Word</th>'
            html += '<th>Agent</th>'
            html += '<th>Remove</th>'
            html += '</tr>'
            for i in c4:
                html += '<tr>'
                html += '<td>' + str(i['word']) + '</td>'
                html += '<td>' + str(i['agent']) + '</td>'
                html += '<td><form action="/chat_filter_manager_ai" method="post" id="remove_keyword">'
                html += '<input type="hidden" id="word" name="word" value="' + str(i['word']) + '">'
                html += '<input type="hidden" id="age" name="age" value="' + str(i['age']) + '">'
                html += '<input type="hidden" id="agent" name="agent" value="' + str(i['agent']) + '">'
                html += '<input type="submit" name="remove_bad_word" value="Remove"></form></td>'
                html += '</tr>'
            html += '</table>'
        html += '</center>'
        html += '</body></html>'
        return html
    elif request.method == 'POST':
        if 'add_bad_word' in request.form:
            words = []
            word = request.form['word'].strip()
            if ';' in word:
                words = word.split(';')
                words = list(filter(None, words))
            else:
                words = [ word ]
            ages = []
            data = list(request.form.listvalues())
            agents = []
            if len(data) >= 3:
                agents = data[2]

            if 'age12' in request.form and request.form['age12'] == 'on':
                ages.append(12)
            if 'age16' in request.form and request.form['age16'] == 'on':
                ages.append(16)
            if 'age18' in request.form and request.form['age18'] == 'on':
                ages.append(18)
            if 'agexxx' in request.form and request.form['agexxx'] == 'on':
                ages.append(19)

            unlimited = request.form['unlimited'] if 'unlimited' in request.form else ''
            if (unlimited == 'on'):
                word = 'unlimited'

            for word in words:
                for age in ages:
                    for agent in agents:
                        if (len(word) == 0 or len(agent) == 0):
                            return flask.make_response(flask.redirect('chat_filter_manager_ai'))

                        _postgres.addAIChatFilter(word, age, agent)
        elif 'edit_bad_Word' in request.form:
            word = request.form['word'].strip()
            age = request.form['age'].strip()
            agent = request.form['agent'].strip()
            _postgres.updateAIChatFilter(word, age, agent)
        elif 'remove_bad_word' in request.form:
            word = request.form['word'].strip()
            age = request.form['age'].strip()
            agent = request.form['agent'].strip()
            _postgres.removeAIChatFilter(word, age, agent)

        return flask.make_response(flask.redirect('chat_filter_manager_ai'))


if __name__ == '__main__':
    envReader.read()
    ais = envReader.getValue('AVAILABLE_AIS').split(';')
    ais = list(filter(None, ais))
    print(ais)    
    app.secret_key = envReader.getValue('BOT_MANAGER_SECRET_KEY')
    print('connecting to the database')
    _postgres = postgres()
    print('starting server')
    app.run(host=envReader.getValue('BOT_MANAGER_IP'), port=envReader.getValue('BOT_MANAGER_PORT'))