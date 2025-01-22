from flask import Flask, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
import logging
import sqlite3
import requests
import base64
import datetime
import time
from db import *
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, InvalidSelectorException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

app = Flask(__name__)
app.run(debug=True)

CORS(app)

webpageSourceData = None
jobResults = None

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
        print(data['websiteFormData'])
        required_fields = ['url', 'company', 'containerXpath', 'titleXpath', 'linkXpath']
        missing_fields = []
        for field in required_fields:
            if not data['websiteFormData'].get(field):
                missing_fields.append(field)
        if missing_fields:
            app.logger.error(f"Missing required field for test website: {', '.join(missing_fields)}")
            return jsonify({'error': f"Missing required field(s): {', '.join(missing_fields)}"}), 400

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
            
        missing_fields = []
        for field in required_fields:
            if not data.get(field):
                missing_fields.append(field)
        if missing_fields:
            app.logger.error(f"Missing required field for create website: {', '.join(missing_fields)}")
            return jsonify({'error': f"Missing required field(s): {', '.join(missing_fields)}"}), 400

        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
        
        try:
            favicon = getFavicon(webpageSourceData, data['url'])
        except Exception as e:
            app.logger.error(f"Error retrieving favicon: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to retrieve favicon'}), 500

        jobWebsiteCreateResult = addJobWebsite(app, connection['cursor'], connection['conn'], data, favicon)
        if not jobWebsiteCreateResult['success']:
            return jsonify({'error': jobWebsiteCreateResult['error']}), jobWebsiteCreateResult['status']
        
        try:
            for filter in data['filters']:
                if not all(k in filter for k in ['filterXpath', 'selectValue', 'type']):
                    app.logger.error(f"Missing required filter fields in: {filter}")
                    return jsonify({'error': 'Invalid filter format'}), 400
                connection['cursor'].execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (jobWebsiteCreateResult['jobWebsiteId'], filter['filterXpath'], filter['selectValue'], filter['type']))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobWebsiteFilters table: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to add filters'}), 500
        try:
            for job in jobResults:
                if not all(k in job for k in ['link', 'title']):
                    app.logger.error(f"Missing required job fields in: {job}")
                    return jsonify({'error': 'Invalid job format'}), 400
                connection['cursor'].execute(f"INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], jobWebsiteCreateResult['jobWebsiteId'], 0, datetime.datetime.now()))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobLinks table: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to save job links'}), 500
        connection['conn'].commit()
        connection['conn'].close()
        try:
            send_message([{'link': job['link'], 'title': job['title']} for job in jobResults], data['company'], data['channelId'], jobWebsiteCreateResult['jobWebsiteId'])
        except Exception as e:
            app.logger.error(f"Error sending notification: {e}")
            return jsonify({'error': 'Failed to send notification'}), 500
        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error in create_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/settings', methods=['GET'])
def get_settings():
    connection = create_db_connection(app)
    if not connection['success']:
        return jsonify({'error': connection['error']}), connection['status']

    try:
        settingsResults = fetch_settings(app, connection['cursor'], connection['conn'])
        if not settingsResults['success']:
            return jsonify({'error': settingsResults['error']}), settingsResults['status']
        
        channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
        if not channelResults['success']:
            return jsonify({'error': channelResults['error']}), channelResults['status']

        connection['conn'].close()
        settings = [{'id': setting[0], 'name': setting[1], 'value': setting[2]} for setting in settingsResults['settings']]
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults['channels']]

        return jsonify({'settings': settings, 'channels': channels})
    except Exception as e:
        app.logger.error(f"Unexpected error while processing request: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
@app.route('/settings', methods=['POST'])
def update_settings():
    data = request.get_json()

    if 'settings' not in data or ((data['channels'] or data['newChannels']) and not next((item.get('value') for item in data['settings'] if item.get('name') == 'slackToken'), None)):
        app.logger.error("Slack channels cannot be set without a Slack token")
        return jsonify({'error': "Slack channels cannot be set without a Slack token"}), 400

    connection = create_db_connection(app)
    if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
    channels = data['channels']
    try:
        try:
            for setting in data['settings']:
                if 'name' not in setting or 'value' not in setting:
                    app.logger.error(f"Invalid setting format: {setting}")
                    return jsonify({'error': 'Invalid setting format'}), 400
                connection['cursor'].execute('''UPDATE settings SET value = ? WHERE name = ?''', (setting.get('value'), setting.get('name')))
        except sqlite3.Error as e:
            app.logger.error(f"Error updating settings: {e}")
            return jsonify({'error': 'Failed to update settings'}), 500
        try:
            channelIds = {channel["id"] for channel in channels}

            channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
            if not channelResults['success']:
                return jsonify({'error': channelResults['error']}), channelResults['status']
            existingChannelIds = {row[0] for row in channelResults['channels']}

            idsToDelete = existingChannelIds - channelIds
            if idsToDelete:
                connection['cursor'].execute(
                    f"DELETE FROM channels WHERE id IN ({','.join(['?'] * len(idsToDelete))})",
                    tuple(idsToDelete)
                )
            for channel in channels:
                if 'id' not in channel or 'name' not in channel:
                    app.logger.error(f"Invalid channel format: {channel}")
                    return jsonify({'error': 'Invalid channel format'}), 400
                connection['cursor'].execute(
                    "UPDATE channels SET name = ? WHERE id = ?",
                    (channel['name'], channel['id'])
                )
        except sqlite3.Error as e:
            app.logger.error(f"Error updating channels: {e}")
            return jsonify({'error': 'Failed to update channels'}), 500
        try:
            for channel in data['newChannels']:
                if 'name' not in channel:
                    app.logger.error(f"Invalid new channel format: {channel}")
                    return jsonify({'error': 'Invalid new channel format'}), 400
                connection['cursor'].execute('INSERT INTO channels (name) VALUES (?)', (channel.get('name'),))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting new channels: {e}")
            return jsonify({'error': 'Failed to add new channels'}), 500
        connection['conn'].commit()
        connection['conn'].close()
        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error during update_settings: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/index', methods=['GET'])
def get_websites():
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        initializationResult = initialize_db(app, connection['cursor'], connection['conn'])
        if not initializationResult['success']:
            return jsonify({'error': initializationResult['error']}), initializationResult['status']

        jobWebsiteResults = fetch_job_websites_with_new_link_counts(app, connection['cursor'], connection['conn'])
        if not jobWebsiteResults['success']:
            return jsonify({'error': jobWebsiteResults['error']}), jobWebsiteResults['status']
    
        channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
        if not channelResults['success']:
            return jsonify({'error': channelResults['error']}), channelResults['status']
        
        connection['conn'].commit()
        connection['conn'].close()
    except sqlite3.Error as e:
        app.logger.error(f"Database connection error: {e}")
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        websites = []
        for row in jobWebsiteResults['jobWebsites']:
            image_base64 = base64.b64encode(row[2]).decode('utf-8') if row[2] is not None else None
            websites.append({'id': row[0], 'url': row[1], 'favicon': image_base64, 'company': row[3], 'channelId': row[4], 'containerXpath': row[5], 'titleXpath': row[6], 'linkXpath': row[7], 'titleAttribute': row[8], 'numLinksFound': row[9]})
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults['channels']]
    except Exception as e:
        app.logger.error(f"Error processing results: {e}")
        return jsonify({'error': 'Failed to process results'}), 500
    return jsonify({'websites': websites, 'channels': channels})

