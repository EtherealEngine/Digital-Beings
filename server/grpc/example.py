
import os
import sys

import sqlite3 as lite
from itertools import chain

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)


# These might be red in your IDE, since we are adding parent dir to path (above)
import agent_params as param
from agents.openchat.agents.gpt3 import GPT3Agent
from agents.openchat.agents.rasa import RasaAgent
from agents.openchat.openchat import OpenChat


def handle_message(**kwargs):
    sender = kwargs.get('sender')
    message = kwargs.get('message')
    responses_dict = {}
    if sender and message:
        try:
            for model_name in param.SELECTED_AGENTS:
                if model_name == 'gpt3':
                    gpt3_agent = GPT3Agent(param.GPT3_ENGINE, param.CONTEXT, message)
                    responses_dict['gpt3'] = gpt3_agent.invoke_api()
                elif model_name == 'rasa':
                    rasa_agent = RasaAgent(param.RASA_MODEL_NAME, message)
                    responses_dict['rasa'] = rasa_agent.invoke()
                else:
                    agent = OpenChat( 
                                        model=model_name,
                                        device=param.DEVICE,
                                        environment=param.ENVIRONMENT
                                    )
                    agent_env = agent.create_environment_by_name(agent.environment)
                    responses_dict[model_name] = agent_env.start(agent.agent, user_message=message, model_name=model_name)

            return responses_dict
        except Exception as err:
            return "Exception: " + str(err)


def get_agents():
    con = lite.connect(param.SQLITE_DB)
    cursor = con.cursor()
    cursor.execute("SELECT name FROM Agents")
    agents_tuple = cursor.fetchall()
    cursor.close()
    con.close()
    agents_list = list(chain.from_iterable(agents_tuple))
    agents_dict = dict.fromkeys(agents_list, "selected_agent")

    return agents_dict


def set_agent_fields(**kwargs):
    name = kwargs.get('name')
    context = kwargs.get('context')
    sender = kwargs.get('sender')
    message = kwargs.get('message')
    agent_type = kwargs.get('type')
    con = lite.connect(param.SQLITE_DB)
    cursor = con.cursor()
    cursor.execute(f"UPDATE Agents SET topic = '{context.lstrip()}' WHERE name = '{name.lstrip()}'")
    cursor.execute(f"SELECT  name, topic FROM Agents WHERE name = ?", (name.lstrip(),))
    agents_tuple = cursor.fetchone()
    agents_dict = dict(zip([c[0] for c in cursor.description], agents_tuple))
    con.commit()
    cursor.close()
    con.close()

    return agents_dict


def invoke_solo_agent(**kwargs):
    sender = kwargs.get('sender')
    message = kwargs.get('message')
    model_name = kwargs.get('agent')
    response_dict = {}
    if model_name == 'gpt3':
        gpt3_agent = GPT3Agent(param.GPT3_ENGINE, param.CONTEXT, message)
        response_dict['gpt3'] = gpt3_agent.invoke_api()
    elif model_name == 'rasa':
        rasa_agent = RasaAgent(param.RASA_MODEL_NAME, message)
        response_dict['rasa'] = rasa_agent.invoke()
    else:
        agent = OpenChat( 
                            model=model_name,
                            device=param.DEVICE,
                            environment=param.ENVIRONMENT
                        )
        agent_env = agent.create_environment_by_name(agent.environment)
        response_dict[model_name] = agent_env.start(agent.agent, user_message=message, model_name=model_name)
    
    return response_dict

