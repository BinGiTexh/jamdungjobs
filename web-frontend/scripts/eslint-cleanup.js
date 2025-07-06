#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * ESLint Cleanup Script for JamDung Jobs
 * 
 * This script systematically fixes ESLint errors by:
 * 1. Running ESLint with --fix for auto-fixable issues
 * 2. Identifying and removing unused imports/variables
 * 3. Standardizing code formatting
 * 4. Generating a report of remaining issues
 */

class ESLintCleanup {
  constructor() {
    this.srcDir = path.join(__dirname, '..', 'src');
    this.errors = [];
    this.fixed = [];
    this.skipped = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runESLintFix() {
    this.log('Running ESLint auto-fix...', 'info');
    
    try {
      const result = execSync(
        'npx eslint src/ --fix --ext .js,.jsx --format json',
        { 
          cwd: path.join(__dirname, '..'),
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      this.log('ESLint auto-fix completed successfully', 'success');
      return JSON.parse(result || '[]');
    } catch (error) {
      // ESLint returns non-zero exit code when there are unfixable errors
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout);
          this.log(`ESLint found ${results.length} files with issues`, 'warning');
          return results;
        } catch (parseError) {
          this.log('Failed to parse ESLint output', 'error');
          return [];
        }
      }
      
      this.log(`ESLint error: ${error.message}`, 'error');
      return [];
    }
  }

  analyzeResults(results) {
    const summary = {
      totalFiles: results.length,
      filesWithErrors: 0,
      totalErrors: 0,
      totalWarnings: 0,
      errorsByRule: {},
      filesByErrorCount: []
    };

    results.forEach(result => {
      if (result.messages.length > 0) {
        summary.filesWithErrors++;
        
        const fileErrors = result.messages.filter(msg => msg.severity === 2).length;
        const fileWarnings = result.messages.filter(msg => msg.severity === 1).length;
        
        summary.totalErrors += fileErrors;
        summary.totalWarnings += fileWarnings;
        
        if (fileErrors > 0 || fileWarnings > 0) {
          summary.filesByErrorCount.push({
            file: result.filePath,
            errors: fileErrors,
            warnings: fileWarnings,
            messages: result.messages
          });
        }

        result.messages.forEach(msg => {
          if (!summary.errorsByRule[msg.ruleId]) {
            summary.errorsByRule[msg.ruleId] = 0;
          }
          summary.errorsByRule[msg.ruleId]++;
        });
      }
    });

    return summary;
  }

  generateCleanupPlan(summary) {
    const plan = {
      priority1: [], // Critical errors that break builds
      priority2: [], // Code quality issues
      priority3: [], // Style/formatting issues
      automated: []  // Can be fixed automatically
    };

    const criticalRules = [
      'no-unused-vars',
      'no-undef',
      'react/jsx-no-undef',
      'import/no-unresolved'
    ];

    const qualityRules = [
      'react-hooks/exhaustive-deps',
      'no-unused-expressions',
      'prefer-const'
    ];

    const styleRules = [
      'quotes',
      'semi',
      'comma-dangle',
      'jsx-quotes'
    ];

    Object.entries(summary.errorsByRule).forEach(([rule, count]) => {
      const ruleInfo = { rule, count };
      
      if (criticalRules.includes(rule)) {
        plan.priority1.push(ruleInfo);
      } else if (qualityRules.includes(rule)) {
        plan.priority2.push(ruleInfo);
      } else if (styleRules.includes(rule)) {
        plan.priority3.push(ruleInfo);
        plan.automated.push(ruleInfo);
      } else {
        plan.priority2.push(ruleInfo);
      }
    });

    return plan;
  }

  async fixUnusedImports() {
    this.log('Fixing unused imports...', 'info');
    
    try {
      // Use a more targeted approach for unused imports
      execSync(
        'npx eslint src/ --fix --rule "no-unused-vars: error" --ext .js,.jsx',
        { 
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit'
        }
      );
      
      this.log('Unused imports cleanup completed', 'success');
    } catch (error) {
      this.log('Some unused import issues require manual fixing', 'warning');
    }
  }

  generateReport(summary, plan) {
    const report = `
# ESLint Cleanup Report
Generated: ${new Date().toISOString()}

## Summary
- Total files scanned: ${summary.totalFiles}
- Files with issues: ${summary.filesWithErrors}
- Total errors: ${summary.totalErrors}
- Total warnings: ${summary.totalWarnings}

## Top Issues by Rule
${Object.entries(summary.errorsByRule)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([rule, count]) => `- ${rule}: ${count} occurrences`)
  .join('\n')}

## Cleanup Plan

### Priority 1 (Critical - Fix First)
${plan.priority1.map(item => `- ${item.rule}: ${item.count} issues`).join('\n') || 'None'}

### Priority 2 (Code Quality)
${plan.priority2.map(item => `- ${item.rule}: ${item.count} issues`).join('\n') || 'None'}

### Priority 3 (Style/Formatting)
${plan.priority3.map(item => `- ${item.rule}: ${item.count} issues`).join('\n') || 'None'}

## Files Requiring Attention
${summary.filesByErrorCount
  .sort((a, b) => (b.errors + b.warnings) - (a.errors + a.warnings))
  .slice(0, 20)
  .map(file => `- ${path.relative(process.cwd(), file.file)}: ${file.errors} errors, ${file.warnings} warnings`)
  .join('\n')}

## Next Steps
1. Fix Priority 1 issues manually or with targeted scripts
2. Run automated fixes for style issues
3. Address code quality issues in Priority 2
4. Set up pre-commit hooks to prevent regression

## Commands to Run
\`\`\`bash
# Fix auto-fixable issues
npm run lint:fix

# Check remaining issues
npm run lint

# Fix specific rule across all files
npx eslint src/ --fix --rule "rule-name: error"
\`\`\`
`;

    const reportPath = path.join(__dirname, '..', 'reports', 'eslint-cleanup-report.md');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    this.log(`Report generated: ${reportPath}`, 'success');
    
    return report;
  }

  async run() {
    this.log('Starting ESLint cleanup process...', 'info');
    
    // Step 1: Run ESLint with auto-fix
    const results = await this.runESLintFix();
    
    // Step 2: Analyze results
    const summary = this.analyzeResults(results);
    
    // Step 3: Generate cleanup plan
    const plan = this.generateCleanupPlan(summary);
    
    // Step 4: Fix unused imports specifically
    await this.fixUnusedImports();
    
    // Step 5: Generate report
    const report = this.generateReport(summary, plan);
    
    // Step 6: Summary
    this.log('ESLint cleanup process completed!', 'success');
    this.log(`Found ${summary.totalErrors} errors and ${summary.totalWarnings} warnings`, 'info');
    
    if (summary.totalErrors > 0) {
      this.log('Manual intervention required for remaining errors', 'warning');
      this.log('Check the generated report for detailed cleanup plan', 'info');
    }
    
    return {
      summary,
      plan,
      report
    };
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  const cleanup = new ESLintCleanup();
  cleanup.run().catch(error => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
}

module.exports = ESLintCleanup;
