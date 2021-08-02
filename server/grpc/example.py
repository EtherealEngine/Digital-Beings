
import os, sys
currentdir = os.path.dirname(os.path.realpath(__file__))
parentdir = os.path.dirname(currentdir)
sys.path.append(parentdir)
from openchat.agents.dialogpt import DialoGPTAgent
from openchat.agents.gptneo import GPTNeoAgent
from openchat.agents.gpt3 import GPT3Agent
from openchat.agents.rasa import RasaAgent


def handle_message(sender, message):
    print("Handle messages to respond to here!")
    print(sender)
    print(message)
    if sender and message:
        try:
            engine = 'curie-instruct-beta'
            context = 'Agent is a teacher expert in Web Development. You have skills in HTML And the problem your student is telling you about is I have been trying to center a div inside another div for over an hour now, I just can not do it, i need help with it..'
            rasa_model_name = '1'
            dialog_gpt_model = 'dialogpt.small'
            gpt_neo_model = 'gptneo.small'
            gpt3_agent = GPT3Agent(engine, context, message)
            rasa_agent = RasaAgent(rasa_model_name, message)
            dialog_gpt_agent = DialoGPTAgent(model=dialog_gpt_model, device="cpu", maxlen=48)
            gpt_neo_agent = GPTNeoAgent(model=gpt_neo_model, device="cpu", maxlen=48)
            dialog_gpt_response = dialog_gpt_agent.predict(message)
            gpt_neo_response = gpt_neo_agent.predict(message)
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


