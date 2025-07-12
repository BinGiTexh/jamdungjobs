/* eslint-disable no-console */
// Test script to debug phone number input focus issue
// This script will help identify what's causing the focus loss after typing one character

import React, { useState, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';

export const PhoneInputTest = () => {
  const [phone, setPhone] = useState('');
  const [renderCount, setRenderCount] = useState(0);
  const inputRef = useRef(null);
  const [focusEvents, setFocusEvents] = useState([]);
  
  // Track render count
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`Component rendered ${renderCount + 1} times`);
  });
  
  // Track focus state
  useEffect(() => {
    if (inputRef.current) {
      const element = inputRef.current.querySelector('input');
      if (element) {
        console.log('Input element focus state:', document.activeElement === element);
      }
    }
  }, [phone]);
  
  const handleChange = (e) => {
    const value = e.target.value;
    console.log('onChange triggered:', { 
      oldValue: phone, 
      newValue: value,
      cursorPosition: e.target.selectionStart,
      isFocused: document.activeElement === e.target
    });
    setPhone(value);
  };
  
  const handleFocus = (e) => {
    const event = {
      type: 'focus',
      time: new Date().toISOString(),
      value: e.target.value
    };
    console.log('onFocus triggered:', event);
    setFocusEvents(prev => [...prev, event]);
  };
  
  const handleBlur = (e) => {
    const event = {
      type: 'blur',
      time: new Date().toISOString(),
      value: e.target.value,
      relatedTarget: e.relatedTarget?.tagName
    };
    console.log('onBlur triggered:', event);
    setFocusEvents(prev => [...prev, event]);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>Phone Input Focus Test</h2>
      <p>Render count: {renderCount}</p>
      <p>Current value: {phone}</p>
      
      <TextField
        ref={inputRef}
        label="Phone Number"
        value={phone}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        name="phone"
        type="tel"
        fullWidth
        variant="outlined"
        inputProps={{
          'data-testid': 'phone-input'
        }}
      />
      
      <div style={{ marginTop: '20px' }}>
        <h3>Focus Events Log:</h3>
        <pre>{JSON.stringify(focusEvents, null, 2)}</pre>
      </div>
    </div>
  );
};

// Debugging recommendations:
console.log(`
=== PHONE INPUT FOCUS ISSUE DEBUGGING ===

1. Check if the component is re-rendering after each character:
   - Monitor the render count
   - Check if parent components are causing re-renders

2. Look for these common causes:
   - Form state being recreated on each render
   - Key prop changing on the input
   - Parent component re-mounting
   - Conflicting event handlers
   - CSS transitions causing layout shifts

3. Test these scenarios:
   - Type slowly vs quickly
   - Use Tab to focus vs clicking
   - Try with autoComplete="off"
   - Check if other inputs have the same issue

4. Potential fixes to test:
   - Use uncontrolled component with defaultValue
   - Add key prop to TextField
   - Memoize the component
   - Check for CSS pointer-events issues
`);
