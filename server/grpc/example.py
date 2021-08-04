
import os
import sys
currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)
from openchat.agents.gpt3 import GPT3Agent
from openchat.agents.rasa import RasaAgent
from openchat import OpenChat
import agent_params


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
            for model_name in agent_params.SELECTED_AGENTS:
                agent = OpenChat( 
                                    model=model_name,
                                    device=agent_params.DEVICE,
                                    environment=agent_params.ENVIRONMENT
                                )
                agent_env = agent.create_environment_by_name(agent.environment)
                agent_response = f'\n\n {model_name.split(".")[0].upper()} Response | '.join(agent_env.start(agent.agent, user_message=message))
            gpt3_response = gpt3_agent.invoke_api()
            rasa_response = rasa_agent.invoke()
            
            return f'Respond to message from  {sender} | {message} \n\n GPT3 Response | {gpt3_response} \n\n Rasa Response | {rasa_response} \n\n {agent_response} '
        except Exception as err:
            return "Exception: " + str(err)


