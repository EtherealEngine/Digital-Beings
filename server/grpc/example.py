
import os
import sys

import sqlite3 as lite
from itertools import chain

currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)


# These might be red in your IDE, since we are adding parent dir to path (above)
import agent_params
from agents.openchat.agents.gpt3 import GPT3Agent
from agents.openchat.agents.rasa import RasaAgent
from agents.openchat.openchat import OpenChat


def handle_message(sender, message):
    responses_dict = {}
    if sender and message:
        try:
            gpt3_agent = GPT3Agent(
                                    agent_params.GPT3_ENGINE,
                                    agent_params.CONTEXT,
                                    message
                                  )
            rasa_agent = RasaAgent( 
                                    agent_params.RASA_MODEL_NAME,
                                    message
                                  )
            for model_name in agent_params.SELECTED_AGENTS:
                agent = OpenChat( 
                                    model=model_name,
                                    device=agent_params.DEVICE,
                                    environment=agent_params.ENVIRONMENT
                                )
                agent_env = agent.create_environment_by_name(agent.environment)
                responses_dict[model_name] = agent_env.start(agent.agent, user_message=message)

            responses_dict['gpt3'] = gpt3_agent.invoke_api()
            responses_dict['rasa'] = rasa_agent.invoke()
            return responses_dict
        except Exception as err:
            return "Exception: " + str(err)


def get_agents():
    con = lite.connect(agent_params.SQLITE_DB)
    cursor = con.cursor()
    cursor.execute("SELECT name FROM Agents")
    agents_tuple = cursor.fetchall()
    cursor.close()
    con.close()
    agents_list = list(chain.from_iterable(agents_tuple))

    return agents_list


def set_agent_fields(name, context, sender=None, message=None, type=None):
    con = lite.connect(agent_params.SQLITE_DB)
    cursor = con.cursor()
    cursor.execute(f"UPDATE Agents SET topic = '{context.lstrip()}' WHERE name = '{name.lstrip()}'")
    cursor.execute(f"SELECT  name, topic FROM Agents WHERE name = ?", (name.lstrip(),))
    agents_tuple = cursor.fetchall()
    con.commit()
    cursor.close()
    con.close()
    agents_list = list(chain.from_iterable(agents_tuple))

    return agents_list[0], agents_list[1]
