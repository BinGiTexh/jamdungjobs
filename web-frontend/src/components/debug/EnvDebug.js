import React from 'react';

export const EnvDebug = () => {
  React.useEffect(() => {
    console.log('Environment Variables Debug:');
    console.log('REACT_APP_GOOGLE_MAPS_API_KEY:', process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
  }, []);

  return null;
};
