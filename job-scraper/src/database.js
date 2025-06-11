import pg from 'pg';
import { logger } from './utils/logger.js';

const { Pool } = pg;

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://jobboard:jobboard@postgres:5432/jobboard'
});

// Function to set up the database connection and create tables if needed
export async function setupDatabase() {
  try {
    // Test the connection
    const client = await pool.connect();
    logger.info('Connected to PostgreSQL database');
    
    // Create the scraped_jobs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraped_jobs (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(255) UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        company_name VARCHAR(255),
        location VARCHAR(255),
        job_type VARCHAR(50),
        salary_min DECIMAL,
        salary_max DECIMAL,
        salary_currency VARCHAR(10),
        skills TEXT[],
        experience VARCHAR(255),
        education VARCHAR(255),
        url VARCHAR(512),
        source VARCHAR(50) NOT NULL,
        imported BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create an index on external_id for faster lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_scraped_jobs_external_id ON scraped_jobs(external_id);
    `);
    
    // Create an index on source for faster filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_scraped_jobs_source ON scraped_jobs(source);
    `);
    
    // Create a table to track scraping runs
    await client.query(`
      CREATE TABLE IF NOT EXISTS scrape_runs (
        id SERIAL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        jobs_found INTEGER DEFAULT 0,
        jobs_imported INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'running',
        error TEXT
      )
    `);
    
    client.release();
    logger.info('Database setup completed');
  } catch (error) {
    logger.error('Error setting up database:', error);
    throw error;
  }
}

// Function to execute database queries
export async function query(text, params) {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query: ${text} - Duration: ${duration}ms - Rows: ${result.rowCount}`);
    return result;
  } catch (error) {
    logger.error('Error executing query:', error);
    throw error;
  }
}

// Function to close the database connection pool
export async function closePool() {
  await pool.end();
  logger.info('Database connection pool closed');
}
