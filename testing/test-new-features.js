#!/usr/bin/env node

/**
 * Test script for the new JamDung Jobs features:
 * 1. Job Sharing
 * 2. Recently Viewed Jobs
 * 3. Application Deadline Warnings
 */

const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const DEMO_URL = `${BASE_URL}/feature-demo`;

async function testNewFeatures() {
  let browser;
  let testResults = {
    jobSharing: false,
    recentlyViewed: false,
    deadlineWarnings: false,
    errors: []
  };

  try {
    console.log('🚀 Starting New Features Test...');
    console.log(`📍 Testing URL: ${DEMO_URL}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to demo page
    console.log('📂 Loading feature demo page...');
    await page.goto(DEMO_URL, { waitUntil: 'networkidle2' });

    // Test 1: Check if demo page loads
    const pageTitle = await page.title();
    console.log(`📄 Page title: ${pageTitle}`);

    // Test 2: Job Sharing functionality
    console.log('🔗 Testing Job Sharing...');
    try {
      // Wait for job share buttons to be present
      await page.waitForSelector('[data-testid="job-share-button"], .share-btn, [title="Share this job"]', { timeout: 5000 });
      
      // Click the first share button
      const shareButton = await page.$('[data-testid="job-share-button"], .share-btn, [title="Share this job"]');
      if (shareButton) {
        await shareButton.click();
        
        // Wait for share menu to appear
        await page.waitForSelector('[data-testid="share-menu"], .share-menu, .share-dropdown', { timeout: 3000 });
        
        // Check if social media options are present
        const whatsappLink = await page.$('a[href*="wa.me"], a[href*="whatsapp"]');
        const linkedinLink = await page.$('a[href*="linkedin"]');
        const copyButton = await page.$('[data-testid="copy-link"], button:contains("Copy")');
        
        if (whatsappLink && linkedinLink) {
          testResults.jobSharing = true;
          console.log('✅ Job sharing component working');
        } else {
          testResults.errors.push('Job sharing social media links not found');
        }
      } else {
        testResults.errors.push('Job share button not found');
      }
    } catch (error) {
      testResults.errors.push(`Job sharing test failed: ${error.message}`);
      console.log('⚠️ Job sharing test failed, but this may be expected if components are not yet integrated');
    }

    // Test 3: Recently Viewed Jobs
    console.log('👁️ Testing Recently Viewed Jobs...');
    try {
      // Look for "View & Track" buttons
      const trackButtons = await page.$$('button:contains("View & Track"), [data-testid="track-job"]');
      
      if (trackButtons.length > 0) {
        // Click the first track button
        await trackButtons[0].click();
        
        // Wait for alert or confirmation
        await page.waitForTimeout(1000);
        
        // Check if recently viewed section appears or updates
        const recentlyViewedSection = await page.$('[data-testid="recently-viewed"], .recently-viewed, h3:contains("Recently Viewed")');
        
        if (recentlyViewedSection) {
          testResults.recentlyViewed = true;
          console.log('✅ Recently viewed jobs component working');
        } else {
          testResults.errors.push('Recently viewed section not found after tracking');
        }
      } else {
        testResults.errors.push('Track job buttons not found');
      }
    } catch (error) {
      testResults.errors.push(`Recently viewed test failed: ${error.message}`);
      console.log('⚠️ Recently viewed test failed, checking localStorage instead...');
      
      // Fallback: Check if localStorage tracking is working
      const localStorageData = await page.evaluate(() => {
        return localStorage.getItem('recentlyViewedJobs');
      });
      
      if (localStorageData) {
        testResults.recentlyViewed = true;
        console.log('✅ Recently viewed localStorage tracking working');
      }
    }

    // Test 4: Deadline Warnings
    console.log('⏰ Testing Deadline Warnings...');
    try {
      // Look for deadline warning elements
      const deadlineWarnings = await page.$$('[data-testid="deadline-warning"], .deadline-warning, [role="alert"]');
      
      if (deadlineWarnings.length > 0) {
        testResults.deadlineWarnings = true;
        console.log('✅ Deadline warnings component working');
        
        // Check for different urgency levels
        const urgencyLevels = await page.$$eval('[data-testid="deadline-warning"], .deadline-warning', 
          elements => elements.map(el => el.textContent)
        );
        
        console.log(`📊 Found ${urgencyLevels.length} deadline warnings:`, urgencyLevels);
      } else {
        testResults.errors.push('Deadline warning elements not found');
      }
    } catch (error) {
      testResults.errors.push(`Deadline warnings test failed: ${error.message}`);
    }

    // Test 5: Overall page functionality
    console.log('🔍 Testing overall page functionality...');
    try {
      // Check if sample jobs are displayed
      const jobCards = await page.$$('[data-testid="job-card"], .job-card, .MuiCard-root');
      console.log(`📋 Found ${jobCards.length} job cards on demo page`);
      
      if (jobCards.length === 0) {
        testResults.errors.push('No job cards found on demo page');
      }
    } catch (error) {
      testResults.errors.push(`Page functionality test failed: ${error.message}`);
    }

    // Take a screenshot for reference
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: path.join(__dirname, 'feature-demo-screenshot.png'),
      fullPage: true 
    });

  } catch (error) {
    testResults.errors.push(`Overall test failed: ${error.message}`);
    console.error('❌ Test execution failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print results
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`🔗 Job Sharing: ${testResults.jobSharing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👁️ Recently Viewed: ${testResults.recentlyViewed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`⏰ Deadline Warnings: ${testResults.deadlineWarnings ? '✅ PASS' : '❌ FAIL'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  const passedTests = [testResults.jobSharing, testResults.recentlyViewed, testResults.deadlineWarnings]
    .filter(Boolean).length;
  
  console.log(`\n📈 Overall Score: ${passedTests}/3 tests passed`);
  
  if (passedTests === 3) {
    console.log('🎉 All new features are working correctly!');
  } else if (passedTests >= 2) {
    console.log('⚠️ Most features working, some issues to address');
  } else {
    console.log('❌ Multiple features need attention');
  }

  return testResults;
}

// Manual testing instructions
function printManualTestingInstructions() {
  console.log('\n📋 Manual Testing Instructions:');
  console.log('================================');
  console.log('1. Open your browser and go to: http://localhost:3000/feature-demo');
  console.log('2. Test Job Sharing:');
  console.log('   - Click any "Share" button on a job card');
  console.log('   - Verify WhatsApp, LinkedIn, Twitter, and Copy Link options appear');
  console.log('   - Test the Copy Link functionality');
  console.log('3. Test Recently Viewed:');
  console.log('   - Click "View & Track" buttons on different jobs');
  console.log('   - Check if "Recently Viewed" section appears and updates');
  console.log('   - Verify jobs appear with timestamps');
  console.log('4. Test Deadline Warnings:');
  console.log('   - Look for colored warning badges on job cards');
  console.log('   - Verify different urgency levels (Critical, Urgent, Warning, Expired)');
  console.log('   - Check that expired jobs show as disabled');
}

// Check if we're running this script directly
if (require.main === module) {
  // Check if we should run automated tests or just show manual instructions
  const args = process.argv.slice(2);
  
  if (args.includes('--manual') || args.includes('-m')) {
    printManualTestingInstructions();
  } else {
    testNewFeatures().catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
  }
}

module.exports = { testNewFeatures };
