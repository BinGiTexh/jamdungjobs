/**
 * Job Recommendations API
 * 
 * Provides personalized job recommendations for job seekers
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, checkRole } = require('./lib/auth');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/jobseeker/recommendations
 * Get personalized job recommendations for the current job seeker
 */
router.get('/jobseeker/recommendations', authenticateJWT, checkRole('JOBSEEKER'), async (req, res) => {
  try {
    // Get user profile with skills
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { candidateProfile: true }
    });
    
    if (!user || !user.candidateProfile) {
      return res.json({ recommendations: [], message: 'Complete your profile to get recommendations' });
    }
    
    // Extract user skills
    const userSkills = user.candidateProfile.skills ? 
      (Array.isArray(user.candidateProfile.skills) ? 
        user.candidateProfile.skills : 
        []) : 
      [];
    
    // Find jobs matching user location and skills
    const matchingJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          // Match by location
          user.location ? { location: { contains: user.location, mode: 'insensitive' } } : {},
          // Match by skills (if user has skills)
          userSkills.length > 0 ? { 
            skills: { 
              hasSome: userSkills 
            } 
          } : {}
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });
    
    // Format job types for frontend display
    const recommendations = matchingJobs.map(job => {
      const typeDisplayMap = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'TEMPORARY': 'Temporary',
        'INTERNSHIP': 'Internship'
      };
      
      // Calculate match score based on skills overlap
      const matchingSkills = job.skills.filter(skill => 
        userSkills.includes(skill)
      );
      
      const matchScore = userSkills.length > 0 ? 
        (matchingSkills.length / userSkills.length) * 100 : 
        50; // Default score if no skills
      
      return {
        ...job,
        jobType: typeDisplayMap[job.type] || job.type,
        companyName: job.company.name,
        companyLogo: job.company.logoUrl,
        matchScore: Math.round(matchScore),
        matchingSkills
      };
    });
    
    res.json({
      recommendations: recommendations.sort((a, b) => b.matchScore - a.matchScore)
    });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({ message: 'Error getting job recommendations', error: error.message });
  }
});

module.exports = router;
