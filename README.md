![Screen Shot 2025-01-21 at 5 40 37 PM](https://github.com/user-attachments/assets/b40d3b55-53fe-4946-83dd-23542f93e096)

# Job Scraper App

## Description

This project is a web scraping application built with React for the frontend and Flask for the backend. It interacts with a SQLite database to manage job listings and provides an API for creating and retrieving postings on job websites.

## Technologies Used

- React
- Flask
- Flask-CORS
- SQLite
- Selenium
- BeautifulSoup
- Axios
- Material UI

## Installation Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd job-scraper
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Set up the backend environment:
   - Create a virtual environment and activate it.
   - Install Flask and other dependencies.

## Usage

To run the application, use the following commands:

- Start the Flask API:
  ```bash
  cd api
  venv/bin/flask run
  ```
- Start the React application:
  ```bash
  npm start
  ```

## Functionality

- Homepage: Display all websites set up for scraping and provide a hub for all other app functionality

   API Routes:
   - **GET /index**: Retrieves all job website scrapers and their associated data.
   - **GET /website/{jobWebsiteId}/run**: Runs a job website scraper
   - **DELETE /website/{jobWebsiteId}**: Delete a job website scraper
  
  ![Screen Shot 2025-01-21 at 5 40 37 PM](https://github.com/user-attachments/assets/b40d3b55-53fe-4946-83dd-23542f93e096)

- Add/Update Website Scraper: Display a form for setting up a new website scraper with a mock webpage and details about each input reactively displayed to the left

  API ROUTES:
  - **POST /website/test**: Tests a website and retrieves job listings.
  - **GET /website/{jobWebsiteId}**: Fetch the job scraper details for the update page

   ![Screen Shot 2025-01-23 at 9 52 24 PM](https://github.com/user-attachments/assets/1f0b8de9-a75a-4459-bc7d-6b462e023ad9)

- Test Website Results: Display the jobs retrieved from testing a new/updated website scraper and allow for the user to save or return to the edit screen

  API ROUTES:
  - **POST /website**: Creates a new job website entry.
  - **PUT /website/{jobWebsiteId}**: Update a job website entry.
  
   ![Screen Shot 2025-01-23 at 10 12 33 PM](https://github.com/user-attachments/assets/a06c6222-f8d8-4c22-acce-a9850e9be16e)

- List Jobs: Display all jobs found by a scraper with a marker indicating new ones
  
   API ROUTES:
   - **GET /links/{jobWebsiteId}**: Fetch a history of all jobs found by a scraper
   - **PUT /links/{jobWebsiteId}**: Set all jobs found by a scraper as viewed

   ![Screen Shot 2025-01-24 at 11 47 59 AM](https://github.com/user-attachments/assets/4266cd4f-6f3e-4d21-8afb-1a5194fd5856)

- Settings: Manage slack integration details

  API ROUTES:
   - **GET /settings**: Retrieves settings.
   - **POST /settings**: Updates settings.
     
   ![Screen Shot 2025-01-22 at 6 48 54 PM](https://github.com/user-attachments/assets/8be743b8-375c-42a2-a625-2da3fe3733fa)


## Database Structure

The application uses a SQLite database (`jobs.db`) with the following tables:

- `jobWebsites`: Stores job website entries.
- `jobWebsiteFilters`: Stores filters for job websites.
- `jobLinks`: Stores job links associated with job websites.
- `settings`: Stores application settings, including Slack integration details.

## Slack Integration

The application integrates with Slack to send notifications about new job links. The Slack token and channels are stored in the `settings` table. When a new job link is created, it is sent to the Slack channel associated with the corresponding website record.

## Planned Enhancements

- Package the application as a desktop app with Electron.js
- Simplify the process of running the scrapers on a schedule
- Suggest inputs for a web scraper if the url matches a recognized pattern
- Attempt to autogenerate a web scraper

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License

This project is licensed under the MIT License.
