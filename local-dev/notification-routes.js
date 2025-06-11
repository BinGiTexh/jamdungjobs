const express = require('express');

/**
 * Initialize notification routes with authentication and Prisma client
 * @param {Object} app - Express app instance
 * @param {Function} authenticateJWT - JWT authentication middleware
 * @param {Object} prisma - Prisma client instance
 */
const addNotificationRoutes = (app, authenticateJWT, prisma) => {
  // Get all notifications for a user
  app.get('/api/notifications', authenticateJWT, async (req, res) => {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          recipient_id: req.user.id,
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  });

  // Get unread notification count
  app.get('/api/notifications/count', authenticateJWT, async (req, res) => {
    try {
      const count = await prisma.notification.count({
        where: {
          recipient_id: req.user.id,
          status: 'UNREAD'
        }
      });

      res.json({ count });
    } catch (error) {
      console.error('Error counting notifications:', error);
      res.status(500).json({ message: 'Error counting notifications' });
    }
  });

  // Mark notification as read
  app.patch('/api/notifications/:id', authenticateJWT, async (req, res) => {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: req.params.id,
          recipient_id: req.user.id
        },
        data: {
          status: 'READ'
        }
      });

      res.json(notification);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ message: 'Error updating notification' });
    }
  });

  // Mark all notifications as read
  app.post('/api/notifications/mark-all-read', authenticateJWT, async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: {
          recipient_id: req.user.id,
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
};

module.exports = addNotificationRoutes;

// notification-routes.js
// This file contains a function to integrate notification endpoints into server.js

/**
 * Add notification system routes to the Express app
 * @param {Express.Application} app - The Express application
 * @param {Function} authenticateJWT - JWT authentication middleware
 * @param {PrismaClient} prisma - Prisma client instance
 */
function addNotificationRoutes(app, authenticateJWT, prisma) {
  // Import node-cron for scheduled tasks
  const cron = require('node-cron');

  // Get all notifications for the current user
  app.get('/api/notifications', authenticateJWT, async (req, res) => {
    try {
      const { type, status, limit = 20, offset = 0 } = req.query;
      
      // Build filter
      const filter = {
        recipient_id: req.user.id,
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
          created_at: 'desc'
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
                      logo_url: true
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
          recipient_id: req.user.id

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
          recipient_id: req.user.id,
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
          recipient_id: req.user.id
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
          recipient_id: req.user.id,
          status: 'UNREAD'
        }
      });
      
      res.json({ count });
    } catch (error) {
      console.error('Error counting notifications:', error);
      res.status(500).json({ message: 'Error counting notifications' });
    }
  });

  // Message-related endpoints

  // Get all message threads for current user
  app.get('/api/messages/threads', authenticateJWT, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get all thread IDs the user is part of
      const threadParticipations = await prisma.messageThreadParticipant.findMany({
        where: {
          user_id: userId
        },
        select: {
          thread_id: true
        }
      });
      
      const threadIds = threadParticipations.map(tp => tp.thread_id);
      
      // Get threads with latest message and participants
      const threads = await prisma.messageThread.findMany({
        where: {
          id: {
            in: threadIds
          }
        },
        orderBy: {
          updated_at: 'desc'
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  role: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                      logo_url: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      // Get latest message for each thread
      const threadsWithLatestMessage = await Promise.all(
        threads.map(async thread => {
          const latestMessage = await prisma.message.findFirst({
          where: {
            thread_id: thread.id
          },
          orderBy: {
            created_at: 'desc'
            }
          });
          
          // Count unread messages
          const unreadCount = await prisma.message.count({
            where: {
              thread_id: thread.id,
              sender_id: {
                not: userId
              },
              read_at: null
            }
          });
          
          return {
            ...thread,
            latestMessage,
            unreadCount
          };
        })
      );
      
      res.json(threadsWithLatestMessage);
    } catch (error) {
      console.error('Error fetching message threads:', error);
      res.status(500).json({ message: 'Error fetching message threads' });
    }
  });

  // Get messages for a specific thread
  app.get('/api/messages/threads/:threadId', authenticateJWT, async (req, res) => {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      
      // Check if user is part of thread
      const isParticipant = await prisma.messageThreadParticipant.findFirst({
        where: {
          thread_id: threadId,
          user_id: userId
        }
      });
      
      if (!isParticipant) {
        return res.status(403).json({ message: 'You do not have access to this thread' });
      }
      
      // Get messages
      const messages = await prisma.message.findMany({
        where: {
          thread_id: threadId
        },
        orderBy: {
          created_at: 'asc'
        },
        include: {
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
              company: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      
      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          thread_id: threadId,
          sender_id: {
            not: userId
          },
          read_at: null
        },
        data: {
          read_at: new Date()
        }
      });
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Error fetching messages' });
    }
  });

  // Create a new message thread
  app.post('/api/messages/threads', authenticateJWT, async (req, res) => {
    try {
      const { title, participantIds, initialMessage } = req.body;
      const senderId = req.user.id;
      
      // Ensure sender is included in participants
      const allParticipantIds = [...new Set([...participantIds, senderId])];
      
      // Check if all users exist
      const userCount = await prisma.user.count({
        where: {
          id: {
            in: allParticipantIds
          }
        }
      });
      
      if (userCount !== allParticipantIds.length) {
        return res.status(400).json({ message: 'One or more users do not exist' });
      }
      
      // Create thread and add participants in a transaction
      const result = await prisma.$transaction(async (prisma) => {
        // Create thread
        const thread = await prisma.messageThread.create({
          data: {
            title
          }
        });
        
        // Add participants
        await Promise.all(
          allParticipantIds.map(userId => 
            prisma.messageThreadParticipant.create({
              data: {
                thread_id: thread.id,
                user_id: userId
              }
            })
          )
        );
        
        // Add initial message if provided
        let message = null;
        if (initialMessage) {
          message = await prisma.message.create({
            data: {
              thread_id: thread.id,
              sender_id: senderId,
              content: initialMessage
            }
          });
        }
        
        return { thread, message };
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating message thread:', error);
      res.status(500).json({ message: 'Error creating message thread' });
    }
  });

  // Send a message to an existing thread
  app.post('/api/messages/threads/:threadId', authenticateJWT, async (req, res) => {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const senderId = req.user.id;
      
      // Check if thread exists and user is a participant
      const isParticipant = await prisma.messageThreadParticipant.findFirst({
        where: {
          thread_id: threadId,
          user_id: senderId
        }
      });
      
      if (!isParticipant) {
        return res.status(403).json({ message: 'You do not have access to this thread' });
      }
      
      // Create message
      const message = await prisma.message.create({
        data: {
          thread_id: threadId,
          sender_id: senderId,
          content
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  });

  // Record a profile view
  app.post('/api/profile-views', authenticateJWT, async (req, res) => {
    try {
      const { viewed_user_id } = req.body;
      const viewer_id = req.user.id;
      
      // Don't record if user is viewing their own profile
      if (viewer_id === viewed_user_id) {
        return res.status(400).json({ message: 'Cannot record view of your own profile' });
      }
      
      // Check if viewed user exists
      const viewedUser = await prisma.user.findUnique({
        where: { id: viewed_user_id }
      });
      
      if (!viewedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Record profile view
      const profileView = await prisma.profileView.create({
        data: {
          viewer_id: viewer_id,
          viewed_user_id: viewed_user_id
        }
      });
      
      res.status(201).json(profileView);
    } catch (error) {
      console.error('Error recording profile view:', error);
      res.status(500).json({ message: 'Error recording profile view' });
    }
  });

  // Create a job recommendation notification (admin only)
  app.post('/api/recommendations', authenticateJWT, async (req, res) => {
    try {
      // Only admins or system can create recommendations
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to create recommendations' });
      }
      
      const { userId, jobId, score, reason } = req.body;
      
      // Check if user and job exist
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      
      // Create recommendation
      const recommendation = await prisma.jobRecommendation.create({
        data: {
          user_id: userId,
          job_id: jobId,
          score: parseFloat(score),
          reason
        }
      });
      
      // Create notification
      const notification = await prisma.notification.create({
        data: {
          type: 'JOB_RECOMMENDATION',
          status: 'UNREAD',
          title: 'Job Recommendation',
          message: `We found a job that matches your profile: ${job.title}`,
          recipient_id: userId,
          related_entity_ids: { job_id: job.id, recommendation_id: recommendation.id }
        }
      });
      
      res.status(201).json({ recommendation, notification });
    } catch (error) {
      console.error('Error creating job recommendation:', error);
      res.status(500).json({ message: 'Error creating job recommendation' });
    }
  });

  // Create a scheduled reminder
  app.post('/api/reminders', authenticateJWT, async (req, res) => {
    try {
      const { user_id, type, scheduled_for, content } = req.body;
      
      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: user_id } });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create scheduled reminder
      const reminder = await prisma.scheduledReminder.create({
        data: {
          user_id: user_id,
          type,
          scheduled_for: new Date(scheduled_for),
          content
        }
      });
      
      res.status(201).json(reminder);
    } catch (error) {
      console.error('Error creating scheduled reminder:', error);
      res.status(500).json({ message: 'Error creating scheduled reminder' });
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
          scheduled_for: {
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
          title: `Reminder: ${reminder.type}`,
          message: reminder.content.message || 'You have a reminder',
          recipient_id: reminder.user_id,
            related_entity_ids: reminder.content.related_entity_ids || {},
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
        console.log(`Processed ${dueReminders.length} reminders`);
      }
    } catch (error) {
      console.error('Error processing reminders:', error);
    }
  });

  // Set up weekly job recommendation generation (runs every Monday at midnight)
  cron.schedule('0 0 * * 1', async () => {
    try {
      console.log('Generating job recommendations...');
      
      // Get all active job seekers
      const jobSeekers = await prisma.user.findMany({
        where: {
          role: 'JOBSEEKER'
        },
        include: {
          candidateProfile: true
        }
      });
      
      // Get all active jobs
      const activeJobs = await prisma.job.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          company: true
        }
      });
      
      // For each job seeker, find matching jobs
      for (const jobSeeker of jobSeekers) {
        // Skip users without profiles
        if (!jobSeeker.candidateProfile) continue;
        
        // Get user's skills
        const userSkills = jobSeeker.candidateProfile.skills || [];
        
        // Find matching jobs based on skills
        const matchingJobs = activeJobs.filter(job => {
          const jobSkills = job.skills || [];
          // Calculate skill match score (simplified)
          const matchingSkills = userSkills.filter(skill => 
            jobSkills.includes(skill)
          );
          return matchingSkills.length > 0;
        });
        
        // Take top 3 matching jobs
        const topJobs = matchingJobs.slice(0, 3);
        
        // Create recommendations and notifications
        for (const job of topJobs) {
          // Check if recommendation already exists
          const existingRecommendation = await prisma.jobRecommendation.findFirst({
            where: {
              user_id: jobSeeker.id,
              job_id: job.id
            }
          });
          
          if (!existingRecommendation) {
            // Create recommendation
            const recommendation = await prisma.jobRecommendation.create({
              data: {
                user_id: jobSeeker.id,
                job_id: job.id,
                score: 0.8, // Simplified scoring
                reason: 'Skills match'
              }
            });
            
            // Create notification
            await prisma.notification.create({
              data: {
            type: 'JOB_RECOMMENDATION',
            status: 'UNREAD',
            title: 'Job Recommendation',
            message: `We found a job that matches your profile: ${job.title} at ${job.company.name}`,
            recipient_id: jobSeeker.id,
                related_entity_ids: { job_id: job.id, recommendation_id: recommendation.id }
              }
            });
          }
        }
      }
      
      console.log('Job recommendations generated');
    } catch (error) {
      console.error('Error generating job recommendations:', error);
    }
  });

  console.log('Notification system routes added successfully');
}

module.exports = addNotificationRoutes;

