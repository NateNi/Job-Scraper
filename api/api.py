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
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

app = Flask(__name__)
CORS(app)

webpageSourceData = None

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

def getJobs(url, company, containerXpath, titleXpath, linkXpath, titleAttribute, request):
    jobs = []
    driver = webdriver.Chrome()
    driver.get(url)
    # Wait for the JavaScript content to load
    time.sleep(5)

    for key, value in request.args.items():
        if (key.startswith('filter') or key.startswith('newFilter')) and '_filterXpath' in key:
            filterName = key.split('_')[0]
            filterXpath = value
            type = request.args.get(f'{filterName}_type', '')
            selectValue = request.args.get(f'{filterName}_selectValue', '')
            match type:
                case 'select':
                    select = Select(driver.find_element(By.XPATH, filterXpath))
                    select.select_by_value(selectValue)
                    time.sleep(5)

    jobContainers = driver.find_elements(By.XPATH, containerXpath)
    for option in jobContainers:
        try:
            if (titleXpath):
                titleElement = option.find_element(By.XPATH, titleXpath)
                title = titleElement.get_attribute(titleAttribute) if titleAttribute else titleElement.text
            else:
                title = f'New {company} Job'
            if (linkXpath):
                link = option.find_element(By.XPATH, linkXpath).get_attribute('href')
            else:
                link = url
            jobs.append({'title': title, 'link': link})
        except NoSuchElementException:
            print("Element not found")
    global webpageSourceData 
    webpageSourceData = driver.page_source
    driver.quit()
    return jobs

@app.route('/website/test', methods=['GET'])
def test_website():
    data = request.args.to_dict()
    jobs = getJobs(data['url'], data['company'], data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute'], request)
    return jsonify({'jobs': jobs})

@app.route('/website', methods=['POST'])
def create_website():
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    userId = 1
    channel = '#jobstest'
    favicon = getFavicon(webpageSourceData)
    cursor.execute('''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)''')
    cursor.execute('''INSERT INTO jobWebsites (url, userId, favicon, company, channel, containerXpath, titleXpath, linkXpath, titleAttribute) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ''', (data['url'], userId, favicon, data['company'], channel, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute']))
    cursor.execute(''' CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT, filterXpath VARCHAR, selectValue VARCHAR, type VARCHAR) ''')
    jobWebsiteId = cursor.lastrowid
    for filter in data['filters']:
        cursor.execute('INSERT INTO jobWebsiteFilters (jobWebsiteId, filterXpath, selectValue, type) VALUES (?, ?, ?, ?)', (jobWebsiteId, filter['filterXpath'], filter['selectValue'], filter['type']))
    conn.commit()
    conn.close()
    return jsonify({'success': 1})

@app.route('/index', methods=['GET'])
def get_websites():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM jobWebsites''')
    jobWebsitesResults = cursor.fetchall()
    conn.commit()
    conn.close()
    websites = []
    for row in jobWebsitesResults:
        image_base64 = base64.b64encode(row[3]).decode('utf-8') if row[3] is not None else None
        websites.append({'id': row[0], 'userId': row[1], 'url': row[2], 'favicon': image_base64, 'company': row[4], 'channel': row[5], 'containerXpath': row[6], 'titleXpath': row[7], 'linkXpath': row[8], 'titleAttribute': row[9]})
    return jsonify({'websites': websites})

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
    cursor.execute('''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)''')
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

    conn.commit()
    conn.close()
    return jsonify({'success': 1})

if __name__ == '__main__':
    app.run(debug=True)