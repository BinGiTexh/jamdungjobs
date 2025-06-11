const fs = require('fs');

function fixServerFile() {
  try {
    let content = fs.readFileSync('server.js', 'utf8');
    
    // Step 1: Fix imports at the top
    const importStatements = `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const addNotificationRoutes = require('./notification-routes');
`;
    
    // Remove existing imports and replace with cleaned version
    content = content.replace(/^const.*require.*\n/gm, '');
    content = importStatements + content;
    
    // Step 2: Remove duplicate notification endpoints
    // Remove any existing notification route implementations
    content = content.replace(/\/\/ Notification routes[\s\S]*?}\);/g, '');
    content = content.replace(/\/\/ Get unread notification count[\s\S]*?}\);/g, '');
    
    // Step 3: Fix the jobs update endpoint by removing misplaced import
    content = content.replace(/location: updatedJob\.location,\s*const addNotificationRoutes = require\('\.\/notification-routes'\);/g, 
      'location: updatedJob.location,');
    
    // Step 4: Remove duplicate server initialization
    // Keep only the last app.listen() call
    const listenCalls = content.match(/app\.listen\(.*\);/g) || [];
    if (listenCalls.length > 1) {
      // Remove all but the last app.listen
      for (let i = 0; i < listenCalls.length - 1; i++) {
        content = content.replace(listenCalls[i], '');
      }
    }
    
    // Step 5: Add notification routes initialization before the last app.listen
    const lastListen = content.lastIndexOf('app.listen');
    if (lastListen !== -1) {
      const initNotifications = '\n// Initialize notification routes\naddNotificationRoutes(app, authenticateJWT, prisma);\n\n';
      content = content.slice(0, lastListen) + initNotifications + content.slice(lastListen);
    }
    
    // Write the fixed content back to server.js
    fs.writeFileSync('server.js', content, 'utf8');
    console.log('Successfully fixed server.js');
    
  } catch (error) {
    console.error('Error fixing server.js:', error);
    process.exit(1);
  }
}

fixServerFile();

