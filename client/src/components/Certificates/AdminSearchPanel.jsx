import React, { useState, useRef, useEffect, useCallback } from 'react';
import FuturisticSpinner from '../../components/ui/FuturisticSpinner';
import DateRangeFilter from './DateRangeFilter';

const AdminSearchPanel = ({
  searchTerm,
  setSearchTerm,
  studentAddressFilter,
  setStudentAddressFilter,
  institutionFilter,
  setInstitutionFilter,
  statusFilter,
  setStatusFilter,
  setNoResultsAddress,
  normalizeAddress,
  setError,
  setCurrentPage,
  contract,
  handleSearch,
  handleResetSearch,
  viewMode,
  setViewMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDateFilter,
  setShowDateFilter,
  courseNameFilter
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const statusOptions = [
    { 
      value: 'all', 
      label: 'All Statuses', 
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      value: 'verified', 
      label: 'Verified', 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'pending', 
      label: 'Pending', 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      value: 'revoked', 
      label: 'Revoked', 
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const selectedStatus = statusOptions.find(option => option.value === statusFilter) || statusOptions[0];

  // Auto-search function with debounce
  const debouncedSearch = useCallback(
    async (searchParams) => {
      if (!contract || !contract.target) {
        console.error('Contract not properly initialized. Attempting to reinitialize...');
        setError('Connection to blockchain not established. Please check your wallet connection.');
        return;
      }
      
      try {
        await handleSearch(searchParams);
      } catch (error) {
        console.error('Search error:', error);
        setError(`Search failed: ${error.message}`);
      }
    },
    [contract, handleSearch, setError]
  );

  // Effect for auto-search when searchTerm changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Check if any filters are active
      const hasActiveFilters = searchTerm.trim() !== '' || studentAddressFilter || institutionFilter || statusFilter !== 'all' || startDate || endDate;
      
      if (hasActiveFilters) {
        // Validate addresses before searching
        if (studentAddressFilter && !normalizeAddress(studentAddressFilter)) {
          setError('Invalid student address format. Please enter a valid Ethereum address.');
          return;
        }
        if (institutionFilter && !normalizeAddress(institutionFilter)) {
          setError('Invalid institution address format. Please enter a valid Ethereum address.');
          return;
        }
        setError('');
        setNoResultsAddress({ type: null, address: null });
        setCurrentPage(1);
        
        debouncedSearch({
          studentAddress: studentAddressFilter,
          institutionAddress: institutionFilter,
          courseName: courseNameFilter,
          searchTerm,
          statusFilter,
          startDate,
          endDate
        });
      }
      // Note: Don't auto-load all certificates when clearing - let user explicitly clear
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, studentAddressFilter, institutionFilter, courseNameFilter, statusFilter, startDate, endDate, debouncedSearch, normalizeAddress, setError, setNoResultsAddress, setCurrentPage]);

  // Function to handle clearing all filters and loading all certificates
  const handleClearAllFilters = useCallback(async () => {
    // Clear all filter states
    setSearchTerm('');
    setStudentAddressFilter('');
    setInstitutionFilter('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
    setError('');
    setNoResultsAddress({ type: null, address: null });
    setCurrentPage(1);
    
    // Use the handleResetSearch function from the hook to properly reset everything
    if (handleResetSearch) {
      await handleResetSearch();
    }
  }, [setSearchTerm, setStudentAddressFilter, setInstitutionFilter, setStatusFilter, setStartDate, setEndDate, setShowDateFilter, setError, setNoResultsAddress, setCurrentPage, handleResetSearch]);

  const handleSearchClick = async () => {
    setNoResultsAddress({ type: null, address: null });
    if (studentAddressFilter && !normalizeAddress(studentAddressFilter)) {
      setError('Invalid student address format. Please enter a valid Ethereum address.');
      return;
    }
    if (institutionFilter && !normalizeAddress(institutionFilter)) {
      setError('Invalid institution address format. Please enter a valid Ethereum address.');
      return;
    }
    setError('');
    setLocalLoading(true);
    setCurrentPage(1);
    if (!contract || !contract.target) {
      console.error('Contract not properly initialized. Attempting to reinitialize...');
      setError('Connection to blockchain not established. Please check your wallet connection.');
      setLocalLoading(false);
      return;
    }
    await handleSearch({
      studentAddress: studentAddressFilter,
      institutionAddress: institutionFilter,
      courseName: courseNameFilter,
      searchTerm,
      statusFilter,
      startDate,
      endDate
    });
    setLocalLoading(false);
  };

  return (
    <div className="mb-6 relative group">
      {/* Dark glassmorphism background with app's color scheme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 rounded-2xl backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 rounded-2xl"></div>
      
      {/* Animated border with app colors */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 opacity-20 blur-sm group-hover:opacity-30 transition-opacity duration-500"></div>
      <div className="absolute inset-[1px] bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-violet-500/20"></div>
      
      {/* Main content */}
      <div className="relative p-8">
        {/* Search header with dark theme */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* App-style icon with violet/cyan gradient */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-2xl blur opacity-50"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-200 shadow-lg shadow-violet-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Search Certificates
              </h2>
              <p className="text-sm text-gray-400 font-medium">Find and filter certificates by multiple criteria</p>
            </div>
          </div>
          
          {/* Dark theme view toggle */}
          <div className="flex bg-slate-800/80 rounded-2xl p-1.5 border border-violet-500/20 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25 transform scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/25 transform scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Dark theme search bar */}
        <div className="relative mb-6 group/search">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 rounded-2xl blur group-hover/search:from-violet-500/30 group-hover/search:via-cyan-500/30 group-hover/search:to-violet-500/30 transition-all duration-300"></div>
          <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-violet-500/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-hover/search:text-cyan-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by certificate ID or course name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-28 py-4 text-white placeholder-gray-400 bg-transparent border-0 rounded-2xl focus:ring-2 focus:ring-violet-500/40 focus:outline-none text-lg font-medium transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
              {/* Clear button - only show when there's text */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200 group/clear"
                  title="Clear search"
                >
                  <svg className="w-4 h-4 text-gray-400 group-hover/clear:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Search button */}
              <button
                onClick={handleSearchClick}
                disabled={localLoading}
                className="p-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-105 transform"
                title="Search"
              >
                {localLoading ? (
                  <div className="h-5 w-5">
                    <FuturisticSpinner size="sm" color="white" />
                  </div>
                ) : (
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Global Clear All Filters Button */}
        {(searchTerm || studentAddressFilter || institutionFilter || statusFilter !== 'all' || startDate || endDate) && (
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleClearAllFilters}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-orange-500/30 hover:border-orange-400/50 rounded-xl text-orange-400 hover:text-orange-300 transition-all duration-200 group/reset"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="font-medium">Clear All & Show All Certificates</span>
            </button>
          </div>
        )}

        {/* Dark theme advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-3 text-sm font-semibold text-gray-400 hover:text-cyan-300 mb-6 transition-all duration-200 group/toggle"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-700/50 border border-violet-500/20 group-hover/toggle:bg-slate-600/50 group-hover/toggle:border-cyan-400/30 transition-all duration-200">
            <svg 
              className={`w-3 h-3 transition-all duration-300 ${showAdvanced ? 'rotate-180' : ''} group-hover/toggle:text-cyan-400`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="group-hover/toggle:text-cyan-300 transition-colors duration-200">
            {showAdvanced ? 'Hide' : 'Show'} advanced filters
          </span>
        </button>

        {/* Dark theme advanced filters */}
        {showAdvanced && (
          <div className="relative">
            {/* Dark glassmorphism container for advanced filters */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/70 via-slate-900/70 to-slate-800/70 rounded-2xl blur-sm"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-violet-500/30 shadow-2xl">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Student Address with dark styling */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                      Student Address
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={studentAddressFilter}
                        onChange={(e) => setStudentAddressFilter(e.target.value)}
                        className={`block w-full px-4 py-3 text-white placeholder-gray-500 bg-slate-700/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                          studentAddressFilter && !studentAddressFilter.match(/^0x[0-9a-fA-F]{40}$/)
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/40'
                            : 'border-violet-500/30 focus:border-violet-400 hover:border-violet-400/50'
                        }`}
                      />
                      {studentAddressFilter && !studentAddressFilter.match(/^0x[0-9a-fA-F]{40}$/) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="bg-red-500/20 border border-red-400/30 rounded-full p-1">
                            <svg className="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    {studentAddressFilter && !studentAddressFilter.match(/^0x[0-9a-fA-F]{40}$/) && (
                      <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-400/20 px-3 py-1.5 rounded-lg">Please enter a valid Ethereum address</p>
                    )}
                  </div>

                  {/* Institution Address with dark styling */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                      Institution Address
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={institutionFilter}
                        onChange={(e) => setInstitutionFilter(e.target.value)}
                        className={`block w-full px-4 py-3 text-white placeholder-gray-500 bg-slate-700/60 backdrop-blur-sm border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                          institutionFilter && !institutionFilter.match(/^0x[0-9a-fA-F]{40}$/)
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/40'
                            : 'border-violet-500/30 focus:border-violet-400 hover:border-violet-400/50'
                        }`}
                      />
                      {institutionFilter && !institutionFilter.match(/^0x[0-9a-fA-F]{40}$/) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="bg-red-500/20 border border-red-400/30 rounded-full p-1">
                            <svg className="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    {institutionFilter && !institutionFilter.match(/^0x[0-9a-fA-F]{40}$/) && (
                      <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-400/20 px-3 py-1.5 rounded-lg">Please enter a valid Ethereum address</p>
                    )}
                  </div>

                  {/* Modern Futuristic Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                      Certificate Status
                    </label>
                    <div className="relative" ref={statusDropdownRef}>
                      {/* Modern trigger button */}
                      <button
                        type="button"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="group relative w-full px-4 py-3 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-violet-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 hover:border-violet-400/60 transition-all duration-200 cursor-pointer text-left overflow-hidden"
                      >
                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-1.5 rounded-lg ${selectedStatus.bgColor} ${selectedStatus.color}`}>
                              {selectedStatus.icon}
                            </div>
                            <div>
                              <span className="text-white font-medium">{selectedStatus.label}</span>
                              <div className="text-xs text-gray-400">Select certificate status</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* Status indicator dot */}
                            <div className={`w-2 h-2 rounded-full ${selectedStatus.color.replace('text-', 'bg-')} animate-pulse`}></div>
                            <svg 
                              className={`h-4 w-4 text-gray-400 transition-all duration-300 ${isStatusDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Modern Dropdown Menu */}
                      {isStatusDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2">
                          {/* Backdrop blur effect */}
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl rounded-xl border border-violet-500/30 shadow-2xl"></div>
                          
                          {/* Menu content */}
                          <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-xl border border-violet-500/30 shadow-2xl overflow-hidden">
                            {/* Header with gradient */}
                            <div className="px-4 py-3 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border-b border-violet-500/20">
                              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Status</div>
                            </div>
                            
                            {/* Options */}
                            <div className="py-2">
                              {statusOptions.map((option, index) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setStatusFilter(option.value);
                                    setIsStatusDropdownOpen(false);
                                    // Auto-trigger search when status changes
                                    debouncedSearch({
                                      studentAddress: studentAddressFilter,
                                      institutionAddress: institutionFilter,
                                      courseName: courseNameFilter,
                                      searchTerm,
                                      statusFilter: option.value,
                                      startDate,
                                      endDate
                                    });
                                  }}
                                  className={`group relative w-full px-4 py-3 text-left transition-all duration-200 flex items-center space-x-3 ${
                                    statusFilter === option.value 
                                      ? 'bg-gradient-to-r from-violet-500/30 to-cyan-500/20 text-white border-l-2 border-l-cyan-400' 
                                      : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-cyan-500/10'
                                  }`}
                                >
                                  {/* Status icon with background */}
                                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                                    statusFilter === option.value 
                                      ? option.bgColor 
                                      : 'bg-slate-700/50 group-hover:' + option.bgColor
                                  }`}>
                                    <div className={statusFilter === option.value ? option.color : 'text-gray-400 group-hover:' + option.color}>
                                      {option.icon}
                                    </div>
                                  </div>
                                  
                                  {/* Label */}
                                  <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-gray-500">
                                      {option.value === 'all' && 'Show all certificates'}
                                      {option.value === 'verified' && 'Validated certificates'}
                                      {option.value === 'pending' && 'Awaiting verification'}
                                      {option.value === 'revoked' && 'Invalid certificates'}
                                    </div>
                                  </div>
                                  
                                  {/* Selection indicator */}
                                  {statusFilter === option.value && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                      <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {/* Hover glow effect */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dark theme Date range filter */}
                <div className="pt-6 border-t border-violet-500/20">
                  <DateRangeFilter
                    showDateFilter={showDateFilter}
                    setShowDateFilter={setShowDateFilter}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                  />
                </div>

                {/* Dark theme action buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-violet-500/20">
                  <button
                    onClick={handleClearAllFilters}
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200 group"
                  >
                    <div className="bg-slate-700/50 group-hover:bg-slate-600/50 border border-violet-500/20 group-hover:border-cyan-400/30 p-1.5 rounded-lg transition-all duration-200">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <span>Clear all filters</span>
                  </button>
                  
                  <button
                    onClick={handleSearchClick}
                    disabled={localLoading}
                    className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-105 transform"
                  >
                    {localLoading ? (
                      <>
                        <div className="h-4 w-4">
                          <FuturisticSpinner size="sm" color="white" />
                        </div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Apply Filters</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSearchPanel; 