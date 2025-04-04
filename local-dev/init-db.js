const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = "mongodb://jobboard:jobboard@localhost:27017/jobboard?authSource=admin";
const client = new MongoClient(uri);

// Helper function to hash passwords
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function initializeDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('jobboard');
        
        // Clear existing data
        await db.collection('users').deleteMany({});
        await db.collection('jobs').deleteMany({});
        await db.collection('applications').deleteMany({});
        await db.collection('analytics').deleteMany({});

        // Create users
        const hashedPassword = await hashPassword('password123');
        
        const employerUser = {
            email: 'employer@example.com',
            password: hashedPassword,
            role: 'employer',
            company: 'BingiTech Solutions',
            firstName: 'John',
            lastName: 'Employer',
            createdAt: new Date(),
            updatedAt: new Date(),
            companyDetails: {
                name: 'BingiTech Solutions',
                size: '50-200',
                industry: 'Technology',
                location: 'San Francisco, CA'
            }
        };

        const candidateUser = {
            email: 'candidate@example.com',
            password: hashedPassword,
            role: 'candidate',
            firstName: 'Jane',
            lastName: 'Candidate',
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: {
                title: 'Senior Software Engineer',
                summary: 'Experienced software engineer with 5+ years in full-stack development',
                skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB'],
                location: 'San Francisco, CA',
                experience: [
                    {
                        title: 'Software Engineer',
                        company: 'Tech Corp',
                        duration: '2020-2023'
                    }
                ]
            }
        };

        const userResults = await db.collection('users').insertMany([employerUser, candidateUser]);
        console.log('Created users');

        // Create jobs
        const jobs = [
            {
                title: 'Senior Full Stack Developer',
                company: 'BingiTech Solutions',
                employerId: userResults.insertedIds[0], // Reference to employer
                location: 'San Francisco, CA',
                type: 'Full-time',
                description: 'We are seeking an experienced Full Stack Developer to join our team...',
                requirements: [
                    'At least 5 years of experience with full-stack development',
                    'Strong proficiency in React, Node.js, and MongoDB',
                    'Experience with cloud platforms (AWS/GCP)',
                    'Excellent communication skills'
                ],
                salary: {
                    min: 120000,
                    max: 180000,
                    currency: 'USD'
                },
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Product Manager',
                company: 'BingiTech Solutions',
                employerId: userResults.insertedIds[0],
                location: 'San Francisco, CA',
                type: 'Full-time',
                description: 'Looking for an experienced Product Manager to lead our product initiatives...',
                requirements: [
                    '3+ years of product management experience',
                    'Strong technical background',
                    'Experience with agile methodologies',
                    'MBA preferred'
                ],
                salary: {
                    min: 130000,
                    max: 190000,
                    currency: 'USD'
                },
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const jobResults = await db.collection('jobs').insertMany(jobs);
        console.log('Created jobs');

        // Create applications
        const applications = [
            {
                jobId: jobResults.insertedIds[0],
                candidateId: userResults.insertedIds[1],
                status: 'pending',
                coverLetter: 'I am excited to apply for the Senior Full Stack Developer position...',
                resume: {
                    url: 'https://example.com/resume.pdf',
                    filename: 'jane-candidate-resume.pdf'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                jobId: jobResults.insertedIds[1],
                candidateId: userResults.insertedIds[1],
                status: 'interview_scheduled',
                coverLetter: 'I would be a great fit for the Product Manager position...',
                resume: {
                    url: 'https://example.com/resume.pdf',
                    filename: 'jane-candidate-resume.pdf'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await db.collection('applications').insertMany(applications);
        console.log('Created applications');

        // Create analytics
        const analytics = [
            {
                type: 'job_view',
                jobId: jobResults.insertedIds[0],
                timestamp: new Date(),
                userId: userResults.insertedIds[1],
                metadata: {
                    source: 'job_listing',
                    device: 'desktop'
                }
            },
            {
                type: 'application_submitted',
                jobId: jobResults.insertedIds[0],
                applicationId: applications[0]._id,
                timestamp: new Date(),
                userId: userResults.insertedIds[1],
                metadata: {
                    source: 'job_detail',
                    device: 'desktop'
                }
            },
            {
                type: 'search',
                timestamp: new Date(),
                userId: userResults.insertedIds[1],
                metadata: {
                    query: 'developer',
                    filters: {
                        location: 'San Francisco',
                        type: 'Full-time'
                    },
                    resultCount: 1
                }
            }
        ];

        await db.collection('analytics').insertMany(analytics);
        console.log('Created analytics');

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await client.close();
    }
}

// Run the initialization
initializeDatabase().catch(console.error);

