import React, { useState, useEffect } from 'react';
import { FaTimes, FaRegBookmark, FaBookmark, FaClock, FaBuilding, FaMapMarkerAlt, FaBriefcase } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logDev, logError, sanitizeForLogging } from '../utils/logging';
import { LocationAutocomplete } from './common/LocationAutocomplete';
import { JobTitleAutocomplete } from './common/JobTitleAutocomplete';
import { SalaryRangeAutocomplete } from './common/SalaryRangeAutocomplete';
import { CompanyAutocomplete } from './common/CompanyAutocomplete';
import { SkillsAutocomplete } from './common/SkillsAutocomplete';

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'salary', label: 'Salary' },
  { value: 'relevance', label: 'Relevance' }
];

const QuickApplyModal = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        },
        body: JSON.stringify({ coverLetter })
      });
      
      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        throw new Error(data.message);
      }
    } catch (error) {
      logError('Failed to submit application', { 
        jobId: sanitizeForLogging(job.id),
        error: sanitizeForLogging(error)
      });
      // TODO: Show error notification
      // error.message || 'Failed to submit application'
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Quick Apply - {job.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Why are you a good fit for this role? (Optional)"
            className="w-full p-3 border rounded-lg mb-4 min-h-[120px]"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const FindJobsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState({
    search: '',
    location: '',
    jobType: '',
    minSalary: '',
    maxSalary: '',
    remote: false,
    sort: 'latest'
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [showQuickApply, setShowQuickApply] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...searchParams,
        page,
        limit: 10
      });

      const response = await fetch(`http://localhost:5000/api/jobs?${queryParams}`);
      const data = await response.json();

      setJobs(data.jobs);
      setTotalPages(data.pagination.pages);

      // Fetch saved jobs if user is logged in
      if (user?.role === 'JOBSEEKER') {
        const savedResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
          }
        });
        const userData = await savedResponse.json();
        setSavedJobs(new Set(userData.savedJobs || []));
      }
    } catch (error) {
      logError('Error fetching jobs', { 
        searchParams: sanitizeForLogging(searchParams),
        page: sanitizeForLogging(page),
        error: sanitizeForLogging(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const action = savedJobs.has(jobId) ? 'unsave' : 'save';
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jamdung_auth_token')}`
        }
      });
      
      if (response.ok) {
        setSavedJobs(prev => {
          const next = new Set(prev);
          if (action === 'save') next.add(jobId);
          else next.delete(jobId);
          return next;
        });
      }
    } catch (error) {
      logError('Error saving job', { 
        jobId: sanitizeForLogging(jobId),
        userId: sanitizeForLogging(user?.id),
        action: sanitizeForLogging(savedJobs.has(jobId) ? 'unsave' : 'save'),
        error: sanitizeForLogging(error)
      });
    }
  };


  const handleQuickApply = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setShowQuickApply(true);
  };

  useEffect(() => {
    if (isOpen) {
      logDev('Opening FindJobsModal', { 
        searchParams: sanitizeForLogging(searchParams),
        page: sanitizeForLogging(page)
      });
      fetchJobs();
    }
  }, [isOpen, page, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    logDev('Searching for jobs', { 
      searchParams: sanitizeForLogging(searchParams)
    });
    setPage(1);
    fetchJobs();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const viewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {showQuickApply && selectedJob && (
          <QuickApplyModal
            job={selectedJob}
            onClose={() => setShowQuickApply(false)}
            onSuccess={() => {
              setShowQuickApply(false);
              // TODO: Show success notification
              // Application submitted successfully
            }}
          />
        )}
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Find Jobs</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <JobTitleAutocomplete
              value={searchParams.search}
              onChange={(value) => handleInputChange({ target: { name: 'search', value } })}
            />
            <LocationAutocomplete
              value={searchParams.location}
              onChange={(value) => handleInputChange({ target: { name: 'location', value } })}
            />
            <CompanyAutocomplete
              value={searchParams.company || ''}
              onChange={(value) => handleInputChange({ target: { name: 'company', value } })}
            />
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <SalaryRangeAutocomplete
              type="min"
              value={searchParams.minSalary}
              onChange={(value) => handleInputChange({ target: { name: 'minSalary', value } })}
            />
            <SalaryRangeAutocomplete
              type="max"
              value={searchParams.maxSalary}
              onChange={(value) => handleInputChange({ target: { name: 'maxSalary', value } })}
            />
            <div className="relative">
              <select
                name="jobType"
                value={searchParams.jobType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">All Job Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                name="sort"
                value={searchParams.sort}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="remote"
                  checked={searchParams.remote}
                  onChange={(e) => handleInputChange({
                    target: { name: 'remote', value: e.target.checked }
                  })}
                  className="mr-2"
                />
                Remote Only
              </label>
            </div>
          </div>
          
          {/* Skills Filter */}
          <div className="mt-4">
            <SkillsAutocomplete
              value={searchParams.currentSkill || ''}
              onChange={(value) => {
                if (value && !searchParams.skills?.includes(value)) {
                  handleInputChange({
                    target: {
                      name: 'skills',
                      value: [...(searchParams.skills || []), value]
                    }
                  });
                }
                handleInputChange({ target: { name: 'currentSkill', value: '' } });
              }}
              selectedSkills={searchParams.skills || []}
            />
            {searchParams.skills && searchParams.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {searchParams.skills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm
                      bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      onClick={() => handleInputChange({
                        target: {
                          name: 'skills',
                          value: searchParams.skills.filter(s => s !== skill)
                        }
                      })}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setSearchParams({
                search: '',
                location: '',
                jobType: '',
                minSalary: '',
                maxSalary: '',
                remote: false,
                sort: 'latest'
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search Jobs
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No jobs found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => viewJobDetails(job.id)}>
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {job.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {job.remote && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Remote
                          </span>
                        )}
                        {job.applicationDeadline && (
                          <span className="flex items-center text-xs text-gray-500">
                            <FaClock className="mr-1" />
                            {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {savedJobs.has(job.id) ? <FaBookmark /> : <FaRegBookmark />}
                    </button>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-4 flex-wrap">
                      <span className="flex items-center">
                        <FaBuilding className="mr-1" /> {job.companyName}
                      </span>
                      <span className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" /> {job.location}
                      </span>
                      <span className="flex items-center">
                        <FaBriefcase className="mr-1" /> {job.jobType}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{job.description}</p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    {job.salary && (
                      <div className="text-sm text-green-600 font-medium">
                        {job.salary}
                      </div>
                    )}
                    {user?.role === 'JOBSEEKER' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickApply(job);
                        }}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Quick Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
