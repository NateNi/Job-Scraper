![Screen Shot 2025-01-21 at 5 40 37 PM](https://github.com/user-attachments/assets/b40d3b55-53fe-4946-83dd-23542f93e096)

# Job Scraper App

## Description

This project is a web scraping application built with React for the frontend and Flask for the backend. It interacts with a SQLite database to manage job listings and provides an API for creating and retrieving postings on job websites.

![Screen Shot 2025-01-23 at 9 52 24 PM](https://github.com/user-attachments/assets/1f0b8de9-a75a-4459-bc7d-6b462e023ad9)

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
   cd react-flask-app
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

## API Endpoints

- **POST /website/test**: Tests a website and retrieves job listings.
- **POST /website**: Creates a new job website entry.
- **GET /settings**: Retrieves settings.
- **POST /settings**: Updates settings.
- **GET /index**: Retrieves all job websites and their associated data.

## Database Structure

The application uses a SQLite database (`jobs.db`) with the following tables:

- `jobWebsites`: Stores job website entries.
- `jobWebsiteFilters`: Stores filters for job websites.
- `jobLinks`: Stores job links associated with job websites.
- `settings`: Stores application settings, including Slack integration details.

## Slack Integration

![Screen Shot 2025-01-22 at 6 48 54 PM](https://github.com/user-attachments/assets/8be743b8-375c-42a2-a625-2da3fe3733fa)

The application integrates with Slack to send notifications about new job links. The Slack token and channels are stored in the `settings` table. When a new job link is created, it is sent to the Slack channel associated with the corresponding website record.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License

This project is licensed under the MIT License.
