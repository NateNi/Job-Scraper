import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from selenium import webdriver
from bs4 import BeautifulSoup
import sqlite3
import requests
import base64
import time
import datetime
from scrape import *
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

app = Flask(__name__)
CORS(app)

webpageSourceData = None
jobResults = None

CREATE_JOB_WEBSITES = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channelId INT, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR, FOREIGN KEY ("channelId") REFERENCES "channels"("id"))'''
CREATE_JOB_WEBSITE_FILTERS = '''CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT, filterXpath VARCHAR, selectValue VARCHAR, type VARCHAR, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id") ) '''
CREATE_JOB_LINKS = '''CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR, title VARCHAR, jobWebsiteId INTEGER, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id"))'''
CREATE_CHANNELS = '''CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, name VARCHAR)'''
CREATE_SETTINGS = '''CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name VARCHAR, value VARCHAR)'''

def getFavicon(html):
    soup = BeautifulSoup(html, 'html.parser')
    favicon_tag = soup.find('link', rel=lambda rel: rel and 'icon' in rel.lower())
    if favicon_tag:
        favicon_url = favicon_tag['href']
        if not favicon_url.startswith(('http://', 'https://')):
            favicon_url = requests.compat.urljoin(url, favicon_url)
        response = requests.get(favicon_url, stream=True)
        if response.status_code == 200:
            return response.content
        else:
            return None
    return None

@app.route('/website/test', methods=['GET'])
def test_website():
    data = request.get_json()
    filters = data['websiteFilterData']
    newFilters = data['websiteNewFilterData']
    driver = webdriver.Chrome()
    jobs = getJobs(driver, data['websiteFormData']['url'], data['websiteFormData']['company'], data['websiteFormData']['containerXpath'], data['websiteFormData']['titleXpath'], data['websiteFormData']['linkXpath'], data['websiteFormData']['titleAttribute'], filters, newFilters)
    global webpageSourceData 
    webpageSourceData = driver.page_source
    global jobResults
    jobResults = jobs
    driver.quit()
    return jsonify({'jobs': jobs})

@app.route('/website', methods=['POST'])
def create_website():
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    userId = 1
    channel = '#jobstest'
    favicon = getFavicon(webpageSourceData)
    cursor.execute('''INSERT INTO jobWebsites (url, userId, favicon, company, channel, containerXpath, titleXpath, linkXpath, titleAttribute) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ''', (data['url'], userId, favicon, data['company'], channel, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute']))
    jobWebsiteId = cursor.lastrowid
    for filter in data['filters']:
        cursor.execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (jobWebsiteId, filter['filterXpath'], filter['selectValue'], filter['type']))
    for job in jobResults:
        cursor.execute(f"INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], jobWebsiteId, 0, datetime.datetime.now()))
    conn.commit()
    conn.close()
    return jsonify({'success': 1})

@app.route('/settings', methods=['GET'])
def get_settings():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM settings ''')
    settingsResults = cursor.fetchone()
    cursor.execute('''SELECT * FROM channels''')
    channelResults = cursor.fetchall()
    conn.commit()
    conn.close()
    settings = [{'id': setting[0], 'name': setting[1], 'value': setting[2]} for setting in settingsResults]
    channels = [{'id': channel[0], 'name': channel[1]} for channel in channelResults]
    return jsonify({'settings': settings, 'channels': channels})
    
@app.route('/settings', methods=['POST'])
def update_settings():
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    settings = data['settings']
    channels = data['channels']
    newChannels = data['newChannels']
    for setting in settings:
        cursor.execute('''UPDATE settings SET value = ? WHERE name = ?''', (setting['value'], setting['name']))
    cursor.execute('')
    for channel in newChannels:
        cursor.execute('INSERT INTO channels (name) VALUES (?)', (channel))
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
        cursor.execute(
            "UPDATE channels SET (name = ?) WHERE id = ?",
            (channel['name'], channel['id'])
        )
    
    conn.commit()
    conn.close()
    return jsonify({'success': 1})

@app.route('/index', methods=['GET'])
def get_websites():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute(CREATE_JOB_WEBSITES)
    cursor.execute(CREATE_JOB_WEBSITE_FILTERS)
    cursor.execute(CREATE_JOB_LINKS)
    cursor.execute(CREATE_CHANNELS)
    cursor.execute(CREATE_SETTINGS)
    cursor.execute('''SELECT * FROM jobWebsites''')
    jobWebsitesResults = cursor.fetchall()
    cursor.execute('''SELECT * FROM channels''')
    channelResults = cursor.fetchall()
    conn.commit()
    conn.close()
    websites = []
    for row in jobWebsitesResults:
        image_base64 = base64.b64encode(row[3]).decode('utf-8') if row[3] is not None else None
        websites.append({'id': row[0], 'userId': row[1], 'url': row[2], 'favicon': image_base64, 'company': row[4], 'channel': row[5], 'containerXpath': row[6], 'titleXpath': row[7], 'linkXpath': row[8], 'titleAttribute': row[9]})
    channels = [{'id': row[0], 'name': row[1]}]
    return jsonify({'websites': websites, 'channels': channels})

@app.route('/run/<int:website_id>', methods=['GET'])
def run_scraper(website_id):
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM jobWebsites WHERE id = ? ''', (website_id,))
    websiteResult = cursor.fetchone()
    cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
    filterResults = cursor.fetchall()
    conn.commit()
    conn.close()
    filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]
    driver = webdriver.Chrome()
    jobResults = getJobs(driver, websiteResult[2], websiteResult[4], websiteResult[6], websiteResult[7], websiteResult[8],  websiteResult[9], filters)
    driver.quit()
    cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
    previouslySentLinkResults = cursor.fetchall()
    previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
    for job in jobResults:
        jobDict = {'link': job['link'], 'title': job['title']}
        if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
            cursor.execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
    conn.commit()
    conn.close()
    return jsonify({'success': 1})

