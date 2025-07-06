-- Jamaican Jobs Database Seeder
-- This script populates the companies and jobs tables with realistic Jamaican job market data

-- Clear existing data
DELETE FROM jobs;
DELETE FROM companies;

-- Insert companies first
INSERT INTO companies (id, name, description, location, industry, website, "updatedAt") VALUES
('comp_1', 'DigiTech Solutions JA', 'Leading technology solutions provider in Jamaica', 'New Kingston', 'Technology', 'https://digitech.com.jm', CURRENT_TIMESTAMP),
('comp_2', 'WebCraft Jamaica', 'Creative web development agency', 'Half Way Tree', 'Technology', 'https://webcraft.jm', CURRENT_TIMESTAMP),
('comp_3', 'Jamaica Business Solutions', 'Comprehensive IT support services', 'Spanish Town', 'Technology', 'https://jbs.com.jm', CURRENT_TIMESTAMP),
('comp_4', 'Kingston Public Hospital', 'Premier healthcare institution', 'Kingston', 'Healthcare', 'https://kph.gov.jm', CURRENT_TIMESTAMP),
('comp_5', 'Mandeville Medical Centre', 'Modern medical facility', 'Mandeville', 'Healthcare', 'https://mmc.com.jm', CURRENT_TIMESTAMP),
('comp_6', 'National Commercial Bank', 'Leading financial institution', 'New Kingston', 'Finance', 'https://ncb.com', CURRENT_TIMESTAMP),
('comp_7', 'Scotiabank Jamaica', 'International banking services', 'Montego Bay', 'Finance', 'https://scotiabank.com.jm', CURRENT_TIMESTAMP),
('comp_8', 'Meadowbrook Preparatory School', 'Quality primary education', 'Meadowbrook', 'Education', 'https://meadowbrook.edu.jm', CURRENT_TIMESTAMP),
('comp_9', 'Academic Excellence Centre', 'Tutoring and test preparation', 'Liguanea', 'Education', 'https://academic-excellence.jm', CURRENT_TIMESTAMP),
('comp_10', 'Sandals Montego Bay', 'Luxury resort and hospitality', 'Montego Bay', 'Tourism', 'https://sandals.com', CURRENT_TIMESTAMP),
('comp_11', 'Island Adventures Tours', 'Authentic Jamaican tour experiences', 'Ocho Rios', 'Tourism', 'https://island-adventures.jm', CURRENT_TIMESTAMP),
('comp_12', 'Ministry of Agriculture', 'Government agricultural services', 'May Pen', 'Agriculture', 'https://moa.gov.jm', CURRENT_TIMESTAMP),
('comp_13', 'Grace Foods Jamaica', 'Food processing and manufacturing', 'Spanish Town', 'Manufacturing', 'https://gracefoods.com', CURRENT_TIMESTAMP),
('comp_14', 'Digicel Jamaica', 'Telecommunications leader', 'Kingston', 'Telecommunications', 'https://digicel.com', CURRENT_TIMESTAMP),
('comp_15', 'Courts Jamaica', 'Retail and furniture', 'Portmore', 'Retail', 'https://courts.com.jm', CURRENT_TIMESTAMP),
('comp_16', 'Caribbean Engineering Solutions', 'Civil engineering and construction', 'Kingston', 'Construction', 'https://ces.com.jm', CURRENT_TIMESTAMP),
('comp_17', 'FLOW Jamaica', 'Cable and internet services', 'New Kingston', 'Telecommunications', 'https://discoverflow.co', CURRENT_TIMESTAMP),
('comp_18', 'Red Stripe Jamaica', 'Brewing and beverages', 'Kingston', 'Manufacturing', 'https://redstripe.com', CURRENT_TIMESTAMP),
('comp_19', 'Guardian Security Services', 'Professional security solutions', 'Spanish Town', 'Security', 'https://guardian-security.jm', CURRENT_TIMESTAMP),
('comp_20', 'Jamaica Post', 'National postal service', 'Kingston', 'Transportation', 'https://jamaicapost.gov.jm', CURRENT_TIMESTAMP),
('comp_21', 'Campbell & Associates', 'Legal services and consultation', 'New Kingston', 'Legal', 'https://campbell-law.jm', CURRENT_TIMESTAMP),
('comp_22', 'Caribbean Content Creators', 'Digital content and marketing', 'Remote', 'Marketing', 'https://caribbean-content.com', CURRENT_TIMESTAMP),
('comp_23', 'Global VA Solutions', 'Virtual assistant services', 'Remote', 'Administrative', 'https://global-va.com', CURRENT_TIMESTAMP);

