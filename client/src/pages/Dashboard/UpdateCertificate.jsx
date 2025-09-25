import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import { useContractInitialization } from '../../hooks/useContractInitialization';
import { useCertificateUpdate } from '../../hooks/useCertificateUpdate';
import { formatGrade, getStatusColor, getStatusText } from '../../components/sperates/cert_utilits';
import { FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import CertificateDetails from '../../components/Certificates/CertificateDetails';

// Custom Dropdown Component with Portal
const FuturisticDropdown = ({ options, value, onChange, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen && buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen && buttonRef.current) {
        setButtonRect(buttonRef.current.getBoundingClientRect());
      }
      setIsOpen(!isOpen);
    }
  };

  const selectedOption = options.find(opt => opt.value === value);

  // Dropdown Portal Component
  const DropdownPortal = () => {
    if (!isOpen || !buttonRect) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        className="fixed z-[99999]"
        style={{
          top: buttonRect.bottom + 8,
          left: buttonRect.left,
          width: buttonRect.width,
        }}
      >
        <div className="
          bg-gradient-to-b from-slate-900/98 via-slate-800/98 to-slate-900/98 
          backdrop-blur-3xl rounded-xl border border-white/20
          shadow-2xl shadow-black/60
        ">
          {/* Enhanced Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl" />
          
          <div className="relative max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name: 'searchType', value: option.value } });
                  setIsOpen(false);
                }}
                className={`
                  w-full p-4 text-left transition-all duration-300 group relative
                  hover:bg-gradient-to-r hover:from-cyan-500/15 hover:to-purple-500/15
                  ${value === option.value ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25' : ''}
                  ${index !== options.length - 1 ? 'border-b border-white/8' : ''}
                  ${index === 0 ? 'rounded-t-xl' : ''}
                  ${index === options.length - 1 ? 'rounded-b-xl' : ''}
                `}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                    ${value === option.value 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30' 
                      : 'bg-white/10 group-hover:bg-white/20 group-hover:shadow-lg group-hover:shadow-white/10'
                    }
                  `}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`
                      font-semibold transition-colors duration-300 text-sm
                      ${value === option.value ? 'text-cyan-300' : 'text-white group-hover:text-cyan-300'}
                    `}>
                      {option.label}
                    </div>
                    <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">
                      {option.description}
                    </div>
                  </div>
                  {value === option.value && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full p-3 sm:p-4 rounded-lg sm:rounded-xl text-left text-sm sm:text-base
          bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-xl
          border transition-all duration-300 group relative overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed border-white/5' : 'cursor-pointer hover:bg-white/15'}
          ${isOpen 
            ? 'border-cyan-500/60 bg-white/15 shadow-lg shadow-cyan-500/20' 
            : 'border-white/10 hover:border-cyan-500/40'
          }
        `}
      >
        {/* Button glow effect */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
        `} />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isOpen 
                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/60 animate-pulse' 
                : 'bg-white/40 group-hover:bg-cyan-400/60'
              }
            `} />
            <span className="text-white font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <div className={`
            transition-all duration-300 transform
            ${isOpen ? 'rotate-180 text-cyan-400' : 'rotate-0 text-white/60 group-hover:text-cyan-400'}
          `}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Portal Dropdown */}
      <DropdownPortal />
    </>
  );
};

const UpdateCertificate = () => {
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState(null);

  // Form values
  const [formValues, setFormValues] = useState({
    searchType: 'id',
    searchQuery: '',
    newGrade: '',
    updateReason: '',
  });

  // Dropdown options with icons and descriptions
  const searchTypeOptions = [
    {
      value: 'id',
      label: 'Certificate ID',
      description: 'Search by unique certificate number',
      icon: (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      )
    },
    {
      value: 'name',
      label: 'Course Name',
      description: 'Search by course title',
      icon: (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      value: 'student',
      label: 'Student Address',
      description: 'Search by wallet address',
      icon: (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      value: 'institution',
      label: 'Institution',
      description: 'Search by institution name',
      icon: (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ];

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            setConnected(true);
          }
          
          // Initialize the contract
          const certContract = new Contract(
            contractAddress.SoulboundCertificateNFT,
            contractABI.SoulboundCertificateNFT,
            provider
          );
          setContract(certContract);
        }
      } catch (error) {
        console.error('Failed to initialize contract:', error);
      }
    };

    initializeContract();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setConnected(true);
        }
      } else {
        alert('Please install MetaMask or another Ethereum wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Use the certificate update hook
  const {
    searchResults,
    selectedCertificate,
    isLoading,
    error,
    isSuccess,
    txHash,
    searchCertificate,
    selectCertificate,
    updateCertificateGrade
  } = useCertificateUpdate(contract);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!formValues.searchType || !formValues.searchQuery) {
      return;
    }
    searchCertificate(formValues.searchType, formValues.searchQuery);
  };

  // Handle update form submission
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedCertificate) return;
    
    updateCertificateGrade(
      selectedCertificate.id,
      formValues.newGrade,
      formValues.updateReason
    );
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormValues({
      searchType: 'id',
      searchQuery: '',
      newGrade: '',
      updateReason: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Compact Header */}
          <div className="relative bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-cyan-600/20 px-4 sm:px-6 py-4 sm:py-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiKDI1NSAyNTUgMjU1IC8gMC4xKSIvPgo8L3N2Zz4K')] opacity-30"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2 tracking-tight">
                Certificate Updater
              </h1>
              <p className="text-sm text-white/70 max-w-md mx-auto">
                Modify academic records with blockchain security
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

            {/* Wallet Connection Status */}
            {!connected ? (
              <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Wallet Connection Required</h3>
                  <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 px-2">Connect your MetaMask wallet to manage certificates securely on the blockchain.</p>
                  <button
                    onClick={connectWallet}
                    className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105"
                  >
                    <span className="flex items-center justify-center text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connect Wallet
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">Wallet Connected</p>
                        <p className="text-emerald-400 text-xs sm:text-sm font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FaExclamationTriangle className="text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Error Occurred</h4>
                    <p className="text-white/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-8 p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FaCheck className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Certificate Updated Successfully!</h4>
                    {txHash && (
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-sm text-emerald-300 font-mono">
                          Transaction: {txHash.slice(0, 12)}...{txHash.slice(-10)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Search Section */}
            <div className="mb-8 sm:mb-10">
              <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md sm:rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Search Certificates</h2>
                </div>
                
                <form onSubmit={handleSearchSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                    <div className="sm:col-span-1 lg:col-span-3">
                      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">Search Type</label>
                      <FuturisticDropdown
                        options={searchTypeOptions}
                        value={formValues.searchType}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Select search type"
                      />
                    </div>

                    <div className="sm:col-span-1 lg:col-span-7">
                      <label className="block text-xs sm:text-sm font-medium text-white/70 mb-2">Search Query</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="searchQuery"
                          value={formValues.searchQuery}
                          onChange={handleChange}
                          placeholder={`Enter ${formValues.searchType === 'id' ? 'certificate ID' : formValues.searchType === 'name' ? 'course name' : formValues.searchType === 'student' ? 'student wallet address' : 'institution name'}...`}
                          className="w-full p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-xl bg-white/5 border-0 focus:ring-2 focus:ring-cyan-500/20 transition-all text-white text-sm sm:text-base placeholder-white/40 outline-none"
                          disabled={isLoading}
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="hidden sm:block text-xs sm:text-sm font-medium text-white/70 mb-2">&nbsp;</label>
                      <button
                        type="submit"
                        className="group w-full h-[48px] sm:h-[56px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        disabled={isLoading || !connected}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center text-sm sm:text-base">
                            <FaSpinner className="animate-spin mr-2" />
                            Searching...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-sm sm:text-base">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && !selectedCertificate && (
              <div className="mb-8 sm:mb-10">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md sm:rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Search Results</h3>
                  </div>
                  <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit">
                    {searchResults.length} found
                  </div>
                </div>
                
                <div className="grid gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {searchResults.map((cert) => (
                    <div 
                      key={cert.id} 
                      className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-cyan-500/30 transition-all duration-300 hover:bg-white/[0.05]"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          {/* Certificate ID */}
                          <div>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">Certificate ID</p>
                            <p className="text-white font-mono text-sm"># {cert.id}</p>
                          </div>
                          
                          {/* Course Info */}
                          <div>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">Course</p>
                            <p className="text-white font-medium text-sm">{cert.courseName || `Course ${cert.courseId}`}</p>
                          </div>
                          
                          {/* Student */}
                          <div className="sm:col-span-2 lg:col-span-1">
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">Student</p>
                            <p className="text-white/80 font-mono text-xs sm:text-sm break-all sm:break-normal">{cert.student.slice(0, 6)}...{cert.student.slice(-4)}</p>
                          </div>
                          
                          {/* Grade & Status */}
                          <div>
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">Grade & Status</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-white font-semibold text-sm">{cert.grade}%</span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(cert)}`}>
                                {getStatusText(cert)}
                              </span>
                            </div>
                            <p className="text-xs text-white/60 mt-1">{formatGrade(cert.grade)}</p>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="lg:ml-6">
                          <button
                            onClick={() => selectCertificate(cert)}
                            disabled={cert.isRevoked}
                            className="group/btn w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 transform hover:scale-105"
                          >
                            <span className="flex items-center justify-center space-x-2 text-sm sm:text-base">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>{cert.isRevoked ? 'Revoked' : 'Select'}</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Update Form - Only show when a certificate is selected */}
            {selectedCertificate && (
              <div className="mt-8 sm:mt-10">
                <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 p-4 sm:p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md sm:rounded-lg flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Update Certificate</h3>
                      </div>
                      <button
                        onClick={() => selectCertificate(null)}
                        className="group text-xs sm:text-sm text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 sm:px-4 py-2 rounded-md sm:rounded-lg transition-all"
                      >
                        <span className="flex items-center space-x-1 sm:space-x-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="hidden sm:inline">Select Different</span>
                          <span className="sm:hidden">Change</span>
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Certificate Details */}
                    <div className="mb-6 sm:mb-8">
                      <CertificateDetails certificate={selectedCertificate} compact={true} />
                    </div>

                    {selectedCertificate.isRevoked ? (
                      <div className="p-4 sm:p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Certificate Revoked</h4>
                        <p className="text-white/70 text-sm">This certificate has been revoked and cannot be updated.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateSubmit} className="space-y-6 sm:space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          {/* New Grade */}
                          <div className="space-y-3">
                            <label htmlFor="newGrade" className="block text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">
                              New Grade
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                name="newGrade"
                                id="newGrade"
                                min="0"
                                max="100"
                                value={formValues.newGrade}
                                onChange={handleChange}
                                placeholder="Enter grade (0-100)"
                                className="w-full p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white text-base sm:text-lg appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-white/40"
                                disabled={isLoading}
                                required
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              {formValues.newGrade && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                                  <span className="text-purple-400 font-semibold text-sm sm:text-base">%</span>
                                </div>
                              )}
                            </div>
                            {formValues.newGrade && (
                              <p className="text-xs sm:text-sm text-white/60">
                                Grade: {formatGrade(parseInt(formValues.newGrade) || 0)}
                              </p>
                            )}
                          </div>

                          {/* Current Grade Display */}
                          <div className="space-y-3">
                            <label className="block text-xs sm:text-sm font-medium text-white/70 uppercase tracking-wide">
                              Current Grade
                            </label>
                            <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-base sm:text-lg font-semibold">{selectedCertificate.grade}%</span>
                                <span className="text-white/60 text-xs sm:text-sm">{formatGrade(selectedCertificate.grade)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Update Reason */}
                        <div className="space-y-3">
                          <label htmlFor="updateReason" className="block text-sm font-medium text-white/70 uppercase tracking-wide">
                            Reason for Update
                          </label>
                          <div className="relative">
                            <textarea
                              name="updateReason"
                              id="updateReason"
                              rows={4}
                              value={formValues.updateReason}
                              onChange={handleChange}
                              placeholder="Please provide a detailed reason for this grade update..."
                              className="w-full p-4 pl-12 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-white resize-none placeholder-white/40"
                              disabled={isLoading}
                              required
                            />
                            <div className="absolute top-4 left-4">
                              <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10">
                          <button
                            type="submit"
                            className="group flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            disabled={isLoading || !connected || selectedCertificate.isRevoked}
                          >
                            {isLoading ? (
                              <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-3" />
                                Processing Update...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Update Certificate
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              selectCertificate(null);
                              resetForm();
                            }}
                            className="group flex-1 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-gray-500/25 transform hover:scale-105"
                            disabled={isLoading}
                          >
                            <span className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCertificate;