@app.route('/links/<int:website_id>', methods=['GET'])
def get_links_list(website_id):
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website_id}' ")
    previouslySentLinkResults = cursor.fetchall()
    cursor.execute('''UPDATE jobLinks SET viewed = 1 WHERE jobWebsiteId = ?''', (website_id,))
    conn.commit()
    conn.close()
    links = []
    for row in previouslySentLinkResults:
        links.append({'id': row[0], 'link': row[1], 'title': row[2], 'viewed': row[4], 'created_at': datetime.datetime.strptime(row[5], "%Y-%m-%d %H:%M:%S.%f").strftime("%m/%d/%Y %I:%M %p")})
    print(links)
    return jsonify({'links': links})

@app.route('/website/<int:website_id>', methods=['GET'])
def edit_website(website_id):
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM jobWebsites WHERE id = ? ''', (website_id,))
    websiteResult = cursor.fetchone()
    cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
    filterResults = cursor.fetchall()
    conn.commit()
    conn.close()
    website = {'id': websiteResult[0], 'userId': websiteResult[1], 'url': websiteResult[2], 'company' : websiteResult[4], 'channel': websiteResult[5], 'containerXpath': websiteResult[6], 'titleXpath': websiteResult[7], 'linkXpath': websiteResult[8], 'titleAttribute' : websiteResult[9]}
    filters = [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]
    return jsonify({'website': website, 'filters': filters})

@app.route('/website/<int:website_id>', methods=['PUT'])
def update_website(website_id):
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    userId = 1
    channel = '#jobstest'
    favicon = getFavicon(webpageSourceData)
    cursor.execute('''UPDATE jobWebsites SET url = ?, userId = ?, favicon = ?, company = ?, channel = ?, containerXpath = ?, titleXpath = ?, linkXpath = ?, titleAttribute = ? WHERE id = ? ''', (data['url'], userId, favicon, data['company'], channel, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute'], website_id))
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
    for job in jobResults:
        jobDict = {'link': job['link'], 'title': job['title']}
        if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
            cursor.execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website_id, 0, datetime.datetime.now()))
    conn.commit()
    conn.close()
    return jsonify({'success': 1})

if __name__ == '__main__':
    app.run(debug=True)