-- Insert jobs with proper schema format
INSERT INTO jobs (id, company_id, title, description, location, type, salary, skills, education, experience, status, "updatedAt") VALUES 

-- Technology Jobs
('job_1', 'comp_1', 'Senior Software Developer', 
'Join our dynamic tech team to build innovative solutions for the Caribbean market. Work with modern technologies including React, Node.js, and cloud platforms.',
'New Kingston', 'FULL_TIME', '{"min": 4500000, "max": 6000000, "currency": "JMD"}', 
'{"JavaScript", "React", "Node.js", "AWS", "MongoDB", "Git"}',
'Bachelor''s degree in Computer Science or related field', '5+ years experience in full-stack development', 'ACTIVE', CURRENT_TIMESTAMP),

('job_2', 'comp_2', 'Junior Web Developer',
'Perfect opportunity for a recent graduate to start their career in web development. You''ll work on exciting projects for local businesses.',
'Half Way Tree', 'FULL_TIME', '{"min": 2400000, "max": 3200000, "currency": "JMD"}',
'{"HTML", "CSS", "JavaScript", "PHP", "MySQL", "WordPress"}',
'Diploma or degree in Computer Science or Web Development', '0-2 years experience', 'ACTIVE'),

('job_3', 'comp_3', 'IT Support Specialist',
'Provide technical support to our growing organization. Troubleshoot hardware and software issues and maintain network infrastructure.',
'Spanish Town', 'FULL_TIME', '{"min": 2800000, "max": 3600000, "currency": "JMD"}',
'{"Windows", "Network Administration", "Hardware Troubleshooting", "Microsoft Office"}',
'Associate degree in IT or equivalent experience', '2-3 years in technical support', 'ACTIVE'),

-- Healthcare Jobs
('job_4', 'comp_4', 'Registered Nurse',
'Join our compassionate healthcare team providing quality patient care. Work in a modern facility with opportunities for growth.',
'Kingston', 'FULL_TIME', '{"min": 3200000, "max": 4200000, "currency": "JMD"}',
'{"Patient Care", "Medical Records", "CPR Certified", "Medication Administration"}',
'Valid nursing license in Jamaica', '2+ years clinical experience preferred', 'ACTIVE'),

('job_5', 'comp_5', 'Medical Receptionist',
'Front desk position at busy medical practice. Handle patient scheduling, insurance verification, and administrative duties.',
'Mandeville', 'FULL_TIME', '{"min": 2000000, "max": 2600000, "currency": "JMD"}',
'{"Customer Service", "Medical Terminology", "Appointment Scheduling"}',
'High school diploma required', 'Previous medical office experience preferred', 'ACTIVE'),

-- Finance Jobs
('job_6', 'comp_6', 'Financial Analyst',
'Analyze financial data, prepare reports, and support strategic decision-making for one of Jamaica''s leading financial institutions.',
'New Kingston', 'FULL_TIME', '{"min": 3800000, "max": 5200000, "currency": "JMD"}',
'{"Financial Analysis", "Excel", "Financial Modeling", "Risk Assessment", "PowerBI"}',
'Bachelor''s degree in Finance, Accounting, or Economics', '3+ years experience in financial analysis', 'ACTIVE'),

('job_7', 'comp_7', 'Bank Teller',
'Provide excellent customer service while handling daily banking transactions. Great opportunity to start a career in banking.',
'Montego Bay', 'FULL_TIME', '{"min": 2200000, "max": 2800000, "currency": "JMD"}',
'{"Customer Service", "Cash Handling", "Attention to Detail", "Banking Software"}',
'High school diploma required', 'Previous customer service experience preferred', 'ACTIVE'),

