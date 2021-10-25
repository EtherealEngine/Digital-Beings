import postgres
import re

class keywordsManager:
    def __init__(self, postgres: postgres.postgres):
        self.keywords = postgres.getKeywords()
        self.postgres = postgres

    def transformText(self, text: str, agent: str):
        for i in self.keywords:
            if i['agent'] == agent:
                if i['word'] in text.lower():
                    return text, int(i['count'])
        
        for i in self.keywords:
            if i['agent'] == agent:
                if i['word'] == 'rest':
                    return text, int(i['count'])

        return text, 1