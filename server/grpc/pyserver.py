import logging
import time

# import the original example.py
from handler import DigitalBeing as DB

logger = logging.getLogger('server_logger')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
fh = logging.FileHandler('grpc_server.log')
fh.setLevel(logging.DEBUG)

logger.addHandler(fh)

# create a class to define the server functions, derived from
# example_pb2_grpc.AgentServicer
class Service():

    def __init__(self):
        self.digital_being = DB()
        
Service()
while True:
    time.sleep(86400)
#except KeyboardInterrupt:
    #server.stop(0)