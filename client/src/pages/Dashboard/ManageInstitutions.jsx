import React, { useState, useRef, useEffect } from 'react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import InstitutionManagement from '../../components/Institutions/InstitutionManagement';
import toast from 'react-hot-toast';

const ManageInstitutions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Use the updated InstitutionManagement component without redundant toast notifications
  const {
    institutions,
    loading,
    error,
    success,
    newInstitution,
    showConfirmDialog,
    institutionToDelete,
    setNewInstitution,
    authorizeInstitution,
    reactivateInstitution,
    confirmRevokeInstitution,
    cancelRevoke,
    revokeInstitution,
    validateEthereumAddress
  } = InstitutionManagement({
    // Don't show duplicate toasts - InstitutionManagement already handles notifications
    onSuccess: () => {},
    onError: () => {}
  });

  // Filter institutions based on search term and status
  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = 
      institution.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || institution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleViewMode = () => {
    setViewMode(viewMode === 'cards' ? 'table' : 'cards');
  };

  const handleAddInstitution = () => {
    if (!validateEthereumAddress(newInstitution)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }
    authorizeInstitution();
    setShowAddForm(false);
    setNewInstitution('');
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Institution Management
                </h1>
                <p className="text-gray-400 mt-1">Authorize and manage blockchain institutions</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Institution</span>
              </div>
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Institutions</p>
                  <p className="text-2xl font-bold text-white">{institutions.length}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-white">{institutions.filter(i => i.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">Inactive</p>
                  <p className="text-2xl font-bold text-white">{institutions.filter(i => i.status === 'inactive').length}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Certificates</p>
                  <p className="text-2xl font-bold text-white">{institutions.reduce((sum, i) => sum + i.certificateCount, 0)}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Institution Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Add New Institution
                </h3>
                <button
                  onClick={() => {setShowAddForm(false); setNewInstitution('');}} 
                  className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3">
                    Ethereum Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      placeholder="0x1234567890123456789012345678901234567890"
                      className={`w-full px-4 py-4 bg-gray-800/50 border-2 transition-all duration-200 ${
                        newInstitution && !validateEthereumAddress(newInstitution)
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-purple-500/30 focus:border-purple-500'
                      } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm`}
                    />
                    {newInstitution && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        {validateEthereumAddress(newInstitution) ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  {newInstitution && !validateEthereumAddress(newInstitution) && (
                    <p className="mt-2 text-sm text-red-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Please enter a valid Ethereum address
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => {setShowAddForm(false); setNewInstitution('');}}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all duration-200 font-medium border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddInstitution}
                    disabled={loading || !newInstitution || !validateEthereumAddress(newInstitution)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-purple-500/25"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Institution
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-500/30 rounded-2xl text-red-200 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-900/40 to-green-800/40 border border-green-500/30 rounded-2xl text-green-200 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Search, Filter and View Toggle */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search institutions by address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative min-w-48" ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full px-4 py-4 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 flex items-center justify-between"
              >
                <span className="capitalize">
                  {filterStatus === 'all' ? 'All Status' : filterStatus}
                </span>
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {[
                    { 
                      value: 'all', 
                      label: 'All Status', 
                      iconSvg: (
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      )
                    },
                    { 
                      value: 'active', 
                      label: 'Active', 
                      iconSvg: (
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: 'inactive', 
                      label: 'Inactive', 
                      iconSvg: (
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: 'admin', 
                      label: 'Admin', 
                      iconSvg: (
                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )
                    }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterStatus(option.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-purple-500/20 transition-all duration-200 flex items-center space-x-3 ${
                        filterStatus === option.value 
                          ? 'bg-purple-500/30 text-purple-200' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {option.iconSvg}
                      <span>{option.label}</span>
                      {filterStatus === option.value && (
                        <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={toggleViewMode}
              className="px-6 py-4 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 rounded-2xl text-white hover:bg-gray-700/40 transition-all duration-200 flex items-center space-x-2 min-w-fit"
              title={viewMode === 'cards' ? 'Switch to Table View' : 'Switch to Card View'}
            >
              {viewMode === 'cards' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Table</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="hidden sm:inline">Cards</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Institutions List */}
        <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-purple-500/20 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                Institutions Registry
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {filteredInstitutions.length} of {institutions.length} institutions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center p-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-500 rounded-full animate-spin animate-reverse"></div>
              </div>
              <p className="mt-4 text-gray-400">Loading institutions...</p>
            </div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full"></div>
                <svg className="relative w-24 h-24 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No institutions found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">No institutions match your current search criteria. Try adjusting your filters or search terms.</p>
              <button
                onClick={() => {setSearchTerm(''); setFilterStatus('all');}}
                className="px-6 py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-200 font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th scope="col" className="px-8 py-6 text-left text-sm font-semibold text-purple-300 uppercase tracking-wider">
                      Institution
                    </th>
                    <th scope="col" className="px-8 py-6 text-left text-sm font-semibold text-purple-300 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-8 py-6 text-left text-sm font-semibold text-purple-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-8 py-6 text-left text-sm font-semibold text-purple-300 uppercase tracking-wider">
                      Certificates
                    </th>
                    <th scope="col" className="px-8 py-6 text-right text-sm font-semibold text-purple-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredInstitutions.map((institution, index) => (
                    <tr key={index} className="hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-blue-900/20 transition-all duration-300 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            {institution.status === 'active' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-white font-semibold">{institution.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-mono text-sm text-gray-300 bg-gray-800/30 px-3 py-2 rounded-lg border border-gray-700/30">
                          {institution.address}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-xl backdrop-blur-sm ${
                          institution.status === 'active' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : institution.status === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {institution.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <div className="text-white font-bold text-lg">{institution.certificateCount}</div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {institution.isAdmin ? (
                          <span className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 px-4 py-2 rounded-xl font-semibold border border-purple-500/30">
                            Admin
                          </span>
                        ) : institution.isSelf ? (
                          <span className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 px-4 py-2 rounded-xl font-semibold border border-blue-500/30">
                            Self
                          </span>
                        ) : institution.status === 'inactive' ? (
                          <button
                            onClick={() => reactivateInstitution(institution.address)}
                            disabled={loading}
                            className="group/btn px-4 py-2 bg-gradient-to-r from-green-600/80 to-emerald-500/80 hover:from-green-600 hover:to-emerald-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25 border border-green-500/30"
                            title="Reactivate Institution"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6" />
                            </svg>
                            <span className="font-semibold">Reactivate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmRevokeInstitution(institution)}
                            disabled={loading}
                            className="group/btn px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-600 hover:to-red-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-red-500/25 border border-red-500/30"
                            title="Revoke Institution"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="font-semibold">Revoke</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution, index) => (
                <div key={index} className="group relative">
                  {/* Card Background with Gradient Border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          {institution.status === 'active' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse">
                              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors duration-200">
                            {institution.name}
                          </h4>
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full backdrop-blur-sm mt-2 ${
                            institution.status === 'active' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : institution.status === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {institution.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {institution.isAdmin ? (
                        <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 px-3 py-2 rounded-xl text-xs font-bold border border-purple-500/30">
                          Admin
                        </div>
                      ) : institution.isSelf ? (
                        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 px-3 py-2 rounded-xl text-xs font-bold border border-blue-500/30">
                          Self
                        </div>
                      ) : null}
                    </div>
                    
                    {/* Institution Details */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Address
                        </div>
                        <div className="font-mono text-sm text-gray-300 bg-gray-800/40 px-3 py-2 rounded-lg border border-gray-700/30 break-all">
                          {institution.address}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Certificates</div>
                            <div className="text-xl font-bold text-white">{institution.certificateCount}</div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        {!institution.isAdmin && !institution.isSelf && institution.status !== 'inactive' && (
                          <button
                            onClick={() => confirmRevokeInstitution(institution)}
                            disabled={loading}
                            className="group/btn px-4 py-2 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-600 hover:to-red-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-red-500/25 border border-red-500/30"
                            title="Revoke Institution"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-sm font-semibold">Revoke</span>
                          </button>
                        )}
                        
                        {institution.status === 'inactive' && (
                          <button
                            onClick={() => reactivateInstitution(institution.address)}
                            disabled={loading}
                            className="group/btn px-4 py-2 bg-gradient-to-r from-green-600/80 to-emerald-500/80 hover:from-green-600 hover:to-emerald-500 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25 border border-green-500/30"
                            title="Reactivate Institution"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 4l-6 6M4 20l6-6" />
                            </svg>
                            <span className="text-sm font-semibold">Reactivate</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-3xl blur opacity-30"></div>
            
            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-gray-900/95 to-red-900/95 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  Confirm Revocation
                </h3>
                
                {/* Message */}
                <p className="text-gray-300 mb-8 leading-relaxed">
                  Are you sure you want to revoke{' '}
                  <span className="font-bold text-white bg-gray-800/50 px-2 py-1 rounded">
                    {institutionToDelete?.name}
                  </span>
                  ? This action will permanently remove their ability to issue new certificates.
                </p>
                
                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={cancelRevoke}
                    className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all duration-200 font-medium border border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={revokeInstitution}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-red-500/25"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        <span>Revoking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Revoke Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageInstitutions;