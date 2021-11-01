'''import random
import torch
import gc

from ..base.agents.base import BaseAgent, SingleTurn
from ..base.agents.convai2 import ConvAI2Agent
from ..base.agents.prompt import PromptAgent
from ..base.agents.wow import WizardOfWikipediaAgent
from ..base.envs.base import BaseEnvironment
from ..utils.terminal_utils import cprint, cinput



class CustomEnvironment(BaseEnvironment):

    def __init__(self):
        super().__init__()
        self.user_id = "dummy_value"

    def start(self, agent: BaseAgent, **kwargs):
        self.model_name = kwargs.get('model_name')
        self.context = kwargs.get('context')
        self.clear_histories(self.user_id)
        gc.enable()
        torch.cuda.empty_cache()
        if self.is_empty(self.user_id):
            pre_dialog_output = self.pre_dialog_for_special_tasks(agent)

        if isinstance(agent, PromptAgent):
            user_name, bot_name = pre_dialog_output
            user_message = kwargs.get('user_message')
        else:
            user_message = kwargs.get('user_message')

        if isinstance(agent, WizardOfWikipediaAgent):
            user_message = agent.retrieve_knowledge(user_message)

        if isinstance(agent, PromptAgent):
            user_message = f"{user_name}: {user_message} {bot_name}:"

        if isinstance(agent, SingleTurn):
            model_input = user_message
        else:
            model_input = self.make_model_input(
                self.user_id,
                user_message,
                agent,
            )

        self.add_user_message(self.user_id, user_message)

        if isinstance(agent, PromptAgent):
            bot_message = agent.predict(
                model_input,
                person_1=user_name,
                person_2=bot_name,
            )["output"]

        else:
            bot_message = agent.predict(model_input)["output"]

        self.add_bot_message(self.user_id, bot_message)
        gc.collect()

        return bot_message

    def pre_dialog_for_special_tasks(self, agent):
        if isinstance(agent, ConvAI2Agent):
            return self.pre_dialog_for_convai2(agent)

        if isinstance(agent, WizardOfWikipediaAgent):
            return self.pre_dialog_for_wow(agent)

        if isinstance(agent, PromptAgent):
            return self.pre_dialog_for_prompt(agent)

    def pre_dialog_for_prompt(self, agent):
        user_name = 'user'

        bot_name = 'einstein'

        agent.name = bot_name

        story = '''''' user is a student of einstein. einstein is a german born theoretical physicist, 
                    widely acknowledged to be one of the greatest physicists of all time. Einstein is known for developing the theory
                    of relativity, but he has also made important contributions to the development of theory of quantum mechanics.
                ''''''

        if (user_name not in story) or (bot_name not in story):
            raise Exception("The story MUST contain '{user_name}' and '{bot_name}")


        story += f" {user_name} and {bot_name} start talking. "
        story += f"{user_name}: Hello {bot_name}. "
        story += f"{bot_name}: Hi {user_name}. "

        agent.add_prompt(
            self.histories,
            self.user_id,
            story,
        )

        return user_name, bot_name

    def pre_dialog_for_convai2(self, agent):
        cprint(
            f"[SYSTEM]: Please input [{agent.name.upper()}]'s perosna.\n"
            f"[SYSTEM]: Enter '.done' if you want to end input persona.\n",
            color=self.system_color)

        while True:
            _persona = cinput(
                f"[{agent.name.upper()}'s PERSONA]: ",
                color=self.special_color,
            )

            if _persona == ".done":
                cprint(
                    f"[{agent.name.upper()}'s PERSONA]: Persona setting complete.\n",
                    color=self.special_color,
                )
                break
            else:
                agent.add_persona(
                    self.histories,
                    user_id=self.user_id,
                    text=_persona,
                )

    def pre_dialog_for_wow(self, agent):
        _topic = self.context
        agent.set_topic(_topic)'''