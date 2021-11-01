'''from rasa.core.agent import Agent
from rasa.utils.endpoints import EndpointConfig
import asyncio
import logging

logger = logging.getLogger("app.main")


class RasaAgent():
    def __init__(self, **kwargs):
        self.model_name = kwargs.get('model')
        self.response   = None
        self.message    = None
        self.action_endpoint = "http://localhost:5055/webhook"
        self.modal_dir  = "../DigitalBeing/server/agents/rasa/models/"
    
    
    def invoke(self, **kwargs):
        self.message = kwargs.get('message')
        modal_path = f"{self.modal_dir}{self.model_name}.tar.gz"
        agent = Agent.load(modal_path, action_endpoint=EndpointConfig(self.action_endpoint))
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
            logger.exception("Exception: select from available rasa models")'''