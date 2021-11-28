import psycopg2
import os
from datetime import date, datetime
from json import dumps

class postgres: 
    def __init__(self):
        print('initializing postgres')
        self.postgres_con = psycopg2.connect(
                            host=os.getenv('PGHOST'),
                            database=os.getenv('PGDATABASE'),
                            user=os.getenv('PGUSER'),
                            password=os.getenv('PGPASSWORD'))
        self.cur = self.postgres_con.cursor()
    
    def getHistory(self, length, client_name, chat_id, author):
        client_name = client_name.lower()
        query = """SELECT * FROM chat_history WHERE client_name=%s AND chat_id=%s"""
        self.cur.execute(query, [client_name, chat_id])
        results = self.cur.fetchall()
        history = []
        i = 0
        if len(results) > 0:
            try:
                '''
                First it sorts the results based on the date they were created
                then it checks the sender is the bot or the author of the message, otherwise it ignores it
                then it checks the date difference, if the message is old, it ignores it
                finally it checks if the message is sent by the bot and adds a boolean about it
                '''
                sortedArray = sorted(results, key=lambda t: datetime.strptime(t[6], '%d/%m/%Y %H:%M:%S'), reverse=True)
                for res in sortedArray:
                    sender = res[4]
                    content = res[5]
                    createdAt = datetime.strptime(res[6], '%d/%m/%Y %H:%M:%S')
                    db_bot = False
                    if sender != os.getenv('BOT_NAME') and sender != author:
                        continue
                    if abs(datetime.now() - createdAt).days > 1: 
                        continue
                    if sender == os.getenv('BOT_NAME'):
                        db_bot = True
                    history.append({ 'author': sender, 'content': content, 'db_bot': db_bot })
                    i += 1
                    if (i >= length):
                        break
            except Exception as ex: 
                print('caught excpeition in sort')
                print(ex)
        
        #history.reverse()
        return history
    
    def getKeywords(self):
        query = '''SELECT * FROM keywords'''
        self.cur.execute(query)
        results = self.cur.fetchall()
        keywords = []

        if len(results) > 0:
            try:
                for res in results:
                    keywords.append({ 'word': res[0], 'count': res[1], 'agent': res[2] })
            except Exception as ex:
                print(ex)
                
        return keywords

    def getAIMaxLoopCount(self):
        query = '''SELECT * FROM ai_max_filter_count'''
        self.cur.execute(query)
        results = self.cur.fetchall()

        if len(results) > 0:
            try:
                for res in results:
                    return res[0]
            except Exception as ex:
                print(ex)

        return 5
    
    def getAIChatFilter(self):
        query = '''SELECT * FROM ai_chat_filter'''
        self.cur.execute(query)
        results = self.cur.fetchall()
        _res = []

        if len(results) > 0:
            try:
                for res in results:
                    _res.append({ 'word': res[0], 'age': res[1] })
            except Exception as ex:
                print(ex)

        return _res
    
    

    def getAgentAgeGroups(self):
        query = '''SELECT * FROM agent_ages'''
        self.cur.execute(query)
        results = self.cur.fetchall()
        _res = []

        if len(results) > 0:
            try:
                for res in results:
                    _age = res[1]
                    _res.append({ 'agent': res[0], 'age': list(filter(None, _age.split(';'))) })
            except Exception as ex:
                print(ex)

        return _res
    
    def getHasUserSentMessage(self, client_name, sender) -> bool:
        client_name = client_name.lower()
        query = '''SELECT * FROM chat_history WHERE client_name=%s AND sender=%s'''
        self.cur.execute(query, [client_name, sender])
        results = self.cur.fetchall()
        
        return len(results) > 0
        