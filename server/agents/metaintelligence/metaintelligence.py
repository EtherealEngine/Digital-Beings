from json import dumps
from re import sub, split, IGNORECASE, MULTILINE
from random import choice
import asyncio
import websockets
import os

class MetaintelligenceWS:
    def __init__(self):
        # TODO add some form of a configuration system later
        self.server_uri = os.getenv('METAINTELLIGENCE_CONNECTION_STRING')

    async def get_ws_response(self, history):
        print('sending data (history):')
        print(history)
        print('\n\n')
        result = ''
        async with websockets.connect(
            self.server_uri, close_timeout=10000
        ) as websocket:
            await websocket.send( dumps(history) )
            result = await websocket.recv()
        return result

    def handle_message(self, history):
        result = ''
        try:
            loop = asyncio.new_event_loop()
            result = loop.run_until_complete(self.get_ws_response(history))
            if isinstance(result, list):
                result = '\n'.join(result)
            print('\n\n')
            print(f'Metaintelligence bot output: {result}')
            print('\n\n')
        except Exception as exc:
            result = choice([
                'Hm', 'Hm-m', 'I\'m not sure', 'I wonder', 'I don\'t know',
                'I\'m trying to think of a good answer.'
            ])
            print(exc)
        return result