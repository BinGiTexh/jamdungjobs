/**
 * Search Helper Utilities
 * Provides consistent search behavior and UX patterns across the application
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for debounced search functionality
 * @param {Function} searchFunction - Function to call when search is triggered
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {Function} - Debounced search function
 */
export const useDebounceSearch = (searchFunction, delay = 300) => {
  const debounceRef = useRef();

  const debouncedSearch = useCallback((...args) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchFunction(...args);
    }, delay);
  }, [searchFunction, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return debouncedSearch;
};

/**
 * Custom hook for managing dropdown focus state properly
 * Fixes race conditions with blur/click events
 */
export const useDropdownFocus = () => {
  const dropdownRef = useRef();
  const inputRef = useRef();
  const blurTimeoutRef = useRef();

  const handleInputFocus = useCallback((onFocus) => {
    clearTimeout(blurTimeoutRef.current);
    if (onFocus) onFocus();
  }, []);

  const handleInputBlur = useCallback((onBlur) => {
    // Delay blur to allow clicks on dropdown items
    blurTimeoutRef.current = setTimeout(() => {
      // Check if focus moved to dropdown
      const activeElement = document.activeElement;
      const dropdownElement = dropdownRef.current;
      
      if (!dropdownElement?.contains(activeElement)) {
        if (onBlur) onBlur();
      }
    }, 150);
  }, []);

  const handleDropdownMouseDown = useCallback((e) => {
    // Prevent input blur when clicking dropdown
    e.preventDefault();
  }, []);

  const handleClickOutside = useCallback((onClickOutside) => {
    const handleClick = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        clearTimeout(blurTimeoutRef.current);
        if (onClickOutside) onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return {
    dropdownRef,
    inputRef,
    handleInputFocus,
    handleInputBlur,
    handleDropdownMouseDown,
    handleClickOutside
  };
};

/**
 * Keyboard navigation handler for dropdown suggestions
 * @param {Array} suggestions - Array of suggestion items
 * @param {number} selectedIndex - Currently selected suggestion index
 * @param {Function} setSelectedIndex - Function to update selected index
 * @param {Function} onSelect - Function called when item is selected
 * @param {Function} onEscape - Function called when escape is pressed
 */
export const useKeyboardNavigation = (
  suggestions,
  selectedIndex,
  setSelectedIndex,
  onSelect,
  onEscape
) => {
  const handleKeyDown = useCallback((e) => {
    if (!suggestions.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        if (onEscape) onEscape();
        break;
      
      default:
        break;
    }
  }, [suggestions, selectedIndex, setSelectedIndex, onSelect, onEscape]);

  return { handleKeyDown };
};

/**
 * Generates accessible ARIA attributes for search dropdowns
 * @param {string} inputId - ID of the search input
 * @param {string} listboxId - ID of the dropdown listbox
 * @param {boolean} expanded - Whether dropdown is expanded
 * @param {number} selectedIndex - Currently selected item index
 * @param {number} totalItems - Total number of items in dropdown
 */
export const getSearchAriaAttributes = (
  inputId,
  listboxId,
  expanded,
  selectedIndex,
  totalItems
) => {
  const inputAttributes = {
    'aria-autocomplete': 'list',
    'aria-controls': listboxId,
    'aria-expanded': expanded,
    'aria-activedescendant': selectedIndex >= 0 ? `${listboxId}-item-${selectedIndex}` : undefined,
    'role': 'combobox'
  };

  const listboxAttributes = {
    'id': listboxId,
    'role': 'listbox',
    'aria-label': `Search suggestions, ${totalItems} results available`
  };

  const getItemAttributes = (index) => ({
    'id': `${listboxId}-item-${index}`,
    'role': 'option',
    'aria-selected': index === selectedIndex
  });

  return {
    inputAttributes,
    listboxAttributes,
    getItemAttributes
  };
};

/**
 * Search performance optimization utilities
 */
export const searchUtils = {
  /**
   * Throttle function for search input
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Highlight matching text in search suggestions
   */
  highlightMatch: (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  /**
   * Filter and rank search suggestions
   */
  filterAndRankSuggestions: (suggestions, query, maxResults = 10) => {
    if (!query) return suggestions.slice(0, maxResults);
    
    const lowercaseQuery = query.toLowerCase();
    
    return suggestions
      .filter(item => 
        item.toLowerCase().includes(lowercaseQuery)
      )
      .sort((a, b) => {
        const aIndex = a.toLowerCase().indexOf(lowercaseQuery);
        const bIndex = b.toLowerCase().indexOf(lowercaseQuery);
        
        // Prioritize exact matches at start
        if (aIndex === 0 && bIndex !== 0) return -1;
        if (bIndex === 0 && aIndex !== 0) return 1;
        
        // Then by position of match
        return aIndex - bIndex;
      })
      .slice(0, maxResults);
  }
};