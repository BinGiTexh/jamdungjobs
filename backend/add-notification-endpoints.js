// add-notification-endpoints.js
// This script adds notification endpoints directly to server.js

const fs = require('fs');
const path = require('path');

// Path to server.js file
const serverFilePath = path.join(__dirname, '..', 'backend', 'server.js');

// The notification endpoints to add
const notificationEndpoints = `
// Notification System - Start
// Import node-cron for scheduled tasks
const cron = require('node-cron');

// Get all notifications for the current user
app.get('/api/notifications', authenticateJWT, async (req, res) => {
  try {
    const { type, status, limit = 20, offset = 0 } = req.query;
    
    // Build filter
    const filter = {
      recipientId: req.user.id,
      ...(type && { type: type }),
      ...(status === 'unread' && { status: 'UNREAD' }),
      ...(status === 'read' && { status: 'READ' }),
      ...(status === 'undismissed' && { dismissed: false })
    };
    
    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: filter
    });
    
    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(offset),
      take: parseInt(limit),
      include: {
        jobApplication: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    res.json({
      data: notifications,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark a notification as read
app.patch('/api/notifications/:id/mark-read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update notification status
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status: 'READ' }
    });
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read
app.patch('/api/notifications/mark-all-read', authenticateJWT, async (req, res) => {
  try {
    // Update all unread notifications for user
    await prisma.notification.updateMany({
      where: {
        recipientId: req.user.id,
        status: 'UNREAD'
      },
      data: {
        status: 'READ'
      }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Mark a notification as dismissed
app.patch('/api/notifications/:id/dismiss', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        recipientId: req.user.id
      }
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { dismissed: true }
    });
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Get unread notification count
app.get('/api/notifications/count', authenticateJWT, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: req.user.id,
        status: 'UNREAD'
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ message: 'Error counting notifications' });
  }
});

// Record a profile view
app.post('/api/profile-views', authenticateJWT, async (req, res) => {
  try {
    const { viewedUserId } = req.body;
    const viewerId = req.user.id;
    
    // Don't record if user is viewing their own profile
    if (viewerId === viewedUserId) {
      return res.status(400).json({ message: 'Cannot record view of your own profile' });
    }
    
    // Check if viewed user exists
    const viewedUser = await prisma.user.findUnique({
      where: { id: viewedUserId }
    });
    
    if (!viewedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Record profile view
    const profileView = await prisma.profileView.create({
      data: {
        viewerId,
        viewedUserId
      }
    });
    
    res.json(profileView);
  } catch (error) {
    console.error('Error recording profile view:', error);
    res.status(500).json({ message: 'Error recording profile view' });
  }
});

// Set up scheduled tasks for processing reminders
cron.schedule('* * * * *', async () => {
  try {
    console.log('Checking for due reminders...');
    
    // Find all unprocessed reminders that are due
    const dueReminders = await prisma.scheduledReminder.findMany({
      where: {
        processed: false,
        scheduledFor: {
          lte: new Date()
        }
      }
    });
    
    // Process each reminder
    for (const reminder of dueReminders) {
      // Create a notification for this reminder
      await prisma.notification.create({
        data: {
          type: 'REMINDER',
          status: 'UNREAD',
          title: \`Reminder: \${reminder.type}\`,
          message: reminder.content.message || 'You have a reminder',
          recipientId: reminder.userId,
          relatedEntityIds: reminder.content.relatedEntityIds || {},
          metadata: reminder.content
        }
      });
      
      // Mark reminder as processed
      await prisma.scheduledReminder.update({
        where: { id: reminder.id },
        data: { processed: true }
      });
    }
    
    if (dueReminders.length > 0) {
      console.log(\`Processed \${dueReminders.length} reminders\`);
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
});

// Notification System - End
`;

// Read the server.js file
fs.readFile(serverFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading server.js file:', err);
    process.exit(1);
  }

  // Check if notification endpoints are already added
  if (data.includes('Notification System - Start')) {
    console.log('Notification endpoints already added to server.js');
    process.exit(0);
  }

  // Find where to add the notification endpoints (just before app.listen)
  let insertPosition = data.indexOf('app.listen');
  if (insertPosition === -1) {
    // If app.listen not found, try to add it at the end
    insertPosition = data.length;
  }

  // Insert the notification endpoints before app.listen
  const updatedContent = data.slice(0, insertPosition) + notificationEndpoints + data.slice(insertPosition);

  // Write the updated content back to the file
  fs.writeFile(serverFilePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to server.js file:', err);
      process.exit(1);
    }
    console.log('Successfully added notification endpoints to server.js');
  });
});

