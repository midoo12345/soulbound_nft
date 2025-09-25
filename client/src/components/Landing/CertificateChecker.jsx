import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCertificate, FaCheckCircle, FaTimesCircle, FaSpinner, FaEthereum, FaEye } from 'react-icons/fa';
import { ethers } from 'ethers';
import contractAddresses from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import { fetchMetadataFromIPFS, getImageUrlFromMetadata, placeholderImage } from '../sperates/f1.js';
import { processCertificatesBatch } from '../sperates/cert_utilits.js';
import FuturisticSpinner from '../ui/FuturisticSpinner';

const CertificateChecker = () => {
  const [studentAddress, setStudentAddress] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageLoading, setModalImageLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateImages, setCertificateImages] = useState({});

  // Initialize contract
  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        try {
          console.log('Initializing contract...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contractInstance = new ethers.Contract(
            contractAddresses.sepolia.SoulboundCertificateNFT,
            contractABI.SoulboundCertificateNFT,
            provider
          );
          setContract(contractInstance);
          setError('');
          console.log('Contract initialized successfully.');
        } catch (error) {
          console.error('Error initializing contract:', error);
          setError('Failed to initialize blockchain connection: ' + error.message);
        }
      } else {
        setError('MetaMask not detected. Please install MetaMask to use this feature.');
      }
    };

    initializeContract();
  }, []);

  // Validate Ethereum address
  const validateAddress = (address) => {
    return ethers.isAddress(address);
  };

  // Quick check using balanceOf
  const quickCheck = async (address) => {
    try {
      const balance = await contract.balanceOf(address);
      return {
        hasCertificates: balance > 0,
        count: Number(balance)
      };
    } catch (error) {
      console.error('Error in quick check:', error);
      throw new Error('Failed to check certificate balance');
    }
  };

  // Detailed check using getCertificatesByStudent
  const detailedCheck = async (address) => {
    try {
      const certificateIds = await contract.getCertificatesByStudent(address, 0, 100);
      
      if (certificateIds.length === 0) {
        return { certificates: [], count: 0 };
      }

      // Use the processCertificatesBatch function to get full certificate data including metadata
      const certificates = await processCertificatesBatch(contract, certificateIds.map(id => Number(id)));

      return { certificates, count: certificates.length };
    } catch (error) {
      console.error('Error in detailed check:', error);
      throw new Error('Failed to get detailed certificate information');
    }
  };


  // Handle certificate check
  const handleCheckCertificates = async () => {
    if (!studentAddress.trim()) {
      setError('Please enter a student address');
      return;
    }

    if (!validateAddress(studentAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    if (!contract) {
      setError('Smart contract not initialized. Please refresh the page.');
      return;
    }

    setIsChecking(true);
    setError('');
    setCheckResult(null);

    try {
      console.log('Starting certificate check for address:', studentAddress);
      
      // Quick check first
      const quickResult = await quickCheck(studentAddress);
      console.log('Quick check result:', quickResult);
      
      if (quickResult.hasCertificates) {
        // Get detailed information
        console.log('Getting detailed certificate information...');
        const detailedResult = await detailedCheck(studentAddress);
        console.log('Detailed check result:', detailedResult);
        
        setCheckResult({
          ...quickResult,
          ...detailedResult,
          address: studentAddress
        });
      } else {
        setCheckResult({
          ...quickResult,
          address: studentAddress,
          certificates: []
        });
      }
    } catch (error) {
      console.error('Certificate check error:', error);
      setError(error.message || 'An unexpected error occurred while checking certificates');
    } finally {
      setIsChecking(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (isVerified, isRevoked) => {
    if (isRevoked) return 'text-red-400';
    if (isVerified) return 'text-green-400';
    return 'text-yellow-400';
  };

  // Get status text
  const getStatusText = (isVerified, isRevoked) => {
    if (isRevoked) return 'REVOKED';
    if (isVerified) return 'VERIFIED';
    return 'PENDING';
  };

  // Load certificate image
  const loadCertificateImage = async (certificate) => {
    if (!certificate) return null;

    // Check if image already loaded
    if (certificateImages[certificate.id]) {
      return certificateImages[certificate.id];
    }

    // Check if certificate has image URL already
    if (certificate.imageUrl) {
      setCertificateImages(prev => ({ ...prev, [certificate.id]: certificate.imageUrl }));
      return certificate.imageUrl;
    }

    // Try to load from IPFS if metadata CID exists
    if (certificate.metadataCID) {
      try {
        const metadata = await fetchMetadataFromIPFS(certificate.metadataCID);
        if (metadata && metadata.image) {
          const imageCID = metadata.image.startsWith('ipfs://') ? metadata.image.slice(7) : metadata.image;
          const imageUrl = getImageUrlFromMetadata(metadata, imageCID);
          setCertificateImages(prev => ({ ...prev, [certificate.id]: imageUrl }));
          return imageUrl;
        }
      } catch (error) {
        console.log('Error loading certificate image:', error);
      }
    }
    
    // If no image found, set placeholder
    setCertificateImages(prev => ({ ...prev, [certificate.id]: placeholderImage }));
    return placeholderImage;
  };

  // Handle modal open
  const openImageModal = async (certificate) => {
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
    setModalImageLoading(true);
    
    // Load image
    await loadCertificateImage(certificate);
    
    // Simulate loading for suspense effect
    setTimeout(() => {
      setModalImageLoading(false);
    }, 800);
  };

  // Handle modal close
  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImageLoading(false);
    setSelectedCertificate(null);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeImageModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden min-h-screen">
      {/* Futuristic Background - Matching Hero Section */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-gray-950"></div>
        
        {/* Animated Grid (motion-safe) */}
        <div className="absolute inset-0 opacity-15 motion-safe:opacity-20">
          <div 
            className="w-full h-full motion-safe:animate-gradient"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px, 50px 50px, 25px 25px, 25px 25px'
            }}
          ></div>
        </div>

        {/* Floating Energy Orbs - Responsive Positioning */}
        <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-radial from-blue-500/20 to-transparent rounded-full motion-safe:animate-float blur-sm"></div>
        <div className="absolute bottom-16 right-4 sm:bottom-32 sm:right-32 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-radial from-violet-500/15 to-transparent rounded-full motion-safe:animate-orbit blur-sm"></div>
        <div className="absolute top-1/2 left-4 sm:left-16 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-radial from-cyan-500/25 to-transparent rounded-full motion-safe:animate-pulse-fast blur-sm"></div>

        {/* Additional Floating Elements for Certificate Section - Responsive */}
        <div className="absolute top-1/4 right-4 sm:top-1/3 sm:right-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-radial from-cyan-500/15 to-transparent rounded-full motion-safe:animate-float blur-sm"></div>
        <div className="absolute bottom-1/4 left-4 sm:bottom-1/3 sm:left-1/3 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-radial from-purple-500/10 to-transparent rounded-full motion-safe:animate-orbit blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-600/30 mb-3 sm:mb-4">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-slate-300 font-medium">Certificate Verification</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-3 sm:mb-4 md:mb-6 leading-tight">
            Certificate Checker
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-300 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto leading-relaxed px-2">
            Verify student certificates on the blockchain with real-time verification and transparent transaction history.
          </p>
        </motion.div>

        {/* Certificate Checker Card */}
        <motion.div 
          className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl blur-lg"></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-600/30 shadow-2xl p-4 sm:p-5 md:p-6 lg:p-8">
              {/* Input Section */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label className="block text-slate-300 text-xs sm:text-sm font-semibold mb-2 uppercase tracking-wider">
                      Student Wallet Address
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="0x1234...5678"
                        value={studentAddress}
                        onChange={(e) => setStudentAddress(e.target.value)}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 sm:focus:ring-3 focus:ring-cyan-400/20 transition-all duration-300 text-sm sm:text-base font-mono group-hover:border-slate-500/50"
                        disabled={isChecking}
                      />
                      <FaEthereum className="absolute right-3 sm:right-4 md:right-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-cyan-400 transition-colors duration-300 text-sm sm:text-base" />
                    </div>
                  </div>
                  <button
                    onClick={handleCheckCertificates}
                    disabled={isChecking || !studentAddress.trim()}
                    className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 disabled:shadow-lg"
                  >
                    {isChecking ? (
                      <>
                        <FaSpinner className="animate-spin text-sm sm:text-base" />
                        <span className="hidden sm:inline">Checking...</span>
                        <span className="sm:hidden">Checking</span>
                      </>
                    ) : (
                      <>
                        <FaSearch className="text-sm sm:text-base" />
                        <span className="hidden sm:inline">Check Certificates</span>
                        <span className="sm:hidden">Check</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg sm:rounded-xl text-red-400 text-xs sm:text-sm backdrop-blur-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full"></div>
                      {error}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Results Section */}
              {checkResult && (
                <motion.div 
                  className="border-t border-slate-600/30 pt-4 sm:pt-6 md:pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Summary */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-slate-700/50 to-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-600/30 shadow-xl">
                      {checkResult.hasCertificates ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-green-400 text-lg sm:text-xl md:text-2xl" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                          <FaTimesCircle className="text-red-400 text-lg sm:text-xl md:text-2xl" />
                        </div>
                      )}
                      <div className="text-center sm:text-left">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">
                          {checkResult.hasCertificates ? 'Certificates Found!' : 'No Certificates Found'}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-slate-300">
                          Address: <span className="font-mono text-cyan-400 bg-slate-800/50 px-2 py-1 rounded-lg text-xs sm:text-sm">{checkResult.address}</span>
                        </p>
                        {checkResult.hasCertificates && (
                          <p className="text-xs sm:text-sm md:text-base text-slate-300 mt-1">
                            Total Certificates: <span className="font-bold text-green-400 text-sm sm:text-base md:text-lg">{checkResult.count}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  {checkResult.hasCertificates && checkResult.certificates.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                      <h4 className="text-base sm:text-lg md:text-xl font-bold text-white text-center mb-4 sm:mb-6">
                        Certificate Details
                      </h4>
                      <div className="grid gap-3 sm:gap-4 md:gap-5 max-h-[250px] sm:max-h-[300px] md:max-h-none overflow-y-auto md:overflow-visible pr-1 sm:pr-2">
                        {checkResult.certificates.map((cert, index) => (
                          <motion.div
                            key={cert.id}
                            className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-slate-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 backdrop-blur-sm hover:border-slate-500/50 transition-all duration-300 group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex flex-col gap-3 sm:gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-cyan-500/20 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors duration-300">
                                    <FaCertificate className="text-cyan-400 text-sm sm:text-lg md:text-xl" />
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1">
                                    <span className="font-bold text-white text-sm sm:text-base md:text-lg">Certificate #{cert.id}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(cert.isVerified, cert.isRevoked)} bg-slate-600/50 backdrop-blur-sm w-fit`}>
                                      {getStatusText(cert.isVerified, cert.isRevoked)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => openImageModal(cert)}
                                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 hover:border-blue-400/50 rounded-lg sm:rounded-xl text-blue-400 hover:text-cyan-400 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium group-hover:scale-105"
                                    title="View Certificate Image"
                                  >
                                    <FaEye className="text-xs sm:text-sm" />
                                    <span className="hidden sm:inline">View Image</span>
                                    <span className="sm:hidden">Image</span>
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-slate-300">
                                  <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                    <span className="text-slate-400 text-xs sm:text-sm">Course:</span>
                                    <div className="text-cyan-400 font-semibold text-xs sm:text-sm md:text-base">{cert.courseName || `Course ${cert.courseId}`}</div>
                                  </div>
                                  <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                    <span className="text-slate-400 text-xs sm:text-sm">Grade:</span>
                                    <div className="text-green-400 font-semibold text-xs sm:text-sm md:text-base">{cert.grade}</div>
                                  </div>
                                  <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                    <span className="text-slate-400 text-xs sm:text-sm">Completion:</span>
                                    <div className="text-blue-400 font-semibold text-xs sm:text-sm md:text-base">{formatDate(cert.completionDate)}</div>
                                  </div>
                                  <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                    <span className="text-slate-400 text-xs sm:text-sm">Institution:</span>
                                    <div className="text-purple-400 font-mono text-xs sm:text-sm">{cert.institution.slice(0, 6)}...{cert.institution.slice(-4)}</div>
                                  </div>
                                </div>
                                
                                {/* Transaction Information */}
                                {cert.transactionHash && (
                                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                      <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                        <span className="text-slate-400 text-xs sm:text-sm block mb-1 sm:mb-2">Transaction Hash:</span>
                                        <a 
                                          href={`https://sepolia.etherscan.io/tx/${cert.transactionHash}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="font-mono text-cyan-400 hover:text-cyan-300 underline break-all cursor-pointer transition-colors duration-200 text-xs sm:text-sm bg-slate-900/50 p-1.5 sm:p-2 rounded-lg block hover:bg-slate-900/70"
                                          title="View on Etherscan Sepolia"
                                        >
                                          {cert.transactionHash.slice(0, 10)}...{cert.transactionHash.slice(-8)}
                                        </a>
                                      </div>
                                      {cert.blockNumber && (
                                        <div className="bg-slate-800/30 p-2 sm:p-2.5 rounded-lg">
                                          <span className="text-slate-400 text-xs sm:text-sm block mb-1 sm:mb-2">Block Number:</span>
                                          <a 
                                            href={`https://sepolia.etherscan.io/block/${cert.blockNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors duration-200 text-xs sm:text-sm bg-slate-900/50 p-1.5 sm:p-2 rounded-lg block hover:bg-slate-900/70"
                                            title="View Block on Etherscan Sepolia"
                                          >
                                            #{cert.blockNumber}
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="mt-12 sm:mt-16 md:mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-600/30 p-4 sm:p-5 md:p-6 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto shadow-2xl">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 md:mb-5">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base text-slate-300">
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-cyan-400 font-bold text-sm sm:text-lg md:text-xl">1</span>
                </div>
                <p className="text-center font-medium text-xs sm:text-sm">Enter any Ethereum wallet address to verify certificate ownership</p>
              </div>
              <div className="flex flex-col items-center group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-blue-400 font-bold text-sm sm:text-lg md:text-xl">2</span>
                </div>
                <p className="text-center font-medium text-xs sm:text-sm">Smart contract verifies ownership and retrieves certificate data</p>
              </div>
              <div className="flex flex-col items-center group sm:col-span-2 md:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-purple-400 font-bold text-sm sm:text-lg md:text-xl">3</span>
                </div>
                <p className="text-center font-medium text-xs sm:text-sm">View detailed certificate information with blockchain verification</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Modal with Suspense Animation */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={closeImageModal}
        >
          {/* Modal Container */}
          <div 
            className="relative max-w-4xl w-full bg-gradient-to-br from-gray-900/95 via-slate-800/90 to-black/95 rounded-2xl sm:rounded-3xl border-2 border-blue-400/50 overflow-hidden transform transition-all duration-500 scale-95 animate-modal-enter my-4"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 sm:w-10 h-8 sm:h-10 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              title="Close"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-blue-400/30">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">Certificate #{selectedCertificate?.id}</h3>
              <p className="text-blue-300 text-sm sm:text-base break-words">
                {selectedCertificate?.courseName || `Course ${selectedCertificate?.courseId}`} | Grade: {selectedCertificate?.grade}%
              </p>
            </div>
                
            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {modalImageLoading ? (
                /* Suspense Loading Animation */
                <div className="flex flex-col items-center justify-center h-64 sm:h-80 lg:h-96">
                  <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="w-12 sm:w-16 h-12 sm:h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    {/* Inner pulsing circle */}
                    <div className="absolute inset-0 w-12 sm:w-16 h-12 sm:h-16 border-4 border-transparent border-b-violet-500 rounded-full animate-pulse"></div>
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  
                  {/* Loading text with typewriter effect */}
                  <div className="mt-4 sm:mt-6 text-center">
                    <p className="text-gray-300 text-base sm:text-lg animate-pulse">Loading certificate image...</p>
                    <div className="flex justify-center mt-2 space-x-1">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                
                  {/* Holographic scanning effect */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
                  </div>
                </div>
              ) : (
                /* Certificate Image */
                <div className="relative">
                  <div className="aspect-[4/3] max-h-[40vh] sm:max-h-[50vh] mx-auto bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden border border-blue-400/30">
                    {certificateImages[selectedCertificate?.id] ? (
                      <img
                        src={certificateImages[selectedCertificate.id]}
                        alt={`Certificate ${selectedCertificate?.id} - Full Size`}
                        className="w-full h-full object-contain transform transition-all duration-700 animate-image-reveal"
                        onError={() => setCertificateImages(prev => ({ ...prev, [selectedCertificate.id]: placeholderImage }))}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl sm:text-6xl lg:text-8xl mb-2 sm:mb-4">🎓</div>
                          <p className="text-sm sm:text-base lg:text-xl">Certificate #{selectedCertificate?.id}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Info Overlay */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Student</div>
                      <div className="text-white font-mono text-xs break-all">
                        {selectedCertificate?.student}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Course</div>
                      <div className="text-cyan-400 font-semibold text-xs sm:text-sm">
                        {selectedCertificate?.courseName || `Course ${selectedCertificate?.courseId}`}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Grade</div>
                      <div className="text-green-400 font-bold text-base sm:text-lg">
                        {selectedCertificate?.grade}%
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Completion Date</div>
                      <div className="text-blue-400 font-semibold text-xs sm:text-sm">
                        {selectedCertificate?.completionDate || formatDate(selectedCertificate?.completionTimestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificateChecker;
