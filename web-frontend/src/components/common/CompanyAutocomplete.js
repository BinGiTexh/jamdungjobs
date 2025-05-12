import React, { useState, useEffect } from 'react';
import { FaBuilding } from 'react-icons/fa';
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
        id: company._id,
        name: company.name,
        logo: company.logo,
        location: company.location
      }));
    } catch (error) {
      console.error('Error fetching company suggestions:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (input) => {
    onChange(input);
    if (input.length >= 2) {
      const results = await fetchCompanySuggestions(input);
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
      onInputChange={handleInputChange}
      placeholder="Company name"
      icon={FaBuilding}
      suggestions={suggestions}
      renderSuggestion={renderSuggestion}
      loading={loading}
    />
  );
};
