import openai
import requests
import json
import os

class GPT3Agent():
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
        payload = "{\n\t \"prompt\": \"" + self.chat_context + "\\nuser:" + self.question + "\\neinstein:\",\n\t  \"max_tokens\": 25,\n\t  \"temperature\": 1,\n\t  \"top_p\": 1,\n\t  \"n\": 1,\n\t  \"stream\": false,\n\t  \"logprobs\": null,\n\t  \"stop\": \"\\n\"\n}"        
        api_key = os.getenv("OPENAI_API_KEY")
        headers = {
            'content-type': "application/json",
            'authorization': f"Bearer {api_key}"
            }
        response = requests.request("POST", url, data=payload, headers=headers)
        response_dic = json.loads(response.text)
        self.agent_response = response_dic['choices'][0]['text']
        return self.agent_response