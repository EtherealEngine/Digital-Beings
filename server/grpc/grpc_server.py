import grpc
from concurrent import futures
import logging
import time
import os

# import the generated classes
import example_pb2
import example_pb2_grpc

# import the original example.py
from example import DigitalBeing as DB

logger = logging.getLogger('server_logger')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
fh = logging.FileHandler('grpc_server.log')
fh.setLevel(logging.DEBUG)

logger.addHandler(fh)

# create a class to define the server functions, derived from
# example_pb2_grpc.AgentServicer
class AgentServicer(example_pb2_grpc.AgentServicer):

    def __init__(self):
        self.digital_being = DB()

    # the request and response are of the data type
    # example_pb2.Request
    def InitializeAgents(self, request, context):
        try:
            response = example_pb2.Response()
            response.response.update({"response":"Initialized all agents"})
            return response
        except Exception as err:
            logger.exception()
            DB.sendDiscordMessage('InitializeAgents exception:' + err)
            print('InitializeAgents exception:' + err)
            return {"response":"Couldn't initialize all agents"}


    # example.handle_message is exposed here
    # the request and response are of the data type
    # example_pb2.Request
    def HandleMessage(self, request, context):
        print('handle message')
        print(request)
        try:
            response = example_pb2.Response()
            agent_responses = self.digital_being.handle_message(**request.kwargs)
            response.response.update(agent_responses)
            if (response == None):
                response = { 'none': 'none' }
            return response
        except Exception as err:
            print("exception")
            logger.exception()
            DB.sendDiscordMessage('HandleMessage exception: ' + err)
            print('HandleMessage exception: ' + err)
            return { 'none': 'none' }        

    # example.GetAgents is exposed here
    def GetAgents(self, request, context):
        print('get agents')
        try:
            response_obj = example_pb2.Response()
            response_obj.response.update(self.digital_being.get_agents())
            if (response_obj == None):
                response_obj = { 'key': 'none', 'value': 'name' }
            return response_obj
        except Exception as err:
            logger.exception()
            DB.sendDiscordMessage('GetAgents exception: ' + err)
            print('GetAgents exception: ' + err)
            return { 'key': 'none', 'value': 'name' }
    

     # example.SetAgentFields is exposed here
    def SetAgentFields(self, request, context):
        print('set agents fields')
        try:
            response_obj = example_pb2.Response()
            response_obj.response.update(self.digital_being.set_agent_fields(**request.kwargs))
            if (response_obj == None):
                response_obj = {'name': 'none', 'context': 'none'}
            return response_obj
        except Exception as err:
            logger.exception()
            DB.sendDiscordMessage('SetAgentFields exception: ' + err)
            print('SetAgentFields exception: ' + err)
            return {'name': 'none', 'context': 'none'}
    
    # example.InvokeSoloAgent is exposed here
    def InvokeSoloAgent(self, request, context):
        print('invoke solo agent')
        try:
            response_obj = example_pb2.Response()
            agent_response = self.digital_being.invoke_solo_agent(**request.kwargs)
            response_obj.response.update(agent_response)
            if (response_obj == None):
                response_obj = { 'key': 'none', 'value': 'none' }
            return response_obj
        except Exception as err:
            logger.exception()
            DB.sendDiscordMessage('InvokeSoloAgent exception: ' + err)
            print('InvokeSoloAgent exception: ' + err)
            return { 'key': 'none', 'value': 'none' }
    
    def HandleSlashCommand(self, request, context):
        print('handle slash command')
        print(request)
        try:
            response = example_pb2.Response()
            agent_responses = self.digital_being.handle_slash_command(**request.kwargs)
            response.response.update(agent_responses)
            if (response == None):
                response = { 'none': 'none' }
            return response
        except Exception as err:
            print("exception")
            logger.exception()
            DB.sendDiscordMessage('HandleMessage exception: ' + err)
            print('HandleMessage exception: ' + err)
            return { 'none': 'none' }        

    def HandleUserUpdate(self, request, context):
        print('handle user update')
        print(request)
        try:
            response = example_pb2.Response()
            agent_responses = self.digital_being.handle_user_update(**request.kwargs)
            response.response.update(agent_responses)
            if (response == None):
                response = { 'none': 'none' }
            return response
        except Exception as err:
            print("exception")
            logger.exception()
            DB.sendDiscordMessage('HandleMessage exception: ' + err)
            print('HandleMessage exception: ' + err)
            return { 'none': 'none' }    

    def HandleMessageReaction(self, request, context):
        print('handle message reaction')
        print(request)
        try:
            response = example_pb2.Response()
            agent_responses = self.digital_being.handle_message_reaction(**request.kwargs)
            response.response.update(agent_responses)
            if (response == None):
                response = { 'none': 'none' }
            return response
        except Exception as err:
            print("exception")
            logger.exception()
            DB.sendDiscordMessage('HandleMessage exception: ' + err)
            print('HandleMessage exception: ' + err)
            return { 'none': 'none' }    

try:
    # create a gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    # use the generated function `add_AgentServicer_to_server`
    # to add the defined class to the server

    example_pb2_grpc.add_AgentServicer_to_server(
        AgentServicer(), server)

    port = os.getenv('GRPC_SERVER_PORT') 

    if (port == None):
        print("env for grpc server port is not configured")
        exit()

    # listen on port 7777
    print('Starting server. Listening on port ' + port + '.')
    print('started server1')
    server.add_insecure_port('[::]:' + port)
    print('started server2')
    server.start()
    print('started server3')

except Exception as err:
    logger.exception("launching server")

# since server.start() will not block,
# a sleep-loop is added to keep alive
try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)