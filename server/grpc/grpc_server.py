import grpc
from concurrent import futures
import time

# import the generated classes
import example_pb2
import example_pb2_grpc

# import the original example.py
from example import DigitalBeing as DB

# create a class to define the server functions, derived from
# example_pb2_grpc.AgentServicer
class AgentServicer(example_pb2_grpc.AgentServicer):

    def __init__(self):
        self.digital_being = DB()

    # the request and response are of the data type
    # example_pb2.Request
    def InitializeAgents(self, request, context):
        response_obj = example_pb2.Response()
        response_obj.response.update({"response":"Initialized all agents"})
        return response_obj


    # example.handle_message is exposed here
    # the request and response are of the data type
    # example_pb2.Request
    def HandleMessage(self, request, context):
        print('handle message')
        response_obj = example_pb2.Response()
        agent_responses = self.digital_being.handle_message(**request.kwargs)
        response_obj.response.update(agent_responses)
        return response_obj
    

    # example.GetAgents is exposed here
    def GetAgents(self, request, context):
        print('get agents')
        response_obj = example_pb2.Response()
        response_obj.response.update(self.digital_being.get_agents())
        return response_obj
    

     # example.SetAgentFields is exposed here
    def SetAgentFields(self, request, context):
        print('set agents fields')
        response_obj = example_pb2.Response()
        response_obj.response.update(self.digital_being.set_agent_fields(**request.kwargs))
        if (response_obj == None):
            response_obj = {'name': 'none', 'context': 'none'}
        return response_obj
    
    # example.InvokeSoloAgent is exposed here
    def InvokeSoloAgent(self, request, context):
        print('invoke solo agent')
        response_obj = example_pb2.Response()
        agent_response = self.digital_being.invoke_solo_agent(**request.kwargs)
        response_obj.response.update(agent_response)
        return response_obj
       


# create a gRPC server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

# use the generated function `add_AgentServicer_to_server`
# to add the defined class to the server

example_pb2_grpc.add_AgentServicer_to_server(
        AgentServicer(), server)

# listen on port 7777
print('Starting server. Listening on port 7777.')
print('started server1')
server.add_insecure_port('[::]:7777')
print('started server2')
server.start()
print('started server3')

# since server.start() will not block,
# a sleep-loop is added to keep alive
try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)