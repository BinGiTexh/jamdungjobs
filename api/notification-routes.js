const cron = require('node-cron');

function addNotificationRoutes(app, authenticateJWT, prisma) {
  // Get all notifications for the authenticated user
  app.get('/api/notifications', authenticateJWT, async (req, res) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          recipientId: req.user.id,
          read: false,
        },
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          read: true,
          recipientId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ notifications, totalCount: notifications.length });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/count', authenticateJWT, async (req, res) => {
    try {
      const count = await prisma.notification.count({
        where: {
          recipientId: req.user.id,
          read: false,
        },
      });

      res.json({ count });
    } catch (error) {
      console.error('Error counting notifications:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id', authenticateJWT, async (req, res) => {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: req.params.id,
          recipientId: req.user.id,
        },
        data: {
          read: true,
        },
      });

      res.json({ notification });
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mark all notifications as read
  app.patch('/api/notifications', authenticateJWT, async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: {
          recipientId: req.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new notification (internal use only)
  async function createNotification(recipientId, type, title, message) {
    try {
      return await prisma.notification.create({
        data: {
          recipientId,
          type,
          title,
          message,
          read: false,
        },
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Setup scheduled tasks
  // Send job recommendations weekly
  cron.schedule('0 9 * * 1', async () => {
    try {
      // Get all job seekers
      const jobSeekers = await prisma.user.findMany({
        where: { role: 'JOBSEEKER' },
        include: { profile: true },
      });

      for (const user of jobSeekers) {
        if (!user.profile?.skills?.length) continue;

        // Find matching jobs based on skills
        const matchingJobs = await prisma.job.findMany({
          where: {
            skills: {
              hasSome: user.profile.skills,
            },
            status: 'ACTIVE',
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        });

        if (matchingJobs.length > 0) {
          await createNotification(
            user.id,
            'JOB_RECOMMENDATION',
            'New Job Recommendations',
            `We found ${matchingJobs.length} jobs matching your skills!`
          );
        }
      }
    } catch (error) {
      console.error('Error in job recommendation cron:', error);
    }
  });
}

module.exports = addNotificationRoutes;

