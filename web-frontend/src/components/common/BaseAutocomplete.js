import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

export const BaseAutocomplete = ({
  value,
  onChange,
  onClear,
  placeholder,
  icon: Icon,
  suggestions,
  onInputChange,
  renderSuggestion,
  loading = false,
  clearable = true,
  className = "",
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile-friendly touch handlers
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const suggestionsList = suggestionsRef.current;
    
    if (suggestionsList) {
      const scrollTop = suggestionsList.scrollTop;
      const scrollHeight = suggestionsList.scrollHeight;
      const clientHeight = suggestionsList.clientHeight;
      
      // Allow scrolling within suggestions
      if (
        (scrollTop === 0 && touchY > touchStartY) || // At top and pulling down
        (scrollTop + clientHeight >= scrollHeight && touchY < touchStartY) // At bottom and pulling up
      ) {
        e.preventDefault();
      }
    }
  };

  const handleFocus = () => {
    if (suggestions?.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e) => {
    onInputChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" />}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
            ${Icon ? 'pl-10' : 'pl-4'} ${clearable && value ? 'pr-10' : 'pr-4'}`}
        />
        {clearable && value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions?.length > 0 && (
        <div
          ref={suggestionsRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="absolute z-[55] w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto
            overscroll-contain touch-pan-y"
        >
          {loading ? (
            <div className="px-4 py-3 text-gray-500 text-center">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                onClick={() => {
                  onChange(suggestion);
                  setShowSuggestions(false);
                }}
                className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200 cursor-pointer
                  transition-colors duration-150 ease-in-out"
              >
                {renderSuggestion(suggestion)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
