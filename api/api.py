from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from selenium import webdriver
from bs4 import BeautifulSoup
import logging
import sqlite3
import requests
import base64
import datetime
from scrape import *
from selenium.webdriver.chrome.options import Options

app = Flask(__name__)
CORS(app)

webpageSourceData = None
jobResults = None

# CREATE_JOB_WEBSITES = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channelId INT, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR, FOREIGN KEY ("channelId") REFERENCES "channels"("id"))'''
# CREATE_JOB_WEBSITE_FILTERS = '''CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT, filterXpath VARCHAR, selectValue VARCHAR, type VARCHAR, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")) '''
# CREATE_JOB_LINKS = '''CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR, title VARCHAR, jobWebsiteId INTEGER, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id"))'''
# CREATE_CHANNELS = '''CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, name VARCHAR)'''
# CREATE_SETTINGS = '''CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name VARCHAR, value VARCHAR)'''
# CHECK_SETTINGS = '''SELECT * FROM settings'''
# SEED_SETTINGS = '''INSERT OR IGNORE INTO settings ( name, value ) VALUES ( 'slackToken', '' ) '''

INITIALIZE_DB = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channelId INT, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR, FOREIGN KEY ("channelId") REFERENCES "channels"("id"))
                CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT, filterXpath VARCHAR, selectValue VARCHAR, type VARCHAR, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")) 
                CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR, title VARCHAR, jobWebsiteId INTEGER, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")) 
                CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, name VARCHAR) 
                CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name VARCHAR, value VARCHAR)
                INSERT INTO settings (name, value)
                VALUES ('slackToken', '') ON CONFLICT(name) DO NOTHING; '''

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)

def getFavicon(html, url):
    soup = BeautifulSoup(html, 'html.parser')
    favicon_tag = soup.find('link', rel=lambda rel: rel and 'icon' in rel.lower())
    if favicon_tag:
        favicon_url = favicon_tag['href']
        if not favicon_url.startswith(('http://', 'https://')):
            favicon_url = requests.compat.urljoin(url, favicon_url)
        try:
            response = requests.get(favicon_url, stream=True)
            if response.status_code == 200:
                return response.content
            else:
                app.logger.warning(f"Failed to retrieve favicon, status code: {response.status_code}")
                return None
        except requests.RequestException as e:
            app.logger.error(f"Error fetching favicon: {e}")
            return None
    else:
        app.logger.info("No favicon tag found in the HTML for url: {url}")
        return None

@app.route('/website/test', methods=['POST'])
def test_website():
    try:
        data = request.get_json()
        required_fields = ['url', 'company', 'containerXpath', 'titleXpath', 'linkXpath']
        for field in required_fields:
            if field not in data:
                app.logger.error(f"Missing required field for test website: {field}")
                return jsonify({'error': f"Missing required field: {field}"}), 400

        filters = data['websiteFilterData']
        newFilters = data['websiteNewFilterData']
        options = Options()
        options.add_argument('--headless=new')
        try:
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            app.logger.error(f"Failed to initialize WebDriver: {e}")
            return jsonify({'error': 'Failed to initialize WebDriver'}), 500
        try:
            jobs = getJobs(driver, data['websiteFormData']['url'], data['websiteFormData']['company'], data['websiteFormData']['containerXpath'], data['websiteFormData']['titleXpath'], data['websiteFormData']['linkXpath'], data['websiteFormData']['titleAttribute'], filters, newFilters)
        except Exception as e:
                app.logger.error(f"Error while executing getJobs: {e}")
                driver.quit()
                return jsonify({'error': 'Failed to fetch jobs'}), 500
        global webpageSourceData 
        webpageSourceData = driver.page_source
        global jobResults
        jobResults = jobs
        driver.quit()
        return jsonify({'jobs': jobs})
    except Exception as e:
        app.logger.error(f"Unexpected error in test_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/website', methods=['POST'])
def create_website():
    try:
        data = request.get_json()
        required_fields = ['url', 'company', 'containerXpath', 'titleXpath', 'linkXpath']
        for field in required_fields:
            if field not in data:
                app.logger.error(f"Missing required field for create website: {field}")
                return jsonify({'error': f"Missing required field: {field}"}), 400
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            app.logger.error(f"Database connection error: {e}")
            return jsonify({'error': 'Database connection failed'}), 500
        userId = 1
        try:
            favicon = getFavicon(webpageSourceData, data['url'])
        except Exception as e:
            app.logger.error(f"Error retrieving favicon: {e}")
            conn.close()
            return jsonify({'error': 'Failed to retrieve favicon'}), 500
        try:
            cursor.execute('''INSERT INTO jobWebsites (url, userId, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ''', (data['url'], userId, favicon, data['company'], data['channelId'], data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute']))
            jobWebsiteId = cursor.lastrowid
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobWebsites table: {e}")
            conn.close()
            return jsonify({'error': 'Failed to create job website entry'}), 500
        try:
            for filter in data['filters']:
                if not all(k in filter for k in ['filterXpath', 'selectValue', 'type']):
                    app.logger.error(f"Missing required filter fields in: {filter}")
                    return jsonify({'error': 'Invalid filter format'}), 400
                cursor.execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (jobWebsiteId, filter['filterXpath'], filter['selectValue'], filter['type']))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobWebsiteFilters table: {e}")
            conn.close()
            return jsonify({'error': 'Failed to add filters'}), 500
        try:
            for job in jobResults:
                if not all(k in job for k in ['link', 'title']):
                    app.logger.error(f"Missing required job fields in: {job}")
                    return jsonify({'error': 'Invalid job format'}), 400
                cursor.execute(f"INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], jobWebsiteId, 0, datetime.datetime.now()))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobLinks table: {e}")
            conn.close()
            return jsonify({'error': 'Failed to save job links'}), 500
        conn.commit()
        conn.close()
        try:
            send_message([{'link': job['link'], 'title': job['title']} for job in jobResults], data['company'], data['channelId'], jobWebsiteId)
        except Exception as e:
            app.logger.error(f"Error sending notification: {e}")
            return jsonify({'error': 'Failed to send notification'}), 500
        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error in create_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/settings', methods=['GET'])
def get_settings():
    try:
        conn = sqlite3.connect('jobs.db')
        cursor = conn.cursor()
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {e}")
        return jsonify({'error': 'Failed to connect to the database'}), 500

    try:
        try:
            cursor.execute('''SELECT * FROM settings ''')
            settingsResults = cursor.fetchall()
        except sqlite3.Error as e:
            logging.error(f"Error querying settings: {e}")
            return jsonify({'error': 'Failed to fetch settings'}), 500
        
        try:
            cursor.execute('''SELECT * FROM channels''')
            channelResults = cursor.fetchall()
        except sqlite3.Error as e:
            logging.error(f"Error querying channels: {e}")
            return jsonify({'error': 'Failed to fetch channels'}), 500
        conn.close()
        settings = [{'id': setting[0], 'name': setting[1], 'value': setting[2]} for setting in settingsResults]
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults]
        return jsonify({'settings': settings, 'channels': channels})
    except Exception as e:
        logging.error(f"Unexpected error while processing request: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
@app.route('/settings', methods=['POST'])
def update_settings():
    data = request.get_json()

    # if 'settings' not in data or 'channels' not in data or 'newChannels' not in data:
    #     logging.error("Missing required fields: 'settings', 'channels', or 'newChannels'")
    #     return jsonify({'error': "Missing required fields: 'settings', 'channels', or 'newChannels'"}), 400

    try:
        conn = sqlite3.connect('jobs.db')
        cursor = conn.cursor()
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {e}")
        return jsonify({'error': 'Failed to connect to the database'}), 500
    channels = data['channels']
    try:
        try:
            for setting in data['settings']:
                if 'name' not in setting or 'value' not in setting:
                    logging.error(f"Invalid setting format: {setting}")
                    return jsonify({'error': 'Invalid setting format'}), 400
                cursor.execute('''UPDATE settings SET value = ? WHERE name = ?''', (setting.get('value'), setting.get('name')))
        except sqlite3.Error as e:
            logging.error(f"Error updating settings: {e}")
            return jsonify({'error': 'Failed to update settings'}), 500
        try:
            channelIds = {channel["id"] for channel in channels}
            cursor.execute("SELECT id FROM channels")
            existingChannelIds = {row[0] for row in cursor.fetchall()}
            idsToDelete = existingChannelIds - channelIds
            if idsToDelete:
                cursor.execute(
                    f"DELETE FROM channels WHERE id IN ({','.join(['?'] * len(idsToDelete))})",
                    tuple(idsToDelete)
                )
            for channel in channels:
                if 'id' not in channel or 'name' not in channel:
                    logging.error(f"Invalid channel format: {channel}")
                    return jsonify({'error': 'Invalid channel format'}), 400
                cursor.execute(
                    "UPDATE channels SET name = ? WHERE id = ?",
                    (channel['name'], channel['id'])
                )
        except sqlite3.Error as e:
            logging.error(f"Error updating channels: {e}")
            return jsonify({'error': 'Failed to update channels'}), 500
        try:
            for channel in data['newChannels']:
                if 'name' not in channel:
                    logging.error(f"Invalid new channel format: {channel}")
                    return jsonify({'error': 'Invalid new channel format'}), 400
                cursor.execute('INSERT INTO channels (name) VALUES (?)', (channel.get('name'),))
        except sqlite3.Error as e:
            logging.error(f"Error inserting new channels: {e}")
            return jsonify({'error': 'Failed to add new channels'}), 500
        conn.commit()
        conn.close()
        return jsonify({'success': 1})
    except Exception as e:
        logging.error(f"Unexpected error during update_settings: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/index', methods=['GET'])
def get_websites():
    try:
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            logging.error(f"Database connection error: {e}")
            return jsonify({'error': 'Failed to connect to the database'}), 500

        try:
            cursor.execute(INITIALIZE_DB)
            logging.info("Database initialization checked")
        except sqlite3.Error as e:
            logging.error(f"Error executing INITIALIZE_DB: {e}")
            return jsonify({'error': 'Failed to initialize the database'}), 500

        try:
            cursor.execute('''SELECT jobWebsites.id, userId, url, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute, COUNT(jL.id) AS numLinksFound FROM jobWebsites LEFT JOIN (SELECT * FROM jobLinks where viewed = 0) jL  ON jL.jobWebsiteId = jobWebsites.id GROUP BY jobWebsites.id, userId, url, favicon, company, channelId, containerXpath, titleXpath, linkXpath, titleAttribute ''')
            jobWebsitesResults = cursor.fetchall()
        except sqlite3.Error as e:
            logging.error(f"Error fetching job websites: {e}")
            return jsonify({'error': 'Failed to fetch job websites'}), 500
    
        try:
            cursor.execute('''SELECT * FROM channels''')
            channelResults = cursor.fetchall()
        except sqlite3.Error as e:
            logging.error(f"Error fetching channels: {e}")
            return jsonify({'error': 'Failed to fetch channels'}), 500
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        logging.error(f"Database connection error: {e}")
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        websites = []
        for row in jobWebsitesResults:
            image_base64 = base64.b64encode(row[3]).decode('utf-8') if row[3] is not None else None
            websites.append({'id': row[0], 'userId': row[1], 'url': row[2], 'favicon': image_base64, 'company': row[4], 'channelId': row[5], 'containerXpath': row[6], 'titleXpath': row[7], 'linkXpath': row[8], 'titleAttribute': row[9], 'numLinksFound': row[10]})
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults]
    except Exception as e:
        logging.error(f"Error processing results: {e}")
        return jsonify({'error': 'Failed to process results'}), 500
    return jsonify({'websites': websites, 'channels': channels})

@app.route('/website/<int:website_id>/run', methods=['GET'])
def run_scraper(website_id):
    try:
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            logging.error(f"Database connection error: {e}")
            return jsonify({'error': 'Failed to connect to the database'}), 500
        
        try:
            cursor.execute('''SELECT * FROM jobWebsites WHERE id = ? ''', (website_id,))
            websiteResult = cursor.fetchone()
        except sqlite3.Error as e:
            logging.error(f"Error fetching jobWebsite: {e}")
            return jsonify({'error': 'Failed to fetch jobWebsite'}), 500
        
        if not websiteResult:
            logging.warning(f"No website found with ID: {website_id}")
            return jsonify({'error': 'Website not found'}), 404
        
        try:
            cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
            filterResults = cursor.fetchall()
            filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]
        except sqlite3.Error as e:
            logging.error(f"Error fetching jobWebsiteFilters: {e}")
            return jsonify({'error': 'Failed to fetch jobWebsiteFilters'}), 500
        
        options = Options()
        options.add_argument('--headless=new')
        try:
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            app.logger.error(f"Failed to initialize WebDriver: {e}")
            return jsonify({'error': 'Failed to initialize WebDriver'}), 500
        
        try:
            jobResults = getJobs(driver, websiteResult[2], websiteResult[4], websiteResult[6], websiteResult[7], websiteResult[8],  websiteResult[9], filters)
        except Exception as e:
            app.logger.error(f"Error while executing getJobs: {e}")
            driver.quit()
            return jsonify({'error': 'Failed to fetch jobs'}), 500
        driver.quit()

        try:
            cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = cursor.fetchall()
            previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
        except sqlite3.Error as e:
                logging.error(f"Error fetching previously sent links: {e}")
                return jsonify({'error': 'Failed to fetch previously sent links'}), 500

        try:
            newJobs = []
            for job in jobResults:
                jobDict = {'link': job['link'], 'title': job['title']}
                if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
                    cursor.execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
                    newJobs.append(jobDict)
        except Exception as e:
            logging.error(f"Error adding new job links: {e}")
            return jsonify({'error': 'Failed to add new job links'}), 500
        
        conn.commit()
        conn.close()

        try:
            send_message(newJobs, websiteResult[4], websiteResult[5], website_id)
        except Exception as e:
            app.logger.error(f"Error sending notification: {e}")
            return jsonify({'error': 'Failed to send notification'}), 500
        return jsonify({'success': 1})
    
    except Exception as e:
        logging.error(f"Unexpected error during run_scraper: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/links/<int:website_id>', methods=['GET'])
def get_links_list(website_id):
    try:
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            logging.error(f"Database connection error: {e}")
            return jsonify({'error': 'Failed to connect to the database'}), 500
        
        try:
            cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = cursor.fetchall()
            links = []
            for row in previouslySentLinkResults:
                links.append({'id': row[0], 'link': row[1], 'title': row[2], 'viewed': row[4], 'created_at': datetime.datetime.strptime(row[5], "%Y-%m-%d %H:%M:%S.%f").strftime("%m/%d/%Y %I:%M %p")})
        except sqlite3.Error as e:
                logging.error(f"Error fetching previously sent links: {e}")
                return jsonify({'error': 'Failed to fetch previously sent links'}), 500
        
        conn.commit()
        conn.close()
        return jsonify({'links': links})
    
    except Exception as e:
        logging.error(f"Unexpected error during get_links_list: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/links/<int:website_id>', methods=['PUT'])
def set_viewed_links(website_id):
    try:
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            logging.error(f"Database connection error: {e}")
            return jsonify({'error': 'Failed to connect to the database'}), 500
        try:
            cursor.execute('''UPDATE jobLinks SET viewed = 1 WHERE jobWebsiteId = ?''', (website_id,))
        except sqlite3.Error as e:
            logging.error(f"Error setting links as viewed: {e}")
            return jsonify({'error': 'Failed to set links as viewed'}), 500
        conn.commit()
        conn.close()
        return jsonify({'success': 1})
    except Exception as e:
        logging.error(f"Unexpected error during set_viewed_links: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/website/<int:website_id>', methods=['GET'])
def edit_website(website_id):
    #TODO: Add Logging
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM jobWebsites WHERE id = ? ''', (website_id,))
    websiteResult = cursor.fetchone()
    cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
    filterResults = cursor.fetchall()
    conn.commit()
    conn.close()
    website = {'id': websiteResult[0], 'userId': websiteResult[1], 'url': websiteResult[2], 'company' : websiteResult[4], 'channelId': websiteResult[5], 'containerXpath': websiteResult[6], 'titleXpath': websiteResult[7], 'linkXpath': websiteResult[8], 'titleAttribute' : websiteResult[9]}
    filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]
    return jsonify({'website': website, 'filters': filters})

