import psycopg2
import os
from datetime import datetime
from json import dumps

class postgres: 
    def __init__(self):
        print('initializing postgres')
        self.postgres_con = psycopg2.connect(
                            host='localhost',
                            database='digitalbeing',
                            user='postgres',
                            password='newpassword')
        self.cur = self.postgres_con.cursor()
    
    def getBlockedUsers(self):
        query = """SELECT * FROM blocked_users"""
        self.cur.execute(query)
        results = self.cur.fetchall()
        users = []
        if len(results) > 0:
            try:
                for res in results:
                    users.append({ 'key': res[0], 'value': res[1] })
            except Exception as ex: 
                print('caught excpeition in sort')
                print(ex)
        
        return users
    
    def blockUser(self, user_id, client):
        if not user_id or len(user_id) == 0 or not client or len(client) == 0:
            return
        
        query = """INSERT INTO blocked_users(user_id, client) VALUES(%s, %s)"""
        self.cur.execute(query, (user_id, client))
        self.postgres_con.commit()
    
    def unblockUser(self, user_id, client):
        if not user_id or len(user_id) == 0 or not client or len(client) == 0:
            return
        
        query = """DELETE FROM blocked_users WHERE user_id=%s AND client=%s"""
        self.cur.execute(query, (user_id, client))
        self.postgres_con.commit()