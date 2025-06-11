# JamDung Jobs Scraper Service - Quick Start Guide

This guide will help you quickly set up and run the JamDung Jobs scraper service with all the Jamaica-specific enhancements.

## Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose
- Access to the main JamDung Jobs platform API

## Setup Steps

1. **Run the setup script**

   ```bash
   ./setup.sh
   ```

   This script creates necessary directories and copies the `.env.example` file to `.env`.

2. **Configure your environment**

   Edit the `.env` file and set your JamDung Jobs API token and other configuration options:

   ```bash
   nano .env
   ```

   The most important settings to configure are:
   - `JAMDUNG_API_URL`: URL of the main JamDung Jobs backend API
   - `JAMDUNG_API_TOKEN`: Your admin API token for authentication
   - `SCRAPE_INTERVAL`: Cron schedule for automatic scraping

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Test the scrapers**

   Run the test script to verify that the scrapers are working correctly:

   ```bash
   node test-scraper.js
   ```

   This will:
   - Run each scraper individually
   - Apply Jamaica-specific enhancements to job data
   - Validate jobs against quality criteria
   - Save results to the `data` directory

5. **Build and start the Docker containers**

   ```bash
   docker-compose up -d
   ```

   This starts:
   - The scraper service on port 3500
   - A PostgreSQL database for storing scraped jobs

## Using the Scraper Service

### API Endpoints

- `GET /api/stats`: View scraping statistics
- `GET /api/validation-stats`: View job validation statistics
- `POST /api/scrape`: Trigger a scrape of all job sources
- `POST /api/scrape/:source`: Trigger a scrape of a specific source (linkedin, caribbeanjobs, or ejamjobs)

### Viewing Scraped Jobs

1. Access the scraper API at `http://localhost:3500`
2. Check the stats endpoint at `http://localhost:3500/api/stats`
3. View scraped jobs in the main JamDung Jobs platform after synchronization

### Monitoring

- Logs are stored in the `logs` directory
- Docker logs can be viewed with `docker-compose logs -f scraper`

## Jamaica-Specific Features

The scraper service includes several Jamaica-specific enhancements:

1. **Location Normalization**: Standardizes Jamaican location names
2. **Industry Categorization**: Categorizes jobs into Jamaican industries
3. **Skill Extraction**: Identifies in-demand skills in the Jamaican job market
4. **Salary Estimation**: Provides salary estimates based on Jamaican market data
5. **Spam Detection**: Filters out non-Jamaican or spam job listings

## Troubleshooting

- If the scraper fails to connect to the database, check your `DATABASE_URL` in the `.env` file
- If synchronization fails, verify your `JAMDUNG_API_TOKEN` is valid and has admin permissions
- For scraper-specific issues, check the logs in the `logs` directory

For more detailed information, refer to the full `README.md` file.
