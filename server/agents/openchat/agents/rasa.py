from rasa.core.agent import Agent
from rasa.utils.endpoints import EndpointConfig
import asyncio


class RasaAgent():
    def __init__(self, **kwargs):
        self.model_name = kwargs.get('model')
        self.response = ''
        self.message = ''
    
    def invoke(self, **kwargs):
        self.message = kwargs.get('message')
        action_endpoint = "http://localhost:5055/webhook"
        output_path	= "../DigitalBeing/server/agents/rasa/models/"
        full_modal_path = output_path+self.model_name+".tar.gz"
        agent = Agent.load(full_modal_path, action_endpoint=EndpointConfig(action_endpoint))
        if agent.is_ready():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop = asyncio.get_event_loop()
            self.response = loop.run_until_complete(agent.handle_text(self.message))
            agent_response_data = agent.tracker_store.retrieve_full_tracker("default")._latest_message_data()
            intent = agent_response_data.get('intent',{})
            confidence = intent.get('confidence', 0)            
            if confidence >= 0.20:
                return self.response[0].get("text")
            else:
                return "Im sorry can you elaborate?"
        else:
            raise Exception("wrong rasa model")