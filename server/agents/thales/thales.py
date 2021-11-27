from json import dumps
from re import sub, split, IGNORECASE, MULTILINE
from random import choice
import asyncio
import websockets
import os
import requests

class Thales:
    def __init__(self):
        self.server_uri = os.getenv('THALES_CONNECTION_STRING')

    async def get_response(self, message, sender):
        result = ''
        r = requests.post(self.server_uri, json={'message': message, 'sender': sender})
        if (r.status_code == 200):
            result = r.json()['result']
        return result

    def handle_message(self, message, sender):
        result = ''
        try:
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(self.get_response(message, sender))
            if isinstance(result, list):
                result = '\n'.join(result)
            print('\n\n')
            print(f'Thales bot output: {result}')
            print('\n\n')
        except Exception as exc:
            result = choice([
                'Hm', 'Hm-m', 'I\'m not sure', 'I wonder', 'I don\'t know',
                'I\'m trying to think of a good answer.'
            ])
            print(exc)
        return result