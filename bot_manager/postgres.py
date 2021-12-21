import psycopg2
import os
from datetime import datetime
from json import dumps
import envReader
from time import sleep

# A maximum count of Postgres connection establishing attempts
MAX_RETRIES = 128

class postgres:

    def __init__(self):
        """
        This method establishes a connection with the PostgreSQL server.
        It will retry 128 times, if necessary, which realistically shouldn't happen,
        unless the Postgres server stays down.

        On each retry, code will wait for a second, so PostgreSQL has time to actually start.

        Todo:
            - Consider if a keep-alive DB connection is actually required.
            - Consider if keeping a single cursor is sane. Actually read about DB cursors.
            - Consider if keeping both outweights the risk of the Docker-compose
              failing to start all the containers.
        """
        for retry_id in range(MAX_RETRIES):
            try:
                self.postgres_con = psycopg2.connect(
                                    host=envReader.getValue('PGHOST'),
                                    database=envReader.getValue('PGDATABASE'),
                                    user=envReader.getValue('PGUSER'),
                                    password=envReader.getValue('PGPASSWORD'))
                self.cur = self.postgres_con.cursor()
                break
            except psycopg2.OperationalError as pg_ex:
                print(f'Postgres connection exception #{retry_id}')
                sleep(1)
    
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
        
        query = 'INSERT INTO blocked_users(user_id, client) VALUES(%s, %s)'
        self.cur.execute(query, (user_id, client))
        self.postgres_con.commit()
    
    def unblockUser(self, user_id, client):
        if not user_id or len(user_id) == 0 or not client or len(client) == 0:
            return
        
        query = 'DELETE FROM blocked_users WHERE user_id=%s AND client=%s'
        self.cur.execute(query, (user_id, client))
        self.postgres_con.commit()
    
    def getChatFilterRatings(self):
        query = 'SELECT * FROM chat_filter'
        self.cur.execute(query)
        results = self.cur.fetchall()
        half = 5
        max = 10

        if len(results) > 0:
            try:
                for res in results:
                    half = res[0]
                    max = res[1]
            except Exception as ex:
                print('caught excpeition in sort')
                print(ex)
        
        return half, max
    
    def updateChatFilter(self, half, max):
        query = 'UPDATE chat_filter SET half=%s, max=%s'
        self.cur.execute(query, (half, max))
        self.postgres_con.commit()

    def getBadWordsRatings(self):
        query = 'SELECT * FROM bad_words'
        self.cur.execute(query)
        results = self.cur.fetchall()
        bad_words = []

        if len(results) > 0:
            try:
                for res in results:
                    bad_words.append({ 'key': res[0], 'value': res[1] })
            except Exception as ex:
                print(ex)
        
        return bad_words
    
    def addBadWord(self, word, rating):
        if (self.badWordExists(word)):
            return

        query = 'INSERT INTO bad_words(word, rating) VALUES(%s, %s)'
        self.cur.execute(query, (word, rating))
        self.postgres_con.commit()

    def removeBadWord(self, word):
        query = 'DELETE FROM bad_words WHERE word=%s'
        self.cur.execute(query, (word,))
        self.postgres_con.commit()
    
    def badWordExists(self, word):
        query = 'SELECT * FROM bad_words WHERE word=%s'
        self.cur.execute(query, (word,))
        results = self.cur.fetchall()
        return len(results) > 0
        
    def editBadWord(self, word, newRating):
        query = 'UPDATE bad_words SET rating=%s WHERE word=%s'
        self.cur.execute(query, (newRating, word))
        self.postgres_con.commit()
    
    def getKeywords(self):
        query = 'SELECT * FROM keywords'
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

    def addKeyword(self, word, count, agent):
        if (self.keywordExists(word, agent)):
            return

        query = 'INSERT INTO keywords(word, count, agent) VALUES(%s, %s, %s)'
        self.cur.execute(query, (word, count, agent))
        self.postgres_con.commit()
    
    def removeKeyword(self, word, agent):
        query = 'DELETE FROM keywords WHERE word=%s AND agent=%s'
        self.cur.execute(query, (word, agent))
        self.postgres_con.commit()
    
    def editKeyword(self, word, count, agent):
        query = 'UPDATE keywords SET count=%s WHERE word=%s AND agent=%s'
        self.cur.execute(query, (count, word, agent))
        self.postgres_con.commit()

    def keywordExists(self, word, agent):
        query = 'SELECT * FROM keywords WHERE word=%s AND agent=%s'
        self.cur.execute(query, (word, agent))
        results = self.cur.fetchall()
        return len(results) > 0

    def getAIMaxLoopCount(self):
        query = 'SELECT * FROM ai_max_filter_count'
        self.cur.execute(query)
        results = self.cur.fetchall()

        if len(results) > 0:
            try:
                for res in results:
                    return res[0]
            except Exception as ex:
                print(ex)

        return 5
    
    def setAIMaxLoopCount(self, count):
        query = 'UPDATE ai_max_filter_count SET count = %s;'
        self.cur.execute(query, (count))
        self.postgres_con.commit()

    def getAIChatFilter(self):
        query = 'SELECT * FROM ai_chat_filter'
        self.cur.execute(query)
        results = self.cur.fetchall()
        _res1 = []
        _res2 = []
        _res3 = []
        _res4 = []

        if len(results) > 0:
            try:
                for res in results:
                    if res[1] == 12:
                        _res1.append({ 'word': res[0], 'age': res[1] })
                    elif res[1] == 16:
                        _res2.append({ 'word': res[0], 'age': res[1] })
                    elif res[1] == 18:
                        _res3.append({ 'word': res[0], 'age': res[1] })
                    else:
                        _res4.append({ 'word': res[0], 'age': res[1] })
            except Exception as ex:
                print(ex)

        return _res1, _res2, _res3, _res4

    def addAIChatFilter(self, word, age):
        if (self.aiChatFilterExists(word, age)) or self.filterIsDisabled(age):
            return

        if (word == 'unlimited'):
            query = 'DELETE FROM ai_chat_filter'
            self.cur.execute(query)
            self.postgres_con.commit()
            
        query = 'INSERT INTO ai_chat_filter(word, age) VALUES(%s, %s)'
        self.cur.execute(query, (word, age))
        self.postgres_con.commit()
    
    def removeAIChatFilter(self, word, age):
        query = 'DELETE FROM ai_chat_filter WHERE word=%s AND age=%s'
        self.cur.execute(query, (word, age))
        self.postgres_con.commit()

    def aiChatFilterExists(self, word, age):
        query = 'SELECT * FROM ai_chat_filter WHERE word=%s AND age=%s'
        self.cur.execute(query, (word, age))
        results = self.cur.fetchall()
        return len(results) > 0

    def filterIsDisabled(self, age):
        query = 'SELECT * FROM ai_chat_filter WHERE word=%s AND age=%s'
        self.cur.execute(query, ('unlimited', age))
        results = self.cur.fetchall()
        return len(results) > 0
    
    def updateAIChatFilter(self, word, age):
        query = 'UPDATE ai_chat_filter SET age=%s WHERE word=%s'
        self.cur.execute(query, (age, word))
        self.postgres_con.commit()

    def getAgeGroupsPerAgent(self):
        query = 'SELECT * FROM agent_ages'
        self.cur.execute(query)
        results = self.cur.fetchall()

        _res = []

        if len(results) > 0:
            try:
                for res in results:
                    _res.append({ 'agent': res[0], 'age':list(filter(None, res[1].split(';'))) })
            except Exception as ex:
                print(ex)

        return _res
    
    def addAgentAgeGroup(self, agent, age):
        query = 'SELECT * FROM agent_ages WHERE agent=%s'
        self.cur.execute(query, (agent,))
        results = self.cur.fetchall()

        if len(results) > 0:
            ages = results[0][1]
            temp = ages.split(';')
            if age in temp:
                print('already in')
                print(temp)
                return

            ages += ';' + age
            query = 'UPDATE agent_ages SET age=%s WHERE agent=%s'
            self.cur.execute(query, (ages, agent))
            self.postgres_con.commit()
            return
        
        ages = age + ''
        query = 'INSERT INTO agent_ages(agent, age) VALUES(%s, %s)'
        self.cur.execute(query, (agent, ages))
        self.postgres_con.commit()

    def removeAgentAgeGroup(self, agent, age):
        query = 'SELECT * FROM agent_ages WHERE agent=%s'
        self.cur.execute(query, (agent,))
        results = self.cur.fetchall()

        if len(results) > 0:
            ages = results[0][1].split(';')
            if age in ages:
                ages.remove(age)
            ages = ';'.join(ages) 
            print('ages: ', ages)
            query = 'UPDATE agent_ages SET age=%s WHERE agent=%s'
            self.cur.execute(query, (ages, agent))
            self.postgres_con.commit()