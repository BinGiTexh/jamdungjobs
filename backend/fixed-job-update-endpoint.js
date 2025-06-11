app.put('/api/employer/jobs/:id', authenticateJWT, checkRole('EMPLOYER'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      benefits,
      location,
      type, // Use type directly
      jobType, // For backward compatibility
      salary,
      salaryMin,
      salaryMax,
      salaryCurrency,
      skills,
      experience,
      education,
      applicationDeadline,
      status,
      featured
    } = req.body;
    
    // Get the employer's company
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });
    
    if (!user || !user.company) {
      return res.status(403).json({ message: 'Access denied - no company associated with user' });
    }
    
    // Now find the job that belongs to the user's company
    const job = await prisma.job.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not authorized' });
    }

    // Valid job types as defined in the Prisma schema
    const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'];
    
    // Determine the job type to use
    let finalType = job.type; // Default to current type
    
    // First try using the type field directly if provided
    if (type && validTypes.includes(type)) {
      finalType = type;
      console.log('Using type directly:', finalType);
    } 
    // Fall back to jobType if provided
    else if (jobType) {
      // If jobType is already a valid enum value, use it directly
      if (validTypes.includes(jobType)) {
        finalType = jobType;
        console.log('Using jobType directly:', finalType);
      } 
      // Otherwise try to transform it
      else {
        try {
          finalType = transformJobType(jobType);
          console.log('Transformed jobType:', finalType);
        } catch (error) {
          console.error('Error transforming job type:', error.message);
          // Don't return error, just keep the existing type
        }
      }
    }

    // Format salary object according to schema
    let salaryObject;
    if (salary && typeof salary === 'object') {
      // If salary is already an object, use it
      salaryObject = salary;
    } else if (salaryMin || salaryMax) {
      // Format from min/max values
      salaryObject = formatSalaryObject(salaryMin, salaryMax, salaryCurrency);
    }

    const updateData = {
      title,
      description,
      requirements,
      benefits,
      location,
      type: finalType,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      status,
      featured
    };
    
    // Only include fields that were provided
    if (salaryObject) {
      updateData.salary = salaryObject;
    }
    
    if (skills) {
      updateData.skills = skills;
    }
    
    if (experience !== undefined) {
      updateData.experience = experience;
    }
    
    if (education !== undefined) {
      updateData.education = education;
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true
          }
        }
      }
    });

    // Create a consistent response format with jobType exposed for frontend
    // Convert the DB enum type back to a display format for the frontend
    let displayJobType = updatedJob.type;
    if (updatedJob.type) {
      // Convert enum format back to display format
      const typeDisplayMap = {
        'FULL_TIME': 'Full-time',
        'PART_TIME': 'Part-time',
        'CONTRACT': 'Contract',
        'TEMPORARY': 'Temporary',
        'INTERNSHIP': 'Internship'
      };
      displayJobType = typeDisplayMap[updatedJob.type] || updatedJob.type;
    }
    
    const responseJob = {
      ...updatedJob,
      jobType: displayJobType, // Add jobType field for frontend consumption
      companyName: updatedJob.company.name,
      companyLogo: updatedJob.company.logoUrl
    };

    res.json(responseJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job listing', error: error.message });
  }
});
