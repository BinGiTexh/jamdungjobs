// analytics.js - Simple tracking script to include in your website

// Configuration
const ANALYTICS_ENDPOINT = 'https://api.yourdomain.com/analytics';

// Initialize tracking
document.addEventListener('DOMContentLoaded', function() {
  initializeAnalytics();
});

function initializeAnalytics() {
  // Track page views
  trackPageView();
  
  // Track clicks on important elements
  trackElementClicks('job-apply-btn', 'apply');
  trackElementClicks('job-listing', 'view_job');
  trackElementClicks('employer-contact', 'contact_employer');
  
  // Track form submissions
  trackForms();
}

function trackPageView() {
  const data = {
    type: 'pageview',
    page: window.location.pathname,
    referrer: document.referrer,
    title: document.title,
    timestamp: Date.now(),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    userAgent: navigator.userAgent
  };
  
  sendAnalyticsData(data);
}

function trackElementClicks(className, eventName) {
  const elements = document.getElementsByClassName(className);
  
  for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', function(e) {
      const data = {
        type: 'event',
        event: eventName,
        page: window.location.pathname,
        element: e.target.outerHTML.substring(0, 100),
        elementId: e.target.id || null,
        timestamp: Date.now()
      };
      
      sendAnalyticsData(data);
    });
  }
}

function trackForms() {
  const forms = document.getElementsByTagName('form');
  
  for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function(e) {
      const data = {
        type: 'form_submission',
        formId: e.target.id || 'unknown_form',
        page: window.location.pathname,
        timestamp: Date.now()
      };
      
      sendAnalyticsData(data);
    });
  }
}

function sendAnalyticsData(data) {
  // Add session ID if it exists or create one
  const sessionId = getOrCreateSessionId();
  data.sessionId = sessionId;
  
  // Add user ID if available (for logged in users)
  const userId = getUserId();
  if (userId) {
    data.userId = userId;
  }
  
  // Send data to analytics API
  fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    // Use keepalive to ensure the request completes even on page unload
    keepalive: true
  }).catch(err => {
    console.error('Analytics error:', err);
  });
}

function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
}

function getUserId() {
  // This function should be customized based on how you store logged-in user info
  // Example: return from localStorage or a cookie
  return localStorage.getItem('user_id');
}

// -----------------------------------------------------------------
// Lambda function to handle analytics requests - save this as index.js
// -----------------------------------------------------------------

// AWS Lambda function for processing analytics data
exports.handler = async (event) => {
  const AWS = require('aws-sdk');
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  
  try {
    let body;
    
    // Parse the incoming data
    if (event.body) {
      body = JSON.parse(event.body);
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing request body' })
      };
    }
    
    // Generate a unique ID for the event
    const id = body.sessionId || 'anonymous';
    const timestamp = body.timestamp || Date.now();
    
    // Store the event in DynamoDB
    const params = {
      TableName: process.env.ANALYTICS_TABLE,
      Item: {
        id: id,
        timestamp: timestamp,
        page: body.page || '/',
        type: body.type || 'pageview',
        data: body,
        ip: event.requestContext?.identity?.sourceIp || 'unknown'
      }
    };
    
    await dynamoDB.put(params).promise();
    
    // Enable CORS
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ status: 'success' })
    };
    
  } catch (error) {
    console.error('Error processing analytics:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to process analytics data' })
    };
  }
};

// -----------------------------------------------------------------
// A simple dashboard viewer - basic version to get you started
// -----------------------------------------------------------------

// Lambda function for analytics dashboard API
exports.dashboardHandler = async (event) => {
  const AWS = require('aws-sdk');
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  
  try {
    // Get time range from query parameters or use defaults
    const queryParams = event.queryStringParameters || {};
    const startTime = parseInt(queryParams.start) || Date.now() - (24 * 60 * 60 * 1000); // Default to last 24 hours
    const endTime = parseInt(queryParams.end) || Date.now();
    
    // Get page views count
    const pageViewsParams = {
      TableName: process.env.ANALYTICS_TABLE,
      IndexName: 'TypeIndex',
      KeyConditionExpression: '#type = :type AND #timestamp BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#type': 'type',
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':type': 'pageview',
        ':start': startTime,
        ':end': endTime
      }
    };
    
    const pageViewsResult = await dynamoDB.query(pageViewsParams).promise();
    
    // Get top pages
    const pageData = {};
    pageViewsResult.Items.forEach(item => {
      const page = item.page || '/';
      if (!pageData[page]) {
        pageData[page] = 0;
      }
      pageData[page]++;
    });
    
    const topPages = Object.entries(pageData)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Get unique visitors (by sessionId)
    const uniqueVisitors = new Set();
    pageViewsResult.Items.forEach(item => {
      if (item.data && item.data.sessionId) {
        uniqueVisitors.add(item.data.sessionId);
      }
    });
    
    // Return dashboard data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        totalPageViews: pageViewsResult.Items.length,
        uniqueVisitors: uniqueVisitors.size,
        topPages: topPages,
        timeRange: {
          start: startTime,
          end: endTime
        }
      })
    };
    
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to generate dashboard data' })
    };
  }
};
