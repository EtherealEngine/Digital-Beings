import json
from flask import Flask, session, request
import flask
from postgres import postgres as postgres
from utils import *
import envReader
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Configure a Flask app
app = Flask('bot_manager')
# A Postgres interface object that exchanges data with it using raw requests
_postgres: postgres = None
# A global variable that keeps currently connected AI instances.
# TODO refactor.
ais = []
# Create a Jinja2 template environment
tpl_env = Environment(
    loader=FileSystemLoader('/DigitalBeing/bot_manager/templates'),
    autoescape=select_autoescape(['html', 'xml']),
)


@app.route('/', methods=['POST', 'GET', 'DELETE'])
def api():
    try:
        if request.method == 'POST':
            if 'login' in request.form:
                username = request.form['username']
                password = request.form['password']
                if envReader.getValue('MANAGER_USERNAME') == username and \
                   envReader.getValue('MANAGER_PASSWORD') == password:
                    session['logged_in'] = True
            return flask.make_response(flask.redirect('block_manager'))
        elif request.method == 'GET':
            if session.get('logged_in') == None or \
               session.get('logged_in') == False:
                session['logged_in'] = False
                login_tpl = tpl_env.get_template("login.jinja")
                return login_tpl.render()
            else:
                main_page_tpl = tpl_env.get_template("main_page.jinja")
                return main_page_tpl.render()
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
        blocked_users = _postgres.getBlockedUsers()
        blocked_user_list_tpl = tpl_env.get_template('blocked_user_list.jinja')
        return blocked_user_list_tpl.render(blocked_users=blocked_users)
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
        half_rt, max_rt = _postgres.getChatFilterRatings()
        bad_words = _postgres.getBadWordsRatings()
        user_chat_filter_manager_tpl = tpl_env.get_template("user_chat_filter_manager.jinja")
        return user_chat_filter_manager_tpl.render(bad_words=bad_words, half=half_rt, max=max_rt)
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

@app.route('/chat_filter_manager_ai', methods=['POST', 'GET'])
def chat_filter_manager_ai():
    if request.method == 'GET':
        if session.get('logged_in') == None or session.get('logged_in') == False:
            return flask.make_response(flask.redirect('/'))
        # Words with age associated to them.
        # c1 seems to be 12.
        # c2 seems to be 16.
        # c3 seems to be 18.
        # c4 seems to be 19.
        c1, c2, c3, c4 = _postgres.getAIChatFilter()
        # Fill template variables
        agents = getAgentsAges()
        # This part seems to be unused.
        # bad_words = _postgres.getBadWordsRatings()
        return tpl_env.get_template('ai_chat_filter_manager.jinja').render(
            agents=agents,
            count=str(_postgres.getAIMaxLoopCount()),
            c1=c1,c2=c2,c3=c3,c4=c4
        )
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
            # TODO describe
            if 'age12' in request.form and request.form['age12'] == 'on':
                ages.append(12)
            if 'age16' in request.form and request.form['age16'] == 'on':
                ages.append(16)
            if 'age18' in request.form and request.form['age18'] == 'on':
                ages.append(18)
            if 'agexxx' in request.form and request.form['agexxx'] == 'on':
                ages.append(19)
            # TODO describe
            unlimited = request.form['unlimited'] if 'unlimited' in request.form else ''
            if (unlimited == 'on'):
                word = 'unlimited'
            # TODO describe
            for word in words:
                for age in ages:
                        if (len(word) == 0):
                            return flask.make_response(flask.redirect('chat_filter_manager_ai'))
                        _postgres.addAIChatFilter(word, age)
        elif 'edit_bad_Word' in request.form:
            word = request.form['word'].strip()
            age = request.form['age'].strip()
            agent = request.form['agent'].strip()
            _postgres.updateAIChatFilter(word, age, agent)
        elif 'remove_bad_word' in request.form:
            word = request.form['word'].strip()
            age = request.form['age'].strip()
            _postgres.removeAIChatFilter(word, age)
        elif 'add_agent_age' in request.form:
            agent = request.form['agent'].strip()
            age = request.form['age'].strip()
            _postgres.addAgentAgeGroup(agent, age)
        elif 'remove_agent_age' in request.form:
            agent = request.form['agent'].strip()
            age = request.form['age'].strip()
            _postgres.removeAgentAgeGroup(agent, age)
        elif 'max_loop_count' in request.form:
            count = request.form.get('count', 5)
            _postgres.setAIMaxLoopCount(count)
        return flask.make_response(flask.redirect('chat_filter_manager_ai'))

def getAgentsAges():
    list = _postgres.getAgeGroupsPerAgent()
    if len(list) == 0:
        print('list is empty')
        for ai in ais:
            list.append({ 'agent': ai, 'age': [] })
        return list
        
    for ai in ais:
        found = False
        for j in list:
            if j['agent'] == ai:
                found = True
            
        if not found:
            print('ai ', ai, ' not found')
            list.append({ 'agent': ai, 'age': [] })

    for ai in list:
        i = 0
        ai['age'] = sorted(ai['age'])
        while i < len(ai['age']):
            print(i, ': ', ai['age'][i])
            ai['age'][i] = getAgeGroup(ai['age'][i])
            i += 1

    return list

if __name__ == '__main__':
    envReader.read()
    ais = envReader.getValue('AVAILABLE_AIS').split(';')
    ais = list(filter(None, ais))
    print('Connected AI instances:')
    print(ais)
    app.secret_key = envReader.getValue('BOT_MANAGER_SECRET_KEY')
    print('Connecting to the database.')
    _postgres = postgres()
    print('Starting the Flask server.')
    app.run(
        host=envReader.getValue('BOT_MANAGER_IP'),
        port=envReader.getValue('BOT_MANAGER_PORT')
    )