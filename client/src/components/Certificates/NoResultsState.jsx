import React from 'react';
import { FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';

const NoResultsState = ({
  error,
  noResultsAddress,
  studentAddressFilter,
  institutionFilter,
  certificates,
  handleClearSearchAndShowAll,
  isAdmin = false,
  isInstitute = false,
  searchTerm = '',
  statusFilter = '',
  courseNameFilter = ''
}) => {
  
  // Determine if there's an active search/filter
  const hasActiveSearch = !!(
    searchTerm || 
    studentAddressFilter || 
    institutionFilter || 
    (statusFilter && statusFilter !== 'all') ||
    courseNameFilter ||
    noResultsAddress.type
  );
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-red-500/20 rounded-full mb-4">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-400">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          
          {/* Clear button intentionally removed to avoid duplicate with AdminSearchPanel */}
        </div>
      </div>
    );
  }
  
  if (noResultsAddress.type) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-20 h-20 flex items-center justify-center bg-blue-500/10 rounded-full mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3 text-white">No Certificates Found</h3>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-5">
            <p className="text-lg text-gray-300 mb-2">
              {noResultsAddress.type === 'student' 
                ? "This student doesn't have any certificates issued yet." 
                : "This institution hasn't issued any certificates yet."}
            </p>
            <div className="flex items-center justify-center p-2 bg-gray-900/50 rounded mt-3 overflow-hidden">
              <span className="text-gray-400 mr-2">Address:</span>
              <code className="text-violet-400 text-sm font-mono truncate">{noResultsAddress.address}</code>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            The address is valid but no {noResultsAddress.type === 'student' ? 'certificates have been issued to this student' : 'certificates have been issued by this institution'}.
          </p>
          
          {/* Clear button intentionally removed to avoid duplicate with AdminSearchPanel */}
        </div>
      </div>
    );
  }
  
  if (studentAddressFilter || institutionFilter) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-14 h-14 flex items-center justify-center bg-blue-500/20 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Certificates Found</h3>
          <p className="text-gray-400 mb-2">
            No certificates match your search criteria.
          </p>
          
          {/* Clear button intentionally removed to avoid duplicate with AdminSearchPanel */}
        </div>
      </div>
    );
  }
  
  // Default "no certificates" state
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <FaFileAlt className="mx-auto text-4xl text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Certificates Found</h3>
        <p className="text-gray-400 mb-2">
          {certificates.length === 0 ? "No certificates available." : "No certificates match your search criteria."}
        </p>
        
        {/* Clear button intentionally removed to avoid duplicate with AdminSearchPanel */}
      </div>
    </div>
  );
};

export default NoResultsState; 