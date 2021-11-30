from json import dumps, loads
import os
import json
from re import sub as re_sub
import sys

import emoji

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)

# These might be red in your IDE, since we are adding parent dir to path (above)
import agent_params as param
from agents.openchat.agents.gpt3 import GPT3Agent
#from agents.openchat.agents.rasa import RasaAgent
#from agents.openchat.openchat import OpenChat
from agents.repeat.repeat import Repeat
from agents.metaintelligence.metaintelligence import MetaintelligenceWS
from agents.thales.thales import Thales

from tcpServer import tcpServer as server
from jsondb import jsondb as jsondb
from postgres import postgres as _db
from loggingServer import loggingServer as _loggingServer
from aiChatFilterManager import aiChatFilterManager as aicfm

import logging

logger = logging.getLogger("app.main")

def prepare_metaintelligence_history(history_str):
    history = history_str
    #history.reverse()
    # TODO remove the regex after
    # https://github.com/XRFoundation/DigitalBeing/issues/212
    for midx, message in enumerate(history):
        history[midx]['content'] = re_sub(r'<@!\d+>', '', message['content']).strip()
        if history[midx]['author'] == os.getenv('BOT_NAME'):
            history[midx]['author'] = os.getenv('BOT_NAME_HANDLE')
    return history
class DigitalBeing():
    def __init__(self):
        try:            
            self.server = server('127.0.0.1', int(os.getenv('TCP_PORT')), self)
            self.jsondb = jsondb()
            self.jsondb.getAgents()
            self.postgres = _db()
            self.aicfm = aicfm(self.postgres)
            if (os.getenv('LOAD_DISCORD_LOGGER') == 'True'):
                self._logginServer = _loggingServer('127.0.0.1', 7778)
            for model_name in param.SELECTED_AGENTS:
                self.context = self.jsondb.getTopicForAgent(model_name.lstrip())
                print('got self context: ' + self.context)
                if model_name == 'gpt3':
                    self.gpt3_agent = GPT3Agent(engine=param.GPT3_ENGINE, context=self.context)
                #elif model_name == 'rasa':
                #    self.rasa_agent = RasaAgent(param.RASA_MODEL_NAME)
                elif model_name =="repeat":
                    self.repeat_agent = Repeat()
                elif model_name == "metaintelligence":
                    self.mi_agent = MetaintelligenceWS()
                elif model_name == "thales":
                    self.thales = Thales()
                #else:
                #    self.agent = OpenChat(model=model_name, device=param.DEVICE, environment=param.ENVIRONMENT)
                #    self.agent_env = self.agent.create_environment_by_name(self.agent.environment)
        except:
            logger.exception("__init__")

    def sendDiscordMessage(self, text: str):
        try:
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage(text)
        except:
            logger.exception("sendDiscordMessage")

    def handle_message(self, packetId, message, client_name, chat_id, createdAt, message_id, addPing, author, args):
        print('handle message: ', message)
        try:
            chat_history = self.postgres.getHistory(int(os.getenv('CHAT_HISTORY_MESSAGES_COUNT')), client_name, chat_id, author)
            userFirstMessage: bool = not self.postgres.getHasUserSentMessage(client_name, author)
            print('userFirstMessage: ', userFirstMessage)
            parent_chat_history = []
            if (len(args.split(':')) == 2 and len(chat_history) < int(os.getenv('CHAT_HISTORY_MESSAGES_COUNT'))):
                _len = int(os.getenv('CHAT_HISTORY_MESSAGES_COUNT')) - len(chat_history)
                parentId = args.split(':')[1]
                parent_chat_history = self.postgres.getHistory(_len, client_name, parentId, author)
                for x in parent_chat_history:
                    chat_history.append(x)
                
            if (message == None):
                if (hasattr(self, '_logginServer')):
                    self._logginServer.sendMessage("Exception invoke_solo_agent: invalid kwarg: message")
                print("Exception invoke_solo_agent: invalid kwarg: message")
                return { 'none': 'none' }
            responses_dict = {}
            i = 0
            for model_name in param.SELECTED_AGENTS:
                if model_name == 'gpt3':
                    responses_dict = {}
                    if ('\n' in message):
                        message = message.replace('\n', "r''")
                    responses_dict['gpt3'] = self.addEmojis(self.gpt3_agent.invoke_api(message=message))

                    j = 0
                    while self.aicfm.hasBadWord(responses_dict['gpt3'], model_name) or (client_name == "twitter" and len(responses_dict['gpt3']) >= 280):
                        responses_dict['gpt3'] = self.addEmojis(self.gpt3_agent.invoke_api(message=message))
                        j += 1
                        if (j > self.aicfm.getMaxCount()):
                            return

                    if (len(responses_dict) == 0):
                        responses_dict = { 'none': 'none' }

                    self.server.sendMessage(json.dumps([
                                    packetId,
                                    client_name,
                                    chat_id,
                                    message_id,
                                    responses_dict,
                                    addPing,
                                    args
                    ]))

            #    elif model_name == 'rasa':
            #        responses_dict = {}
            #            responses_dict['rasa'] = self.addEmojis(self.rasa_agent.invoke(message=message))

            #            j = 0
            #            while self.aicfm.hasBadWord(responses_dict['rasa'], model_name) or (client_name == "twitter" and len(responses_dict['rasa']) >= 280):
            #                responses_dict['rasa'] = self.addEmojis(self.rasa_agent.invoke(message=message))
            #                j += 1
            #                if j > self.aicfm.getMaxCount():
            #                    return

            #            if (len(responses_dict) == 0):
            #                responses_dict = { 'none': 'none' }

            #            self.server.sendMessage(json.dumps([
            #                        packetId,
            #                        client_name,
            #                        chat_id,
            #                        message_id,
            #                        responses_dict,
            #                        addPing,
            #                        args
            #                    ]))

            #            i += 1                      

                elif model_name == "repeat":
                    responses_dict = {}
                    responses_dict['repeat'] = self.addEmojis(self.repeat_agent.handle_message(message))
                    
                    if (len(responses_dict) == 0):
                        responses_dict = { 'none': 'none' }

                    self.server.sendMessage(json.dumps([
                                packetId,
                                client_name,
                                chat_id,
                                message_id,
                                responses_dict,
                                addPing,
                                args
                            ]))
                    
                elif model_name =="metaintelligence":
                    responses_dict = {}
                    if len(chat_history) == 0 or (len(chat_history) > 0 and chat_history[0]['content'] != message):
                        chat_history.insert(0, { 'author': author, 'content': message, 'db_bot': False })
                    history = prepare_metaintelligence_history(chat_history)
                    responses_dict['metaintelligence'] = self.addEmojis(self.mi_agent.handle_message(history))
                    
                    j = 0
                    while self.aicfm.hasBadWord(responses_dict['metaintelligence'], model_name) or (client_name == "twitter" and len(responses_dict['metaintelligence']) >= 280):
                        history = prepare_metaintelligence_history(chat_history)
                        responses_dict['metaintelligence'] = self.addEmojis(self.mi_agent.handle_message(history))
                        j += 1
                        if (j > self.aicfm.getMaxCount()):
                            return

                    if (len(responses_dict) == 0):
                        responses_dict = { 'metaintelligence': 'none' }

                    self.server.sendMessage(json.dumps([
                                packetId,
                                client_name,
                                chat_id,
                                message_id,
                                responses_dict,
                                addPing,
                                args
                            ]))
                
                elif model_name == "thales":
                    responses_dict = {}
                    responses_dict['thales'] = self.thales.handle_message(message, author)

                    self.server.sendMessage(json.dumps([
                                packetId,
                                client_name,
                                chat_id,
                                message_id,
                                responses_dict,
                                addPing,
                                args
                            ]))
                            
                #else:
                #    responses_dict = {}
                #        responses_dict[model_name] = self.addEmojis(self.agent_env.start(self.agent.agent, user_message=text, model_name=model_name, context=self.context))
                #    
                #        j = 0
                #        while self.aicfm.hasBadWord(responses_dict[model_name], model_name) or (client_name == "twitter" and len(responses_dict[model_name]) >= 280):
                #            responses_dict[model_name] = self.addEmojis(self.agent_env.start(self.agent.agent, user_message='m continue', model_name=model_name, context=self.context))
                #            j += 1
                #            if (j > self.aicfm.getMaxCount()):
                #                return

                #        if (len(responses_dict) == 0):
                #            responses_dict = { 'none': 'none' }

                #        self.server.sendMessage(json.dumps([
                #                    packetId,
                #                    client_name,
                #                    chat_id,
                #                    message_id,
                #                    responses_dict,
                #                    addPing,
                #                    args
                #                ]))

        except Exception as err:
            logger.exception("handle_message")
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception handle_message: " + err)

    def addEmojis(self, msg):
        msg = msg.strip()
        res = ''
        words = msg.split(' ')
        i = 0
        while i < len(words):
            words[i] = emoji.emojize(words[i])
            i += 1
                    
        for x in words:
            res += x + ' '

        return res

    def handle_slash_command(self, client_name, chat_id, command, args, createdAt, author):
        try:
            chat_history = self.postgres.getHistory(int(os.getenv('CHAT_HISTORY_MESSAGES_COUNT')), client_name, chat_id, author)
            chat_history = { command + ' ' + args: chat_history }
            chat_history = dumps(chat_history)
            print(chat_history)
            return { 'none': 'not implemented' }
        
        except Exception as err:
            logger.exception("handle_message")
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception handle_message: " + err)
            return { 'none': 'none' }

    def handle_user_update(self, event, user):
        print('user update: ', event, ' for user: ', user)
        try:
            return { 'none': 'not implemented' }
        
        except Exception as err:
            logger.exception("handle_message")
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception handle_message: " + err)
            return { 'none': 'none' }

    def handle_message_reaction(self, message_id, content, user, reaction, createdAt):
        try:
            return { 'none': 'not implemented' }
        
        except Exception as err:
            logger.exception("handle_message")
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception handle_message: " + err)
            return { 'none': 'none' }

    def get_agents(self):
        try:
            return self.jsondb.getAgents()
        except Exception as err:
            logger.exception("get_agents")
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception get_agents: " + err)
            print("Exception get_agents: " + err)
            return { 'key': 'none', 'value': 'name' }


    def set_agent_fields(self, name, context):
        try:
            if (name == None):
                if (hasattr(self, '_logginServer')):
                    self._logginServer.sendMessage("Exception set_agent_fields: invalid kwarg: name")
                print("Exception set_agent_fields: invalid kwarg: name")
                return {'name': 'none', 'context': 'none'}
            if (context == None):
                if (hasattr(self, '_logginServer')):
                    self._logginServer.sendMessage("Exception set_agent_fields: invalid kwarg: context")
                print("Exception set_agent_fields: invalid kwarg: context")
                return {'name': 'none', 'context': 'none'}
            self.jsondb.setAgentName(context.lstrip(), name.lstrip())
            return {'name': name, 'context': context}
        except Exception as err:
            logger.exception()
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception set_agent_fields: " + err)
            print("Exception set_agent_fields: " + err)
            return {'name': 'none', 'context': 'none'}


    def invoke_solo_agent(self, message, model_name):
        try:
            if (message == None):
                if (hasattr(self, '_logginServer')):
                    self._logginServer.sendMessage("Exception invoke_solo_agent: invalid kwarg: message")
                print("Exception invoke_solo_agent: invalid kwarg: message")
                return { 'key': 'none', 'value': 'none' }
            if (model_name == None):
                if (hasattr(self, '_logginServer')):
                    self._logginServer.sendMessage("Exception invoke_solo_agent: invalid kwarg: agent")
                print("Exception invoke_solo_agent: invalid kwarg: agent")
                return { 'key': 'none', 'value': 'none' }
            response_dict = {}
            context = self.jsondb.getTopicForAgent(model_name.lstrip())
            if model_name == 'gpt3':
                response_dict['gpt3'] = self.gpt3_agent.invoke_api(message=message)
            else:
                response_dict[model_name] = self.agent_env.start(self.agent.agent, user_message=message, model_name=model_name, context=context)
            return response_dict
        except Exception as err:
            logger.exception()
            if (hasattr(self, '_logginServer')):
                self._logginServer.sendMessage("Exception invoke_solo_agent: " + err)
            print("Exception invoke_solo_agent: " + err)
            return { 'key': 'none', 'value': 'none' }