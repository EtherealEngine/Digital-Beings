import openai
import requests
import json
import os

class GPT3Agent():
    def __init__(self, **kwargs):
        print('initializing gpt3 agent')
        self.chat_context = kwargs.get('context')
        self.engine_name  = kwargs.get('engine')
        self.openai_url   = f"https://api.openai.com/v1/engines/{self.engine_name}/completions"
        self.agent_response = None
        self.message = None
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.headers = {
            'content-type': "application/json",
            'authorization': f"Bearer {self.api_key}"
            }
    
    
    def invoke_api(self, **kwargs):
        self.message = kwargs.get('message')
        payload = "{\n\t \"prompt\": \"" + self.chat_context + "\\nuser:" + self.message + "\\neinstein:\",\n\t  \"max_tokens\": 25,\n\t  \"temperature\": 1,\n\t  \"top_p\": 1,\n\t  \"n\": 1,\n\t  \"stream\": false,\n\t  \"logprobs\": null,\n\t  \"stop\": \"\\n\"\n}"      
        payload = payload.encode("utf-8", "ignore") 
        response_dic = json.loads(requests.request("POST", self.openai_url, data=payload, headers=self.headers).text)
        print(response_dic)
        if ('error' in response_dic):
            print(response_dic['error'])
            return 'internal error'
        else:
            self.agent_response = response_dic['choices'][0]['text']
        return self.agent_response