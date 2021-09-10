
import os
import sys

import sqlite3 as lite

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)


# These might be red in your IDE, since we are adding parent dir to path (above)
import agent_params as param
from agents.openchat.agents.gpt3 import GPT3Agent
from agents.openchat.agents.rasa import RasaAgent
from agents.openchat.openchat import OpenChat

import logging
import traceback
import sys


logger = logging.getLogger("app.main")


def initialize_db():
    con = lite.connect(param.SQLITE_DB)
    con.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
    cursor = con.cursor()
    return con, cursor


def close_db_connection(con, cursor):
    con.commit()
    cursor.close()
    con.close()


def execute_db_transaction(query):
    con, cursor = initialize_db()
    cursor.execute(query)
    agents_list = cursor.fetchall()
    close_db_connection(con, cursor)
    return agents_list


def handle_message(**kwargs):
    message = kwargs.get('message')
    responses_dict = {}
    try:
        for model_name in param.SELECTED_AGENTS:
            select_query = f"SELECT topic FROM Agents WHERE name = '{model_name.lstrip()}'"
            agents_list = execute_db_transaction(select_query)
            context = agents_list[0].get('topic')
            if model_name == 'gpt3':
                gpt3_agent = GPT3Agent(param.GPT3_ENGINE, context, message)
                responses_dict['gpt3'] = gpt3_agent.invoke_api()
            elif model_name == 'rasa':
                rasa_agent = RasaAgent(param.RASA_MODEL_NAME, message)
                responses_dict['rasa'] = rasa_agent.invoke()
            else:
                agent = OpenChat(model=model_name, device=param.DEVICE, environment=param.ENVIRONMENT)
                agent_env = agent.create_environment_by_name(agent.environment)
                responses_dict[model_name] = agent_env.start(agent.agent, user_message=message, model_name=model_name, context=context)
        return responses_dict
    except:
        logger.exception("Exception handle_message")


def get_agents():
    select_query = "SELECT name FROM Agents"
    try:
        agents_list = execute_db_transaction(select_query)
        agents_dict = {}
        for dic in agents_list:
            agents_dict.update({dic[key]:key for key in dic})
        return agents_dict
    except:
        logger.exception("Exception get_agents")


def set_agent_fields(**kwargs):
    name = kwargs.get('name')
    context = kwargs.get('context')
    update_query = f"UPDATE Agents SET topic = '{context.lstrip()}' WHERE name = '{name.lstrip()}'"
    try:
        agents_tuple = execute_db_transaction(update_query)
        return {'name': name, 'context': context}
    except:
        logger.exception("Exception set_agent_fields")


def invoke_solo_agent(**kwargs):
    message = kwargs.get('message')
    model_name = kwargs.get('agent')
    response_dict = {}
    try:
        select_query = f"SELECT topic FROM Agents WHERE name = '{model_name.lstrip()}'"
        agents_list = execute_db_transaction(select_query)
        context = agents_list[0].get('topic')
        if model_name == 'gpt3':
            gpt3_agent = GPT3Agent(param.GPT3_ENGINE, context, message)
            response_dict['gpt3'] = gpt3_agent.invoke_api()
        elif model_name == 'rasa':
            rasa_agent = RasaAgent(param.RASA_MODEL_NAME, message)
            response_dict['rasa'] = rasa_agent.invoke()
        else:
            agent = OpenChat(model=model_name, device=param.DEVICE, environment=param.ENVIRONMENT)
            agent_env = agent.create_environment_by_name(agent.environment)
            response_dict[model_name] = agent_env.start(agent.agent, user_message=message, model_name=model_name, context=context)
        return response_dict
    except:
        logger.exception("Exception invoke_solo_agent")

