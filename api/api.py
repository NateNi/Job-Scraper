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

JOB_WEBSITE_REQUIRED_FIELDS = ['url', 'company', 'containerXpath']
JOB_WEBSITE_FILTER_REQUIRED_FIELDS = ['filterXpath', 'selectValue', 'type']
JOB_LINK_REQUIRED_FIELDS = ['link', 'title']
SETTING_REQUIRED_FIELDS = ['name', 'value']
EXISTING_CHANNEL_REQUIRED_FIELDS = ['id', 'name']
NEW_CHANNEL_REQUIRED_FIELDS = ['id', 'name']

webpageSourceData = None
jobResults = None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

file_handler = logging.FileHandler('app.log')
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)

def get_favicon(html, base_url):

    # Validate parameters (html must not be empty)
    if not html:
        app.logger.error("Invalid input: HTML content is missing.")
        return None
    
    try:    
        # Find the favicon link from the html
        soup = BeautifulSoup(html, 'html.parser')
        favicon_tag = soup.find('link', rel=lambda rel: rel and 'icon' in rel.lower())

        if not favicon_tag:
            app.logger.info(f"No favicon tag found in the HTML for URL: {base_url}")
            return None

        # Modify the favicon link if it 's relative
        favicon_url = favicon_tag['href']
        if not favicon_url.startswith(('http://', 'https://')):
            favicon_url = requests.compat.urljoin(base_url, favicon_url)

        return fetch_favicon(favicon_url)
    except Exception as e:
        app.logger.error(f"Unexpected error in get_favicon: {e}")
        return None
    

def fetch_favicon(favicon_url):
    try:
        response = requests.get(favicon_url, stream=True)
        if response.status_code == 200:
            return response.content
        else:
            app.logger.warning(f"Failed to retrieve favicon from {favicon_url}, status code: {response.status_code}")
            return None
    except requests.RequestException as e:
        app.logger.error(f"Error fetching favicon from {favicon_url}: {e}")
        return None
    
def initialize_webdriver():
    options = Options()
    options.add_argument('--headless=new')
    try:
        driver = webdriver.Chrome(options=options)
        return driver
    except Exception as e:
        app.logger.error(f"Failed to initialize WebDriver: {e}")
        return None
    
def validate_fields(data, required_fields):
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        app.logger.error(f"Missing required fields: {', '.join(missing_fields)}")
    return missing_fields

