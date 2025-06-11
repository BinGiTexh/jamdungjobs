const fs = require('fs');

// Read the current server.js
const serverContent = fs.readFileSync('server.js', 'utf8');

// Remove duplicate notification route definitions
const updatedContent = serverContent
  // Remove individual notification routes
  .replace(/\/\/ Get all notifications for the current user[\s\S]*?app\.get\('\/api\/notifications'[\s\S]*?}\);/g, '')
  .replace(/\/\/ Mark a notification as read[\s\S]*?app\.patch\('\/api\/notifications\/:id\/mark-read'[\s\S]*?}\);/g, '')
  .replace(/\/\/ Mark all notifications as read[\s\S]*?app\.patch\('\/api\/notifications\/mark-all-read'[\s\S]*?}\);/g, '')
  .replace(/\/\/ Mark a notification as dismissed[\s\S]*?app\.patch\('\/api\/notifications\/:id\/dismiss'[\s\S]*?}\);/g, '')
  .replace(/\/\/ Get unread notification count[\s\S]*?app\.get\('\/api\/notifications\/count'[\s\S]*?}\);/g, '')
  // Remove duplicate initialization
  .replace(/\/\/ Initialize notification system[\s\S]*?addNotificationRoutes\(app, authenticateJWT, prisma\);/, '')
  // Ensure we have the proper import at the top
  .replace(/const express = require\('express'\);/, "const express = require('express');\nconst notificationRoutes = require('./notification-endpoints');")
  // Add the proper route mounting before app.listen
  .replace(/app\.listen\(PORT,/, "// Mount notification routes\napp.use('/api/notifications', notificationRoutes);\n\napp.listen(PORT,");

// Write the updated content back to server.js
fs.writeFileSync('server.js', updatedContent);
console.log('Successfully updated server.js notification routes');
