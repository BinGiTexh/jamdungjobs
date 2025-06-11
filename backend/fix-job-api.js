// Add this endpoint to server.js to fix the job listing issue
app.get('/api/employer/jobs/simple', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer?.company) {
      return res.json([]);
    }

    const jobs = await prisma.job.findMany({
      where: { companyId: employer.company.id },
      include: {
        company: true,
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});
