// This file contains a fix for the company profile creation issue
// To apply this fix, copy the following code into server.js after the existing
// '/api/employer/profile' endpoint

// New endpoint for company creation that uses the correct field name
app.post('/api/employer/create-company', authenticateJWT, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'EMPLOYER') {
      return res.status(403).json({ message: 'Only employers can create company profiles' });
    }

    // Extract company data from request
    const { 
      name, 
      description, 
      location, 
      website,
      industry
    } = req.body;

    // Find the employer
    const employer = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { company: true }
    });

    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // If employer already has a company, update it
    if (employer.companyId) {
      const updatedCompany = await prisma.company.update({
        where: { id: employer.companyId },
        data: {
          name: name || undefined,
          description: description || undefined,
          location: location || undefined,
          website: website || undefined,
          industry: industry || undefined,
        }
      });
      
      return res.json(updatedCompany);
    }
    
    // Otherwise, create a new company
    const newCompany = await prisma.company.create({
      data: {
        name: name || 'My Company',
        description: description || '',
        location: location || '',
        website: website || '',
        industry: industry || '',
        employees: {
          connect: { id: employer.id }
        }
      }
    });
    
    // Update the employer with the new company ID
    await prisma.user.update({
      where: { id: employer.id },
      data: { companyId: newCompany.id }
    });
    
    return res.status(201).json(newCompany);
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({ message: 'Failed to create company profile', error: error.message });
  }
});
