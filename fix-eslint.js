#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files with known issues and their fixes
const fixes = [
  // Remove unused imports
  {
    file: 'web-frontend/src/components/candidate/AboutMeCard.js',
    replacements: [
      { from: "  CircularProgress,", to: "" },
      { from: "  Alert,", to: "" }
    ]
  },
  {
    file: 'web-frontend/src/components/employer/EmployerDashboard.js',
    replacements: [
      { from: "  Tooltip,", to: "" },
      { from: "import CheckCircleIcon from '@mui/icons-material/CheckCircle';", to: "" },
      { from: "import CancelIcon from '@mui/icons-material/Cancel';", to: "" },
      { from: "import PersonIcon from '@mui/icons-material/Person';", to: "" }
    ]
  },
  {
    file: 'web-frontend/src/components/dashboard/ProfileCompletionWidget.js',
    replacements: [
      { from: "  Box,", to: "" }
    ]
  },
  {
    file: 'web-frontend/src/components/onboarding/OnboardingTour.js',
    replacements: [
      { from: "import React, { useState, useEffect } from 'react';", to: "import React, { useState } from 'react';" }
    ]
  },
  {
    file: 'web-frontend/src/components/onboarding/ProfileCompletionPrompt.js',
    replacements: [
      { from: "import React, { useState, useEffect } from 'react';", to: "import React, { useState } from 'react';" }
    ]
  }
];

// Fix theme parameter issues
const themeParamFixes = [
  {
    file: 'web-frontend/src/components/employer/EmployerDashboard.js',
    replacements: [
      { from: "({ theme }) => ({", to: "({ _theme }) => ({" }
    ]
  },
  {
    file: 'web-frontend/src/components/dashboard/ProfileCompletionWidget.js',
    replacements: [
      { from: "({ theme }) => ({", to: "({ _theme }) => ({" }
    ]
  }
];

function applyFixes() {
  console.log('🔧 Starting ESLint fixes...');
  
  [...fixes, ...themeParamFixes].forEach(({ file, replacements }) => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(from, to);
        changed = true;
        console.log(`✅ Fixed in ${file}: ${from.substring(0, 50)}...`);
      }
    });
    
    if (changed) {
      // Clean up any double empty lines
      content = content.replace(/\n\n\n+/g, '\n\n');
      fs.writeFileSync(filePath, content);
    }
  });
  
  console.log('✅ ESLint fixes completed!');
}

applyFixes();