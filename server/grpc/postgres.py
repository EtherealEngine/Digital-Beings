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
        print('starting sort')
        if len(results) > 0:
            print('shorting')
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
        
        return dumps(history)