/**
 * Comprehensive list of Jamaican locations including parishes, major cities, towns, and neighborhoods
 */

export const jamaicaParishes = [
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

export const jamaicaLocations = [
  // Kingston & St. Andrew
  { name: 'Kingston', parish: 'Kingston', type: 'city', isCapital: true },
  { name: 'Half Way Tree', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'New Kingston', parish: 'St. Andrew', type: 'business district' },
  { name: 'Liguanea', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Constant Spring', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Papine', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Mona', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Harbour View', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Bull Bay', parish: 'St. Andrew', type: 'town' },
  { name: 'Irish Town', parish: 'St. Andrew', type: 'town' },
  { name: 'Gordon Town', parish: 'St. Andrew', type: 'town' },
  { name: 'Jack\'s Hill', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Stony Hill', parish: 'St. Andrew', type: 'town' },
  { name: 'Mavis Bank', parish: 'St. Andrew', type: 'town' },
  { name: 'Beverly Hills', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Cherry Gardens', parish: 'St. Andrew', type: 'neighborhood' },
  { name: 'Norbrook', parish: 'St. Andrew', type: 'neighborhood' },
  
  // St. Catherine
  { name: 'Spanish Town', parish: 'St. Catherine', type: 'city', isFormerCapital: true },
  { name: 'Portmore', parish: 'St. Catherine', type: 'city' },
  { name: 'Old Harbour', parish: 'St. Catherine', type: 'town' },
  { name: 'Linstead', parish: 'St. Catherine', type: 'town' },
  { name: 'Ewarton', parish: 'St. Catherine', type: 'town' },
  { name: 'Bog Walk', parish: 'St. Catherine', type: 'town' },
  { name: 'Hellshire', parish: 'St. Catherine', type: 'neighborhood' },
  { name: 'Sligoville', parish: 'St. Catherine', type: 'town' },
  { name: 'Gregory Park', parish: 'St. Catherine', type: 'neighborhood' },
  { name: 'Caymanas', parish: 'St. Catherine', type: 'neighborhood' },
  
  // Clarendon
  { name: 'May Pen', parish: 'Clarendon', type: 'city' },
  { name: 'Chapelton', parish: 'Clarendon', type: 'town' },
  { name: 'Lionel Town', parish: 'Clarendon', type: 'town' },
  { name: 'Spaldings', parish: 'Clarendon', type: 'town' },
  { name: 'Frankfield', parish: 'Clarendon', type: 'town' },
  { name: 'Hayes', parish: 'Clarendon', type: 'town' },
  { name: 'Rocky Point', parish: 'Clarendon', type: 'town' },
  
  // Manchester
  { name: 'Mandeville', parish: 'Manchester', type: 'city' },
  { name: 'Christiana', parish: 'Manchester', type: 'town' },
  { name: 'Porus', parish: 'Manchester', type: 'town' },
  { name: 'Newport', parish: 'Manchester', type: 'town' },
  { name: 'Mile Gully', parish: 'Manchester', type: 'town' },
  
  // St. Elizabeth
  { name: 'Black River', parish: 'St. Elizabeth', type: 'town' },
  { name: 'Santa Cruz', parish: 'St. Elizabeth', type: 'town' },
  { name: 'Junction', parish: 'St. Elizabeth', type: 'town' },
  { name: 'Malvern', parish: 'St. Elizabeth', type: 'town' },
  { name: 'Balaclava', parish: 'St. Elizabeth', type: 'town' },
  { name: 'Treasure Beach', parish: 'St. Elizabeth', type: 'town' },
  
  // Westmoreland
  { name: 'Savanna-la-Mar', parish: 'Westmoreland', type: 'town' },
  { name: 'Negril', parish: 'Westmoreland', type: 'town' },
  { name: 'Whitehouse', parish: 'Westmoreland', type: 'town' },
  { name: 'Bluefields', parish: 'Westmoreland', type: 'town' },
  { name: 'Petersfield', parish: 'Westmoreland', type: 'town' },
  
  // Hanover
  { name: 'Lucea', parish: 'Hanover', type: 'town' },
  { name: 'Green Island', parish: 'Hanover', type: 'town' },
  { name: 'Hopewell', parish: 'Hanover', type: 'town' },
  { name: 'Sandy Bay', parish: 'Hanover', type: 'town' },
  
  // St. James
  { name: 'Montego Bay', parish: 'St. James', type: 'city' },
  { name: 'Rose Hall', parish: 'St. James', type: 'neighborhood' },
  { name: 'Ironshore', parish: 'St. James', type: 'neighborhood' },
  { name: 'Anchovy', parish: 'St. James', type: 'town' },
  { name: 'Cambridge', parish: 'St. James', type: 'town' },
  { name: 'Adelphi', parish: 'St. James', type: 'town' },
  
  // Trelawny
  { name: 'Falmouth', parish: 'Trelawny', type: 'town' },
  { name: 'Duncans', parish: 'Trelawny', type: 'town' },
  { name: 'Clark\'s Town', parish: 'Trelawny', type: 'town' },
  { name: 'Albert Town', parish: 'Trelawny', type: 'town' },
  { name: 'Rio Bueno', parish: 'Trelawny', type: 'town' },
  
  // St. Ann
  { name: 'St. Ann\'s Bay', parish: 'St. Ann', type: 'town' },
  { name: 'Ocho Rios', parish: 'St. Ann', type: 'town' },
  { name: 'Brown\'s Town', parish: 'St. Ann', type: 'town' },
  { name: 'Runaway Bay', parish: 'St. Ann', type: 'town' },
  { name: 'Discovery Bay', parish: 'St. Ann', type: 'town' },
  { name: 'Moneague', parish: 'St. Ann', type: 'town' },
  { name: 'Claremont', parish: 'St. Ann', type: 'town' },
  
  // St. Mary
  { name: 'Port Maria', parish: 'St. Mary', type: 'town' },
  { name: 'Annotto Bay', parish: 'St. Mary', type: 'town' },
  { name: 'Highgate', parish: 'St. Mary', type: 'town' },
  { name: 'Oracabessa', parish: 'St. Mary', type: 'town' },
  { name: 'Gayle', parish: 'St. Mary', type: 'town' },
  { name: 'Richmond', parish: 'St. Mary', type: 'town' },
  
  // Portland
  { name: 'Port Antonio', parish: 'Portland', type: 'town' },
  { name: 'Buff Bay', parish: 'Portland', type: 'town' },
  { name: 'Hope Bay', parish: 'Portland', type: 'town' },
  { name: 'Manchioneal', parish: 'Portland', type: 'town' },
  { name: 'Boston', parish: 'Portland', type: 'town' },
  
  // St. Thomas
  { name: 'Morant Bay', parish: 'St. Thomas', type: 'town' },
  { name: 'Yallahs', parish: 'St. Thomas', type: 'town' },
  { name: 'Bath', parish: 'St. Thomas', type: 'town' },
  { name: 'Golden Grove', parish: 'St. Thomas', type: 'town' },
  { name: 'Seaforth', parish: 'St. Thomas', type: 'town' }
];

/**
 * Get formatted location string with parish
 * @param {string} name - Location name
 * @returns {string} - Formatted location string
 */
export const getFormattedLocation = (name) => {
  const location = jamaicaLocations.find(loc => loc.name === name);
  if (!location) return name;
  return `${location.name}, ${location.parish}, Jamaica`;
};

/**
 * Search for locations by name
 * @param {string} query - Search query
 * @returns {Array} - Matching locations
 */
export const searchLocations = (query) => {
  if (!query || query.length < 2) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return jamaicaLocations
    .filter(location => 
      location.name.toLowerCase().includes(lowercaseQuery) || 
      location.parish.toLowerCase().includes(lowercaseQuery)
    )
    .map(location => ({
      mainText: location.name,
      secondaryText: `${location.parish}, Jamaica`,
      placeId: `jamaica-${location.parish.toLowerCase().replace(/\s+/g, '-')}-${location.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: location.name,
      parish: location.parish,
      type: location.type,
      formattedAddress: getFormattedLocation(location.name)
    }));
};
