import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import HeroImage from "../../assets/hero.svg";
import contractAddress from "../../config/contractAddress.json";
import contractABI from "../../config/abi.json";
import { fetchMetadataFromIPFS, getImageUrlFromMetadata, placeholderImage } from "../sperates/f1.js";
import { processCertificatesBatch } from "../sperates/cert_utilits.js";
import FuturisticSpinner from "../ui/FuturisticSpinner";

export default function Certificates() {
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageLoading, setModalImageLoading] = useState(false);

  // Fetch real certificates from blockchain
  useEffect(() => {
    const fetchRealCertificates = async () => {
      try {
        setLoading(true);
        console.log('Starting certificate fetch...');
        
        // Try to connect to blockchain
        if (!window.ethereum) {
          console.log('No MetaMask, using fallback');
          setLoading(false);
          return;
        }

        console.log('MetaMask detected, connecting to blockchain...');
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(
          contractAddress.sepolia.SoulboundCertificateNFT,
          contractABI.SoulboundCertificateNFT,
          provider
        );

        // Get total supply
        console.log('Getting total supply...');
        const totalSupply = await contract.totalSupply();
        const total = Number(totalSupply);
        console.log('Total supply:', total);

        if (total === 0) {
          console.log('No certificates found');
          setLoading(false);
          return;
        }

        // Get latest 5 certificates for showcase
        const numberOfCerts = Math.min(5, total);
        const tokenIds = [];
        
        console.log(`Fetching ${numberOfCerts} certificates...`);
        for (let i = 0; i < numberOfCerts; i++) {
          try {
            const tokenId = await contract.tokenByIndex(total - 1 - i);
            tokenIds.push(Number(tokenId));
            console.log(`Got token ID: ${tokenId}`);
          } catch (err) {
            console.log(`Error getting token at index ${i}:`, err);
          }
        }

        console.log('Token IDs:', tokenIds);
        if (tokenIds.length > 0) {
          // Process certificates using your existing utility with timeout
          console.log('Processing certificates...');
          
          // Add timeout to prevent hanging on mobile
          const processingPromise = processCertificatesBatch(contract, tokenIds);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Certificate processing timeout')), 15000)
          );
          
          try {
            const processedCerts = await Promise.race([processingPromise, timeoutPromise]);
            console.log('Processed certificates:', processedCerts);
            
            if (processedCerts && processedCerts.length > 0) {
              setCertificates(processedCerts);
              setCurrentCertificate(processedCerts[0]);
              console.log('Successfully set certificates:', processedCerts.length);
            } else {
              console.log('No valid certificates processed');
            }
          } catch (processError) {
            console.error('Error processing certificates batch:', processError);
            // Fallback: try to get basic certificate data without full processing
            console.log('Attempting fallback certificate processing...');
            try {
              const fallbackCerts = [];
              for (const tokenId of tokenIds.slice(0, 3)) { // Limit to 3 for fallback
                try {
                  const cert = await contract.getCertificate(tokenId);
                  if (cert && cert.length > 0) {
                    const courseName = await contract.getCourseName(cert[2]).catch(() => `Course ${cert[2]}`);
                    fallbackCerts.push({
                      id: tokenId.toString(),
                      student: cert[0],
                      institution: cert[1],
                      courseName: courseName,
                      grade: Number(cert[4]),
                      isVerified: cert[5],
                      isRevoked: cert[6],
                      completionDate: new Date(Number(cert[3]) * 1000).toLocaleDateString(),
                      completionTimestamp: Number(cert[3])
                    });
                  }
                } catch (err) {
                  console.log(`Fallback failed for token ${tokenId}:`, err.message);
                }
              }
              
              if (fallbackCerts.length > 0) {
                console.log('Fallback certificates loaded:', fallbackCerts.length);
                setCertificates(fallbackCerts);
                setCurrentCertificate(fallbackCerts[0]);
              }
            } catch (fallbackError) {
              console.error('Fallback processing also failed:', fallbackError);
            }
          }
        }

      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealCertificates();
  }, []);

  // Auto-rotate through certificates every 6 seconds (pause when modal is open)
  useEffect(() => {
    if (certificates.length <= 1 || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % certificates.length;
        setCurrentCertificate(certificates[nextIndex]);
        return nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [certificates, isModalOpen]);

  // Load certificate image when current certificate changes
  useEffect(() => {
    const loadCertificateImage = async () => {
      if (!currentCertificate) return;

      setImageLoading(true);
      setImageUrl(null);

      // Check if certificate has image URL already
      if (currentCertificate.imageUrl) {
        setImageUrl(currentCertificate.imageUrl);
        setImageLoading(false);
        return;
      }

      // Try to load from IPFS if metadata CID exists
      if (currentCertificate.metadataCID) {
        try {
          const metadata = await fetchMetadataFromIPFS(currentCertificate.metadataCID);
          if (metadata && metadata.image) {
            const imageCID = metadata.image.startsWith('ipfs://') ? metadata.image.slice(7) : metadata.image;
            const imageUrl = getImageUrlFromMetadata(metadata, imageCID);
            setImageUrl(imageUrl);
          }
        } catch (error) {
          console.log('Error loading certificate image:', error);
        }
      }
      
      setImageLoading(false);
    };

    loadCertificateImage();
  }, [currentCertificate]);

  // Handle modal open
  const openImageModal = () => {
    setIsModalOpen(true);
    setModalImageLoading(true);
    // Simulate loading for suspense effect
    setTimeout(() => {
      setModalImageLoading(false);
    }, 800);
  };

  // Handle modal close
  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImageLoading(false);
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
    <section className='relative min-h-screen w-full overflow-hidden'>
      <img
        src={HeroImage}
        alt="Hero background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
      />
   
      <div className="max-w-7xl mx-auto py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight pb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">
          Live Certificate Showcase<br />
          <span className="block max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed text-gray-300 backdrop-blur-sm px-2 sm:px-4 mt-2">
            Real certificates from our blockchain
          </span>
        </h2>

        {/* Debug Info for Mobile */}
        <div className="mb-4 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
          <div>Debug Info:</div>
          <div>Loading: {loading ? 'true' : 'false'}</div>
          <div>Certificates count: {certificates.length}</div>
          <div>Current certificate: {currentCertificate ? 'exists' : 'null'}</div>
          <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
          <div>Window width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20">
            <FuturisticSpinner />
            <p className="text-gray-300 mt-4 sm:mt-6 text-sm sm:text-base px-4">Loading real certificates from blockchain...</p>
          </div>
        ) : !currentCertificate ? (
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 sm:p-8 lg:p-12 border border-blue-500/20 max-w-2xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">No Certificates Yet</h3>
              <p className="text-gray-300 text-sm sm:text-base">Be the first to mint a certificate on our blockchain!</p>
              <div className="mt-4 sm:mt-6">
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors text-sm sm:text-base">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Certificate Spotlight */}
            <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
              <div className="relative group">
                {/* Main Certificate Display */}
                <div className="bg-gradient-to-br from-gray-900/90 via-slate-800/80 to-black/90 border-2 border-blue-400/60 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-2xl p-4 sm:p-6 lg:p-8 transition-all duration-1000 hover:shadow-blue-500/40">
                  
                  {/* Holographic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-violet-400/5 to-cyan-400/10 rounded-2xl sm:rounded-3xl animate-gradient opacity-60"></div>
                  
                  {/* Certificate Content */}
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
                    
                    {/* Certificate Image */}
                    <div className="order-2 lg:order-1">
                      <div 
                        className="relative aspect-[4/3] bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden border border-blue-400/30 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/50"
                        onClick={openImageModal}
                      >
                        {imageLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <FuturisticSpinner />
                          </div>
                        ) : imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Certificate ${currentCertificate.id}`}
                            className="w-full h-full object-cover transition-all duration-300"
                            onError={() => setImageUrl(placeholderImage)}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                              <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4">🎓</div>
                              <p className="text-xs sm:text-sm">Certificate #{currentCertificate.id}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Blockchain Badge */}
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-500/90 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1 sm:gap-2">
                          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="hidden sm:inline">On-Chain</span>
                          <span className="sm:hidden">Chain</span>
                        </div>

                        {/* Subtle Hover Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="order-1 lg:order-2 text-left space-y-4 sm:space-y-6">
                      <div>
                        <div className="text-blue-400 text-xs sm:text-sm font-bold tracking-wide mb-2">CERTIFICATE #{currentCertificate.id}</div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">{currentCertificate.courseName}</h3>
                        <p className="text-cyan-300 text-xs sm:text-sm font-mono">Blockchain Verified</p>
                      </div>

                      {/* Student & Institution */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start sm:items-center">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-2 sm:mr-3 animate-pulse mt-1 sm:mt-0 flex-shrink-0"></div>
                          <div className="text-gray-300 text-xs sm:text-sm min-w-0">
                            <span className="block sm:inline">Student:</span>
                            <span className="text-white font-semibold font-mono text-xs break-all block sm:inline sm:ml-1">
                              <span className="sm:hidden">{currentCertificate.student.slice(0, 6)}...{currentCertificate.student.slice(-4)}</span>
                              <span className="hidden sm:inline">{currentCertificate.student.slice(0, 8)}...{currentCertificate.student.slice(-6)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start sm:items-center">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full mr-2 sm:mr-3 animate-pulse mt-1 sm:mt-0 flex-shrink-0" style={{ animationDelay: '0.3s' }}></div>
                          <div className="text-gray-300 text-xs sm:text-sm min-w-0">
                            <span className="block sm:inline">Institution:</span>
                            <span className="text-white font-semibold font-mono text-xs break-all block sm:inline sm:ml-1">
                              <span className="sm:hidden">{currentCertificate.institution.slice(0, 6)}...{currentCertificate.institution.slice(-4)}</span>
                              <span className="hidden sm:inline">{currentCertificate.institution.slice(0, 8)}...{currentCertificate.institution.slice(-6)}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-2 sm:mr-3 animate-pulse flex-shrink-0" style={{ animationDelay: '0.6s' }}></div>
                          <div className="text-gray-300 text-xs sm:text-sm">
                            Grade: <span className="text-green-400 font-bold text-sm sm:text-lg">{currentCertificate.grade}%</span>
                          </div>
                        </div>
                        <div className="flex items-start sm:items-center">
                          <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-2 sm:mr-3 animate-pulse mt-1 sm:mt-0 flex-shrink-0" style={{ animationDelay: '0.9s' }}></div>
                          <div className="text-gray-300 text-xs sm:text-sm">
                            <span className="block sm:inline">Completed:</span>
                            <span className="text-white font-semibold block sm:inline sm:ml-1">{currentCertificate.completionDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        {currentCertificate.isRevoked ? (
                          <>
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-semibold text-xs sm:text-sm">REVOKED</span>
                          </>
                        ) : currentCertificate.isVerified ? (
                          <>
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-semibold text-xs sm:text-sm">VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 sm:w-3 h-2 sm:h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-yellow-400 font-semibold text-xs sm:text-sm">PENDING</span>
                          </>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Blockchain Hash */}
                  <div className="relative z-10 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-6 border-t border-blue-400/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs">
                      <div className="flex-1">
                        <div className="text-gray-400 mb-2 text-xs sm:text-sm">Transaction Hash:</div>
                        {currentCertificate.metadata?.transactionHash ? (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-800/50 rounded-lg p-2 sm:p-3">
                            <a
                              href={`https://sepolia.etherscan.io/tx/${currentCertificate.metadata.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors font-mono text-xs break-all flex-1 min-w-0"
                              title="View on Etherscan Sepolia"
                            >
                              {currentCertificate.metadata.transactionHash}
                            </a>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(currentCertificate.metadata.transactionHash);
                                  // Simple feedback - you could add a toast here
                                  const btn = event.target;
                                  const originalText = btn.textContent;
                                  btn.textContent = '✓';
                                  setTimeout(() => btn.textContent = originalText, 1000);
                                }}
                                className="px-2 py-1 bg-violet-600 hover:bg-violet-700 rounded text-white transition-colors text-xs"
                                title="Copy transaction hash"
                              >
                                📋
                              </button>
                              <a
                                href={`https://sepolia.etherscan.io/tx/${currentCertificate.metadata.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors text-xs"
                                title="View on Etherscan"
                              >
                                🔗
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 font-mono text-xs">
                            No transaction hash available
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm flex-shrink-0">
                        {certificates.length > 1 && (
                          <>
                            <span className="hidden sm:inline">Certificate {currentIndex + 1} of {certificates.length}</span>
                            <span className="sm:hidden">{currentIndex + 1}/{certificates.length}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Dots */}
                {certificates.length > 1 && (
                  <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
                    {certificates.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setCurrentCertificate(certificates[index]);
                        }}
                        className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex 
                            ? 'bg-blue-400 scale-125' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Count Indicator */}
            {certificates.length > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800/50 rounded-full text-xs sm:text-sm text-gray-300 border border-gray-700/50">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Showing {certificates.length} latest certificate{certificates.length > 1 ? 's' : ''}</span>
                  <span className="sm:hidden">{certificates.length} certificate{certificates.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal with Suspense Animation */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          {/* Modal Container */}
          <div 
            className="relative max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full bg-gradient-to-br from-gray-900/95 via-slate-800/90 to-black/95 rounded-2xl sm:rounded-3xl border-2 border-blue-400/50 overflow-hidden transform transition-all duration-500 scale-95 animate-modal-enter"
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
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">Certificate #{currentCertificate?.id}</h3>
              <p className="text-blue-300 text-sm sm:text-base break-words">{currentCertificate?.courseName}</p>
                </div>
                
            {/* Modal Content */}
            <div className="p-4 sm:p-6">
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
                  <div className="aspect-[4/3] max-h-[50vh] sm:max-h-[60vh] mx-auto bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden border border-blue-400/30">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Certificate ${currentCertificate?.id} - Full Size`}
                        className="w-full h-full object-contain transform transition-all duration-700 animate-image-reveal"
                        onError={() => setImageUrl(placeholderImage)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <div className="text-4xl sm:text-6xl lg:text-8xl mb-2 sm:mb-4">🎓</div>
                          <p className="text-sm sm:text-base lg:text-xl">Certificate #{currentCertificate?.id}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Info Overlay */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Student</div>
                      <div className="text-white font-mono text-xs break-all">
                        {currentCertificate?.student}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
                      <div className="text-gray-400 mb-1 text-xs sm:text-sm">Grade</div>
                      <div className="text-green-400 font-bold text-base sm:text-lg">
                        {currentCertificate?.grade}%
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
}