-- Education Jobs
('job_8', 'comp_8', 'Primary School Teacher',
'Teach and inspire young minds in grades 1-6. Create engaging lesson plans and foster a positive learning environment.',
'Meadowbrook', 'FULL_TIME', '{"min": 2600000, "max": 3400000, "currency": "JMD"}',
'{"Classroom Management", "Curriculum Development", "Child Psychology", "Educational Technology"}',
'Bachelor''s degree in Education or teaching certificate', '2+ years teaching experience', 'ACTIVE'),

('job_9', 'comp_9', 'Mathematics Tutor',
'Provide one-on-one and small group tutoring for high school students preparing for CSEC and CAPE examinations.',
'Liguanea', 'PART_TIME', '{"min": 150000, "max": 300000, "currency": "JMD"}',
'{"Mathematics", "CSEC Preparation", "CAPE Preparation", "Tutoring"}',
'Bachelor''s degree in Mathematics or related field', 'Experience with CSEC/CAPE curriculum', 'ACTIVE'),

-- Tourism Jobs
('job_10', 'comp_10', 'Hotel Manager',
'Oversee daily operations of our luxury resort property. Ensure exceptional guest experiences and manage staff across all departments.',
'Montego Bay', 'FULL_TIME', '{"min": 4200000, "max": 6000000, "currency": "JMD"}',
'{"Hotel Management", "Staff Leadership", "Customer Service", "Budget Management", "Operations"}',
'Bachelor''s degree in Hospitality Management or related field', '5+ years hotel management experience', 'ACTIVE'),

('job_11', 'comp_11', 'Tour Guide',
'Lead exciting tours showcasing Jamaica''s natural beauty and rich culture. Share your knowledge and passion for our beautiful island.',
'Ocho Rios', 'FULL_TIME', '{"min": 1800000, "max": 2400000, "currency": "JMD"}',
'{"Public Speaking", "Jamaican History", "Customer Service", "First Aid", "Cultural Knowledge"}',
'High school diploma', 'Knowledge of Jamaican history and culture', 'ACTIVE'),

-- Agriculture Jobs
('job_12', 'comp_12', 'Agricultural Extension Officer',
'Support local farmers with modern farming techniques, crop management, and sustainable agriculture practices.',
'May Pen', 'FULL_TIME', '{"min": 2800000, "max": 3600000, "currency": "JMD"}',
'{"Crop Management", "Soil Science", "Pest Control", "Sustainable Agriculture", "Farmer Education"}',
'Bachelor''s degree in Agriculture or related field', '2+ years field experience', 'ACTIVE'),

-- Manufacturing Jobs
('job_13', 'comp_13', 'Production Supervisor',
'Supervise manufacturing operations, ensure quality standards, and lead production teams in our food processing facility.',
'Spanish Town', 'FULL_TIME', '{"min": 3400000, "max": 4400000, "currency": "JMD"}',
'{"Production Management", "Quality Control", "Team Leadership", "Safety Protocols", "Food Safety"}',
'Bachelor''s degree in Engineering or related field', '4+ years manufacturing experience', 'ACTIVE'),

-- Sales Jobs
('job_14', 'comp_14', 'Sales Representative',
'Drive sales growth by building relationships with clients and promoting our telecommunications services across the island.',
'Kingston', 'FULL_TIME', '{"min": 2600000, "max": 3800000, "currency": "JMD"}',
'{"Sales", "Customer Relationship Management", "Telecommunications", "Negotiation", "Territory Management"}',
'Bachelor''s degree preferred', '2+ years sales experience', 'ACTIVE'),

('job_15', 'comp_15', 'Store Manager',
'Manage daily operations of our retail location, supervise staff, and ensure excellent customer service.',
'Portmore', 'FULL_TIME', '{"min": 3000000, "max": 4000000, "currency": "JMD"}',
'{"Retail Management", "Staff Supervision", "Inventory Management", "Customer Service", "Sales Analysis"}',
'Bachelor''s degree in Business or related field', '3+ years retail management experience', 'ACTIVE'),

