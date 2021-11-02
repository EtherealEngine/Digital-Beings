import postgres
import threading

class aiChatFilterManager: 
    def __init__(self, postgres: postgres.postgres):
        self.maxCount = postgres.getAIMaxLoopCount()
        self.words = postgres.getAIChatFilter()
        self.ages = postgres.getAgentAgeGroups()
        self.postgres = postgres
        self.thread = threading.Timer(35.0, self.update)
        self.thread.start()
  
    
    def update(self):
        self.maxCount = self.postgres.getAIMaxLoopCount()
        self.words = self.postgres.getAIChatFilter()
        self.ages = self.postgres.getAgentAgeGroups()
        threading.Timer(35.0, self.update).start()

    def hasBadWord(self, text, agent):
        groups = self.getAgentAge(agent)
        for age in groups:
            for x in self.words:
                if (age == x['age'] and  (x['word'] in text or x['word'] == 'unlimited')):
                    return True
        
        return False
    
    def getAgentAge(self, agent):
        for a in self.ages:
            if agent == a['agent']:
                return a['age']
        return []

    def getMaxCount(self):
        return self.maxCount