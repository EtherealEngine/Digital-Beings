import sqlite3

from sqlite3 import Error
import agent_params

def sql_connection():

    try:

        con = sqlite3.connect('digitalbeing.db')

        return con

    except Error:

        print(Error)

def sql_table(con):

    cursorObj = con.cursor()

    cursorObj.execute("CREATE TABLE IF NOT EXISTS Agents(id integer PRIMARY KEY AUTOINCREMENT, name text, type text, topic text,  question text, reaponse text)")

    # Insert default selected agents
    entities = res = [(agent,) for agent in agent_params.SELECTED_AGENTS]

    if len(entities) > 1:
        cursorObj.executemany('INSERT INTO Agents(name) VALUES(?)', entities)
    else:
        cursorObj.execute('INSERT INTO Agents(name) VALUES(?)', entities)
    
    cursorObj.execute("SELECT name FROM Agents")

    con.commit()
    cursorObj.close()
    con.close()

con = sql_connection()
sql_table(con)
