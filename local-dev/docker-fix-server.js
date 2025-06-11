#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to server.js file in Docker container
const serverFilePath = './server.js';

// Function to fix the server.js file
async function fixServerFile() {
  try {
    console.log('Reading server.js file...');
    
    // Read the server.js file
    const data = await fs.promises.readFile(serverFilePath, 'utf8');
    
    // Remove existing notification routes lines
    let updatedContent = data
      .split('\n')
      .filter(line => {
        const trimmedLine = line.trim();
        return !(
          trimmedLine.includes('addNotificationRoutes(app, authenticateJWT, prisma)') ||
          trimmedLine.includes('const addNotificationRoutes = require(\'./notification-routes\')')
        );
      })
      .join('\n');
    
    // Find the position to add the import (after other require statements)
    const lastRequireIndex = updatedContent.lastIndexOf('require(');
    const importEndIndex = updatedContent.indexOf('\n', lastRequireIndex);
    
    if (lastRequireIndex === -1) {
      throw new Error('Could not find a proper location to add the import statement');
    }
    
    const importLine = "\nconst addNotificationRoutes = require('./notification-routes');";
    updatedContent = 
      updatedContent.substring(0, importEndIndex + 1) + 
      importLine + 
      updatedContent.substring(importEndIndex + 1);
    
    // Find the position to add the function call (before app.listen)
    const appListenIndex = updatedContent.lastIndexOf('app.listen(');
    
    if (appListenIndex === -1) {
      throw new Error('Could not find app.listen() to add the function call');
    }
    
    // Find the beginning of the line with app.listen
    const lineStartIndex = updatedContent.lastIndexOf('\n', appListenIndex);
    
    const functionCallLine = "\n// Add notification routes\naddNotificationRoutes(app, authenticateJWT, prisma);\n";
    updatedContent = 
      updatedContent.substring(0, lineStartIndex) + 
      functionCallLine + 
      updatedContent.substring(lineStartIndex);
    
    // Write the updated content back to the file
    console.log('Writing updated content to server.js...');
    await fs.promises.writeFile(serverFilePath, updatedContent, 'utf8');
    
    console.log('Successfully updated server.js with notification routes');
  } catch (error) {
    console.error('Error fixing server.js file:', error.message);
    process.exit(1);
  }
}

// Execute the function
fixServerFile();

