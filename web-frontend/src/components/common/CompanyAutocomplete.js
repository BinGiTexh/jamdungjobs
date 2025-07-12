import React, { useState } from 'react';
import { FaBuilding } from 'react-icons/fa';
import { logDev, logError } from '../../utils/loggingUtils';
import { BaseAutocomplete } from './BaseAutocomplete';

export const CompanyAutocomplete = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanySuggestions = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.companies.map(company => ({
        id: company.id,
        name: company.name,
        logo: company.logo,
        location: company.location
      }));
    } catch (error) {
      logError('Error fetching company suggestions', error, {
        module: 'CompanyAutocomplete',
        function: 'fetchCompanySuggestions',
        query
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (input) => {
    onChange(input);
    if (input.length >= 2) {
      const results = await fetchCompanySuggestions(input);
      logDev('debug', 'Company suggestions fetched', {
        query: input,
        resultsCount: results.length
      });
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const renderSuggestion = (suggestion) => (
    <div className="flex items-center">
      {suggestion.logo && (
        <img
          src={suggestion.logo}
          alt={suggestion.name}
          className="w-8 h-8 rounded-full mr-3 object-cover"
        />
      )}
      <div>
        <div className="font-medium">{suggestion.name}</div>
        {suggestion.location && (
          <div className="text-sm text-gray-500">{suggestion.location}</div>
        )}
      </div>
    </div>
  );

  return (
    <BaseAutocomplete
      value={value}
      onChange={(suggestion) => onChange(suggestion.name)}
      onClear={() => onChange('')}
      onInputChange={(input) => {
        handleInputChange(input);
        if (input.length >= 2) {
          logDev('debug', 'Company search input changed', { 
            inputLength: input.length 
          });
        }
      }}
      placeholder="Company name"
      icon={FaBuilding}
      suggestions={suggestions}
      renderSuggestion={renderSuggestion}
      loading={loading}
    />
  );
};
