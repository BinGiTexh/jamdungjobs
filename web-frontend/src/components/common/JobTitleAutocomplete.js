import React, { useState, useEffect } from 'react';
import { FaBriefcase } from 'react-icons/fa';
import { BaseAutocomplete } from './BaseAutocomplete';

// Common job titles and roles
const commonJobTitles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'UI Designer',
  'Content Writer',
  'Account Manager',
  'HR Manager',
  'Financial Analyst',
  'Operations Manager',
  'Customer Success Manager'
].map(title => ({ id: title.toLowerCase(), title }));

export const JobTitleAutocomplete = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (input) => {
    onChange(input);
    if (input.length >= 2) {
      const filtered = commonJobTitles.filter(item =>
        item.title.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const renderSuggestion = (suggestion) => (
    <div>
      <div className="font-medium">{suggestion.title}</div>
    </div>
  );

  return (
    <BaseAutocomplete
      value={value}
      onChange={(suggestion) => onChange(suggestion.title)}
      onClear={() => onChange('')}
      onInputChange={handleInputChange}
      placeholder="Job title or keyword"
      icon={FaBriefcase}
      suggestions={suggestions}
      renderSuggestion={renderSuggestion}
    />
  );
};
