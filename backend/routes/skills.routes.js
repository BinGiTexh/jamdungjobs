const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();

  /**
   * @route GET /api/skills
   * @description Return unique list of skills from jobs and candidate profiles.
   *              Optional ?query=react param filters by contains.
   * @access Public
   */
  router.get('/', async (req, res) => {
    try {
      // Fetch skills arrays
      const [jobRows, candidateRows] = await Promise.all([
        prisma.job.findMany({ select: { skills: true } }),
        prisma.candidateProfile.findMany({ select: { skills: true } })
      ]);

      const skillSet = new Set();
      const addSkills = (rows) => {
        rows.forEach((row) => {
          if (Array.isArray(row.skills)) {
            row.skills.forEach((s) => {
              if (s && typeof s === 'string') skillSet.add(s);
            });
          }
        });
      };

      addSkills(jobRows);
      addSkills(candidateRows);

      let skills = Array.from(skillSet).sort((a, b) => a.localeCompare(b));

      const { query } = req.query;
      if (query) {
        const q = query.toLowerCase();
        skills = skills.filter((s) => s.toLowerCase().includes(q));
      }

      res.json({ success: true, data: skills });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch skills', code: 'INTERNAL_SERVER_ERROR' });
    }
  });

  return router;
};