@app.route('/website/<int:website_id>', methods=['PUT'])
def update_website(website_id):
    #TODO: Add Logging
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    userId = 1
    favicon = getFavicon(webpageSourceData, data['url'])
    cursor.execute('''UPDATE jobWebsites SET url = ?, userId = ?, favicon = ?, company = ?, channelId = ?, containerXpath = ?, titleXpath = ?, linkXpath = ?, titleAttribute = ? WHERE id = ? ''', (data['url'], userId, favicon, data['company'], data['channelId'], data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute'], website_id))
    for filter in data['newFilters']:
        cursor.execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (website_id, filter['filterXpath'], filter['selectValue'], filter['type']))
    filterIds = {filter["id"] for filter in data['filters']}
    cursor.execute("SELECT id FROM jobWebsiteFilters WHERE jobWebsiteId = ?", (website_id,))
    existingFilterIds = {row[0] for row in cursor.fetchall()}
    idsToDelete = existingFilterIds - filterIds
    if idsToDelete:
        cursor.execute(
            f"DELETE FROM jobWebsiteFilters WHERE id IN ({','.join(['?'] * len(idsToDelete))}) AND jobWebsiteId = ?",
            tuple(idsToDelete) + (website_id,)
        )
    for filter in data['filters']:
        cursor.execute(
            "UPDATE jobWebsiteFilters SET (filterXpath = ?, type = ?, selectValue = ?) WHERE id = ?",
            (filter['filterXpath'], filter['type'], filter['selectValue'], filter['id'])
        )
    cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
    previouslySentLinkResults = cursor.fetchall()
    previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
    newJobs = []
    for job in jobResults:
        jobDict = {'link': job['link'], 'title': job['title']}
        if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
            cursor.execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
            newJobs.append(jobDict)
    conn.commit()
    conn.close()
    send_message(newJobs, data['company'], data['channelId'], website_id)
    return jsonify({'success': 1})

@app.route('/website/<int:website_id>', methods=['DELETE'])
def delete_website(website_id):
    try:
        try:
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
        except sqlite3.Error as e:
            logging.error(f"Database connection error: {e}")
            return jsonify({'error': 'Failed to connect to the database'}), 500
        try:
            cursor.execute('''DELETE FROM jobWebsites WHERE id = ? 
                            DELETE FROM jobLinks WHERE jobWebsiteId = ? 
                            DELETE FROM jobWebsiteFilters WHERE jobWebsiteId = ?''', (website_id, website_id, website_id))
        except sqlite3.Error as e:
            app.logger.error(f"Error deleting the jobWebsite record: {e}")
            conn.close()
            return jsonify({'error': 'Failed to delete jobWebsite'}), 500
        conn.commit()
        conn.close()
        return jsonify({'success': 1})
    except Exception as e:
        logging.error(f"Unexpected error during delete_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True)