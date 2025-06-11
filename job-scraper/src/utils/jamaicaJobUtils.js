/**
 * Utilities for handling Jamaica-specific job data
 */

// Jamaican parishes for location validation
export const jamaicanParishes = [
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Clarendon',
  'Manchester',
  'St. Elizabeth',
  'Westmoreland',
  'Hanover',
  'St. James',
  'Trelawny',
  'St. Ann',
  'St. Mary',
  'Portland',
  'St. Thomas'
];

// Major cities and towns in Jamaica
export const jamaicanCities = [
  'Kingston',
  'Montego Bay',
  'Spanish Town',
  'Portmore',
  'Mandeville',
  'May Pen',
  'Old Harbour',
  'Ocho Rios',
  'Port Antonio',
  'Negril',
  'Savanna-la-Mar',
  'Linstead',
  'Half Way Tree',
  'Morant Bay',
  'Falmouth',
  'Black River',
  'Lucea'
];

// Common industries in Jamaica
export const jamaicanIndustries = [
  'Tourism & Hospitality',
  'Agriculture & Farming',
  'Banking & Finance',
  'Information Technology',
  'Telecommunications',
  'Manufacturing',
  'Retail & Sales',
  'Construction',
  'Education',
  'Healthcare',
  'Mining & Resources',
  'Government & Public Service',
  'Shipping & Logistics',
  'Business Process Outsourcing (BPO)',
  'Creative Industries',
  'Energy & Utilities'
];

// Jamaica-specific skills that are in demand
export const jamaicanSkills = [
  'Tourism Management',
  'Hospitality Services',
  'Agricultural Science',
  'Food Processing',
  'Banking Operations',
  'Financial Analysis',
  'Software Development',
  'Web Development',
  'Mobile App Development',
  'Network Administration',
  'Customer Service',
  'Call Center Operations',
  'Sales',
  'Marketing',
  'Construction Management',
  'Teaching',
  'Healthcare Administration',
  'Nursing',
  'Mining Operations',
  'Public Administration',
  'Logistics Management',
  'Shipping Operations',
  'Content Creation',
  'Graphic Design',
  'Digital Marketing',
  'Energy Management',
  'Renewable Energy',
  'Patois Fluency',
  'Cultural Tourism',
  'Reggae Music Production'
];

/**
 * Categorizes a job into a Jamaican industry based on its title and description
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {string} The most likely industry
 */
export function categorizeJamaicanJob(title, description) {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  // Define industry keywords
  const industryKeywords = {
    'Tourism & Hospitality': ['hotel', 'resort', 'tourism', 'hospitality', 'restaurant', 'chef', 'bartender', 'waiter', 'waitress', 'front desk'],
    'Agriculture & Farming': ['farm', 'agriculture', 'crop', 'livestock', 'plantation', 'harvest', 'cultivat'],
    'Banking & Finance': ['bank', 'finance', 'accounting', 'accountant', 'financial', 'investment', 'loan', 'credit', 'audit'],
    'Information Technology': ['software', 'developer', 'programming', 'it ', 'computer', 'tech', 'web', 'app', 'data', 'system administrator', 'network'],
    'Telecommunications': ['telecom', 'network', 'communication', 'cellular', 'mobile', 'phone', 'broadband'],
    'Manufacturing': ['manufacturing', 'factory', 'production', 'assembly', 'quality control', 'warehouse', 'inventory'],
    'Retail & Sales': ['retail', 'sales', 'store', 'shop', 'customer', 'cashier', 'merchandis', 'buyer'],
    'Construction': ['construction', 'builder', 'architect', 'engineer', 'project manager', 'foreman', 'carpenter', 'plumber', 'electrician'],
    'Education': ['education', 'teacher', 'school', 'university', 'college', 'professor', 'lecturer', 'tutor', 'academic'],
    'Healthcare': ['health', 'medical', 'doctor', 'nurse', 'hospital', 'clinic', 'patient', 'pharmacy', 'dental'],
    'Mining & Resources': ['mining', 'bauxite', 'alumina', 'resource', 'extraction', 'mineral'],
    'Government & Public Service': ['government', 'public service', 'civil servant', 'ministry', 'agency', 'administration', 'policy'],
    'Shipping & Logistics': ['shipping', 'logistics', 'transport', 'freight', 'cargo', 'supply chain', 'warehouse', 'distribution', 'import', 'export'],
    'Business Process Outsourcing (BPO)': ['bpo', 'call center', 'customer service', 'outsourcing', 'contact center', 'support'],
    'Creative Industries': ['creative', 'design', 'media', 'art', 'music', 'film', 'entertainment', 'reggae', 'production', 'content'],
    'Energy & Utilities': ['energy', 'utility', 'power', 'electricity', 'water', 'gas', 'renewable', 'solar']
  };
  
  // Score each industry based on keyword matches
  const scores = {};
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    scores[industry] = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = (combinedText.match(regex) || []).length;
      scores[industry] += matches;
    }
  }
  
  // Find the industry with the highest score
  let bestMatch = 'Other';
  let highestScore = 0;
  
  for (const [industry, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      bestMatch = industry;
    }
  }
  
  return highestScore > 0 ? bestMatch : 'Other';
}

