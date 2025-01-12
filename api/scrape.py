import os
from selenium import webdriver
from slack_sdk import WebClient
import sqlite3
import time
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

CREATE_JOB_WEBSITES = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, userId INTEGER, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)'''
CREATE_JOB_WEBSITE_FILTERS = ''' CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT, filterXpath VARCHAR, selectValue VARCHAR, type VARCHAR, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id") ) '''
CREATE_JOB_LINKS = '''CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR, title VARCHAR, jobWebsiteId INTEGER, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id"))'''

def applyFilters(filters, driver):
    for filter in filters:
        # if (key.startswith('filter') or key.startswith('newFilter')) and '_filterXpath' in key:
        # filterName = key.split('_')[0]
        filterXpath = filter['filterXpath']
        type = filter['type']
        selectValue = filter['selectValue']
        match type:
            case 'select':
                select = Select(driver.find_element(By.XPATH, filterXpath))
                select.select_by_value(selectValue)
                time.sleep(5)
        return True

def getJobs(driver, url, company, containerXpath, titleXpath, linkXpath, titleAttribute, filters, newFilters = None):
    jobs = []
    driver.get(url)
    # Wait for the JavaScript content to load
    time.sleep(4)

    applyFilters(filters, driver)
    if newFilters:
        applyFilters(newFilters, driver)

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
    return jobs

def getFiltersForWebsite(cursor, website_id):
    cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
    filterResults = cursor.fetchall()
    return [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]

def scrape_all():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.execute(CREATE_JOB_WEBSITES)
    cursor.execute(CREATE_JOB_WEBSITE_FILTERS)
    cursor.execute(CREATE_JOB_LINKS)
    cursor.execute('''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, url VARCHAR, favicon BLOB, company VARCHAR, channel VARCHAR, containerXpath VARCHAR, titleXpath VARCHAR, linkXpath VARCHAR, titleAttribute VARCHAR)''')
    cursor.execute("SELECT * FROM jobWebsites")
    jobWebsitesResults = cursor.fetchall()
    websites = [{'id': row[0], 'url': row[1], 'company': row[2], 'channel': row[3], 'containerXpath': row[4], 'titleXpath': row[5], 'linkXpath': row[6], 'titleAttribute': row[7], 'filters': getFiltersForWebsite(cursor, row[0])} for row in jobWebsitesResults]
    conn.close()
    for website in websites:
        driver = webdriver.Chrome()
        getJobs(driver, website['id'], website['url'], website['company'], website['channel'], website['containerXpath'], website['titleXpath'], website['linkXpath'], website['titleAttribute'])
        driver.quit()
    return True

def send_message(jobs, company, channel, websiteId):
    slack_client = WebClient(token=os.getenv('SLACK_TOKEN'))
    links = [f"<{job['link']}|{job['title']}>" for job in jobs]
    response = slack_client.chat_postMessage(channel=channel, text= "*" + company + " jobs found: * \n\n" + "\n\n".join(links))
    if response["ok"]:
        conn = sqlite3.connect('jobs.db')
        cursor = conn.cursor()
        for job in jobs:
            cursor.execute(f"INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId) VALUES('{job['link']}', '{job['title']}', '{websiteId}')")
        conn.commit()
        conn.close()
    else:
        print(f"Failed to send Slack message: {response['error']}")