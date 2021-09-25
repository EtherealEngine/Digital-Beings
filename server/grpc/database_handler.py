
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
        self.con = lite.connect(param.SQLITE_DB)
        self.con.row_factory = lambda c, r: dict([(col[0], r[idx]) for idx, col in enumerate(c.description)])
        self.cursor = self.con.cursor()


    def close_db_connection(self):
        self.cursor.close()
        self.con.close()

    
    def get_topic_by_agent_name(self, model_name):
        self.cursor.execute(self.SELECT_TOPIC % (model_name,))
        agents_list = self.cursor.fetchall()
        topic = agents_list[0].get('topic')
        return topic
    

    def get_agents_name(self):
        self.cursor.execute(self.SELECT_AGENTS)
        agents_list = self.cursor.fetchall()
        agents_dict = {}
        for dic in agents_list:
            agents_dict.update({dic[key]:key for key in dic})
        return agents_dict
    

    def set_agent_topic(self, context, name):
        self.cursor.execute("UPDATE Agents SET topic='" + context + "' WHERE name='" + name + "'")
        self.con.commit()