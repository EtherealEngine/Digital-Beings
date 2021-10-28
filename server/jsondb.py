from genericpath import isfile
import json
import os
import agent_params as param

class jsondb: 
    def __init__(self):
        if (os.path.isfile(param.JSON_FILE) == False):
            data = { }
            data['agents'] = { 'gpt3': 'Elon' }
            with open(param.JSON_FILE, 'w') as outFile:
                json.dump(data, outFile)
    
    def getAgents(self):
        if (os.path.isfile(param.JSON_FILE) == False):
            return {'name': 'none', 'context': 'none'}
        else:
            with open(param.JSON_FILE, 'r') as inFile:
                data = json.load(inFile)
                return data['agents']
    
    def getTopicForAgent(self, agentName):
        if (os.path.isfile(param.JSON_FILE) == False):
            return 'none'
        else:
            with open(param.JSON_FILE, 'r') as inFile:
               data = json.load(inFile)
               for agent in data['agents']:
                   if (agent == agentName):
                       return data['agents'][agent]
            return 'none'
        
    def setAgentName(self, context, name):
        if (os.path.isfile(param.JSON_FILE) == False):
            return
        else:
            data = None
            with open(param.JSON_FILE, 'r') as inFile:
                data = json.load(inFile)
                for agent in data['agents']:
                    if agent == name:
                        data['agents'][agent] = context
                        break

            if (data != None):
                with  open(param.JSON_FILE, 'w') as outFile:
                    json.dump(data, outFile) 