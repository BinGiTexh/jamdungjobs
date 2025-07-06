// Jamaica GDP Industry Growth Data - Q1 2025
// Source: Statistical Institute of Jamaica

export const industryGrowthData = {
  "information_communication": {
    id: "information_communication",
    name: "Information & Communication",
    shortName: "Tech & Telecom",
    growth: 6.4,
    trend: "up",
    priority: "hot",
    description: "Technology, software development, telecommunications, and digital services",
    icon: "computer",
    jobTypes: ["Software Developer", "IT Support", "Digital Marketing", "Data Analyst", "Cybersecurity Specialist"],
    averageSalary: { min: 80000, max: 200000, currency: "JMD" },
    color: "#ff6b35",
    bgColor: "linear-gradient(45deg, #ff6b35, #f7931e)"
  },
  "agriculture_forestry_fishing": {
    id: "agriculture_forestry_fishing",
    name: "Agriculture, Forestry & Fishing",
    shortName: "Agriculture",
    growth: 3.1,
    trend: "up",
    priority: "growing",
    description: "Sustainable farming, agricultural technology, and food production",
    icon: "agriculture",
    jobTypes: ["Agricultural Engineer", "Farm Manager", "Food Scientist", "Sustainability Specialist"],
    averageSalary: { min: 45000, max: 120000, currency: "JMD" },
    color: "#28a745",
    bgColor: "linear-gradient(45deg, #28a745, #20c997)"
  },
  "goods_producing": {
    id: "goods_producing",
    name: "Goods Producing Industries",
    shortName: "Manufacturing",
    growth: 2.0,
    trend: "up",
    priority: "growing",
    description: "Manufacturing, production, and industrial goods",
    icon: "factory",
    jobTypes: ["Production Manager", "Quality Control", "Industrial Engineer", "Machine Operator"],
    averageSalary: { min: 50000, max: 140000, currency: "JMD" },
    color: "#28a745",
    bgColor: "linear-gradient(45deg, #28a745, #20c997)"
  },
  "transportation_storage": {
    id: "transportation_storage",
    name: "Transportation & Storage",
    shortName: "Logistics",
    growth: 1.9,
    trend: "up",
    priority: "growing",
    description: "Logistics, shipping, warehousing, and transportation services",
    icon: "local_shipping",
    jobTypes: ["Logistics Coordinator", "Warehouse Manager", "Driver", "Supply Chain Analyst"],
    averageSalary: { min: 40000, max: 110000, currency: "JMD" },
    color: "#28a745",
    bgColor: "linear-gradient(45deg, #28a745, #20c997)"
  },
  "manufacturing": {
    id: "manufacturing",
    name: "Manufacturing",
    shortName: "Manufacturing",
    growth: 1.7,
    trend: "up",
    priority: "growing",
    description: "Industrial manufacturing and production processes",
    icon: "precision_manufacturing",
    jobTypes: ["Manufacturing Engineer", "Plant Manager", "Quality Assurance", "Maintenance Technician"],
    averageSalary: { min: 55000, max: 150000, currency: "JMD" },
    color: "#28a745",
    bgColor: "linear-gradient(45deg, #28a745, #20c997)"
  },
  "construction": {
    id: "construction",
    name: "Construction",
    shortName: "Construction",
    growth: 1.4,
    trend: "up",
    priority: "stable",
    description: "Building construction, infrastructure, and real estate development",
    icon: "construction",
    jobTypes: ["Project Manager", "Civil Engineer", "Architect", "Construction Worker"],
    averageSalary: { min: 45000, max: 130000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "public_administration": {
    id: "public_administration",
    name: "Public Administration & Defence",
    shortName: "Government",
    growth: 1.3,
    trend: "up",
    priority: "stable",
    description: "Government services, public sector, and defense",
    icon: "account_balance",
    jobTypes: ["Civil Servant", "Policy Analyst", "Administrative Officer", "Security Personnel"],
    averageSalary: { min: 50000, max: 120000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "accommodation_food": {
    id: "accommodation_food",
    name: "Accommodation & Food Service",
    shortName: "Hospitality",
    growth: 1.2,
    trend: "up",
    priority: "stable",
    description: "Tourism, hotels, restaurants, and hospitality services",
    icon: "hotel",
    jobTypes: ["Hotel Manager", "Chef", "Tour Guide", "Restaurant Server"],
    averageSalary: { min: 35000, max: 100000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "financial_insurance": {
    id: "financial_insurance",
    name: "Financial & Insurance",
    shortName: "Finance",
    growth: 1.2,
    trend: "up",
    priority: "stable",
    description: "Banking, insurance, financial services, and fintech",
    icon: "account_balance_wallet",
    jobTypes: ["Financial Analyst", "Bank Teller", "Insurance Agent", "Investment Advisor"],
    averageSalary: { min: 60000, max: 180000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "utilities": {
    id: "utilities",
    name: "Electricity, Water Supply & Waste",
    shortName: "Utilities",
    growth: 1.1,
    trend: "up",
    priority: "stable",
    description: "Power generation, water services, and waste management",
    icon: "power",
    jobTypes: ["Electrical Engineer", "Water Treatment Operator", "Utility Technician", "Environmental Specialist"],
    averageSalary: { min: 50000, max: 140000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "other_services": {
    id: "other_services",
    name: "Other Services",
    shortName: "Services",
    growth: 1.0,
    trend: "up",
    priority: "stable",
    description: "Professional services, consulting, and other business services",
    icon: "business_center",
    jobTypes: ["Consultant", "Legal Assistant", "Marketing Specialist", "Customer Service"],
    averageSalary: { min: 40000, max: 120000, currency: "JMD" },
    color: "#007bff",
    bgColor: "linear-gradient(45deg, #007bff, #6610f2)"
  },
  "real_estate_business": {
    id: "real_estate_business",
    name: "Real Estate & Business Services",
    shortName: "Real Estate",
    growth: -0.4,
    trend: "down",
    priority: "declining",
    description: "Real estate, property management, and business services",
    icon: "home_work",
    jobTypes: ["Real Estate Agent", "Property Manager", "Business Analyst", "Office Administrator"],
    averageSalary: { min: 45000, max: 130000, currency: "JMD" },
    color: "#6c757d",
    bgColor: "linear-gradient(45deg, #6c757d, #495057)"
  },
  "wholesale_retail": {
    id: "wholesale_retail",
    name: "Wholesale & Retail Trade",
    shortName: "Retail",
    growth: -0.8,
    trend: "down",
    priority: "declining",
    description: "Retail stores, wholesale distribution, and trade",
    icon: "storefront",
    jobTypes: ["Sales Associate", "Store Manager", "Merchandiser", "Inventory Specialist"],
    averageSalary: { min: 30000, max: 90000, currency: "JMD" },
    color: "#6c757d",
    bgColor: "linear-gradient(45deg, #6c757d, #495057)"
  }
};

// Helper functions
export const getIndustriesByPriority = (priority) => {
  return Object.values(industryGrowthData).filter(industry => industry.priority === priority);
};

export const getGrowingIndustries = () => {
  return Object.values(industryGrowthData)
    .filter(industry => industry.growth > 0)
    .sort((a, b) => b.growth - a.growth);
};

export const getHotIndustries = () => {
  return getIndustriesByPriority('hot');
};

export const getIndustryById = (id) => {
  return industryGrowthData[id];
};

export const formatGrowthRate = (rate) => {
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
};

export const getGrowthIcon = (priority) => {
  switch (priority) {
    case 'hot':
      return '🔥';
    case 'growing':
      return '📈';
    case 'stable':
      return '➡️';
    case 'declining':
      return '📉';
    default:
      return '➡️';
  }
};

export const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'hot':
      return 'Hot Industry';
    case 'growing':
      return 'Growing';
    case 'stable':
      return 'Stable';
    case 'declining':
      return 'Declining';
    default:
      return 'Stable';
  }
};

export default industryGrowthData;
