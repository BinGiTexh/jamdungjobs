# JamDung Jobs - New Features Testing Guide

## 🎯 Features to Test

### 1. 🔗 Job Sharing Component
### 2. 👁️ Recently Viewed Jobs
### 3. ⏰ Application Deadline Warnings

---

## 📋 Manual Testing Instructions

### **Step 1: Access the Demo Page**
1. Open your browser and navigate to: **http://localhost:3000/feature-demo**
2. You should see a demo page with sample job listings and new features

### **Step 2: Test Job Sharing 🔗**

**What to test:**
- Click any "Share" button on a job card
- Verify the dropdown menu appears with social media options
- Test each sharing option

**Expected behavior:**
- ✅ Share button should open a dropdown menu
- ✅ WhatsApp option should generate correct sharing URL
- ✅ LinkedIn option should open LinkedIn sharing
- ✅ Twitter option should open Twitter sharing
- ✅ "Copy Link" should copy the job URL to clipboard
- ✅ Clicking outside the dropdown should close it

**Test steps:**
1. Click the "Share" button on the first job card
2. Verify you see options for: WhatsApp, LinkedIn, Twitter, Copy Link
3. Click "Copy Link" and verify it shows "Copied!" feedback
4. Click one of the social media links and verify it opens the correct sharing page
5. Click outside the dropdown to close it

---

### **Step 3: Test Recently Viewed Jobs 👁️**

**What to test:**
- Click "View & Track" buttons on different jobs
- Verify recently viewed section appears and updates
- Check localStorage persistence

**Expected behavior:**
- ✅ Clicking "View & Track" should add the job to recently viewed list
- ✅ Recently viewed section should appear on the right side
- ✅ Jobs should appear with company info and timestamps
- ✅ Most recent jobs should appear at the top
- ✅ "Clear" button should remove all recent views

**Test steps:**
1. Click "View & Track" on the first job (you should see an alert)
2. Click "View & Track" on the second job
3. Click "View & Track" on the third job
4. Check the "Recently Viewed Jobs" section on the right
5. Verify jobs appear in reverse chronological order (most recent first)
6. Click "Clear" button and verify the section disappears or shows empty state
7. Refresh the page and click more "View & Track" buttons to verify persistence

---

### **Step 4: Test Deadline Warnings ⏰**

**What to test:**
- Look for colored warning badges on job cards
- Verify different urgency levels display correctly
- Check expired jobs are disabled

**Expected behavior:**
- ✅ Jobs with deadlines should show colored warning badges
- ✅ Critical (1 day): Red badge with "Last day to apply!" and fire icon
- ✅ Urgent (2-3 days): Orange badge with "Only X days left"
- ✅ Warning (4-7 days): Yellow badge with "X days left"
- ✅ Expired jobs: Red badge "Application deadline has passed"
- ✅ Expired jobs should have disabled "Apply Now" button

**Test steps:**
1. Look at each job card for deadline warning badges
2. Verify the "Senior React Developer" shows urgent warning (2 days)
3. Verify the "Digital Marketing Specialist" shows critical warning (1 day)
4. Verify the "DevOps Engineer" shows standard warning (7 days)
5. Verify the "UX/UI Designer" shows expired status
6. Check that the expired job's "Apply Now" button is disabled

---

## 🔍 Visual Verification Checklist

### **Overall Page**
- [ ] Demo page loads without errors
- [ ] Page has proper JamDung Jobs styling (dark theme with gold accents)
- [ ] 4 sample job cards are displayed
- [ ] Right sidebar shows feature explanations

### **Job Cards**
- [ ] Each job card displays: title, company, location, description, skills, salary
- [ ] Share buttons are present on each card
- [ ] "View & Track" buttons are present
- [ ] Deadline warnings appear on appropriate cards
- [ ] Apply buttons reflect correct state (enabled/disabled)

### **Responsive Design**
- [ ] Page works on desktop (1280px+ width)
- [ ] Job cards stack properly on smaller screens
- [ ] Share dropdowns position correctly
- [ ] Recently viewed section adapts to screen size

---

## 🚨 Common Issues & Troubleshooting

### **Issue: Components not loading**
- **Solution**: Refresh the page, check browser console for errors
- **Check**: Make sure React development server is running

### **Issue: Share buttons don't work**
- **Solution**: Check browser console for JavaScript errors
- **Check**: Verify React Icons are loaded properly

### **Issue: Recently viewed doesn't persist**
- **Solution**: Check browser localStorage permissions
- **Check**: Open DevTools > Application > Local Storage

### **Issue: Deadline warnings don't show**
- **Solution**: Verify the sample jobs have deadline fields
- **Check**: Component props are being passed correctly

---

## ✅ Success Criteria

**All features pass if:**
1. **Job Sharing**: Share dropdown works, all social media links function, copy link works
2. **Recently Viewed**: Jobs are tracked, displayed with timestamps, persist across page refreshes
3. **Deadline Warnings**: Appropriate warnings show with correct colors and urgency levels

---

## 📝 Testing Report Template

```
## Test Results - [Date]

### Job Sharing 🔗
- Share button functionality: ✅/❌
- Social media links: ✅/❌
- Copy link feature: ✅/❌
- Dropdown behavior: ✅/❌

### Recently Viewed 👁️
- Job tracking: ✅/❌
- Display with timestamps: ✅/❌
- Persistence: ✅/❌
- Clear functionality: ✅/❌

### Deadline Warnings ⏰
- Warning badges display: ✅/❌
- Correct urgency levels: ✅/❌
- Expired job handling: ✅/❌
- Visual styling: ✅/❌

### Overall Score: X/12 ✅

### Notes:
[Add any observations or issues here]
```

---

## 🎉 Ready for Sign-off?

**Once all features pass testing:**
1. Document any issues found
2. Verify fixes for any failures
3. Confirm all components integrate properly with existing codebase
4. Ready to proceed with GitHub Actions deployment setup!
