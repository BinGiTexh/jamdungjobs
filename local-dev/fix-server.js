const fs = require('fs');
const path = require('path');

// File paths
const sourceFilePath = path.join(__dirname, '../backend/server.js');
const targetFilePath = path.join(__dirname, 'server-fixed.js');

// Read the server.js file
fs.readFile(sourceFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err.message}`);
    return;
  }

  console.log('Successfully read server.js');

  // Split the file into lines for easier manipulation
  let lines = data.split('\n');

  // Remove the problematic lines (using a filter to keep all lines except the ones we want to remove)
  lines = lines.filter((line, index) => {
    // Line numbers are 1-based, but array indices are 0-based
    return index !== 2259 && // Remove line 2260
           index !== 2744;   // Remove line 2745
  });

  // Find the last import statement to add our import right after it
  let lastImportIndex = -1;
  for (let i = 0; i < 50; i++) { // Look at the first 50 lines for imports
    if (lines[i] && (lines[i].includes('require(') || lines[i].includes('import '))) {
      lastImportIndex = i;
    }
  }

  // Add the new import statement after the last import
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, "const addNotificationRoutes = require('./notification-routes');");
    console.log(`Added import statement after line ${lastImportIndex + 1}`);
  } else {
    console.warn('Could not find a suitable place for the import statement');
    // Add at line 13 as a fallback
    lines.splice(12, 0, "const addNotificationRoutes = require('./notification-routes');");
    console.log('Added import statement at line 13 as fallback');
  }

  // Find the app.listen call in the startServer function to add our function call before it
  let appListenIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].includes('app.listen(') && lines[i].includes('port')) {
      appListenIndex = i;
      break;
    }
  }

  // Add the function call before app.listen
  if (appListenIndex !== -1) {
    lines.splice(appListenIndex, 0, 
      '  // Initialize notification system',
      '  addNotificationRoutes(app, authenticateJWT, prisma);'
    );
    console.log(`Added function call before app.listen at line ${appListenIndex}`);
  } else {
    console.warn('Could not find app.listen in the startServer function');
    // Add at line 2508 as a fallback
    lines.splice(2507, 0, 
      '  // Initialize notification system',
      '  addNotificationRoutes(app, authenticateJWT, prisma);'
    );
    console.log('Added function call at line 2508 as fallback');
  }

  // Join the lines back together
  const modifiedContent = lines.join('\n');

  // Write the modified content to the new file
  fs.writeFile(targetFilePath, modifiedContent, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err.message}`);
      return;
    }
    console.log(`Successfully created ${targetFilePath}`);
  });
});

console.log('Running fix-server.js script...');

