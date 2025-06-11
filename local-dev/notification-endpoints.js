// notification-endpoints.js
// This file contains endpoints for the notification system

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Authentication middleware (should match your existing auth middleware)
const authenticateJWT = (req, res, next) => {
  // Your authentication logic here
  // This should be replaced with your actual authentication middleware
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Get all notifications for the current user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { type, status, limit = 20, offset = 0, includeRead = false } = req.query;
    
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
router.patch('/:id/mark-read', authenticateJWT, async (req, res) => {
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
router.patch('/mark-all-read', authenticateJWT, async (req, res) => {
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
router.patch('/:id/dismiss', authenticateJWT, async (req, res) => {
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
router.get('/count', authenticateJWT, async (req, res) => {
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

// Message-related endpoints

// Get all message threads for current user
router.get('/messages/threads', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all thread IDs the user is part of
    const threadParticipations = await prisma.messageThreadParticipant.findMany({
      where: {
        userId
      },
      select: {
        threadId: true
      }
    });
    
    const threadIds = threadParticipations.map(tp => tp.threadId);
    
    // Get threads with latest message and participants
    const threads = await prisma.messageThread.findMany({
      where: {
        id: {
          in: threadIds
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
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
    
    // Get latest message for each thread
    const threadsWithLatestMessage = await Promise.all(
      threads.map(async thread => {
        const latestMessage = await prisma.message.findFirst({
          where: {
            threadId: thread.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            threadId: thread.id,
            senderId: {
              not: userId
            },
            readAt: null
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
router.get('/messages/threads/:threadId', authenticateJWT, async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id;
    
    // Check if user is part of thread
    const isParticipant = await prisma.messageThreadParticipant.findFirst({
      where: {
        threadId,
        userId
      }
    });
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You do not have access to this thread' });
    }
    
    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        threadId
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        threadId,
        senderId: {
          not: userId
        },
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Create a new message thread
router.post('/messages/threads', authenticateJWT, async (req, res) => {
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
              threadId: thread.id,
              userId
            }
          })
        )
      );
      
      // Add initial message if provided
      let message = null;
      if (initialMessage) {
        message = await prisma.message.create({
          data: {
            threadId: thread.id,
            senderId,
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
router.post('/messages/threads/:threadId', authenticateJWT, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    
    // Check if thread exists and user is a participant
    const isParticipant = await prisma.messageThreadParticipant.findFirst({
      where: {
        threadId,
        userId: senderId
      }
    });
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You do not have access to this thread' });
    }
    
    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId,
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
router.post('/profile-view', authenticateJWT, async (req, res) => {
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
    
    res.status(201).json(profileView);
  } catch (error) {
    console.error('Error recording profile view:', error);
    res.status(500).json({ message: 'Error recording profile view' });
  }
});

// Create a job recommendation notification
router.post('/recommendations', authenticateJWT, async (req, res) => {
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
        userId,
        jobId,
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
        recipientId: userId,
        relatedEntityIds: { jobId: job.id, recommendationId: recommendation.id }
      }
    });
    
    res.status(201).json({ recommendation, notification });
  } catch (error) {
    console.error('Error creating job recommendation:', error);
    res.status(500).json({ message: 'Error creating job recommendation' });
  }
});

// Create a scheduled reminder
router.post('/reminders', authenticateJWT, async (req, res) => {
  try {
    const { userId, type, scheduledFor, content } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create scheduled reminder
    const reminder = await prisma.scheduledReminder.create({
      data: {
        userId,
        type,
        scheduledFor: new Date(scheduledFor),
        content
      }
    });
    
    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating scheduled reminder:', error);
    res.status(500).json({ message: 'Error creating scheduled reminder' });
  }
});

module.exports = router;

