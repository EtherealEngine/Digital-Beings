
import sqlite3 as lite
import agent_params as param


class SqliteDatabase():
    SELECT_TOPIC = f"""
        SELECT topic FROM Agents WHERE name='%s'
    """

    SELECT_AGENTS = f"""
        SELECT name FROM Agents
    """

    UPDATE_AGENT_TOPIC = f"""
        UPDATE Agents SET topic = '%s' WHERE name = '%s'
    """

    def __init__(self, **kwargs):
        try:
            self.con = lite.connect(param.SQLITE_DB, check_same_thread=False)
            self.con.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
            self.cursor = self.con.cursor()
        except Exception as err:
            print('database init exception: ' + err)


    def close_db_connection(self):
        try:
            self.cursor.close()
            self.con.close()
        except Exception as err:
            print('close_db_connection: ' + err)

    
    def get_topic_by_agent_name(self, model_name):
        try:
            self.cursor.execute(self.SELECT_TOPIC % (model_name,))
            agents_list = self.cursor.fetchall()
            topic = agents_list[0].get('topic')
            return topic
        except Exception as err:
            print('get_topic_by_agent_name exception: ' + err)
            return 'none'
    

    def get_agents_name(self):
        try:
            self.cursor.execute(self.SELECT_AGENTS)
            agents_list = self.cursor.fetchall()
            agents_dict = {}
            for dic in agents_list:
                agents_dict.update({dic[key]:key for key in dic})
            return agents_dict
        except Exception as err:
            print('get_agents_name exception: ' + err)
            return {'name': 'none', 'context': 'none'}
    

    def set_agent_topic(self, context, name):
        try:
            self.cursor.execute("UPDATE Agents SET topic='" + context + "' WHERE name='" + name + "'")
            self.con.commit()
        except Exception as err:
            print('set_agent_topic exception: ' + err)