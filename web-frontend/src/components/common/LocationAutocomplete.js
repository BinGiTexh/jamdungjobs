import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

export const LocationAutocomplete = ({ value, onChange, placeholder = "Location" }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check if script is already loaded
    if (window.google?.maps?.places) {
      console.log('Google Maps already loaded');
      setScriptLoaded(true);
      initAutocomplete();
      return;
    }

    // Load Google Places API script
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      console.log('Script tag exists, waiting for load');
      return;
    }

    console.log('Creating new script tag');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    console.log('API Key status:', apiKey ? 'Present' : 'Missing');
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      console.log('If you see "This API project is not authorized to use this API", please enable the Places API in the Google Cloud Console.');
    };
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      setScriptLoaded(true);
      initAutocomplete();
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount as other components might need it
    };
  }, []);

  const initAutocomplete = () => {
    console.log('Initializing autocomplete service');
    try {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
      console.log('Autocomplete service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize autocomplete service:', error);
    }
  };

  const debouncedPredictions = useCallback(
    (() => {
      let timeoutId;
      return (input) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        return new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            if (!autocompleteRef.current) {
              console.error('Autocomplete service not initialized');
              resolve([]);
              return;
            }

            console.log('Requesting predictions for:', input);
            try {
              autocompleteRef.current.getPlacePredictions(
                {
                  input,
                  types: ['(cities)'],
                  componentRestrictions: { country: 'us' }
                },
                (predictions, status) => {
                  resolve({ predictions, status });
                }
              );
            } catch (error) {
              console.error('Error getting predictions:', error);
              resolve({ predictions: [], status: 'ERROR' });
            }
          }, 300); // 300ms delay
        });
      };
    })(),
    []
  );

  const handleInput = async (e) => {
    const input = e.target.value;
    onChange(input);

    if (input.length >= 2) {
      const { predictions, status } = await debouncedPredictions(input);
      handleAutocompleteResults(predictions, status);
    } else {
      setSuggestions([]);
    }
  };

  const handleAutocompleteResults = (predictions, status) => {
    console.log('Got autocomplete results:', { status, predictionsCount: predictions?.length });
    
    // Check for specific API activation error
    if (status === 'REQUEST_DENIED') {
      console.error('Google Places API request was denied. Please check if the Places API is enabled in your Google Cloud Console.');
      console.log('Steps to enable the API:');
      console.log('1. Go to https://console.cloud.google.com');
      console.log('2. Select your project');
      console.log('3. Go to "APIs & Services" > "Library"');
      console.log('4. Search for "Places API"');
      console.log('5. Click "Enable"');
      return;
    }

    try {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const mappedSuggestions = predictions.map(p => ({
          id: p.place_id,
          description: p.description,
          mainText: p.structured_formatting.main_text,
          secondaryText: p.structured_formatting.secondary_text
        }));
        console.log('Mapped suggestions:', mappedSuggestions);
        setSuggestions(mappedSuggestions);
        setShowSuggestions(true);
      } else {
        console.log('No valid predictions received, status:', status);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error processing predictions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.mainText);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{suggestion.mainText}</div>
              <div className="text-sm text-gray-500">{suggestion.secondaryText}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
