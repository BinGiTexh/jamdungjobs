// Load environment variables first
require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication middleware
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No auth token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid auth token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: first_name,
        lastName: last_name,
        role,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.firstName,
        last_name: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Notification routes
app.get('/api/notifications', authenticateJWT, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        jobApplication: true,
      },
    });

    const total = await prisma.notification.count({
      where: { recipientId: req.user.id },
    });

    res.json({
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications/count', authenticateJWT, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        recipientId: req.user.id,
        status: 'UNREAD',
      },
    });
    res.json({ count });
  } catch (error) {
    console.error('Error counting notifications:', error);
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/notifications/:id/mark-read', authenticateJWT, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: req.params.id,
        recipientId: req.user.id,
      },
      data: {
        status: 'READ',
      },
      include: {
        jobApplication: true,
      },
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Profile view routes
app.post('/api/profile-views', authenticateJWT, async (req, res) => {
  try {
    const { viewed_user_id } = req.body;
    
    // Create profile view
    const profileView = await prisma.profileView.create({
      data: {
        viewerId: req.user.id,
        viewedUserId: viewed_user_id,
      },
    });

    // Create notification for the viewed user
    const viewer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true },
    });

    await prisma.notification.create({
      data: {
        type: 'PROFILE_VIEW',
        recipientId: viewed_user_id,
        title: 'Profile View',
        message: `${viewer.firstName} ${viewer.lastName} from ${viewer.company?.name || 'Test Company'} viewed your profile`,
        relatedEntityIds: {
          profile_view_id: profileView.id,
          viewer_id: viewer.id,
        },
        metadata: {
          viewer: {
            id: viewer.id,
            firstName: viewer.firstName,
            lastName: viewer.lastName,
            company: {
              id: viewer.company?.id || null,
              name: viewer.company?.name || null,
            },
          },
        },
      },
    });

    res.json(profileView);
  } catch (error) {
    console.error('Error creating profile view:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start server
prisma.$connect()
  .then(() => {
    console.log('Connected to PostgreSQL via Prisma');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
