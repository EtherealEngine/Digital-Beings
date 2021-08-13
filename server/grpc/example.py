
import os
import sys
currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)
from openchat.agents.gpt3 import GPT3Agent
from openchat.agents.rasa import RasaAgent
from openchat import OpenChat
import agent_params
import sqlite3 as lite


def handle_message(sender, message):
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
            agent_response = ''
            for model_name in agent_params.SELECTED_AGENTS:
                agent = OpenChat( 
                                    model=model_name,
                                    device=agent_params.DEVICE,
                                    environment=agent_params.ENVIRONMENT
                                )
                agent_env = agent.create_environment_by_name(agent.environment)
                agent_response += f'\n\n {model_name.split(".")[0].upper()} Response | ' + agent_env.start(agent.agent, user_message=message)
            gpt3_response = gpt3_agent.invoke_api()
            rasa_response = rasa_agent.invoke()
            
            return f'GPT3 Response | {gpt3_response} \n\n Rasa Response | {rasa_response} {agent_response} '
        except Exception as err:
            return "Exception: " + str(err)


def get_agents():
    con = lite.connect('../DigitalBeing/server/digitalbeing.db')
    cursor = con.cursor()
    cursor.execute("SELECT name FROM Agents")
    agents_tuple = cursor.fetchall()
    cursor.close()
    con.close()
    
    from itertools import chain
    agents_list = list(chain.from_iterable(agents_tuple))

    return agents_list


def set_agent_fields(name, context, sender=None, message=None, type=None):
    con = lite.connect('../DigitalBeing/server/digitalbeing.db')
    cursor = con.cursor()
    cursor.execute(f"UPDATE Agents SET topic = '{context.lstrip()}' WHERE name = '{name.lstrip()}'")
    cursor.execute(f"SELECT  name, topic FROM Agents WHERE name = ?", (name.lstrip(),))
    agents_tuple = cursor.fetchall()
    con.commit()
    cursor.close()
    con.close()

    from itertools import chain
    agents_list = list(chain.from_iterable(agents_tuple))

    return agents_list[0], agents_list[1]