/**
 * Extracts Jamaican-specific skills from job description
 * @param {string} description - Job description
 * @returns {Array} Array of identified skills
 */
export function extractJamaicanSkills(description) {
  if (!description) return [];
  
  const descriptionLower = description.toLowerCase();
  const extractedSkills = [];
  
  // Check for each Jamaican skill in the description
  for (const skill of jamaicanSkills) {
    if (descriptionLower.includes(skill.toLowerCase())) {
      extractedSkills.push(skill);
    }
  }
  
  // Look for common skill patterns
  const skillPatterns = [
    /proficient in\s+([^.,;]+)/gi,
    /experience with\s+([^.,;]+)/gi,
    /knowledge of\s+([^.,;]+)/gi,
    /skilled in\s+([^.,;]+)/gi,
    /expertise in\s+([^.,;]+)/gi
  ];
  
  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      if (match[1] && match[1].length > 3 && match[1].length < 50) {
        extractedSkills.push(match[1].trim());
      }
    }
  }
  
  // Remove duplicates and return
  return [...new Set(extractedSkills)];
}

/**
 * Normalizes a Jamaican location to a standard format
 * @param {string} location - Location string to normalize
 * @returns {string} Normalized location
 */
export function normalizeJamaicanLocation(location) {
  if (!location) return '';
  
  // Clean up the location string
  let normalized = location.trim();
  
  // Check for common abbreviations and expand them
  normalized = normalized
    .replace(/\bKgn\b/i, 'Kingston')
    .replace(/\bMoBay\b/i, 'Montego Bay')
    .replace(/\bSpan Town\b/i, 'Spanish Town')
    .replace(/\bSt\.\s*([A-Z])/gi, 'St. $1');
  
  // Check for parish mentions
  for (const parish of jamaicanParishes) {
    if (normalized.toLowerCase().includes(parish.toLowerCase())) {
      return parish;
    }
  }
  
  // Check for city mentions
  for (const city of jamaicanCities) {
    if (normalized.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }
  
  // If we can't normalize it, return the original with "Jamaica" appended
  if (!normalized.toLowerCase().includes('jamaica')) {
    normalized += ', Jamaica';
  }
  
  return normalized;
}

/**
 * Estimates salary range for a job based on title and industry
 * @param {string} title - Job title
 * @param {string} industry - Job industry
 * @returns {Object} Estimated salary range
 */
export function estimateJamaicanSalary(title, industry) {
  const titleLower = title.toLowerCase();
  
  // Base salary ranges by industry (in JMD, annual)
  const industrySalaries = {
    'Tourism & Hospitality': { min: 800000, max: 2500000 },
    'Agriculture & Farming': { min: 700000, max: 2000000 },
    'Banking & Finance': { min: 1200000, max: 5000000 },
    'Information Technology': { min: 1500000, max: 6000000 },
    'Telecommunications': { min: 1200000, max: 4000000 },
    'Manufacturing': { min: 800000, max: 3000000 },
    'Retail & Sales': { min: 700000, max: 2500000 },
    'Construction': { min: 900000, max: 4000000 },
    'Education': { min: 1000000, max: 3500000 },
    'Healthcare': { min: 1200000, max: 5000000 },
    'Mining & Resources': { min: 1000000, max: 4500000 },
    'Government & Public Service': { min: 1000000, max: 3000000 },
    'Shipping & Logistics': { min: 900000, max: 3500000 },
    'Business Process Outsourcing (BPO)': { min: 800000, max: 2500000 },
    'Creative Industries': { min: 800000, max: 3000000 },
    'Energy & Utilities': { min: 1000000, max: 4000000 },
    'Other': { min: 800000, max: 3000000 }
  };
  
  // Salary modifiers based on job level
  const levelModifiers = {
    'entry': 0.7,
    'junior': 0.8,
    'mid': 1.0,
    'senior': 1.5,
    'manager': 1.8,
    'director': 2.2,
    'executive': 3.0
  };
  
  // Determine job level from title
  let levelModifier = 1.0; // Default to mid-level
  
  for (const [level, modifier] of Object.entries(levelModifiers)) {
    if (titleLower.includes(level)) {
      levelModifier = modifier;
      break;
    }
  }
  
  // Special case for C-level positions
  if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo') || titleLower.includes('chief')) {
    levelModifier = 3.5;
  }
  
  // Get base salary for the industry
  const baseSalary = industrySalaries[industry] || industrySalaries['Other'];
  
  // Calculate estimated range
  return {
    min: Math.round(baseSalary.min * levelModifier),
    max: Math.round(baseSalary.max * levelModifier),
    currency: 'JMD'
  };
}
