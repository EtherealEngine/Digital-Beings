
import requests
import openai
import json
import os


def handle_message(sender, message):
    print("Handle messages to respond to here!")
    if sender and message:
        engine = 'curie-instruct-beta'
        context = 'Agent is a teacher expert in Web Development. You have skills in HTML And the problem your student is telling you about is I have been trying to center a div inside another div for over an hour now, I just can not do it, i need help with it..'
        rasa_model_name = '1'
        gpt3_agent = Gpt3Agent(engine, context, message)
        rasa_agent = RasaAgent(rasa_model_name, message)
        gpt3_response = gpt3_agent.invoke_api()
        rasa_response = rasa_agent.invoke()
        return "Respond to message from " + sender + " | " + message + "\n\n" + "GPT3 Response" + " | " + gpt3_response + "\n\n" + "Rasa Response" + " | " + rasa_response


class Gpt3Agent():
    engine_name = ''
    chat_context = ''
    question = ''
    agent_response = ''
    
    
    def __init__(self, engine, context, question):
        self.engine_name = engine
        self.question = question
        self.chat_context = context


    def invoke(self):
        prompt   = f'{self.chat_context}\nQ: {self.question}\nAgent:'
        openai.organization = os.getenv("OPENAI_ORG_ID")
        openai.api_key = os.getenv("OPENAI_API_KEY")
        completion = openai.Completion()
        response = completion.create(
                                        prompt=prompt, engine=self.engine_name, stop=['\nQ:'], temperature=0.9,
                                        top_p=1, frequency_penalty=0, presence_penalty=0.6, best_of=1,
                                        max_tokens=80
                                    )
        self.agent_response = response.choices[0].text.strip()
        
        return self.agent_response
    
    
    def invoke_api(self):
        url = f"https://api.openai.com/v1/engines/{self.engine_name}/completions"
        payload = "{\n\t \"prompt\": \"" + self.chat_context + "\\nQ:" + self.question + "\\nAgent:\",\n\t  \"max_tokens\": 25,\n\t  \"temperature\": 1,\n\t  \"top_p\": 1,\n\t  \"n\": 1,\n\t  \"stream\": false,\n\t  \"logprobs\": null,\n\t  \"stop\": \"\\n\"\n}"        
        headers = {
            'content-type': "application/json",
            'authorization': "Bearer sk-7c8vc7fXQhauFBXy8mXxtfX998p91iku8ktWWm4J"
            }
        response = requests.request("POST", url, data=payload, headers=headers)
        response_dic = json.loads(response.text)
        self.agent_response = response_dic['choices'][0]['text']

        return self.agent_response


from rasa.core.agent import Agent
from rasa.utils.endpoints import EndpointConfig
from rasa import train
import asyncio


class RasaAgent():
    model_name = ''
    response = ''
    question = ''
    
    
    def __init__(self, model, question):
        self.model_name = model
        self.question = question
        
    
    def invoke(self):
        action_endpoint = "http://localhost:5055/webhook"
        output_path	= "rasa/models/"
        full_modal_path = output_path+self.model_name+".tar.gz"
        agent = Agent.load(full_modal_path, action_endpoint=EndpointConfig(action_endpoint))
        if agent.is_ready():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop = asyncio.get_event_loop()
            self.response = loop.run_until_complete(agent.handle_text(self.question))
            agent_response_data = agent.tracker_store.retrieve_full_tracker("default")._latest_message_data()
            intent = agent_response_data.get('intent',{})
            confidence = intent.get('confidence', 0)
            print("rasa response => ", self.response[0].get("text"))
            
            if confidence >= 0.20:
                return self.response[0].get("text")
            else:
                return "Im sorry can you elaborate?"
        else:
            return "No Agent Found"