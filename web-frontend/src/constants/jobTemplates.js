// Predefined job templates by sector for quick job posting guidance
// Each template provides default text for description, requirements and responsibilities fields

const JOB_TEMPLATES = {
  Technology: {
    description: 'We are seeking a passionate software engineer to help build scalable, mission-critical systems that power our platform.',
    requirements: `- Bachelor’s degree in Computer Science or related field\n- 3+ years with JavaScript/TypeScript\n- Experience with React and Node.js\n- Familiarity with cloud services (AWS/Azure/GCP)`,
    responsibilities: `- Design, develop, and ship new features\n- Write clean, maintainable code and tests\n- Participate in code reviews and architecture discussions\n- Collaborate with product and design to deliver delightful UX`,
  },
  Hospitality: {
    description: 'Join our guest-focused resort team delivering authentic Jamaican hospitality in a vibrant beachside environment.',
    requirements: `- 2+ years front-desk or guest-services experience\n- Excellent communication & conflict-resolution skills\n- Flexible schedule, including weekends/holidays\n- Working knowledge of PMS systems a plus`,
    responsibilities: `- Welcome and check-in guests with warmth\n- Handle reservations, inquiries, and special requests\n- Coordinate with housekeeping and F&B for seamless service\n- Resolve guest issues promptly to ensure satisfaction`,
  },
  Construction: {
    description: 'We are expanding our project team and need a site supervisor to oversee day-to-day operations on commercial builds.',
    requirements: `- 5+ years in construction management\n- Proven leadership of multi-disciplinary crews\n- OSH safety certification\n- Ability to read and interpret blueprints`,
    responsibilities: `- Coordinate subcontractors and schedule daily tasks\n- Enforce safety and quality standards\n- Track material usage and report progress\n- Liaise with project manager on timelines and budgets`,
  },
  Healthcare: {
    description: 'Seeking a registered nurse committed to delivering compassionate patient care in a fast-paced clinical environment.',
    requirements: `- Valid RN license in Jamaica\n- 2+ years clinical experience\n- BLS & ACLS certification\n- Excellent patient communication skills`,
    responsibilities: `- Assess, monitor, and document patient conditions\n- Administer medications & treatments accurately\n- Collaborate with physicians on care plans\n- Educate patients and families on health management`,
  },
  Education: {
    description: 'Looking for an enthusiastic mathematics teacher dedicated to inspiring secondary school students.',
    requirements: `- Bachelor’s degree in Mathematics or Education\n- Teaching certification (TRN)\n- Minimum 3 years classroom experience\n- Strong classroom management skills`,
    responsibilities: `- Plan and deliver engaging math lessons\n- Prepare and grade assessments\n- Provide academic support and tutoring\n- Participate in school events and parent meetings`,
  },
  Retail: {
    description: 'Dynamic retail sales associate needed to deliver exceptional customer service in our Kingston flagship store.',
    requirements: `- 1+ year retail or customer service experience\n- Strong communication & upselling skills\n- Ability to work weekends and holidays\n- POS system familiarity`,
    responsibilities: `- Greet and assist customers with product selection\n- Maintain store merchandising and cleanliness\n- Process transactions accurately\n- Meet or exceed daily sales targets`,
  },
  Finance: {
    description: 'Seeking an analytical accountant to join our growing finance team.',
    requirements: `- ACCA Level 2 or Bachelor’s in Accounting\n- 3+ years accounting experience\n- Proficient in QuickBooks & Excel\n- Strong knowledge of IFRS`,
    responsibilities: `- Prepare monthly financial statements\n- Manage AP/AR and reconciliations\n- Assist with budgeting and forecasting\n- Ensure tax compliance and reporting`,
  },
  Manufacturing: {
    description: 'We need a process engineer to optimize production lines and drive efficiency improvements.',
    requirements: `- Degree in Industrial or Mechanical Engineering\n- 2+ years in manufacturing environment\n- Lean / Six Sigma knowledge\n- Strong data analysis skills`,
    responsibilities: `- Analyze workflow and identify bottlenecks\n- Implement process improvements and SOPs\n- Train staff on new procedures\n- Monitor KPIs and report progress to management`,
  },
  Logistics: {
    description: 'Join our logistics team as a dispatch coordinator ensuring timely deliveries island-wide.',
    requirements: `- 2+ years dispatch or logistics experience\n- Knowledge of Jamaican road network\n- Excellent organisational skills\n- Ability to work flexible hours`,
    responsibilities: `- Schedule drivers and routes efficiently\n- Track shipments and resolve delays\n- Communicate with customers regarding ETAs\n- Maintain accurate delivery records`,
  },
  Marketing: {
    description: 'Creative digital marketing specialist wanted to grow brand presence across social media channels.',
    requirements: `- Bachelor’s in Marketing or related field\n- 2+ years managing social media campaigns\n- Proficiency with Meta Ads Manager & Google Analytics\n- Strong copywriting skills`,
    responsibilities: `- Develop and execute social media strategy\n- Create engaging content calendars\n- Monitor and report on campaign performance\n- Coordinate with designers & sales to align messaging`,
  },
};

export default JOB_TEMPLATES;
