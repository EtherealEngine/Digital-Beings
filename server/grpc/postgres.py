import psycopg2
import os
from datetime import datetime
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
    
    def getHistory(self, length, client_name, chat_id):
        query = """SELECT * FROM chat_history WHERE client_name=%s AND chat_id=%s"""
        self.cur.execute(query, [client_name, chat_id])
        results = self.cur.fetchall()
        history = []
        i = 0
        if len(results) > 0:
            try:
                sortedArray = sorted(results, key=lambda t: datetime.strptime(t[6], '%d/%m/%Y %H:%M:%S'), reverse=True)
                for res in sortedArray:
                    sender = res[4]
                    content = res[5]
                    #createdAt = res[6]
                    history.append({ 'author': sender, 'content': content })
                    i += 1
                    if (i >= length):
                        break
            except Exception as ex: 
                print('caught excpeition in sort')
                print(ex)
        
        return history
    
    def getKeywords(self):
        query = '''SELECT * FROM keywords'''
        self.cur.execute(query)
        results = self.cur.fetchall()
        keywords = []

        if len(results) > 0:
            try:
                for res in results:
                    print('adding new keyword')
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
                    _res.append({ 'word': res[0], 'age': res[1], 'agent': res[2] })
            except Exception as ex:
                print(ex)

        return _res