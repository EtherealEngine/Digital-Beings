import postgres
import threading

class aiChatFilterManager: 
    def __init__(self, postgres: postgres.postgres):
        self.maxCount = postgres.getAIMaxLoopCount()
        self.words = postgres.getAIChatFilter()
        self.postgres = postgres
        self.thread = threading.Timer(35.0, self.update)
        self.thread.start()
  
    
    def update(self):
        print('getting new')
        self.maxCount = self.postgres.getAIMaxLoopCount()
        self.words = self.postgres.getAIChatFilter()

    def hasBadWord(self, text, agegroup, agent):
        for x in self.words:
            if (agegroup == x['age'] and agent == x['agent'] and (x['word'] in text or x['word'] == 'unlimited')):
                return True
        
        return False
    
    def getMaxCount(self):
        return self.maxCount