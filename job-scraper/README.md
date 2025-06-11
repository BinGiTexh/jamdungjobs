# JamDung Jobs - Job Scraper Service

A dedicated service for scraping job listings from popular Jamaican job sites and importing them into the JamDung Jobs platform.

## Overview

This service runs as a separate Docker container that:
1. Scrapes job listings from LinkedIn, CaribbeanJobs, and EJamJobs
2. Validates and enhances job data with Jamaica-specific information
3. Stores the scraped data in a PostgreSQL database
4. Synchronizes validated jobs to the main JamDung Jobs platform via API
5. Runs on a configurable schedule (default: every 6 hours)

## Features

- **Multi-source scraping**: Collects job data from multiple Jamaican and international job sites
- **Data validation**: Ensures job listings meet quality standards before import
- **Jamaica-specific enhancements**: Adds location normalization, industry categorization, and skill extraction
- **Data normalization**: Converts varied job formats into a consistent structure
- **Deduplication**: Prevents duplicate job listings across multiple sources
- **API endpoints**: Manual control over scraping, validation, and synchronization processes
- **Scheduled operation**: Automatic scraping on a configurable schedule
- **Detailed logging**: Comprehensive logging of all operations
- **JamDung Jobs integration**: Seamless synchronization with the main platform

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development only)
- Access to the JamDung Jobs API

### Setup

1. Copy the example environment file:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file to add your JamDung Jobs API token:
   ```
   JAMDUNG_API_TOKEN=your_admin_token_here
   ```

3. Build and start the containers:
   ```
   docker-compose up -d
   ```

### Testing

To test the scrapers without Docker:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the test script:
   ```
   node test-scraper.js
   ```

This will run each scraper individually and save the results to JSON files in the `data` directory.

## API Endpoints

- `GET /` - Check if the service is running
- `POST /api/scrape` - Trigger a manual scrape of all job sites
- `POST /api/scrape/:source` - Trigger a manual scrape of a specific job site (linkedin, caribbeanjobs, or ejamjobs)
- `GET /api/stats` - Get statistics about the most recent scrape and job counts
- `GET /api/validation` - Get validation statistics for recently scraped jobs

## Importing Jobs to JamDung Jobs

Jobs are synchronized to the main JamDung Jobs platform in two ways:

1. **Automatic synchronization**: Jobs are automatically validated and synchronized after each scrape
2. **Manual synchronization**: Use the API endpoints to trigger a manual scrape and synchronization

The synchronization process includes:

1. **Validation**: Jobs are validated for quality and completeness
2. **Company creation**: Companies are created if they don't exist in the JamDung Jobs database
3. **Job creation**: Validated jobs are created with proper attribution to the source
4. **Jamaica-specific enhancements**: Jobs are enhanced with:
   - Normalized Jamaican locations
   - Industry categorization based on job content
   - Extracted skills relevant to the Jamaican job market
   - Salary estimates when not provided

Synchronized jobs will appear in the JamDung Jobs platform with appropriate source attribution and enhanced metadata.

## Customization

### Adding New Job Sources

To add a new job source:

1. Create a new scraper module in `src/scrapers/`
2. Follow the pattern of existing scrapers
3. Add the new scraper to `src/index.js`
4. Update the validation logic in `validateJobs.js` if needed
5. Add any source-specific enhancements to `jamaicaJobUtils.js`

### Modifying Scraping Schedule

Edit the `SCRAPE_INTERVAL` environment variable in the `.env` file using cron syntax.

## Troubleshooting

Common issues:

- **Connection errors**: Check network connectivity to job sites
- **Database errors**: Verify PostgreSQL connection settings
- **API token issues**: Ensure your JamDung Jobs API token is valid

Check the logs in `data/logs/` for detailed error information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