@app.route('/website/test', methods=['POST'])
def test_website():
    try:
        data = request.get_json()
        filters = data['websiteFilterData']
        newFilters = data['websiteNewFilterData']
        
        # Validate job website data
        missing_fields = validate_fields(data, JOB_WEBSITE_REQUIRED_FIELDS)
        
        # Validate existing job website filter data
        if filters:
            for filter in filters:
                missing_fields += validate_fields(filter, JOB_WEBSITE_FILTER_REQUIRED_FIELDS)

        # Validate new job website filter data
        if newFilters:
            for filter in newFilters:
                missing_fields += validate_fields(filter, JOB_WEBSITE_FILTER_REQUIRED_FIELDS)

        if missing_fields:
            app.logger.error(f"Missing required field for test website: {', '.join(missing_fields)}")
            return jsonify({'error': f"Missing required field(s): {', '.join(missing_fields)}"}), 400

        # Initialize WebDriver
        driver = initialize_webdriver()
        if not driver:
            return jsonify({'error': 'Failed to initialize WebDriver'}), 500

        try:
            jobs = getJobs(driver, data['websiteFormData']['url'], data['websiteFormData']['company'], data['websiteFormData']['containerXpath'], data['websiteFormData']['titleXpath'], data['websiteFormData']['linkXpath'], data['websiteFormData']['titleAttribute'], filters, newFilters)
        except Exception as e:
            app.logger.error(f"Error while executing getJobs: {e}")
            driver.quit()
            return jsonify({'error': 'Failed to fetch jobs'}), 500
        
        # Save source data in global variable to fetch the favicon when saving the job data
        global webpageSourceData 
        webpageSourceData = driver.page_source

        # Save the job results in global variable to save to the database if the scraper is running properly
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
        filters = data['filters']

        # Validate job website data
        missing_fields = validate_fields(data, JOB_WEBSITE_REQUIRED_FIELDS)

         # Validate job website filter data
        if filters:
            for filter in filters:
                missing_fields += validate_fields(filter, JOB_WEBSITE_FILTER_REQUIRED_FIELDS)

         # Validate job links data
        if jobResults:
            for job in jobResults:
                missing_fields += validate_fields(job, JOB_LINK_REQUIRED_FIELDS)

        if missing_fields:
            app.logger.error(f"Missing required field for create website: {', '.join(missing_fields)}")
            return jsonify({'error': f"Missing required field(s): {', '.join(missing_fields)}"}), 400

        # Establish database connection
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
        
        # Get the favicon
        try:
            favicon = get_favicon(webpageSourceData, data['url'])
        except Exception as e:
            app.logger.error(f"Error retrieving favicon: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to retrieve favicon'}), 500

        # Create the Job Website record
        jobWebsiteCreateResult = store_job_website(app, connection['cursor'], connection['conn'], data, favicon)
        if not jobWebsiteCreateResult['success']:
            return jsonify({'error': jobWebsiteCreateResult['error']}), jobWebsiteCreateResult['status']
        
        # Create the Job Website Filter records
        for filter in data['filters']:
            jobWebsiteFilterCreateResult = store_job_website_filter(app, connection['cursor'], connection['conn'], filter, jobWebsiteCreateResult['jobWebsiteId'])
            if not jobWebsiteFilterCreateResult['success']:
                return jsonify({'error': jobWebsiteFilterCreateResult['error']}), jobWebsiteFilterCreateResult['status']

        # Create the Job Link records
        for job_link in jobResults:
            jobLinkCreateResult = store_job_link(app, connection['cursor'], connection['conn'], job_link, jobWebsiteCreateResult['jobWebsiteId'])
            if not jobLinkCreateResult['success']:
                return jsonify({'error': jobLinkCreateResult['error']}), jobLinkCreateResult['status']

        connection['conn'].commit()
        connection['conn'].close()

        # Send slack message for new jobs
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
        # Fetch the saved settings
        settingsResults = fetch_settings(app, connection['cursor'], connection['conn'])
        if not settingsResults['success']:
            return jsonify({'error': settingsResults['error']}), settingsResults['status']
        settings = [{'id': setting[0], 'name': setting[1], 'value': setting[2]} for setting in settingsResults['settings']]

        # Fetch the saved channels
        channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
        if not channelResults['success']:
            return jsonify({'error': channelResults['error']}), channelResults['status']
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults['channels']]

        connection['conn'].close()

        return jsonify({'settings': settings, 'channels': channels})
    except Exception as e:
        app.logger.error(f"Unexpected error while processing request: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
@app.route('/settings', methods=['POST'])
def update_settings():
    data = request.get_json()
    channels = data['channels']
    newChannels = data['newChannels']
    settings = data['settings']

    if 'settings' not in data or ((data['channels'] or data['newChannels']) and not next((item.get('value') for item in data['settings'] if item.get('name') == 'slackToken'), None)):
        app.logger.error("Slack channels cannot be set without a Slack token")
        return jsonify({'error': "Slack channels cannot be set without a Slack token"}), 400
    
    # Validate settings fields
    for setting in settings:
        missing_fields = validate_fields(setting, SETTING_REQUIRED_FIELDS)

    # Validate existing channel fields
    for channel in channels:
        missing_fields = validate_fields(channel, EXISTING_CHANNEL_REQUIRED_FIELDS)

    # Validate new channel fields
    for channel in newChannels:
        missing_fields = validate_fields(channel, NEW_CHANNEL_REQUIRED_FIELDS)
    
    if missing_fields:
        app.logger.error(f"Missing required field for settings: {', '.join(missing_fields)}")
        return jsonify({'error': f"Missing required field(s): {', '.join(missing_fields)}"}), 400

    # Establish database connection
    connection = create_db_connection(app)
    if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']
    
    try:
        # Update settings (just slack token at the moment)
        for setting in data['settings']:
            settingUpdateResult = update_setting(app, connection['cursor'], connection['conn'], setting)
            if not settingUpdateResult['success']:
                return jsonify({'error': settingUpdateResult['error']}), settingUpdateResult['status']

        channelIds = {channel["id"] for channel in channels}

        # Get the existing channels
        channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
        if not channelResults['success']:
            return jsonify({'error': channelResults['error']}), channelResults['status']
        existingChannelIds = {row[0] for row in channelResults['channels']}

        # Delete channels that are no longer in the list
        idsToDelete = existingChannelIds - channelIds
        if idsToDelete:
            channelDeleteResult = delete_channels(app, connection['cursor'], connection['conn'], idsToDelete)
            if not channelDeleteResult['success']:
                return jsonify({'error': channelDeleteResult['error']}), channelDeleteResult['status']

        # Update channels that are still in the list
        for channel in channels:
            channelUpdateResult = update_channel(app, connection['cursor'], connection['conn'], channel)
            if not channelUpdateResult['success']:
                return jsonify({'error': channelUpdateResult['error']}), channelUpdateResult['status']

        # Add new channels in the list
        for channel in newChannels:
            channelStoreResult = store_channel(app, connection['cursor'], connection['conn'], channel)
            if not channelStoreResult['success']:
                return jsonify({'error': channelStoreResult['error']}), channelStoreResult['status']

        connection['conn'].commit()
        connection['conn'].close()

        return jsonify({'success': 1})
    except Exception as e:
        app.logger.error(f"Unexpected error during update_settings: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/index', methods=['GET'])
def get_websites():
    try:
        # Establish database connection
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']

        # Initialize database if it does not exist
        initializationResult = initialize_db(app, connection['cursor'], connection['conn'])
        if not initializationResult['success']:
            return jsonify({'error': initializationResult['error']}), initializationResult['status']

        # Fetch websites scrapers
        jobWebsiteResults = fetch_job_websites_with_new_link_counts(app, connection['cursor'], connection['conn'])
        if not jobWebsiteResults['success']:
            return jsonify({'error': jobWebsiteResults['error']}), jobWebsiteResults['status']

        # Fetch slack channels
        channelResults = fetch_channels(app, connection['cursor'], connection['conn'])
        if not channelResults['success']:
            return jsonify({'error': channelResults['error']}), channelResults['status']
        
        connection['conn'].close()

        websites = [{'id': row[0], 'url': row[1], 'favicon': (base64.b64encode(row[2]).decode('utf-8') if row[2] is not None else None), 'company': row[3], 'channelId': row[4], 'containerXpath': row[5], 'titleXpath': row[6], 'linkXpath': row[7], 'titleAttribute': row[8], 'numLinksFound': row[9]} for row in jobWebsiteResults['jobWebsites']]
        channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults['channels']]

        return jsonify({'websites': websites, 'channels': channels})
    
    except Exception as e:
        app.logger.error(f"Unexpected error during get_websites: {e}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

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
                connection['conn'].close()
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
                connection['conn'].close()
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
            connection['conn'].close()
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
    try:
        data = request.get_json()
        for field in JOB_WEBSITE_REQUIRED_FIELDS:
            if field not in data:
                app.logger.error(f"Missing required field for create website: {field}")
                return jsonify({'error': f"Missing required field: {field}"}), 400
            
        connection = create_db_connection(app)
        if not connection['success']:
            return jsonify({'error': connection['error']}), connection['status']     

        try:
            favicon = get_favicon(webpageSourceData, data['url'])
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
            connection['conn'].close()
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
                    "UPDATE jobWebsiteFilters SET filterXpath = ?, type = ?, selectValue = ? WHERE id = ?",
                    (filter['filterXpath'], filter['type'], filter['selectValue'], filter['id'])
                )
        except sqlite3.Error as e:
            app.logger.error(f"Error updating filters: {e}")
            connection['conn'].close()
            return jsonify({'error': 'Failed to update filters'}), 500
        
        try:
            connection['cursor'].execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
            previouslySentLinkResults = connection['cursor'].fetchall()
            previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
        except sqlite3.Error as e:
                app.logger.error(f"Error fetching previously sent links: {e}")
                connection['conn'].close()
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
            connection['conn'].close()
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
            connection['conn'].close()
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
        time.sleep(5)

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
                        app.logger.warning(f"Title element not found using XPath: {titleXpath}.")
                else:
                    title = f'New {company} Job'

                link = None
                if (linkXpath):
                    try:
                        link = option.find_element(By.XPATH, linkXpath).get_attribute('href')
                    except NoSuchElementException:
                            app.logger.warning(f"Link element not found using XPath: {linkXpath}. Using fallback link.")
                else:
                    link = url
                if link or title:
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