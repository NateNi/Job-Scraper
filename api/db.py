import sqlite3
import datetime

INITIALIZE_DB = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, url VARCHAR NOT NULL, favicon BLOB, company VARCHAR NOT NULL, channelId INT, containerXpath VARCHAR NOT NULL, titleXpath VARCHAR NOT NULL, linkXpath VARCHAR NOT NULL, titleAttribute VARCHAR, FOREIGN KEY ("channelId") REFERENCES "channels"("id"));
                CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT NOT NULL, filterXpath VARCHAR NOT NULL, selectValue VARCHAR, type VARCHAR NOT NULL, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")); 
                CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR NOT NULL, title VARCHAR, jobWebsiteId INTEGER NOT NULL, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")); 
                CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL); 
                CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL UNIQUE, value VARCHAR); 
                INSERT INTO settings (name, value) VALUES ('slackToken', null) ON CONFLICT(name) DO NOTHING; '''

def initialize_db(app, cursor, conn):
    try:
        cursor.executescript(INITIALIZE_DB)
        conn.commit()
    except sqlite3.Error as e:
        app.logger.error(f"Error initializing the database: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to initialize the database', 'status': 500}
    return {'success': True}

def create_db_connection(app):
    try:
        conn = sqlite3.connect('jobs.db')
        cursor = conn.cursor()
    except sqlite3.Error as e:
        app.logger.error(f"Database connection error: {e}")
        return {'success': False, 'error': 'Database connection failed', 'status': 500}
    return {'success': True, 'conn': conn, 'cursor': cursor}

def store_job_website(app, cursor, conn, data, favicon):
    try:
        cursor.execute('''INSERT INTO jobWebsites (url, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ''', (data['url'], favicon, data['company'], data['channelId'] if 'channelId' in data else None, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute']))
        jobWebsiteId = cursor.lastrowid
    except sqlite3.Error as e:
        app.logger.error(f"Error inserting into jobWebsites table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to create job website entry', 'status': 500}
    return {'success': True, 'jobWebsiteId': jobWebsiteId}

def fetch_settings(app, cursor, conn):
    try:
        cursor.execute('''SELECT * FROM settings ''')
        settings = cursor.fetchall()
    except sqlite3.Error as e:
        app.logger.error(f"Error querying settings: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to fetch settings', 'status': 500}
    return {'success': True, 'settings': settings}

def fetch_channels(app, cursor, conn):
    try:
        cursor.execute('''SELECT * FROM channels''')
        channels = cursor.fetchall()
    except sqlite3.Error as e:
        app.logger.error(f"Error querying channels: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to fetch channels', 'status': 500}
    return {'success': True, 'channels': channels}

def fetch_slack_token(app, cursor, conn):
    try:
        cursor.execute(''' SELECT value FROM settings WHERE name = 'slackToken' ''')
        slackToken = cursor.fetchone()
    except sqlite3.Error as e:
        app.logger.error(f"Error querying the slack token: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to query the slack token', 'status': 500}
    return {'success': True, 'slackToken': slackToken}

def fetch_job_websites_with_new_link_counts(app, cursor, conn):
    try:
        cursor.execute('''SELECT jobWebsites.id, url, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute, COUNT(jL.id) AS numLinksFound FROM jobWebsites LEFT JOIN (SELECT * FROM jobLinks where viewed = 0) jL  ON jL.jobWebsiteId = jobWebsites.id GROUP BY jobWebsites.id, url, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute ''')
        jobWebsites = cursor.fetchall()
    except sqlite3.Error as e:
        app.logger.error(f"Error querying job websites: {e}")
        conn.close()
        return {'success': False, 'error': 'Error fetching job websites', 'status': 500}
    return {'success': True, 'jobWebsites': jobWebsites}

def fetch_job_websites(app, cursor, conn):
    try:
        cursor.execute("SELECT * FROM jobWebsites")
        jobWebsites = cursor.fetchall()
    except sqlite3.Error as e:
        app.logger.error(f"Error querying job websites: {e}")
        conn.close()
        return {'success': False, 'error': 'Error fetching job websites', 'status': 500}
    return {'success': True, 'jobWebsites': jobWebsites}

def fetch_job_website(app, cursor, conn, website_id):
    try:
        cursor.execute('''SELECT * FROM jobWebsites WHERE id = ? ''', (website_id,))
        jobWebsite = cursor.fetchone()
    except sqlite3.Error as e:
        app.logger.error(f"Error fetching jobWebsite: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to fetch jobWebsite', 'status': 500}
    return {'success': True, 'jobWebsite': jobWebsite}

def fetch_filters_for_job_website(app, cursor, conn, website_id):
    try:
        cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
        filters = cursor.fetchall()
    except sqlite3.Error as e:
        app.logger.error(f"Error fetching jobWebsiteFilters: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to fetch jobWebsiteFilters', 'status': 500}
    return {'success': True, 'filters': filters}

def store_job_website_filter(app, cursor, conn, filter, job_website_id):
    try:
        cursor.execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (job_website_id, filter['filterXpath'], filter['selectValue'], filter['type']))
    except sqlite3.Error as e:
        app.logger.error(f"Error inserting into jobWebsiteFilters table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to create job website filter entry', 'status': 500}
    return {'success': True}

def store_job_link(app, cursor, conn, job_link, job_website_id):
    try:
        cursor.execute(f"INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job_link['link'], job_link['title'], job_website_id, 0, datetime.datetime.now()))
    except sqlite3.Error as e:
        app.logger.error(f"Error inserting into jobLinks table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to create job link entry', 'status': 500}
    return {'success': True}

def update_setting(app, cursor, conn, setting):
    try:
        cursor.execute('''UPDATE settings SET value = ? WHERE name = ?''', (setting.get('value'), setting.get('name')))
    except sqlite3.Error as e:
        app.logger.error(f"Error updating settings table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to update setting', 'status': 500}
    return {'success': True}

def delete_channels(app, cursor, conn, idsToDelete):
    try:
        cursor.execute(
                    f"DELETE FROM channels WHERE id IN ({','.join(['?'] * len(idsToDelete))})",
                    tuple(idsToDelete)
        )
    except sqlite3.Error as e:
        app.logger.error(f"Error deleting from the channel table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to delete channel', 'status': 500}
    return {'success': True}


def update_channel(app, cursor, conn, channel):
    try:
        cursor.execute(
                    "UPDATE channels SET name = ? WHERE id = ?",
                    (channel['name'], channel['id'])
                )
    except sqlite3.Error as e:
        app.logger.error(f"Error updating channels table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to update channel', 'status': 500}
    return {'success': True}

def store_channel(app, cursor, conn, channel):
    try:
        cursor.execute('INSERT INTO channels (name) VALUES (?)', (channel.get('name'),))
    except sqlite3.Error as e:
        app.logger.error(f"Error inserting into channel table: {e}")
        conn.close()
        return {'success': False, 'error': 'Failed to create channel', 'status': 500}
    return {'success': True}
