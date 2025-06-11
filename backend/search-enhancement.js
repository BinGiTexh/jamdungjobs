/**
 * Enhanced Search API
 * 
 * Adds improved search functionality to the JamDung Jobs platform
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/jobs/search
 * Enhanced job search with multiple filters
 */
router.get('/jobs/search', async (req, res) => {
  try {
    const {
      query = '',           // Text search
      location = '',        // Location filter
      type = '',            // Job type filter
      minSalary = 0,        // Minimum salary
      skills = '',          // Skills (comma-separated)
      limit = 20,
      offset = 0
    } = req.query;

    // Build the where clause
    const where = {
      status: 'ACTIVE',
      OR: []
    };
    
    // Add text search if provided
    if (query) {
      where.OR.push(
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      );
    }
    
    // Add location filter if provided
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    // Add job type filter if provided
    if (type) {
      where.type = type;
    }
    
    // Add skills filter if provided
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      where.skills = {
        hasSome: skillsArray
      };
    }
    
    // Execute the search
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });
    
    // Get total count for pagination
    const total = await prisma.job.count({ where });
    
    // Format job types for frontend display
    const formattedJobs = jobs.map(job => {
      const typeDisplayMap = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'TEMPORARY': 'Temporary',
        'INTERNSHIP': 'Internship'
      };
      
      return {
        ...job,
        jobType: typeDisplayMap[job.type] || job.type,
        companyName: job.company.name,
        companyLogo: job.company.logoUrl
      };
    });
    
    res.json({
      jobs: formattedJobs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
});

/**
 * GET /api/jobs/filters
 * Get available filter options for job search
 */
router.get('/jobs/filters', async (req, res) => {
  try {
    // Get all active job locations
    const locations = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      select: { location: true },
      distinct: ['location']
    });
    
    // Get all job types from schema
    const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP'];
    
    // Get common skills from active jobs
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      select: { skills: true }
    });
    
    // Extract and count skills
    const skillsCount = {};
    jobs.forEach(job => {
      if (job.skills) {
        job.skills.forEach(skill => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1;
        });
      }
    });
    
    // Sort skills by frequency
    const topSkills = Object.entries(skillsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill]) => skill);
    
    res.json({
      locations: locations.map(l => l.location),
      jobTypes: jobTypes.map(type => ({
        value: type,
        label: type.replace('_', ' ').toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      })),
      skills: topSkills
    });
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ message: 'Error getting filter options', error: error.message });
  }
});

module.exports = router;