@app.route('/website/<int:website_id>/run', methods=['GET'])
def run_scraper(website_id):
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
        
        jobWebsiteResult = fetch_job_website(app, connection['cursor'], connection['conn'], website_id)
        if not jobWebsiteResult['success']:
            return jsonify({'error': jobWebsiteResult['error']}), jobWebsiteResult['status']
        
        if not jobWebsiteResult['jobWebsite']:
            app.logger.warning(f"No website found with ID: {website_id}")
            return jsonify({'error': 'Website not found'}), 404
        
        filterResults = fetch_filters_for_job_website(app, connection['cursor'], connection['conn'], website_id)
        if not filterResults['success']:
            return jsonify({'error': filterResults['error']}), filterResults['status']
        filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults['filters']]
        
        options = Options()
        options.add_argument('--headless=new')
        try:
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            app.logger.error(f"Failed to initialize WebDriver: {e}")
            return jsonify({'error': 'Failed to initialize WebDriver'}), 500
        
        try:
            jobResults = getJobs(driver, jobWebsiteResult['jobWebsite'][1], jobWebsiteResult['jobWebsite'][3], jobWebsiteResult['jobWebsite'][5], jobWebsiteResult['jobWebsite'][6], jobWebsiteResult['jobWebsite'][7],  jobWebsiteResult['jobWebsite'][8], filters)
        except Exception as e:
            app.logger.error(f"Error while executing getJobs: {e}")
            driver.quit()
            return jsonify({'error': 'Failed to fetch jobs'}), 500
        driver.quit()

        try:
            connection['cursor'].execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = connection['cursor'].fetchall()
            previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
        except sqlite3.Error as e:
                app.logger.error(f"Error fetching previously sent links: {e}")
                return jsonify({'error': 'Failed to fetch previously sent links'}), 500

        try:
            newJobs = []
            for job in jobResults:
                jobDict = {'link': job['link'], 'title': job['title']}
                if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
                    connection['cursor'].execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
                    newJobs.append(jobDict)
        except Exception as e:
            app.logger.error(f"Error adding new job links: {e}")
            return jsonify({'error': 'Failed to add new job links'}), 500
        
        connection['conn'].commit()
        connection['conn'].close()

        try:
            send_message(newJobs, jobWebsiteResult['jobWebsite'][4], jobWebsiteResult['jobWebsite'][5], website_id)
        except Exception as e:
            app.logger.error(f"Error sending notification: {e}")
            return jsonify({'error': 'Failed to send notification'}), 500
        return jsonify({'success': 1, 'newJobsCount': len(newJobs)}), 200
    
    except Exception as e:
        app.logger.error(f"Unexpected error during run_scraper: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/links/<int:website_id>', methods=['GET'])
def get_links_list(website_id):
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
        
        try:
            connection['cursor'].execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = connection['cursor'].fetchall()
            links = []
            for row in previouslySentLinkResults:
                links.append({'id': row[0], 'link': row[1], 'title': row[2], 'viewed': row[4], 'created_at': datetime.datetime.strptime(row[5], "%Y-%m-%d %H:%M:%S.%f").strftime("%m/%d/%Y %I:%M %p")})
        except sqlite3.Error as e:
                app.logger.error(f"Error fetching previously sent links: {e}")
                return jsonify({'error': 'Failed to fetch previously sent links'}), 500

        jobWebsiteResult = fetch_job_website(app, connection['cursor'], connection['conn'], website_id)
        if not jobWebsiteResult['success']:
            return jsonify({'error': jobWebsiteResult['error']}), jobWebsiteResult['status']
        
        connection['conn'].commit()
        connection['conn'].close()
        return jsonify({'links': links, 'company': jobWebsiteResult['jobWebsite'][3]})
    
    except Exception as e:
        app.logger.error(f"Unexpected error during get_links_list: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/links/<int:website_id>', methods=['PUT'])
def set_viewed_links(website_id):
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        try:
            connection['cursor'].execute('''UPDATE jobLinks SET viewed = 1 WHERE jobWebsiteId = ?''', (website_id,))
        except sqlite3.Error as e:
            app.logger.error(f"Error setting links as viewed: {e}")
            return jsonify({'error': 'Failed to set links as viewed'}), 500
        connection['conn'].commit()
        connection['conn'].close()
        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error during set_viewed_links: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/website/<int:website_id>', methods=['GET'])
def edit_website(website_id):
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        jobWebsiteResult = fetch_job_website(app, connection['cursor'], connection['conn'], website_id)
        if not jobWebsiteResult['success']:
            return jsonify({'error': jobWebsiteResult['error']}), jobWebsiteResult['status']
        
        website = {'id': jobWebsiteResult['jobWebsite'][0], 'url': jobWebsiteResult['jobWebsite'][1], 'company' : jobWebsiteResult['jobWebsite'][3], 'channelId': jobWebsiteResult['jobWebsite'][4], 'containerXpath': jobWebsiteResult['jobWebsite'][5], 'titleXpath': jobWebsiteResult['jobWebsite'][6], 'linkXpath': jobWebsiteResult['jobWebsite'][7], 'titleAttribute' : jobWebsiteResult['jobWebsite'][8]}

        filterResults = fetch_filters_for_job_website(app, connection['cursor'], connection['conn'], website_id)
        if not filterResults['success']:
            return jsonify({'error': filterResults['error']}), filterResults['status']
        filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults['filters']]

        connection['conn'].commit()
        connection['conn'].close()
        return jsonify({'website': website, 'filters': filters})
    except Exception as e:
        app.logger.error(f"Unexpected error during edit_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/website/<int:website_id>', methods=['PUT'])
def update_website(website_id):
    #TODO: Add Logging
    try:
        data = request.get_json()
        required_fields = ['url', 'company', 'containerXpath', 'titleXpath', 'linkXpath']
        for field in required_fields:
            if field not in data:
                app.logger.error(f"Missing required field for create website: {field}")
                return jsonify({'error': f"Missing required field: {field}"}), 400
            
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']     

        try:
            favicon = getFavicon(webpageSourceData, data['url'])
        except Exception as e:
            app.logger.error(f"Error retrieving favicon: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to retrieve favicon'}), 500
        try:
            connection['cursor'].execute('''UPDATE jobWebsites SET url = ?, favicon = ?, company = ?, channelId = ?, containerXpath = ?, titleXpath = ?, linkXpath = ?, titleAttribute = ? WHERE id = ? ''', (data['url'], favicon, data['company'], data['channelId'] if 'channelId' in data else None, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute'], website_id))
        except sqlite3.Error as e:
            app.logger.error(f"Error updating jobWebsites table: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to update job website entry'}), 500
        try:
            for filter in data['newFilters']:
                if not all(k in filter for k in ['filterXpath', 'selectValue', 'type']):
                    app.logger.error(f"Missing required filter fields in: {filter}")
                    return jsonify({'error': 'Invalid filter format'}), 400
                connection['cursor'].execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (website_id, filter['filterXpath'], filter['selectValue'], filter['type']))
        except sqlite3.Error as e:
            app.logger.error(f"Error inserting into jobWebsiteFilters table: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to add filters'}), 500
    
        filterIds = {filter["id"] for filter in data['filters']}
        try:
            connection['cursor'].execute("SELECT id FROM jobWebsiteFilters WHERE jobWebsiteId = ?", (website_id,))
            existingFilterIds = {row[0] for row in connection['cursor'].fetchall()}
        except sqlite3.Error as e:
            app.logger.error(f"Error fetching jobWebsiteFilters: {e}")
            return jsonify({'error': 'Failed to fetch filters'}), 500
    
        try:
            idsToDelete = existingFilterIds - filterIds
            if idsToDelete:
                connection['cursor'].execute(
                    f"DELETE FROM jobWebsiteFilters WHERE id IN ({','.join(['?'] * len(idsToDelete))}) AND jobWebsiteId = ?",
                    tuple(idsToDelete) + (website_id,)
                )
            for filter in data['filters']:
                connection['cursor'].execute(
                    "UPDATE jobWebsiteFilters SET (filterXpath = ?, type = ?, selectValue = ?) WHERE id = ?",
                    (filter['filterXpath'], filter['type'], filter['selectValue'], filter['id'])
                )
        except sqlite3.Error as e:
            app.logger.error(f"Error updating filters: {e}")
            return jsonify({'error': 'Failed to update filters'}), 500
        
        try:
            connection['cursor'].execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = connection['cursor'].fetchall()
            previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
        except sqlite3.Error as e:
                app.logger.error(f"Error fetching previously sent links: {e}")
                return jsonify({'error': 'Failed to fetch previously sent links'}), 500
    
        try:
            newJobs = []
            for job in jobResults:
                jobDict = {'link': job['link'], 'title': job['title']}
                if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
                    connection['cursor'].execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
                    newJobs.append(jobDict)
        except Exception as e:
            app.logger.error(f"Error adding new job links: {e}")
            return jsonify({'error': 'Failed to add new job links'}), 500
    
        connection['conn'].commit()
        connection['conn'].close()

        try:
            send_message(newJobs, data['company'], data['channelId'], website_id)
        except Exception as e:
            app.logger.error(f"Error sending notification: {e}")
            return jsonify({'error': 'Failed to send notification'}), 500
        return jsonify({'success': 1})
    
    except Exception as e:
        app.logger.error(f"Unexpected error during update_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/website/<int:website_id>', methods=['DELETE'])
def delete_website(website_id):
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        try:
            connection['cursor'].execute('''DELETE FROM jobWebsites WHERE id = ? ''', (website_id,))
            connection['cursor'].execute('''DELETE FROM jobLinks WHERE jobWebsiteId = ? ''', (website_id,))
            connection['cursor'].execute('''DELETE FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
                            
        except sqlite3.Error as e:
            app.logger.error(f"Error deleting the jobWebsite record: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to delete jobWebsite'}), 500
        connection['conn'].commit()
        connection['conn'].close()
        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error during delete_website: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
def send_message(jobs, company, channelId, websiteId):
    if not channelId or not isinstance(channelId, int):
        return None
    
    try: 
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
        
        slackTokenResults = fetch_slack_token(app, connection['cursor'], connection['conn'])
        if not slackTokenResults['success']:
            return jsonify({'error': slackTokenResults['error']}), slackTokenResults['status']
        
        if not slackTokenResults['slackToken']:
            return None

        try:
            connection['cursor'].execute(''' SELECT name FROM channels WHERE id = ? ''', (channelId,))
            channel = connection['cursor'].fetchone()
            if not channel:
                connection['cursor'].execute(''' UPDATE jobWebsites SET channelId = null WHERE id = ? ''', (websiteId,))
        except sqlite3.Error as e:
            app.logger.error(f"Error querying the slack channel: {e}")
            return jsonify({'error': 'Failed to query the slack channel'}), 500

        connection['conn'].commit()
        connection['conn'].close()

        try:
            slack_client = WebClient(token=slackTokenResults['slackToken'][0])
            links = [f"<{job['link']}|{job['title']}>" for job in jobs]
            response = slack_client.chat_postMessage(channel=channel[0], unfurl_links=False, text= "*" + company + " jobs found: * \n\n" + "\n\n".join(links))
            if not response["ok"]:
                app.logger.error(f"Failed to send Slack message: {response['error']}")
                return None
        except SlackApiError as e:
            app.logger.error(f"Slack API Error: {e.response['error']}")
        except Exception as e:
            app.logger.error(f"Unexpected error while sending Slack message: {e}")
    except Exception as e:
        app.logger.error(f"Unexpected error during send_message: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
def scrape_all():
    try:
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        try:
            connection['cursor'].executescript(INITIALIZE_DB)
        except sqlite3.Error as e:
            app.logger.error(f"Error executing INITIALIZE_DB: {e}")
            return jsonify({'error': 'Failed to initialize the database'}), 500
        
        jobWebsiteResults = fetch_job_websites(app, connection['cursor'], connection['conn'])
        if not jobWebsiteResults['success']:
            return jsonify({'error': jobWebsiteResults['error']}), jobWebsiteResults['status']
        websites = [{'id': row[0], 'url': row[1], 'company': row[2], 'channel': row[3], 'containerXpath': row[4], 'titleXpath': row[5], 'linkXpath': row[6], 'titleAttribute': row[7], 'filters': processed_filters(fetch_filters_for_job_website(app, connection['cursor'], connection['conn'], row[0]))} for row in jobWebsiteResults['jobWebsites']]
       
        connection['conn'].close()

        for website in websites:
            options = Options()
            options.add_argument('--headless=new')
            try:
                driver = webdriver.Chrome(options=options)
            except Exception as e:
                app.logger.error(f"Failed to initialize WebDriver: {e}")
                return jsonify({'error': 'Failed to initialize WebDriver'}), 500
            try:
                getJobs(driver, website['id'], website['url'], website['company'], website['channel'], website['containerXpath'], website['titleXpath'], website['linkXpath'], website['titleAttribute'])
            except Exception as e:
                app.logger.error(f"Error while executing getJobs: {e}")
                driver.quit()
                return jsonify({'error': 'Failed to fetch jobs'}), 500
            driver.quit()
        return True
    except Exception as e:
        app.logger.error(f"Unexpected error during scrape_all: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
def processed_filters(filterResults):
    return [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]

def applyFilters(filters, driver):
    try:
        for filter in filters:
            filterXpath = filter['filterXpath']
            selectValue = filter['selectValue']
            try:
                match filter['type']:
                    case 'select':
                        select = Select(driver.find_element(By.XPATH, filterXpath))
                        select.select_by_value(selectValue)
                        time.sleep(5)
                    case _:
                        app.logger.warning(f"Unsupported filter type: {filter['type']}. Skipping this filter.")
                        continue
            except NoSuchElementException:
                app.logger.error(f"Element not found for XPath: {filterXpath}. Skipping this filter.")
            except InvalidSelectorException:
                app.logger.error(f"Invalid XPath: {filterXpath}. Skipping this filter.")
            except Exception as e:
                app.logger.error(f"Unexpected error while applying filter {filter}: {e}")
        return True
    except Exception as e:
        app.logger.error(f"Unexpected error in applyFilters: {e}")
        return False
    
def getJobs(driver, url, company, containerXpath, titleXpath, linkXpath, titleAttribute, filters, newFilters = None):
    jobs = []

    if not driver:
        app.logger.error("WebDriver instance is None.")
        return []
    
    try:
        driver.get(url)
        # Wait for the JavaScript content to load
        time.sleep(4)

        if not applyFilters(filters, driver):
            app.logger.warning("Failed to apply filters.")

        if newFilters:
            if not applyFilters(newFilters, driver):
                app.logger.warning("Failed to apply filters.")

        jobContainers = driver.find_elements(By.XPATH, containerXpath)
        for option in jobContainers:
            try:
                title = None
                if (titleXpath):
                    try:
                        titleElement = option.find_element(By.XPATH, titleXpath)
                        title = titleElement.get_attribute(titleAttribute) if titleAttribute else titleElement.text
                    except NoSuchElementException:
                        app.logger.warning(f"Title element not found using XPath: {titleXpath}. Using fallback title.")
                if not title:
                    title = f'New {company} Job'

                link = None
                if (linkXpath):
                    try:
                        link = option.find_element(By.XPATH, linkXpath).get_attribute('href')
                    except NoSuchElementException:
                            app.logger.warning(f"Link element not found using XPath: {linkXpath}. Using fallback link.")
                if not link:
                        link = url
                
                jobs.append({'title': title, 'link': link})
            except Exception as e:
                    app.logger.error(f"Unexpected error while processing a job container: {e}")

    except TimeoutException:
        app.logger.error(f"Timeout occurred while loading URL: {url}")
    except Exception as e:
        app.logger.error(f"Unexpected error in getJobs: {e}")
    return jobs

if __name__ == '__main__':
    app.run(debug=True)