import React, { useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';
import { BaseAutocomplete } from './BaseAutocomplete';

const salaryRanges = [
  { id: '0-50', min: 0, max: 50000, label: 'Up to $50,000' },
  { id: '50-75', min: 50000, max: 75000, label: '$50,000 - $75,000' },
  { id: '75-100', min: 75000, max: 100000, label: '$75,000 - $100,000' },
  { id: '100-150', min: 100000, max: 150000, label: '$100,000 - $150,000' },
  { id: '150-200', min: 150000, max: 200000, label: '$150,000 - $200,000' },
  { id: '200+', min: 200000, max: null, label: '$200,000+' }
];

export const SalaryRangeAutocomplete = ({ value, onChange, type = 'min' }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (input) => {
    onChange(input);
    const filtered = salaryRanges.filter(range => 
      range.label.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const renderSuggestion = (suggestion) => (
    <div className="font-medium">{suggestion.label}</div>
  );

  const formatValue = (val) => {
    if (!val) return '';
    return typeof val === 'number' 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)
      : val;
  };

  return (
    <BaseAutocomplete
      value={formatValue(value)}
      onChange={(suggestion) => onChange(type === 'min' ? suggestion.min : suggestion.max)}
      onClear={() => onChange('')}
      onInputChange={handleInputChange}
      placeholder={`${type === 'min' ? 'Minimum' : 'Maximum'} salary`}
      icon={FaDollarSign}
      suggestions={suggestions}
      renderSuggestion={renderSuggestion}
    />
  );
};
