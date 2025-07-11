# Profile Endpoints & Frontend Usage Audit Report

## Summary
This audit examines user profile related endpoints and their frontend usage, documenting field name mappings, data structure inconsistencies, validation differences, and response format mismatches.

## 🔍 Backend Endpoints Analysis

### 1. **User Profile Endpoints** (`/Users/mcameron/jamdungjobs/backend/routes/users.routes.js`)

#### GET `/api/users/me`
- **Purpose**: Get current user profile (all user types)
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "JOBSEEKER|EMPLOYER|ADMIN",
      "phoneNumber": "string",
      "location": "string",
      "bio": "string",
      "title": "string",
      "candidateProfile": {...}, // Only for JOBSEEKER
      "company": {...}, // Only for EMPLOYER
      "profileCompletion": {...}
    }
  }
  ```
- **Field Validations**:
  - `firstName`: 1-50 characters, trimmed
  - `lastName`: 1-50 characters, trimmed
  - `phoneNumber`: Regex `/^\+?[\d\s\-\(\)]{7,15}$/`
  - `location`: Max 100 characters
  - `title`: Max 100 characters
  - `bio`: Max 500 characters

#### PUT `/api/users/me`
- **Purpose**: Update current user profile (basic fields only)
- **Expected Fields**:
  - `firstName` (string, 1-50 chars)
  - `lastName` (string, 1-50 chars)
  - `phoneNumber` (string, phone regex)
  - `location` (string, max 100 chars)
  - `bio` (string, max 500 chars)
  - `title` (string, max 100 chars)
- **Response**: Same as GET with updated data

#### PUT `/api/users/me/email`
- **Purpose**: Update user email separately
- **Expected Fields**: `email` (valid email format)
- **Response**: Updated user object

### 2. **Jobseeker Profile Endpoints** (`/Users/mcameron/jamdungjobs/backend/routes/jobseeker.routes.js`)

#### GET `/api/jobseeker/profile`
- **Purpose**: Get jobseeker profile
- **Response**: Full user object with candidateProfile

#### PUT `/api/jobseeker/profile`
- **Purpose**: Update jobseeker profile
- **Expected Fields** (SNAKE_CASE):
  - `first_name` (string)
  - `last_name` (string)
  - `bio` (string)
  - `location` (string)
  - `phone_number` (string)
  - `title` (string)
  - `skills` (array)
  - `education` (array)
  - `experience` (array)
  - `resume_url` (string)
  - `photo_url` (string)
  - `resume_file_name` (string)

#### POST `/api/jobseeker/profile/resume`
- **Purpose**: Upload resume file
- **Expected**: MultiPart form with 'resume' field
- **Response**: `{ resumeUrl, resumeFileName }`

#### POST `/api/jobseeker/profile/photo`
- **Purpose**: Upload profile photo
- **Expected**: MultiPart form with 'photo' field
- **Response**: `{ photoUrl, filename }`

### 3. **Employer Profile Endpoints** (`/Users/mcameron/jamdungjobs/backend/routes/employer.routes.js`)

#### GET `/api/employer/profile`
- **Purpose**: Get employer profile
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "employer": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "phoneNumber": "string",
        "title": "string",
        "bio": "string",
        "location": "string"
      },
      "company": {
        "id": "string",
        "name": "string",
        "industry": "string",
        "location": "string",
        "website": "string",
        "description": "string",
        "logoUrl": "string"
      }
    }
  }
  ```

#### PUT `/api/employer/profile`
- **Purpose**: Update employer profile and company
- **Expected Fields**:
  - `firstName`, `lastName`, `phoneNumber`, `title`, `bio`, `location`
  - `company` (object with name, industry, location, website, description)
- **Supports**: MultiPart form with 'logo' field

#### PUT `/api/employer/company`
- **Purpose**: Update company profile only
- **Expected Fields**:
  - `name` (required, string)
  - `industry`, `location`, `website`, `description`
- **Supports**: MultiPart form with 'logo' field

## 🖥️ Frontend Components Analysis

### 1. **ProfileEditModal** (`/Users/mcameron/jamdungjobs/web-frontend/src/components/profile/ProfileEditModal.js`)

#### Data Fetching
- **Jobseeker**: Uses `GET /api/users/me`
- **Employer**: Uses `GET /api/employer/profile`

#### Form Field Mapping
```javascript
// Frontend form fields
{
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  location: '',
  bio: '',
  jobTitle: '',        // Maps to backend 'title'
  skills: [],
  // ... employer fields
  companyName: '',
  companyWebsite: '',
  companyLocation: '',
  companyDescription: '',
  companyIndustry: ''
}
```

#### Update Logic
- **Jobseeker**: 
  - Updates basic user fields via `PUT /api/users/me`
  - Maps `jobTitle` → `title` in payload
  - Email updates via separate `PUT /api/users/me/email`
- **Employer**:
  - Updates via `PUT /api/employer/profile`
  - Sends nested `company` object

### 2. **ProfilePage** (`/Users/mcameron/jamdungjobs/web-frontend/src/components/profile/ProfilePage.js`)

#### Data Fetching
- **Jobseeker**: Uses `GET /api/users/me`
- **Employer**: Uses `GET /api/employer/profile`

