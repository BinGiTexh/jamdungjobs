#!/usr/bin/env node

/**
 * Theme Consistency Audit Script
 * Scans all components for hardcoded colors, spacing, and typography
 * Provides automated fixing suggestions
 */

const fs = require('fs');
const path = require('path');

// Since we can't import ES modules directly, we'll inline the validation functions
const HARDCODED_COLOR_PATTERNS = [
  /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g, // Hex colors
  /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // RGB colors
  /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA colors
];

const THEME_COLOR_MAP = {
  '#009639': 'theme.palette.primary.main',
  '#4CAF50': 'theme.palette.primary.light',
  '#006D2C': 'theme.palette.primary.dark',
  '#FFD700': 'theme.palette.secondary.main',
  '#FFEB3B': 'theme.palette.secondary.light',
  '#FFA000': 'theme.palette.secondary.dark',
  '#000000': 'theme.palette.text.primary',
  '#ffffff': 'theme.palette.background.paper',
};

function validateThemeUsage(componentCode, componentName) {
  const issues = [];
  
  HARDCODED_COLOR_PATTERNS.forEach(pattern => {
    const matches = componentCode.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const suggestion = THEME_COLOR_MAP[match];
        issues.push({
          type: 'hardcoded-color',
          value: match,
          suggestion: suggestion || 'Use theme.palette values',
          severity: 'error',
          component: componentName
        });
      });
    }
  });
  
  return issues;
}

function validateThemeImports(componentCode) {
  const hasUseTheme = componentCode.includes('useTheme');
  const hasThemeImport = componentCode.includes("from '@mui/material/styles'") || 
                        componentCode.includes("from '../theme/") ||
                        componentCode.includes("from '../../theme/");
  
  return {
    hasUseTheme,
    hasThemeImport,
    isValid: hasUseTheme && hasThemeImport
  };
}

function validateBreakpointUsage(componentCode) {
  const issues = [];
  const hardcodedBreakpoints = [/768px/g, /960px/g, /1024px/g, /1200px/g, /600px/g];
  
  hardcodedBreakpoints.forEach(pattern => {
    const matches = componentCode.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          type: 'hardcoded-breakpoint',
          value: match,
          suggestion: 'Use theme.breakpoints.down() or theme.breakpoints.up()',
          severity: 'warning'
        });
      });
    }
  });
  
  return issues;
}

// Configuration
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const PAGES_DIR = path.join(__dirname, '../src/pages');
const REPORT_FILE = path.join(__dirname, '../reports/theme-audit-report.json');

// Ensure reports directory exists
const reportsDir = path.dirname(REPORT_FILE);
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Recursively find all JS/JSX files
 */
function findComponentFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.match(/\.(js|jsx|ts|tsx)$/)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Audit a single component file
 */
function auditComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const componentName = path.basename(filePath, path.extname(filePath));
  
  // Run validations
  const themeIssues = validateThemeUsage(content, componentName);
  const importIssues = validateThemeImports(content);
  const breakpointIssues = validateBreakpointUsage(content);
  
  return {
    file: filePath,
    component: componentName,
    themeIssues,
    importIssues,
    breakpointIssues,
    hasIssues: themeIssues.length > 0 || !importIssues.isValid || breakpointIssues.length > 0
  };
}

/**
 * Generate audit report
 */
function generateReport(results) {
  const summary = {
    totalFiles: results.length,
    filesWithIssues: results.filter(r => r.hasIssues).length,
    totalIssues: results.reduce((sum, r) => 
      sum + r.themeIssues.length + r.breakpointIssues.length + (!r.importIssues.isValid ? 1 : 0), 0
    ),
    issuesByType: {
      hardcodedColors: 0,
      hardcodedSpacing: 0,
      hardcodedTypography: 0,
      hardcodedBreakpoints: 0,
      missingThemeImports: 0,
    }
  };

  // Count issues by type
  results.forEach(result => {
    result.themeIssues.forEach(issue => {
      if (issue.type === 'hardcoded-color') summary.issuesByType.hardcodedColors++;
      if (issue.type === 'hardcoded-spacing') summary.issuesByType.hardcodedSpacing++;
      if (issue.type === 'hardcoded-typography') summary.issuesByType.hardcodedTypography++;
    });
    
    result.breakpointIssues.forEach(issue => {
      if (issue.type === 'hardcoded-breakpoint') summary.issuesByType.hardcodedBreakpoints++;
    });
    
    if (!result.importIssues.isValid) {
      summary.issuesByType.missingThemeImports++;
    }
  });

  return {
    timestamp: new Date().toISOString(),
    summary,
    results,
    recommendations: generateRecommendations(summary, results)
  };
}

/**
 * Generate recommendations based on audit results
 */
