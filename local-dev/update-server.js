// update-server.js
// This script updates the server.js file to integrate notification routes

const fs = require('fs');
const path = require('path');

// Path to server.js file
const serverFilePath = path.join(__dirname, '..', 'backend', 'server.js');

// Read the server.js file
fs.readFile(serverFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading server.js file:', err);
    process.exit(1);
  }

  // Check if notification routes are already added
  if (data.includes('addNotificationRoutes')) {
    console.log('Notification routes already added to server.js');
    process.exit(0);
  }

  // Find where to add the import statement (after other imports)
  const importLines = data.split('\n').filter(line => line.trim().startsWith('const') || line.trim().startsWith('require'));
  const lastImportIndex = data.lastIndexOf(importLines[importLines.length - 1]);
  const lastImportLineEnd = data.indexOf('\n', lastImportIndex) + 1;

  // Find where to add the function call (before app.listen)
  let insertPosition = data.indexOf('app.listen');
  if (insertPosition === -1) {
    // If app.listen not found, try to add it at the end
    insertPosition = data.length;
  }

  // Prepare the content to add
  const importStatement = "const addNotificationRoutes = require('./notification-routes');\n";
  const functionCall = "\n// Initialize notification system\naddNotificationRoutes(app, authenticateJWT, prisma);\n\n";

  // Add the import statement after other imports
  let updatedContent = data.slice(0, lastImportLineEnd) + importStatement + data.slice(lastImportLineEnd);

  // Add the function call before app.listen
  updatedContent = updatedContent.slice(0, updatedContent.indexOf('app.listen')) + functionCall + updatedContent.slice(updatedContent.indexOf('app.listen'));

  // Write the updated content back to the file
  fs.writeFile(serverFilePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to server.js file:', err);
      process.exit(1);
    }
    console.log('Successfully updated server.js with notification routes');
  });
});