#### Form Field Mapping Issues
```javascript
// Jobseeker update payload - INCONSISTENT FIELD NAMES
const userUpdateData = {
  first_name: firstName,      // ❌ Backend expects 'firstName'
  last_name: lastName,        // ❌ Backend expects 'lastName'
  bio: formData.bio,
  location: formData.address,
  phone_number: formData.phone // ❌ Backend expects 'phoneNumber'
};

// Candidate profile payload - INCONSISTENT FIELD NAMES
const candidateProfileData = {
  bio: formData.bio,
  location: formData.address,
  skills: Array.isArray(formData.skills) ? formData.skills : 
          (formData.skills ? formData.skills.split(',') : []),
  education: Array.isArray(formData.education) ? formData.education : 
             (formData.education ? [formData.education] : []),
  experience: Array.isArray(formData.workExperience) ? formData.workExperience : 
              (formData.workExperience ? [formData.workExperience] : [])
};
```

### 3. **CompanyProfileSetup** (`/Users/mcameron/jamdungjobs/web-frontend/src/components/employer/CompanyProfileSetup.js`)

#### Form Field Mapping
```javascript
// Form data structure
{
  companyName: '',    // Maps to backend 'name'
  industry: '',
  location: '',
  website: '',
  description: '',
  logoUrl: null,
  logo: null         // File object for upload
}
```

#### Update Logic
- Uses `PUT /api/employer/profile`
- Sends MultiPart form data with company fields
- Handles logo upload correctly

## 🚨 Critical Issues Found

### 1. **Field Name Inconsistencies**

#### ProfilePage.js Issues:
```javascript
// ❌ WRONG - Backend expects camelCase
const userUpdateData = {
  first_name: firstName,      // Should be 'firstName'
  last_name: lastName,        // Should be 'lastName'
  phone_number: formData.phone // Should be 'phoneNumber'
};
```

#### Backend Jobseeker Routes Issues:
```javascript
// ❌ INCONSISTENT - Uses snake_case in PUT /api/jobseeker/profile
const {
  first_name,           // Inconsistent with users.routes.js
  last_name,            // Inconsistent with users.routes.js
  phone_number,         // Inconsistent with users.routes.js
  // ...
} = req.body;
```

### 2. **Data Structure Mismatches**

#### Jobseeker Profile Updates:
- **ProfilePage**: Sends separate requests to different endpoints
- **ProfileEditModal**: Uses single endpoint approach
- **Backend**: Expects different field names on different endpoints

#### Employer Profile Structure:
- **GET endpoint**: Returns nested `{ employer: {...}, company: {...} }`
- **PUT endpoint**: Expects flat structure with nested `company` object

### 3. **Validation Rule Differences**

#### Field Length Limits:
- **users.routes.js**: `firstName`/`lastName` max 50 chars
- **ProfileEditModal**: No explicit client-side validation
- **ProfilePage**: No validation before sending

#### Required Fields:
- **Backend**: Different required fields per endpoint
- **Frontend**: Inconsistent required field validation

### 4. **Response Format Inconsistencies**

#### Jobseeker Responses:
- **GET /api/users/me**: Returns `{ success: true, data: {...} }`
- **PUT /api/jobseeker/profile**: Returns `{ success: true, data: {...} }`
- **POST /api/jobseeker/profile/resume**: Returns `{ success: true, resumeUrl, resumeFileName }`

#### Employer Responses:
- **GET /api/employer/profile**: Returns `{ success: true, data: { employer: {...}, company: {...} } }`
- **PUT /api/employer/profile**: Returns `{ success: true, data: { user: {...}, company: {...} } }`

## 🛠️ Recommendations

### 1. **Standardize Field Names**
- Use **camelCase** consistently across all endpoints
- Update jobseeker routes to use `firstName`, `lastName`, `phoneNumber`
- Update frontend ProfilePage to use correct field names

### 2. **Unify Data Structures**
- Standardize response format: `{ success: boolean, data: object, message?: string }`
- Use consistent nested structure for related data

### 3. **Consolidate Profile Updates**
- Create unified profile update endpoints
- Remove redundant endpoints
- Implement atomic updates for related data

### 4. **Implement Consistent Validation**
- Add client-side validation to match backend rules
- Standardize error response format
- Add field-level validation feedback

### 5. **Fix Immediate Issues**

#### High Priority:
1. Fix field name mismatches in ProfilePage.js
2. Standardize jobseeker route field names
3. Add proper error handling for validation failures

#### Medium Priority:
1. Unify response formats
2. Add client-side validation
3. Improve error messages

#### Low Priority:
1. Consolidate redundant endpoints
2. Optimize data fetching patterns
3. Add comprehensive logging

## 📊 Impact Assessment

### **High Impact Issues:**
- Field name mismatches cause profile updates to fail silently
- Inconsistent validation leads to user confusion
- Different response formats complicate error handling

### **Medium Impact Issues:**
- Redundant API calls affect performance
- Inconsistent data structures complicate frontend logic
- Missing client-side validation degrades UX

### **Low Impact Issues:**
- Code duplication increases maintenance burden
- Inconsistent logging makes debugging difficult
- Missing TypeScript types reduce development safety

## 📋 Action Items

1. **Immediate (Next Sprint)**:
   - [ ] Fix ProfilePage field name mismatches
   - [ ] Standardize jobseeker route field names
   - [ ] Add validation error handling

2. **Short Term (Next 2 Sprints)**:
   - [ ] Unify response formats
   - [ ] Add client-side validation
   - [ ] Improve error messages

3. **Long Term (Next Quarter)**:
   - [ ] Consolidate profile endpoints
   - [ ] Add TypeScript types
   - [ ] Implement comprehensive testing

---

*Generated: 2025-01-10*
*Audit Scope: Backend routes, Frontend components, Data flow patterns*
*Status: Complete*