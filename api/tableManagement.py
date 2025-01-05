import sqlite3

def create_table():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute(''' DROP TABLE IF EXISTS jobLinks ''')
    # cursor.execute('''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)''')
    conn.commit()
    conn.close()

create_table()