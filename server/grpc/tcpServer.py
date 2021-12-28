import socket
from threading import Thread
import json

class tcpServer:
    def __init__(self, host, port, DB):
        self.DB = DB
        self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        self._socket.bind((host, port))
        print('listening')
        self._socket.listen(1)

        self.conn = self._socket.accept()[0]
        print('client connected')
        self.thread = Thread(target=self.listener)
        self.thread.start()

    def listener(self):
        while(True):
            data = self.conn.recv(2048)
            if data != None and len(data) > 0:
                data = data.decode('utf-8')
                try:
                    data = json.loads(data)
                except: 
                    continue
                packetId = data['id']
                print(packetId)

                '''Packet IDs: 
                0 -> Ping
                1 -> Slash Command
                2 -> User Update Event (Join/Leave)
                3 -> Get Agents
                4 -> Set Agent's Fields
                5 -> Ping Solo Agent
                6 -> Message Reaction Add
                7 -> Message Edit
                '''
                if packetId == 0: #Ping
                    message = data['message'].strip()
                    message_id = data['message_id']
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    createdAt = data['createdAt']
                    addPing = data['addPing']
                    author = data['author']
                    args = data['args']
                    print(data)
                    self.DB.handle_message(0, message, client_name, chat_id, createdAt, message_id, addPing, author, args)
                elif packetId == 1: #Slash Command
                    sender = data['sender']
                    command = data['command']
                    args = data['args']
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    createdAt = data['createdAt']
                    resp = self.DB.handle_slash_command(client_name, chat_id, command, args, createdAt, sender)

                    self.sendMessage(json.dumps([
                        1,
                        client_name,
                        chat_id,
                        resp
                    ]))

                elif packetId == 2: #User Update Event (Join/Leave)
                    client_name = data['client_name']
                    event = data['event']
                    user = data['user']
                    createdAt = data['createdAt']
                    resp = self.DB.handle_user_update(event, user)

                    self.sendMessage(json.dumps([
                        2,
                        client_name,
                        'none',
                        resp
                    ]))
                elif packetId == 3: #Get Agents
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    resp = self.DB.getAgents()

                    self.sendMessage(json.dumps([
                        3,
                        client_name,
                        chat_id,
                        resp
                    ]))
                elif packetId == 4: #Set Agent's Fields
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    name = data['name']
                    context = data['context']
                    resp = self.DB.set_agent_fields(name, context)

                    self.sendMessage(json.dumps([
                        4,
                        client_name,
                        chat_id,
                        resp
                    ]))
                elif packetId == 5: #Ping Solo Agent
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    message_id = data['message_id']
                    message = data['message']
                    agent = data['agent']
                    addPing = data['addPing']
                    resp = self.DB.invoke_solo_agent(message, agent)

                    self.sendMessage(json.dumps([
                        5,
                        client_name,
                        chat_id,
                        message_id,
                        resp,
                        addPing
                    ]))
                elif packetId == 6: #Message Reaction Add
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    message_id = data['message_id']
                    content = data['content']
                    user = data['user']
                    reaction = data['reaction']
                    createdAt = data['createdAt']
                    resp = self.DB.handle_message_reaction(message_id, content, user, reaction, createdAt)

                    self.sendMessage(json.dumps([
                        6,
                        client_name,
                        'none',
                        resp
                    ]))
                elif packetId == 7: #Message Edit
                    message = data['message'].strip()
                    message_id = data['message_id']
                    client_name = data['client_name']
                    chat_id = data['chat_id']
                    createdAt = data['createdAt']
                    addPing = data['addPing']
                    author = data['author']
                    args = data['args']
                    self.DB.handle_message(7, message, client_name, chat_id, createdAt, message_id, addPing, author, args)
                elif packetId == 8: #Metadata
                    channel_name = data['channel_name']
                    client_name = data['client_name']
                    channel_id = data['channel_id']
                    metadata = data['metadata']
                    print('got metadata from channel: ', channel_name, ' data: ', metadata)
                else:
                    print('found incorect packet id: ' + str(packetId))

    def sendMessage(self, json: str):
        if (hasattr(self, 'conn')):
            try:
                self.conn.send(str(json).encode())
            except Exception as err:
                print('tcpServer sendMessage: ' + err)

    def sendChatMessage(self, message, message_id, client_name, chat_id, addPing ):
        responses_dict = {}
        responses_dict['custom'] = message

        self.server.sendMessage(json.dumps([
                                    0,
                                    client_name,
                                    chat_id,
                                    message_id,
                                    responses_dict,
                                    addPing,
                                    'none'
                                ]))