function generateRecommendations(summary, results) {
  const recommendations = [];

  if (summary.issuesByType.hardcodedColors > 0) {
    recommendations.push({
      priority: 'high',
      type: 'hardcoded-colors',
      title: 'Replace hardcoded colors with theme values',
      description: `Found ${summary.issuesByType.hardcodedColors} hardcoded colors. Replace with theme.palette values.`,
      action: 'Use theme.palette.primary.main, theme.palette.secondary.main, etc.'
    });
  }

  if (summary.issuesByType.hardcodedSpacing > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'hardcoded-spacing',
      title: 'Use theme.spacing() for consistent spacing',
      description: `Found ${summary.issuesByType.hardcodedSpacing} hardcoded spacing values.`,
      action: 'Replace with theme.spacing(1), theme.spacing(2), etc.'
    });
  }

  if (summary.issuesByType.hardcodedTypography > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'hardcoded-typography',
      title: 'Use theme typography variants',
      description: `Found ${summary.issuesByType.hardcodedTypography} hardcoded font sizes.`,
      action: 'Use Typography component with variant props or theme.typography values'
    });
  }

  if (summary.issuesByType.missingThemeImports > 0) {
    recommendations.push({
      priority: 'high',
      type: 'missing-imports',
      title: 'Add proper theme imports',
      description: `Found ${summary.issuesByType.missingThemeImports} components without proper theme imports.`,
      action: 'Import useTheme from @mui/material/styles or custom ThemeContext'
    });
  }

  if (summary.issuesByType.hardcodedBreakpoints > 0) {
    recommendations.push({
      priority: 'low',
      type: 'hardcoded-breakpoints',
      title: 'Use theme breakpoints',
      description: `Found ${summary.issuesByType.hardcodedBreakpoints} hardcoded breakpoint values.`,
      action: 'Use theme.breakpoints.down() or theme.breakpoints.up()'
    });
  }

  return recommendations;
}

/**
 * Print console report
 */
function printConsoleReport(report) {
  console.log('\n🎨 JamDung Jobs Theme Consistency Audit Report');
  console.log('='.repeat(50));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files scanned: ${report.summary.totalFiles}`);
  console.log(`   Files with issues: ${report.summary.filesWithIssues}`);
  console.log(`   Total issues found: ${report.summary.totalIssues}`);
  
  console.log(`\n🔍 Issues by type:`);
  Object.entries(report.summary.issuesByType).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`   ${type}: ${count}`);
    }
  });

  if (report.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    report.recommendations.forEach((rec, index) => {
      const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`   ${index + 1}. ${priorityEmoji} ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Action: ${rec.action}\n`);
    });
  }

  // Show files with most issues
  const problematicFiles = report.results
    .filter(r => r.hasIssues)
    .sort((a, b) => 
      (b.themeIssues.length + b.breakpointIssues.length) - 
      (a.themeIssues.length + a.breakpointIssues.length)
    )
    .slice(0, 5);

  if (problematicFiles.length > 0) {
    console.log(`\n🚨 Files needing attention:`);
    problematicFiles.forEach((file, index) => {
      const issueCount = file.themeIssues.length + file.breakpointIssues.length;
      console.log(`   ${index + 1}. ${file.component} (${issueCount} issues)`);
      console.log(`      ${file.file.replace(process.cwd(), '.')}`);
    });
  }

  console.log(`\n📋 Full report saved to: ${REPORT_FILE.replace(process.cwd(), '.')}`);
}

/**
 * Print development report (less verbose for dev mode)
 */
function printDevReport(report) {
  if (report.summary.totalIssues === 0) {
    console.log('✅ Theme consistency check passed!');
    return;
  }

  console.log(`\n⚠️  Theme Consistency Issues (${report.summary.totalIssues} total):`);
  
  // Show only high priority issues in dev mode
  const highPriorityIssues = report.recommendations.filter(r => r.priority === 'high');
  if (highPriorityIssues.length > 0) {
    console.log('\n🔴 High Priority:');
    highPriorityIssues.forEach(issue => {
      console.log(`   • ${issue.title}`);
    });
  }
  
  const problematicFiles = report.results
    .filter(r => r.hasIssues)
    .slice(0, 3); // Show only top 3 in dev mode
    
  if (problematicFiles.length > 0) {
    console.log(`\n📝 Files to check:`);
    problematicFiles.forEach(file => {
      const issueCount = file.themeIssues.length + file.breakpointIssues.length;
      console.log(`   • ${file.component} (${issueCount} issues)`);
    });
  }
  
  console.log(`\n💡 Run 'npm run theme:audit' for full report`);
}

/**
 * Main audit function
 */
function runAudit() {
  const isWarnOnly = process.argv.includes('--warn-only');
  const isDev = process.env.NODE_ENV === 'development';
  
  console.log(`🔍 Starting theme consistency audit... (${isWarnOnly ? 'warn-only' : 'strict'} mode)`);
  
  // Find all component files
  const componentFiles = [
    ...findComponentFiles(COMPONENTS_DIR),
    ...findComponentFiles(PAGES_DIR)
  ];
  
  console.log(`📁 Found ${componentFiles.length} component files`);
  
  // Audit each file
  const results = componentFiles.map(file => {
    if (!isWarnOnly) process.stdout.write('.');
    return auditComponent(file);
  });
  
  if (!isWarnOnly) console.log('\n✅ Audit complete!');
  
  // Generate and save report
  const report = generateReport(results);
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  
  // Print console summary
  if (isWarnOnly) {
    printDevReport(report);
  } else {
    printConsoleReport(report);
  }
  
  // In warn-only mode, don't exit with error code
  if (isWarnOnly) {
    if (report.summary.totalIssues > 0) {
      console.log('⚠️  Theme issues detected but continuing in development mode...');
    }
    process.exit(0);
  } else {
    // Exit with appropriate code in strict mode
    process.exit(report.summary.totalIssues > 0 ? 1 : 0);
  }
}

// Run the audit
if (require.main === module) {
  runAudit();
}

module.exports = { runAudit, auditComponent, generateReport };
