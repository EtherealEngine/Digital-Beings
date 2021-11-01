import postgres
import threading

class keywordsManager:
    def __init__(self, postgres: postgres.postgres):
        self.keywords = postgres.getKeywords()
        self.postgres = postgres
        self.thread = threading.Timer(35.0, self.update)
        self.thread.start()

    def update(self):
        self.keywords = self.postgres.getKeywords()
        threading.Timer(35.0, self.update).start()

    def getRepeatCount(self, text: str, agent: str):
        print('keywords length: ', len(self.keywords))
        for i in self.keywords:
            if i['agent'] == agent:
                if i['word'] in text.lower():
                    return int(i['count'])
        
        for i in self.keywords:
            if i['agent'] == agent:
                if i['word'] == 'rest':
                    return int(i['count'])

        return 1