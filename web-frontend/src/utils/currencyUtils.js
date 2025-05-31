// Currency conversion utilities
import axios from 'axios';
import { logDev, logError } from './loggingUtils';

// Default exchange rate if API fails (approximately 155 JMD to 1 USD as of 2025)
const DEFAULT_JMD_RATE = 155;

// Cache the exchange rate and last fetch time
let cachedRate = null;
let lastFetchTime = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetches the current USD to JMD exchange rate
 * Uses a public API and falls back to a default rate if the API fails
 */
export const getUSDtoJMDRate = async () => {
  // Return cached rate if it's still valid
  if (cachedRate && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedRate;
  }
  
  try {
    // Use ExchangeRate-API or similar service (replace with actual API endpoint)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.data && response.data.rates && response.data.rates.JMD) {
      cachedRate = response.data.rates.JMD;
      lastFetchTime = Date.now();
      return cachedRate;
    }
    throw new Error('Invalid response from exchange rate API');
  } catch (error) {
    logError('Failed to fetch exchange rate', error, {
      module: 'currencyUtils',
      function: 'getUSDtoJMDRate',
      defaultRate: DEFAULT_JMD_RATE
    });
    
    // Log development details about fallback behavior
    logDev('warn', `Using fallback exchange rate of ${DEFAULT_JMD_RATE} JMD to 1 USD`);
    
    // Return default rate if API fails
    return DEFAULT_JMD_RATE;
  }
};

/**
 * Converts USD to JMD
 * @param {number} usdAmount - Amount in USD
 * @param {number} rate - Exchange rate (optional, will fetch if not provided)
 * @returns {Promise<number>} - Amount in JMD
 */
export const convertUSDtoJMD = async (usdAmount, rate = null) => {
  const exchangeRate = rate || await getUSDtoJMDRate();
  return usdAmount * exchangeRate;
};

/**
 * Formats a salary range in both USD and JMD
 * @param {Object} salary - Salary object with min and max in USD
 * @param {number} rate - Exchange rate (optional)
 * @returns {Promise<Object>} - Formatted salary strings and rate info
 */
export const formatSalaryWithJMD = async (salary, rate = null) => {
  if (!salary || typeof salary !== 'object') {
    logDev('warn', 'Invalid salary object provided to formatSalaryWithJMD', { salary });
    return { usd: 'Salary not specified', jmd: '', rate: 0 };
  }
  
  const exchangeRate = rate || await getUSDtoJMDRate();
  
  const minJMD = Math.round(salary.min * exchangeRate);
  const maxJMD = Math.round(salary.max * exchangeRate);
  
  return {
    usd: `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} USD`,
    jmd: `J$${minJMD.toLocaleString()} - J$${maxJMD.toLocaleString()} JMD`,
    rate: exchangeRate
  };
};
