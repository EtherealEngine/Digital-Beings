import psycopg2
import os

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
        history = {}
        i = 0
        for res in results: 
            history[res[4]] = res[5]
            i += 1
            if (i >= length):
                break
        return history
        
