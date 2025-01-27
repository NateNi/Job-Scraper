import sqlite3
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException, InvalidSelectorException
import time
from slack_sdk import WebClient
import datetime

INITIALIZE_DB = '''CREATE TABLE IF NOT EXISTS jobWebsites (id INTEGER PRIMARY KEY, url VARCHAR NOT NULL, favicon BLOB, company VARCHAR NOT NULL, channelId INT, containerXpath VARCHAR NOT NULL, titleXpath VARCHAR NOT NULL, linkXpath VARCHAR NOT NULL, titleAttribute VARCHAR, FOREIGN KEY ("channelId") REFERENCES "channels"("id"));
                CREATE TABLE IF NOT EXISTS jobWebsiteFilters (id INTEGER PRIMARY KEY, jobWebsiteId INT NOT NULL, filterXpath VARCHAR NOT NULL, selectValue VARCHAR, type VARCHAR NOT NULL, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")); 
                CREATE TABLE IF NOT EXISTS jobLinks (id INTEGER PRIMARY KEY, link VARCHAR NOT NULL, title VARCHAR, jobWebsiteId INTEGER NOT NULL, viewed INTEGER, created_at TIMESTAMP, FOREIGN KEY ("jobWebsiteId") REFERENCES "jobWebsites"("id")); 
                CREATE TABLE IF NOT EXISTS channels (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL); 
                CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL UNIQUE, value VARCHAR); 
                INSERT INTO settings (name, value) VALUES ('slackToken', null) ON CONFLICT(name) DO NOTHING; '''

def scrape_all():
    conn = sqlite3.connect('jobs.db')
    cursor = conn.cursor()
    cursor.executescript(INITIALIZE_DB)
    
    cursor.execute("SELECT * FROM jobWebsites")
    jobWebsites = cursor.fetchall()
    websites = [{'id': row[0], 'url': row[1], 'company': row[3], 'channel': row[4], 'containerXpath': row[5], 'titleXpath': row[6], 'linkXpath': row[7], 'titleAttribute': row[8], 'filters': processed_filters(fetch_filters_for_job_website(cursor, row[0]))} for row in jobWebsites]

    for website in websites:
        options = Options()
        options.add_argument('--headless=new')
        driver = webdriver.Chrome(options=options)
        jobResults = getJobs(driver, website['url'], website['company'], website['containerXpath'], website['titleXpath'], website['linkXpath'], website['titleAttribute'], website['filters'])
        driver.quit()

        cursor.execute(f"SELECT * FROM jobLinks where jobWebsiteId = '{website['id']}' ")
        previouslySentLinkResults = cursor.fetchall()
        previouslySentLinks = [{'link': row[1], 'title': row[2]} for row in previouslySentLinkResults]
        
        newJobs = []
        for job in jobResults:
            jobDict = {'link': job['link'], 'title': job['title']}
            if not [entry for entry in previouslySentLinks if all(entry.get(key) == value for key, value in jobDict.items())]:
                cursor.execute("INSERT OR IGNORE INTO jobLinks(link, title, jobWebsiteId, viewed, created_at) VALUES(?, ?, ?, ?, ?)", (job['link'], job['title'], website['id'], 0, datetime.datetime.now()))
                newJobs.append(jobDict)
        
        send_message(conn, cursor, newJobs, website['company'], website['channel'], website['id'])
        conn.commit()
        
    conn.close()

    return True

def fetch_filters_for_job_website(cursor, website_id):
    cursor.execute('''SELECT * FROM jobWebsiteFilters WHERE jobWebsiteId = ? ''', (website_id,))
    return cursor.fetchall()

def processed_filters(filterResults):
    return [{'id': filterResult[0], 'filterXpath': filterResult[2], 'selectValue': filterResult[3], 'type': filterResult[4]} for filterResult in filterResults]
    
def getJobs(driver, url, company, containerXpath, titleXpath, linkXpath, titleAttribute, filters):
    jobs = []

    driver.get(url)
    # Wait for the JavaScript content to load
    time.sleep(5)

    applyFilters(filters, driver)

    jobContainers = driver.find_elements(By.XPATH, containerXpath)
    for option in jobContainers:
        title = None
        if (titleXpath):
            try:
                titleElement = option.find_element(By.XPATH, titleXpath)
                title = titleElement.get_attribute(titleAttribute) if titleAttribute else titleElement.text
            except NoSuchElementException:
                print('Title element not found using XPath')
        else:
            title = f'New {company} Job'

        link = None
        if (linkXpath):
            try:
                link = option.find_element(By.XPATH, linkXpath).get_attribute('href')
            except NoSuchElementException:
                print("Link element not found using XPath.")
        else:
            link = url
        if link or title:
            jobs.append({'title': title, 'link': link})

    return jobs

def applyFilters(filters, driver):
    for filter in filters:
        filterXpath = filter['filterXpath']
        selectValue = filter['selectValue']
        try:
            match filter['type']:
                case 'select':
                    select = Select(driver.find_element(By.XPATH, filterXpath))
                    select.select_by_value(selectValue)
                    time.sleep(5)
        except NoSuchElementException:
            print("Element not found for XPath")
        except InvalidSelectorException:
            print("Invalid Xpath")
    return True

def send_message(conn, cursor, jobs, company, channelId, websiteId):
    if not channelId or not isinstance(channelId, int):
        return None
    
    cursor.execute(''' SELECT value FROM settings WHERE name = 'slackToken' ''')
    slackToken = cursor.fetchone()
    
    if not slackToken:
        return None

    cursor.execute(''' SELECT name FROM channels WHERE id = ? ''', (channelId,))
    channel = cursor.fetchone()
    if not channel:
        cursor.execute(''' UPDATE jobWebsites SET channelId = null WHERE id = ? ''', (websiteId,))

    slack_client = WebClient(token=slackToken[0])
    links = [f"<{job['link']}|{job['title']}>" for job in jobs]
    response = slack_client.chat_postMessage(channel=channel[0], unfurl_links=False, text= "*" + company + " jobs found: * \n\n" + "\n\n".join(links))
        
    return True

scrape_all()