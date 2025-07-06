/**
 * Distance calculation utilities for GPS-based job search
 * Handles geolocation and distance calculations in Jamaica
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  
  if (distance < 10) {
    return `${distance}km away`;
  }
  
  return `${Math.round(distance)}km away`;
};

/**
 * Get distance radius options for filtering
 * @returns {Array} Array of radius options
 */
export const getRadiusOptions = () => [
  { value: 5, label: '5km radius' },
  { value: 10, label: '10km radius' },
  { value: 25, label: '25km radius' },
  { value: 50, label: '50km radius' },
  { value: 100, label: 'Anywhere in Jamaica' }
];

/**
 * Check if a job is within the specified radius
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @param {Object} jobLocation - Job's coordinates {lat, lng}
 * @param {number} radius - Search radius in kilometers
 * @returns {boolean} Whether job is within radius
 */
export const isWithinRadius = (userLocation, jobLocation, radius) => {
  if (!userLocation || !jobLocation) return false;
  
  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    jobLocation.lat,
    jobLocation.lng
  );
  
  return distance <= radius;
};

/**
 * Sort jobs by distance from user location
 * @param {Array} jobs - Array of job objects with location data
 * @param {Object} userLocation - User's coordinates {lat, lng}
 * @returns {Array} Jobs sorted by distance (closest first)
 */
export const sortJobsByDistance = (jobs, userLocation) => {
  if (!userLocation || !jobs.length) return jobs;
  
  return jobs
    .map(job => ({
      ...job,
      distance: job.location ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        job.location.lat,
        job.location.lng
      ) : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Get approximate coordinates for Jamaican parishes (for demo purposes)
 * In production, this would come from a proper geocoding service
 */
export const getParishCoordinates = () => ({
  'Kingston': { lat: 17.9970, lng: -76.7936 },
  'St. Andrew': { lat: 18.0179, lng: -76.8099 },
  'St. Thomas': { lat: 17.9058, lng: -76.3619 },
  'Portland': { lat: 18.1745, lng: -76.4591 },
  'St. Mary': { lat: 18.3745, lng: -76.9693 },
  'St. Ann': { lat: 18.4347, lng: -77.1969 },
  'Trelawny': { lat: 18.3487, lng: -77.6040 },
  'St. James': { lat: 18.4762, lng: -77.9189 },
  'Hanover': { lat: 18.4204, lng: -78.1305 },
  'Westmoreland': { lat: 18.3070, lng: -78.1421 },
  'St. Elizabeth': { lat: 17.9058, lng: -77.7539 },
  'Manchester': { lat: 18.0456, lng: -77.5114 },
  'Clarendon': { lat: 17.8648, lng: -77.2370 },
  'St. Catherine': { lat: 17.9712, lng: -76.9525 }
});

/**
 * Get major towns/cities for each parish
 */
export const getParishTowns = () => ({
  'Kingston': ['Downtown Kingston', 'New Kingston', 'Half Way Tree', 'Cross Roads'],
  'St. Andrew': ['Half Way Tree', 'Liguanea', 'Papine', 'Constant Spring'],
  'St. Thomas': ['Morant Bay', 'Port Morant', 'Yallahs', 'Bath'],
  'Portland': ['Port Antonio', 'Buff Bay', 'Hope Bay', 'Boston Bay'],
  'St. Mary': ['Port Maria', 'Oracabessa', 'Annotto Bay', 'Highgate'],
  'St. Ann': ['Ocho Rios', 'St. Ann\'s Bay', 'Brown\'s Town', 'Runaway Bay'],
  'Trelawny': ['Falmouth', 'Martha Brae', 'Clark\'s Town', 'Duncans'],
  'St. James': ['Montego Bay', 'Rose Hall', 'Ironshore', 'Cambridge'],
  'Hanover': ['Lucea', 'Green Island', 'Sandy Bay', 'Hopewell'],
  'Westmoreland': ['Savanna-la-Mar', 'Negril', 'Little London', 'Bluefields'],
  'St. Elizabeth': ['Black River', 'Santa Cruz', 'Junction', 'Treasure Beach'],
  'Manchester': ['Mandeville', 'Christiana', 'Porus', 'Mile Gully'],
  'Clarendon': ['May Pen', 'Spanish Town', 'Lionel Town', 'Chapelton'],
  'St. Catherine': ['Spanish Town', 'Portmore', 'Old Harbour', 'Linstead']
});

export default {
  calculateDistance,
  formatDistance,
  getRadiusOptions,
  isWithinRadius,
  sortJobsByDistance,
  getParishCoordinates,
  getParishTowns
};
