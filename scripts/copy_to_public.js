const fs = require('fs');
const path = require('path');

// Create public/scripts directory if it doesn't exist
const publicScriptsDir = path.resolve(__dirname, '../web-frontend/public/scripts');
if (!fs.existsSync(publicScriptsDir)) {
  fs.mkdirSync(publicScriptsDir, { recursive: true });
  console.log(`Created directory: ${publicScriptsDir}`);
}

// Copy the base64 files to the public directory
try {
  const photoBase64 = fs.readFileSync(path.resolve(__dirname, 'photo_base64.txt'));
  fs.writeFileSync(path.resolve(publicScriptsDir, 'photo_base64.txt'), photoBase64);
  console.log('Copied photo_base64.txt to public/scripts directory');
  
  // Also copy the HTML helper
  const helperHtml = fs.readFileSync(path.resolve(__dirname, 'load_demo_files.html'));
  fs.writeFileSync(path.resolve(publicScriptsDir, 'load_demo_files.html'), helperHtml);
  console.log('Copied load_demo_files.html to public/scripts directory');
  
  console.log('Files copied successfully. You can now access:');
  console.log('- http://localhost:3000/scripts/load_demo_files.html');
} catch (error) {
  console.error('Error copying files:', error.message);
}
