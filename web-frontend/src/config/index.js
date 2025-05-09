const environments = {
  development: {
    apiUrl: 'http://localhost:5000',
    apiGateway: false
  },
  staging: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api-staging.jamdungjobs.com',
    apiGateway: true
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.jamdungjobs.com',
    apiGateway: true
  }
};

const environment = process.env.REACT_APP_ENV || 'development';

export const config = {
  ...environments[environment],
  storageKeys: {
    authToken: 'jamdung_auth_token'
  }
};

// Helper function to build API URLs
export const buildApiUrl = (path) => {
  const baseUrl = config.apiUrl;
  // Remove any leading slashes from path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to build asset URLs (like logos)
export const buildAssetUrl = (path) => {
  if (!path) return '';
  const baseUrl = config.apiUrl;
  
  // If the path already contains 'uploads/', don't modify it
  if (path.includes('uploads/')) {
    return `${baseUrl}${path}`;
  }
  
  // Otherwise, ensure path starts with uploads/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/uploads/${cleanPath}`;
};
