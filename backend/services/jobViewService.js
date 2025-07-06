const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class JobViewService {
  /**
   * Track a job view
   */
  async trackJobView({ jobId, userId = null, ipAddress = null, userAgent = null, referrer = null }) {
    try {
      // Avoid duplicate views from same user within 1 hour
      if (userId) {
        const recentView = await prisma.jobView.findFirst({
          where: {
            jobId,
            userId,
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        });

        if (recentView) {
          return recentView; // Don't create duplicate
        }
      }

      // Create new job view record
      const jobView = await prisma.jobView.create({
        data: {
          jobId,
          userId,
          ipAddress,
          userAgent,
          referrer
        }
      });

      return jobView;
    } catch (error) {
      console.error('Error tracking job view:', error);
      throw new Error(`Failed to track job view: ${error.message}`);
    }
  }

  /**
   * Get job view statistics for a specific job
   */
  async getJobViewStats(jobId) {
    try {
      const [totalViews, uniqueUsers, recentViews] = await Promise.all([
        // Total view count
        prisma.jobView.count({
          where: { jobId }
        }),
        
        // Unique users who viewed
        prisma.jobView.groupBy({
          by: ['userId'],
          where: { 
            jobId,
            userId: { not: null }
          }
        }).then(groups => groups.length),
        
        // Views in last 7 days
        prisma.jobView.count({
          where: {
            jobId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        totalViews,
        uniqueUsers,
        recentViews,
        anonymousViews: totalViews - uniqueUsers
      };
    } catch (error) {
      console.error('Error getting job view stats:', error);
      throw new Error(`Failed to get job view stats: ${error.message}`);
    }
  }

  /**
   * Get analytics for multiple jobs (for employer dashboard)
   */
  async getJobsAnalytics(jobIds) {
    try {
      const analytics = await prisma.jobView.groupBy({
        by: ['jobId'],
        where: {
          jobId: { in: jobIds }
        },
        _count: {
          id: true
        },
        _min: {
          createdAt: true
        },
        _max: {
          createdAt: true
        }
      });

      // Get unique user counts for each job
      const uniqueUserCounts = await Promise.all(
        jobIds.map(async (jobId) => {
          const uniqueUsers = await prisma.jobView.groupBy({
            by: ['userId'],
            where: { 
              jobId,
              userId: { not: null }
            }
          });
          return { jobId, uniqueUsers: uniqueUsers.length };
        })
      );

      // Combine results
      const result = jobIds.map(jobId => {
        const viewData = analytics.find(a => a.jobId === jobId);
        const uniqueData = uniqueUserCounts.find(u => u.jobId === jobId);
        
        return {
          jobId,
          totalViews: viewData?._count.id || 0,
          uniqueUsers: uniqueData?.uniqueUsers || 0,
          firstView: viewData?._min.createdAt || null,
          lastView: viewData?._max.createdAt || null
        };
      });

      return result;
    } catch (error) {
      console.error('Error getting jobs analytics:', error);
      throw new Error(`Failed to get jobs analytics: ${error.message}`);
    }
  }

  /**
   * Get trending jobs based on recent views
   */
  async getTrendingJobs(limit = 10, days = 7) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const trendingJobs = await prisma.jobView.groupBy({
        by: ['jobId'],
        where: {
          createdAt: { gte: cutoffDate }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: limit
      });

      // Get job details
      const jobIds = trendingJobs.map(j => j.jobId);
      const jobs = await prisma.job.findMany({
        where: {
          id: { in: jobIds },
          status: 'ACTIVE'
        },
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true
            }
          }
        }
      });

      // Combine view counts with job data
      const result = trendingJobs.map(trending => {
        const job = jobs.find(j => j.id === trending.jobId);
        return {
          ...job,
          viewCount: trending._count.id
        };
      }).filter(job => job.id); // Remove jobs that weren't found

      return result;
    } catch (error) {
      console.error('Error getting trending jobs:', error);
      throw new Error(`Failed to get trending jobs: ${error.message}`);
    }
  }

  /**
   * Get view history for a specific user
   */
  async getUserViewHistory(userId, limit = 20) {
    try {
      const viewHistory = await prisma.jobView.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              company: {
                select: {
                  name: true,
                  logoUrl: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return viewHistory.map(view => ({
        id: view.id,
        viewedAt: view.createdAt,
        job: {
          id: view.job.id,
          title: view.job.title,
          location: view.job.location,
          type: view.job.type,
          company: view.job.company
        }
      }));
    } catch (error) {
      console.error('Error getting user view history:', error);
      throw new Error(`Failed to get user view history: ${error.message}`);
    }
  }

  /**
   * Clean up old view records (for maintenance)
   */
  async cleanupOldViews(daysToKeep = 90) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
      
      const result = await prisma.jobView.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      });

      console.log(`Cleaned up ${result.count} old job view records`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up old views:', error);
      throw new Error(`Failed to cleanup old views: ${error.message}`);
    }
  }
}

module.exports = new JobViewService();