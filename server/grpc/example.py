
import os
import sys

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)


# These might be red in your IDE, since we are adding parent dir to path (above)
import agent_params as param
from agents.openchat.agents.gpt3 import GPT3Agent
from agents.openchat.agents.rasa import RasaAgent
from agents.openchat.openchat import OpenChat

from jsondb import jsondb as jsondb

import logging

logger = logging.getLogger("app.main")

class DigitalBeing():

    def __init__(self, **kwargs):
        self.jsondb = jsondb()
        self.jsondb.getAgents()
        for model_name in param.SELECTED_AGENTS:
            self.context = self.jsondb.getTopicForAgent(model_name.lstrip())
            print('got self context: ' + self.context)
            if model_name == 'gpt3':
                self.gpt3_agent = GPT3Agent(engine=param.GPT3_ENGINE, context=self.context)
            elif model_name == 'rasa':
                self.rasa_agent = RasaAgent(param.RASA_MODEL_NAME)
            else:
                self.agent = OpenChat(model=model_name, device=param.DEVICE, environment=param.ENVIRONMENT)
                self.agent_env = self.agent.create_environment_by_name(self.agent.environment)


    def handle_message(self, **kwargs):
        message = kwargs.get('message')
        responses_dict = {}
        try:
            for model_name in param.SELECTED_AGENTS:
                if model_name == 'gpt3':
                    responses_dict['gpt3'] = self.gpt3_agent.invoke_api(message=message)
                elif model_name == 'rasa':
                    responses_dict['rasa'] = self.rasa_agent.invoke(message=message)
                else:
                    responses_dict[model_name] = self.agent_env.start(self.agent.agent, user_message=message, model_name=model_name, context=self.context)
            return responses_dict
        except Exception as err:
            print("Exception handle_message: " + err)


    def get_agents(self):
        try:
            return self.jsondb.getAgents()
        except Exception as err:
            print("Exception get_agents: " + err)


    def set_agent_fields(self, **kwargs):
        name = kwargs.get('name')
        context = kwargs.get('context')
        try:
            self.jsondb.setAgentName(context.lstrip(), name.lstrip())
            return {'name': name, 'context': context}
        except Exception as err:
            print("Exception set_agent_fields: " + err)


    def invoke_solo_agent(self, **kwargs):
        message = kwargs.get('message')
        model_name = kwargs.get('agent')
        response_dict = {}
        try:
            context = self.jsondb.getTopicForAgent(model_name.lstrip())
            if model_name == 'gpt3':
                response_dict['gpt3'] = self.gpt3_agent.invoke_api(message=message)
            elif model_name == 'rasa':
                response_dict['rasa'] = self.rasa_agent.invoke(message=message)
            else:
                response_dict[model_name] = self.agent_env.start(self.agent.agent, user_message=message, model_name=model_name, context=context)
            return response_dict
        except Exception as err:
            print("Exception invoke_solo_agent: " + err)

