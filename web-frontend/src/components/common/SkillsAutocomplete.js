import React, { useState } from 'react';
import { FaCode } from 'react-icons/fa';
import { BaseAutocomplete } from './BaseAutocomplete';

// Common tech skills and frameworks
const commonSkills = [
  // Programming Languages
  'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go',
  // Frontend
  'React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'TypeScript', 'Next.js', 'Gatsby',
  // Backend
  'Node.js', 'Django', 'Ruby on Rails', 'Spring Boot', 'Express.js', 'FastAPI',
  // Database
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI',
  // Mobile
  'React Native', 'Flutter', 'iOS', 'Android',
  // Other
  'Git', 'REST API', 'GraphQL', 'Machine Learning', 'AI', 'Data Science',
  // Soft Skills
  'Project Management', 'Team Leadership', 'Agile', 'Scrum', 'Communication'
].map(skill => ({ id: skill.toLowerCase(), name: skill }));

export const SkillsAutocomplete = ({ value, onChange, selectedSkills = [] }) => {
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (input) => {
    onChange(input);
    if (input.length >= 2) {
      const filtered = commonSkills.filter(skill =>
        skill.name.toLowerCase().includes(input.toLowerCase()) &&
        !selectedSkills.includes(skill.name)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const renderSuggestion = (suggestion) => (
    <div className="font-medium">{suggestion.name}</div>
  );

  return (
    <BaseAutocomplete
      value={value}
      onChange={(suggestion) => onChange(suggestion.name)}
      onClear={() => onChange('')}
      onInputChange={handleInputChange}
      placeholder="Add a skill"
      icon={FaCode}
      suggestions={suggestions}
      renderSuggestion={renderSuggestion}
    />
  );
};
