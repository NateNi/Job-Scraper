import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from selenium import webdriver
from bs4 import BeautifulSoup
import sqlite3
import requests
import base64
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

app = Flask(__name__)
CORS(app)

def getFavicon(url):
    driver = webdriver.Chrome()
    driver.get(url)
    html = driver.page_source
    driver.quit()
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

@app.route('/website', methods=['POST'])
def create_website():
    data = request.get_json()
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    userId = 1
    channel = '#jobstest'
    favicon = getFavicon(data['url'])
    cursor.execute('''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)''')
    cursor.execute('''INSERT INTO jobWebsites (url, userId, favicon, company, channel, containerXpath, titleXpath, linkXpath, titleAttribute) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ''', (data['url'], userId, favicon, data['company'], channel, data['containerXpath'], data['titleXpath'], data['linkXpath'], data['titleAttribute']))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Data received successfully'})

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
        image_base64 = base64.b64encode(row[3]).decode('utf-8')
        websites.append({'id': row[0], 'userId': row[1], 'url': row[2], 'favicon': image_base64, 'company': row[4], 'channel': row[5], 'containerXpath': row[6], 'titleXpath': row[7], 'linkXpath': row[8], 'titleAttribute': row[9]})
    return jsonify({'websites': websites})

if __name__ == '__main__':
    app.run(debug=True)