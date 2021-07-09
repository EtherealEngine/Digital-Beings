import grpc
from concurrent import futures
import time

# import the generated classes
import example_pb2
import example_pb2_grpc

# import the original example.py
import example

# create a class to define the server functions, derived from
# example_pb2_grpc.AgentServicer
class AgentServicer(example_pb2_grpc.AgentServicer):

    # example.handle_message is exposed here
    # the request and response are of the data type
    # example_pb2.Request
    def HandleMessage(self, request, context):
        response = example_pb2.Response()
        response.value = example.handle_message(request.sender, request.message)
        return response


# create a gRPC server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

# use the generated function `add_AgentServicer_to_server`
# to add the defined class to the server
example_pb2_grpc.add_AgentServicer_to_server(
        AgentServicer(), server)

# listen on port 50051
print('Starting server. Listening on port 50050.')
server.add_insecure_port('[::]:50050')
server.start()

# since server.start() will not block,
# a sleep-loop is added to keep alive
try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)