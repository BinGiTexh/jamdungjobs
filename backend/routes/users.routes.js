const express = require('express');
const router = express.Router();

const createUsersRouter = (prisma) => {
  /**
   * @route   GET /api/users/me
   * @desc    Get current user profile (works for all user types)
   * @access  Private
   */
  router.get('/me', async (req, res) => {
    try {
      console.log('Getting user profile for:', {
        userId: req.user.id,
        role: req.user.role,
        email: req.user.email
      });

      // Get user with appropriate includes based on role
      const includeOptions = {
        candidateProfile: req.user.role === 'JOBSEEKER',
        company: req.user.role === 'EMPLOYER'
      };

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: includeOptions
      });

      if (!user) {
        console.log('User not found in database:', req.user.id);
        return res.status(404).json({
          success: false,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = user;

      console.log('User profile retrieved successfully:', {
        userId: user.id,
        role: user.role,
        hasProfile: req.user.role === 'JOBSEEKER' ? !!user.candidateProfile : !!user.company
      });

      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  /**
   * @route   PUT /api/users/me
   * @desc    Update current user profile (basic user fields only)
   * @access  Private
   */
  router.put('/me', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        bio,
        location,
        phoneNumber,
        title
      } = req.body;

      console.log('Updating user profile for:', {
        userId: req.user.id,
        role: req.user.role,
        updates: Object.keys(req.body)
      });

      // Build update object with only provided fields
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
      if (title !== undefined) updateData.title = title;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        include: {
          candidateProfile: req.user.role === 'JOBSEEKER',
          company: req.user.role === 'EMPLOYER'
        }
      });

      // Remove sensitive data
      const { passwordHash, ...userWithoutPassword } = updatedUser;

      console.log('User profile updated successfully:', {
        userId: updatedUser.id,
        updatedFields: Object.keys(updateData)
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
};

module.exports = createUsersRouter;
