
import os, sys
currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)
from openchat.agents.gpt3 import GPT3Agent
from openchat.agents.rasa import RasaAgent
from openchat import OpenChat


def handle_message(sender, message):
    print("Handle messages to respond to here!")
    print(sender)
    print(message)
    if sender and message:
        try:
            engine = 'curie-instruct-beta'
            context =   '''
                            user is a student of einstein. einstein is a german born theoretical physicist, 
                            widely acknowledged to be one of the greatest physicists of all time. Einstein is known for developing the theory
                            of relativity, but he has also made important contributions to the development of theory of quantum mechanics
                        '''
            rasa_model_name = '1'
            dialog_gpt_model = 'dialogpt.small'
            gpt_neo_model = 'gptneo.small'
            gpt3_agent = GPT3Agent(engine, context, message)
            rasa_agent = RasaAgent(rasa_model_name, message)
            dialog_gpt_agent = OpenChat(model=dialog_gpt_model, device="cpu")
            gpt_neo_agent = OpenChat(model=gpt_neo_model, device="cpu")
            dialog_gpt_env = dialog_gpt_agent.create_environment_by_name(dialog_gpt_agent.environment)
            gpt_neo_env = gpt_neo_agent.create_environment_by_name(gpt_neo_agent.environment)
            dialog_gpt_response = dialog_gpt_env.start(dialog_gpt_agent.agent, user_message=message)
            gpt_neo_response = gpt_neo_env.start(gpt_neo_agent.agent, user_message=message)
            gpt3_response = gpt3_agent.invoke_api()
            rasa_response = rasa_agent.invoke()
            
            return f'''Respond to message from  {sender} | {message} \n\n 
                        GPT3 Response | {gpt3_response} \n\n
                        Rasa Response | {rasa_response} \n\n 
                        Dialog GPT Response | {dialog_gpt_response} \n\n
                        GPT NEO Response | {gpt_neo_response}
                    '''
        except Exception as err:
            return "Exception: " + str(err)


