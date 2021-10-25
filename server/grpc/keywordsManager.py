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
                    if i['replacementRules'] != None and len(i['replacementRules']) > 0:
                        for x in i['replacementRules'].split(','):
                            parts = x.split(':')
                            if (parts == None or len(parts) < 1):
                                continue

                            text = text.replace(re.compile(parts[0], re.IGNORECASE), '' if len(parts) > 1 else parts[1])
                    
                    return text, int(i['count'])
        
        for i in self.keywords:
            if i['agent'] == agent:
                if i['word'] == 'rest':
                    return text, int(i['count'])

        return text, 1