-- Construction Jobs
('job_16', 'comp_16', 'Civil Engineer',
'Design and oversee construction projects including roads, bridges, and infrastructure developments across Jamaica.',
'Kingston', 'FULL_TIME', '{"min": 4000000, "max": 5500000, "currency": "JMD"}',
'{"Civil Engineering", "AutoCAD", "Project Management", "Structural Design", "Construction Management"}',
'Bachelor''s degree in Civil Engineering', '4+ years experience in construction projects', 'ACTIVE'),

-- Customer Service Jobs
('job_17', 'comp_17', 'Customer Service Representative',
'Provide exceptional customer support via phone, email, and chat for our telecommunications services.',
'New Kingston', 'FULL_TIME', '{"min": 2200000, "max": 2800000, "currency": "JMD"}',
'{"Customer Service", "Phone Support", "Problem Solving", "Computer Skills", "Communication"}',
'High school diploma required', 'Previous customer service experience preferred', 'ACTIVE'),

-- Marketing Jobs
('job_18', 'comp_18', 'Digital Marketing Specialist',
'Develop and execute digital marketing campaigns across social media, email, and web platforms to grow our brand presence.',
'Kingston', 'FULL_TIME', '{"min": 3200000, "max": 4200000, "currency": "JMD"}',
'{"Digital Marketing", "Social Media", "Google Analytics", "Content Creation", "SEO", "Email Marketing"}',
'Bachelor''s degree in Marketing or related field', '2+ years digital marketing experience', 'ACTIVE'),

-- Security Jobs
('job_19', 'comp_19', 'Security Guard',
'Provide security services for commercial properties, monitor premises, and ensure safety of personnel and assets.',
'Spanish Town', 'FULL_TIME', '{"min": 1800000, "max": 2200000, "currency": "JMD"}',
'{"Security Procedures", "Surveillance", "Report Writing", "Emergency Response", "Customer Service"}',
'High school diploma', 'Security license required', 'ACTIVE'),

-- Transportation Jobs
('job_20', 'comp_20', 'Delivery Driver',
'Deliver packages and goods across the Kingston Metropolitan Area. Excellent opportunity for reliable, customer-focused individuals.',
'Kingston', 'FULL_TIME', '{"min": 2000000, "max": 2600000, "currency": "JMD"}',
'{"Driving", "Customer Service", "Time Management", "Route Planning", "Package Handling"}',
'Valid driver''s license with clean record', 'Previous delivery experience preferred', 'ACTIVE'),

-- Legal Jobs
('job_21', 'comp_21', 'Legal Assistant',
'Support attorneys with legal research, document preparation, and client communication in our busy law practice.',
'New Kingston', 'FULL_TIME', '{"min": 2800000, "max": 3600000, "currency": "JMD"}',
'{"Legal Research", "Document Preparation", "Client Communication", "Case Management", "Legal Writing"}',
'Associate degree in Legal Studies or Paralegal certificate', '2+ years legal experience', 'ACTIVE'),

-- Remote Work Jobs
('job_22', 'comp_22', 'Content Writer',
'Create engaging content for websites, blogs, and social media platforms. Work remotely while contributing to exciting projects.',
'Remote', 'FULL_TIME', '{"min": 2400000, "max": 3600000, "currency": "JMD"}',
'{"Content Writing", "SEO Writing", "Social Media", "Research", "Editing", "WordPress"}',
'Bachelor''s degree in English, Journalism, or related field', '2+ years writing experience', 'ACTIVE'),

('job_23', 'comp_23', 'Virtual Assistant',
'Provide administrative support to international clients from the comfort of your home. Flexible schedule available.',
'Remote', 'PART_TIME', '{"min": 1800000, "max": 2800000, "currency": "JMD"}',
'{"Administrative Support", "Email Management", "Scheduling", "Data Entry", "Customer Service"}',
'High school diploma', 'Strong computer skills required', 'ACTIVE');

-- Display results
SELECT 'Jobs seeded successfully!' as message;
SELECT COUNT(*) as total_jobs FROM jobs;
SELECT COUNT(*) as total_companies FROM companies;
