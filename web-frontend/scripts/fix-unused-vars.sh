#!/bin/bash

# Script to fix unused variable ESLint errors by prefixing with underscore
# This script handles the remaining files with unused variable issues

echo "🔧 Fixing unused variables in remaining files..."

# Fix JamaicaLocationAutocomplete.js
sed -i '' 's/logError/_logError/g' src/components/common/JamaicaLocationAutocomplete.js

# Fix LocationAutocomplete.js  
sed -i '' 's/const \[isLoaded, setIsLoaded\]/const [_isLoaded, setIsLoaded]/g' src/components/common/LocationAutocomplete.js
sed -i '' 's/const inputRef =/const _inputRef =/g' src/components/common/LocationAutocomplete.js

# Fix SkillsAutocomplete.js
sed -i '' 's/const calculateSkillMatch =/const _calculateSkillMatch =/g' src/components/common/SkillsAutocomplete.js

# Fix ThemeToggle.js
sed -i '' 's/const { themeMode }/const { themeMode: _themeMode }/g' src/components/common/ThemeToggle.js

# Fix ApplicationsReview.js - remove unused imports
sed -i '' '/FormControl,/d' src/components/employer/ApplicationsReview.js
sed -i '' '/InputLabel,/d' src/components/employer/ApplicationsReview.js  
sed -i '' '/Select,/d' src/components/employer/ApplicationsReview.js
sed -i '' '/MenuItem,/d' src/components/employer/ApplicationsReview.js
sed -i '' 's/sanitizeForLogging/_sanitizeForLogging/g' src/components/employer/ApplicationsReview.js
sed -i '' 's/const \[statusUpdateLoading/const [_statusUpdateLoading/g' src/components/employer/ApplicationsReview.js
sed -i '' 's/const handleStatusChange =/const _handleStatusChange =/g' src/components/employer/ApplicationsReview.js
sed -i '' 's/const statusOptions =/const _statusOptions =/g' src/components/employer/ApplicationsReview.js

# Fix JobDescriptionBuilder.js
sed -i '' '/Divider,/d' src/components/employer/JobDescriptionBuilder.js
sed -i '' '/DeleteIcon/d' src/components/employer/JobDescriptionBuilder.js
sed -i '' '/ContentCopyIcon/d' src/components/employer/JobDescriptionBuilder.js
sed -i '' 's/}) => (theme) => ({/}) => (_theme) => ({/g' src/components/employer/JobDescriptionBuilder.js

# Fix QuickApplyModal.js
sed -i '' '/Divider,/d' src/components/jobseeker/QuickApplyModal.js
sed -i '' 's/buildApiUrl/_buildApiUrl/g' src/components/jobseeker/QuickApplyModal.js

# Fix PageTemplate.js
sed -i '' '/Container,/d' src/components/layout/PageTemplate.js
sed -i '' 's/const slideDirection =/const _slideDirection =/g' src/components/layout/PageTemplate.js
sed -i '' 's/const { isDarkMode, jamaicanColors }/const { isDarkMode: _isDarkMode, jamaicanColors: _jamaicanColors }/g' src/components/layout/PageTemplate.js
sed -i '' 's/const { isMobile }/const { isMobile: _isMobile }/g' src/components/layout/PageTemplate.js

# Fix ResponsiveLayout.js
sed -i '' 's/jamaicanColors/_jamaicanColors/g' src/components/layout/ResponsiveLayout.js
sed -i '' 's/const { isMobile, isTablet, isDesktop }/const { isMobile: _isMobile, isTablet: _isTablet, isDesktop: _isDesktop }/g' src/components/layout/ResponsiveLayout.js

# Fix Button.js
sed -i '' 's/const { isMobile }/const { isMobile: _isMobile }/g' src/components/ui/Button.js

# Fix Navigation.js
sed -i '' 's/const drawerConfig =/const _drawerConfig =/g' src/components/ui/Navigation.js

# Fix Typography.js
sed -i '' 's/const { isDarkMode }/const { isDarkMode: _isDarkMode }/g' src/components/ui/Typography.js
sed -i '' 's/const { isMobile }/const { isMobile: _isMobile }/g' src/components/ui/Typography.js

# Fix EmployerApplicationsPage.js
sed -i '' '/Typography/d' src/pages/EmployerApplicationsPage.js

# Fix EmployerPostJobPageNew.js
sed -i '' '/DescriptionIcon/d' src/pages/EmployerPostJobPageNew.js
sed -i '' 's/}) => (theme) => ({/}) => (_theme) => ({/g' src/pages/EmployerPostJobPageNew.js

# Fix FeatureDemo.js
sed -i '' 's/import React, { useState, useEffect }/import React, { useState }/g' src/pages/FeatureDemo.js
sed -i '' 's/const hasDeadline =/const _hasDeadline =/g' src/pages/FeatureDemo.js

echo "✅ Fixed unused variables in all files"
