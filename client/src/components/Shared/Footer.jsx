import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEthereum, 
  FaGithub, 
  FaDiscord, 
  FaTwitter,
  FaSearch,
  FaChevronUp,
  FaExternalLinkAlt,
  FaWallet,
  FaRocket,
  FaCode,
  FaCrown
} from 'react-icons/fa';
import contractAddresses from '../../config/contractAddress.json';

const Footer = ({ userAccount, isInstitution, onConnectWallet }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showZipper, setShowZipper] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Tailwind animations are built-in, no custom CSS needed

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const shouldShow = scrollY > 300;
    setShowScrollButton(shouldShow);
    
    // Auto-close footer when scrolling up (more sensitive)
    if (isExpanded && scrollY < lastScrollY - 5) { // Added threshold of 5px
      setIsExpanded(false);
    }
    
    // Auto-close footer when at the top of the page
    if (isExpanded && scrollY < 100) {
      setIsExpanded(false);
    }
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = scrollY + windowHeight;
    const bottomThreshold = documentHeight * 0.8;
    
    setShowZipper(scrollPosition > bottomThreshold);
    setLastScrollY(scrollY);
  };

  useEffect(() => {
    // Throttled scroll handler for better performance
    let ticking = false;
    
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = false;
      }
    };
    
    // Wheel event for immediate response to scroll direction
    const handleWheel = (e) => {
      if (isExpanded && e.deltaY > 0) { // Scrolling down
        // Keep footer open
      } else if (isExpanded && e.deltaY < 0) { // Scrolling up
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isExpanded]);

  const handleScrollToTop = () => {
    // Close footer immediately when scrolling to top
    if (isExpanded) {
      setIsExpanded(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Security: Rate limiting for IPFS verification
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [lastVerificationTime, setLastVerificationTime] = useState(0);
  const MAX_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW = 60000; // 1 minute

  const handleIpfsVerification = () => {
    const now = Date.now();
    
    // Security: Rate limiting check
    if (now - lastVerificationTime < RATE_LIMIT_WINDOW && verificationAttempts >= MAX_ATTEMPTS) {
      alert('Rate limit exceeded. Please wait before trying again.');
      return;
    }
    
    // Security: Reset rate limit if window has passed
    if (now - lastVerificationTime >= RATE_LIMIT_WINDOW) {
      setVerificationAttempts(0);
    }
    
    if (ipfsHash.trim()) {
      // Security: Strong input validation before processing
      const validation = validateIpfsHash(ipfsHash);
      if (!validation.isValid) {
        alert('Invalid IPFS hash format. Please enter a valid hash.');
        return;
      }
      
      // Security: Sanitize and clean the hash
      const cleanHash = sanitizeIpfsHash(ipfsHash);
      
      // Security: Update rate limiting
      setVerificationAttempts(prev => prev + 1);
      setLastVerificationTime(now);
      
      // Security: Open in new tab with rel="noopener noreferrer"
      const newWindow = window.open(`https://ipfs.io/ipfs/${cleanHash}`, '_blank');
      if (newWindow) {
        newWindow.opener = null;
      }
    }
  };

  // Security: Strong IPFS hash sanitization
  const sanitizeIpfsHash = (hash) => {
    if (!hash || typeof hash !== 'string') return '';
    
    // Remove any potentially dangerous characters
    let cleanHash = hash.trim()
      .replace(/[<>\"'&]/g, '') // Remove HTML entities
      .replace(/ipfs:\/\//g, '') // Remove IPFS protocol
      .replace(/https?:\/\/ipfs\.io\/ipfs\//g, '') // Remove IPFS gateway URLs
      .replace(/[^0-9A-Za-z]/g, ''); // Only allow alphanumeric characters
    
    return cleanHash;
  };

  // Security: Strong IPFS hash validation
  const validateIpfsHash = (hash) => {
    if (!hash || typeof hash !== 'string') return { isValid: false, message: 'Invalid input' };
    
    const cleanHash = sanitizeIpfsHash(hash);
    
    // Security: Minimum length check
    if (cleanHash.length < 46) {
      return { isValid: false, message: 'Hash too short' };
    }
    
    // Security: Maximum length check
    if (cleanHash.length > 59) {
      return { isValid: false, message: 'Hash too long' };
    }
    
    // Security: IPFS v0 CID validation (Qm...)
    if (cleanHash.startsWith('Qm') && cleanHash.length === 46) {
      // Security: Validate Base58 characters only
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
      if (base58Regex.test(cleanHash)) {
        return { isValid: true, message: 'Valid IPFS v0 hash' };
      }
    }
    
    // Security: IPFS v1 CID validation (bafy...)
    if (cleanHash.startsWith('baf') && cleanHash.length === 59) {
      // Security: Validate Base32 characters only
      const base32Regex = /^[a-z2-7]+$/;
      if (base32Regex.test(cleanHash)) {
        return { isValid: true, message: 'Valid IPFS v1 hash' };
      }
    }
    
    return { isValid: false, message: 'Invalid IPFS hash format' };
  };

  // Security: Enhanced input change handler with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Security: Prevent extremely long inputs
    if (value.length > 100) {
      return;
    }
    
    // Security: Only allow valid characters
    const sanitizedValue = value.replace(/[^0-9A-Za-z]/g, '');
    
    setIpfsHash(sanitizedValue);
  };

  const handleConnectWallet = () => {
    if (onConnectWallet) {
      onConnectWallet();
    } else if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  return (
    <>
      {/* Futuristic Zipper Handle */}
      {showZipper && (
        <motion.div 
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-t-xl px-3 sm:px-5 py-2 sm:py-3 border border-slate-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all duration-300">
            <motion.div
              animate={{ y: isExpanded ? 0 : [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <FaChevronUp className={`text-cyan-300 text-base sm:text-lg transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                             <span className="text-white text-xs sm:text-sm font-medium tracking-wide">TOOLS PANEL</span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Futuristic Footer Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.footer 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/70 backdrop-blur-xl text-white border-t border-slate-400/20 max-h-[60vh] sm:max-h-[55vh]"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
              `
            }}
          >
                                                 <div className="pt-6 sm:pt-4 pb-3 sm:pb-5 px-2 sm:px-3 md:px-5">
              <div className="max-w-5xl mx-auto">
                {/* Futuristic Header - More compact */}
                <motion.div 
                  className="text-center mb-3 sm:mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-1 drop-shadow-[0_0_10px_currentColor]">
                    BLOCKCHAIN TOOLS
                  </h2>
                  <p className="text-slate-300 text-xs tracking-wide px-2">
                    Professional blockchain utilities and verification tools
                  </p>
                </motion.div>

                {/* Blockchain Blocks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 relative">
                  {/* Genesis Block - Smart Contract */}
                  <motion.div 
                    className="relative rounded-xl p-3 sm:p-4 text-center group min-h-[160px] sm:min-h-[180px] md:min-h-[200px]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 5,
                      rotateX: 2,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      border: '3px solid rgba(34, 197, 94, 0.9)',
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 30px rgba(34, 197, 94, 0.4),
                        0 0 50px rgba(34, 197, 94, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                  >
                    {/* Genesis Badge */}
                    <div 
                      className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-white text-xs font-black font-mono tracking-wider whitespace-nowrap"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a, #059669)',
                        border: '2px solid rgba(34, 197, 94, 0.8)',
                        boxShadow: `
                          0 4px 15px rgba(34, 197, 94, 0.6),
                          0 0 20px rgba(34, 197, 94, 0.4),
                          0 0 40px rgba(34, 197, 94, 0.3),
                          0 0 60px rgba(34, 197, 94, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        textShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                        filter: 'blur(0.5px)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <FaCrown className="text-yellow-300 text-xs drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                                             <span className="drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">GENESIS</span>
                    </div>

                    {/* Block Number */}
                    <div 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-white text-xs sm:text-sm font-black font-mono tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                        border: '2px solid rgba(99, 102, 246, 0.8)',
                        boxShadow: `
                          0 4px 15px rgba(99, 102, 246, 0.6),
                          0 0 20px rgba(99, 102, 246, 0.4),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        textShadow: '0 0 8px rgba(99, 102, 246, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      #0
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                      <FaEthereum className="text-green-400 text-lg sm:text-2xl drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                    <h4 className="text-green-300 font-semibold text-xs sm:text-sm mb-1 sm:mb-2 tracking-wide">Smart Contract</h4>
                    <p className="text-slate-300 text-xs mb-2 sm:mb-3">Ethereum blockchain explorer</p>
                    
                                                                                   {/* ULTRA-FUTURISTIC BUTTON */}
                       <button 
                         onClick={() => {
                           const contractAddress = contractAddresses.sepolia.SoulboundCertificateNFT;
                           const sepoliaEtherscanUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
                           window.open(sepoliaEtherscanUrl, '_blank');
                         }}
                         className="relative w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-700 overflow-hidden group cursor-pointer bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 shadow-lg hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-105"
                       >
                        {/* Cyberpunk scan lines */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse delay-500"></div>
                        </div>
                        
                        {/* Quantum particle effects */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-emerald-300 rounded-full animate-ping"></div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-300 rounded-full animate-bounce"></div>
                        </div>
                        
                        {/* Neural network grid overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,197,94,0.1)_50%,transparent_51%)] bg-[length:8px_8px]"></div>
                          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,197,94,0.1)_50%,transparent_51%)] bg-[length:8px_8px]"></div>
                        </div>
                        
                        {/* Holographic shimmer effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        </div>
                        
                        {/* Enhanced glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 via-emerald-400/30 to-green-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* Button content with enhanced effects */}
                        <div className="relative z-10 flex items-center justify-center">
                          <FaExternalLinkAlt className="mr-1.5 sm:mr-2 text-green-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                          <span className="tracking-wide group-hover:tracking-widest transition-all duration-500 font-mono text-xs sm:text-sm">View on Etherscan</span>
                        </div>
                        
                                                 {/* Subtle professional border glow */}
                         <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-green-400/40 transition-all duration-700"></div>
                        
                        {/* Corner accent lights */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-0 left-0 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                          <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                          <div className="absolute bottom-0 left-0 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                        </div>
                      </button>
                  </motion.div>

                  {/* Block 2 - IPFS Verifier */}
                  <motion.div 
                    className="relative rounded-xl p-3 sm:p-4 text-center group min-h-[160px] sm:min-h-[180px] md:min-h-[200px] overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: -5,
                      rotateX: -2,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      border: '3px solid rgba(251, 146, 60, 0.8)',
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 30px rgba(251, 146, 60, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                  >
                    {/* Block Number */}
                    <div 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-white text-xs sm:text-sm font-black font-mono tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                        border: '2px solid rgba(99, 102, 246, 0.8)',
                        boxShadow: `
                          0 4px 15px rgba(99, 102, 246, 0.6),
                          0 0 20px rgba(99, 102, 246, 0.4),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        textShadow: '0 0 8px rgba(99, 102, 246, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      #1
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                      <FaSearch className="text-orange-400 text-lg sm:text-2xl drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                    <h4 className="text-orange-300 font-semibold text-xs sm:text-sm mb-1 sm:mb-2 tracking-wide">IPFS Verifier</h4>
                    <p className="text-slate-300 text-xs mb-2 sm:mb-3">Content verification tool</p>
                                                              {/* UNIQUE HOLOGRAPHIC SEARCH INPUT - DIFFERENT FROM BUTTON */}
                      <div className="relative w-full mb-2 sm:mb-3 group">
                                                 <input
                           type="text"
                                                       placeholder="Enter IPFS hash to verify"
                           value={ipfsHash}
                           onChange={handleInputChange}
                           maxLength={59}
                           className={`relative z-20 w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-6 sm:pl-8 pr-10 sm:pr-12 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm backdrop-blur-xl focus:outline-none transition-all duration-700 border shadow-lg focus:shadow-2xl ${
                             ipfsHash ? 
                               (validateIpfsHash(ipfsHash).isValid ? 
                                 'bg-gradient-to-r from-green-900/90 via-emerald-800/90 to-green-900/90 border-green-400/60 focus:border-green-400/80 focus:shadow-green-500/30' : 
                                 'bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-900/90 border-red-400/60 focus:border-red-400/80 focus:shadow-red-500/30'
                               ) : 
                               'bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border-transparent group-hover:border-yellow-400/40 focus:border-yellow-400/60 focus:shadow-yellow-500/30'
                           }`}
                         />
                         
                                                   {/* Security: Subtle Validation Status Indicator */}
                          {ipfsHash && (
                            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              validateIpfsHash(ipfsHash).isValid ? 'bg-green-300 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-red-300 shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                            }`}></div>
                          )}
                         
                        
                         
                                                   {/* Security: Subtle Help Tooltip */}
                          <div className="absolute -top-8 left-0 text-xs text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-600/30 backdrop-blur-sm">
                            IPFS Hash Format
                          </div>
                         
                                                   {/* Security: Subtle Validation Message */}
                          {ipfsHash && (
                            <div className={`absolute -bottom-6 left-0 text-xs font-mono transition-all duration-300 z-30 opacity-80 ${
                              validateIpfsHash(ipfsHash).isValid ? 'text-green-300' : 'text-red-300'
                            }`}>
                              {validateIpfsHash(ipfsHash).isValid ? '✓ Valid' : '✗ Invalid'}
                            </div>
                          )}
                        
                        {/* UNIQUE: DNA Helix Effect - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none">
                          <div className="absolute left-2 top-0 w-0.5 h-full bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 animate-pulse"></div>
                          <div className="absolute right-2 top-0 w-0.5 h-full bg-gradient-to-b from-red-400 via-orange-400 to-yellow-400 animate-pulse delay-300"></div>
                          <div className="absolute left-2 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400/30 to-transparent animate-pulse delay-150"></div>
                          <div className="absolute right-2 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-red-400/30 to-transparent animate-pulse delay-450"></div>
                        </div>
                        
                        {/* UNIQUE: Floating Binary Code - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none overflow-hidden">
                          <div className="absolute top-1 left-2 text-yellow-400/60 text-xs font-mono animate-pulse">01</div>
                          <div className="absolute top-1 right-8 text-orange-400/60 text-xs font-mono animate-pulse delay-200">10</div>
                          <div className="absolute bottom-1 left-4 text-red-400/60 text-xs font-mono animate-pulse delay-400">11</div>
                          <div className="absolute bottom-1 right-2 text-yellow-400/60 text-xs font-mono animate-pulse delay-600">00</div>
                        </div>
                        
                        {/* UNIQUE: Circuit Board Pattern - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none">
                          <div className="absolute top-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"></div>
                          <div className="absolute bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400/40 to-transparent"></div>
                          <div className="absolute top-0 left-2 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-400/40 to-transparent"></div>
                          <div className="absolute top-0 right-2 w-0.5 h-full bg-gradient-to-b from-transparent via-yellow-400/40 to-transparent"></div>
                        </div>
                        
                        {/* UNIQUE: Quantum Dots - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none">
                          <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping"></div>
                          <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.8)] animate-ping delay-200"></div>
                          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping delay-400"></div>
                          <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-ping delay-600"></div>
                        </div>
                        
                        {/* UNIQUE: Data Stream Lines - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none">
                          <div className="absolute top-1/2 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{animationDuration: '1s'}}></div>
                          <div className="absolute top-1/2 left-0 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDuration: '1s', animationDelay: '0.3s'}}></div>
                          <div className="absolute top-1/2 left-0 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDuration: '1s', animationDelay: '0.6s'}}></div>
                        </div>
                        
                        {/* UNIQUE: Holographic Input Field - Different from button */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-700 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 via-orange-400/10 via-red-400/10 to-transparent transform -skew-x-6 translate-x-[-100%] group-hover:translate-x-[100%] focus-within:translate-x-[100%] transition-transform duration-2000"></div>
                        </div>
                        
                        {/* UNIQUE: Search Icon with Different Animation */}
                        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 group-hover:text-orange-400 transition-all duration-500 z-30">
                          <FaSearch className="text-base sm:text-lg group-hover:scale-125 group-hover:rotate-90" />
                        </div>
                      </div>
                                                              {/* UNIQUE ULTRA-FUTURISTIC IPFS SEARCH BUTTON */}
                                             <button
                         onClick={handleIpfsVerification}
                         disabled={!ipfsHash.trim() || !validateIpfsHash(ipfsHash).isValid}
                         className={`relative w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-700 overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transform transition-all duration-300 ${
                           !ipfsHash.trim() || !validateIpfsHash(ipfsHash).isValid ?
                             'bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 opacity-50 cursor-not-allowed' :
                             'bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-500 hover:via-red-500 hover:to-orange-600 hover:shadow-orange-500/50 hover:scale-105'
                         }`}
                       >
                        {/* UNIQUE: Rotating search radar effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-orange-400/60 rounded-full animate-spin"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-red-400/60 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-yellow-400/60 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                        </div>
                        
                        {/* UNIQUE: Data flow lines */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 via-orange-400 via-red-400 to-transparent animate-pulse"></div>
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400 via-orange-400 via-yellow-400 to-transparent animate-pulse delay-300"></div>
                          <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-orange-400 to-transparent animate-pulse delay-150"></div>
                          <div className="absolute right-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-red-400 to-transparent animate-pulse delay-450"></div>
                        </div>
                        
                        {/* UNIQUE: Floating search icons */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <FaSearch className="absolute top-2 left-2 text-yellow-300 text-xs animate-bounce" style={{animationDelay: '0s'}} />
                          <FaSearch className="absolute top-2 right-2 text-orange-300 text-xs animate-bounce" style={{animationDelay: '0.2s'}} />
                          <FaSearch className="absolute bottom-2 left-2 text-red-300 text-xs animate-bounce" style={{animationDelay: '0.4s'}} />
                          <FaSearch className="absolute bottom-2 right-2 text-yellow-300 text-xs animate-bounce" style={{animationDelay: '0.6s'}} />
                        </div>
                        
                        {/* UNIQUE: Matrix-style falling characters */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full">
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute text-orange-400/40 text-xs font-mono animate-pulse"
                                style={{
                                  left: `${(i * 12.5)}%`,
                                  top: '-10px',
                                  animationDelay: `${i * 0.1}s`,
                                  animationDuration: '2s'
                                }}
                              >
                                {['0', '1', 'F', 'E', 'A', 'B', 'C', 'D'][i]}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* UNIQUE: Holographic search beam */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 via-orange-400/30 via-red-400/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
                        </div>
                        
                        {/* UNIQUE: Enhanced glow with search pattern */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/30 via-red-400/30 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* UNIQUE: Button content with search-specific effects */}
                        <div className="relative z-10 flex items-center justify-center">
                          <FaSearch className="mr-1.5 sm:mr-2 text-orange-100 group-hover:scale-125 group-hover:rotate-45 transition-all duration-500" />
                          <span className="tracking-wide group-hover:tracking-widest transition-all duration-500 font-mono group-hover:text-yellow-100 text-xs sm:text-sm">Verify Hash</span>
                        </div>
                        
                        {/* UNIQUE: Search-focused border with pulsing effect */}
                        <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-orange-400/60 transition-all duration-700 animate-pulse"></div>
                        
                        {/* UNIQUE: Corner search indicators */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                          <div className="absolute top-0 left-0 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-ping"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 bg-orange-400 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.9)] animate-ping" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.9)] animate-ping" style={{animationDelay: '0.6s'}}></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-ping" style={{animationDelay: '0.9s'}}></div>
                        </div>
                        
                        {/* UNIQUE: Center search pulse */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-ping"></div>
                      </button>
                  </motion.div>

                  {/* Block 3 - Wallet Connection */}
                  <motion.div 
                    className="relative rounded-xl p-3 sm:p-4 text-center group min-h-[160px] sm:min-h-[180px] md:min-h-[200px] overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateY: 8,
                      rotateX: 3,
                      transition: { duration: 0.15, ease: "easeOut" }
                    }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                      border: '3px solid rgba(99, 102, 246, 0.8)',
                      boxShadow: `
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        0 0 30px rgba(99, 102, 246, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `
                    }}
                  >
                    {/* Block Number */}
                    <div 
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-white text-xs sm:text-sm font-black font-mono tracking-widest"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
                        border: '2px solid rgba(99, 102, 246, 0.8)',
                        boxShadow: `
                          0 4px 15px rgba(99, 102, 246, 0.6),
                          0 0 20px rgba(99, 102, 246, 0.4),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                        textShadow: '0 0 8px rgba(99, 102, 246, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      #2
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                      <FaWallet className="text-blue-400 text-lg sm:text-2xl drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                    <h4 className="text-blue-300 font-semibold text-xs sm:text-sm mb-1 tracking-wide">
                      {userAccount ? 'Connected Wallet' : 'Connect Wallet'}
                    </h4>
                    <p className="text-slate-300 text-xs mb-2 sm:mb-3">Wallet connection tool</p>
                    {userAccount ? (
                      <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-xs sm:text-sm font-mono shadow-[0_0_20px_rgba(99,102,246,0.4)]">
                        {userAccount.slice(0, 6)}...{userAccount.slice(-4)}
                      </div>
                                         ) : (
                       <button
                         onClick={handleConnectWallet}
                         className="relative w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-700 overflow-hidden group cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105"
                       >
                         {/* Cyberpunk scan lines */}
                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                           <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                           <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse delay-500"></div>
                         </div>
                         
                         {/* Quantum particle effects */}
                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                           <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></div>
                           <div className="absolute top-2 right-2 w-1 h-1 bg-blue-300 rounded-full animate-ping"></div>
                           <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-bounce"></div>
                         </div>
                         
                         {/* Neural network grid overlay */}
                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(99,102,246,0.1)_50%,transparent_51%)] bg-[length:8px_8px]"></div>
                           <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(99,102,246,0.1)_50%,transparent_51%)] bg-[length:8px_8px]"></div>
                         </div>
                         
                         {/* Holographic shimmer effect */}
                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                         </div>
                         
                         {/* Enhanced glow effect */}
                         <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                         
                         {/* Button content with enhanced effects */}
                         <div className="relative z-10 flex items-center justify-center">
                           <FaWallet className="mr-1.5 sm:mr-2 text-blue-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                           <span className="tracking-wide group-hover:tracking-widest transition-all duration-500 font-mono text-xs sm:text-sm">Connect Wallet</span>
                         </div>
                         
                         {/* Subtle professional border glow */}
                         <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/40 transition-all duration-700"></div>
                         
                         {/* Corner accent lights */}
                         <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                           <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                           <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                           <div className="absolute bottom-0 left-0 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,246,0.8)]"></div>
                           <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                         </div>
                       </button>
                    )}
                  </motion.div>
                </div>

                                 {/* Futuristic Powered By - Cyberpunk Matrix Style */}
                 <motion.div 
                   className="text-center mb-2 px-2"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.6, delay: 0.4 }}
                 >
                  <h3 className="text-slate-300 text-xs font-medium mb-2 tracking-wide font-mono">POWERED BY BLOCKCHAIN TECHNOLOGY</h3>
                  
                                     {/* Cyberpunk Matrix Grid Container */}
                   <div className="relative inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 bg-gradient-to-r from-slate-900/80 via-slate-800/90 to-slate-900/80 backdrop-blur-xl rounded-xl px-3 sm:px-5 py-2 sm:py-3 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 group overflow-hidden w-full sm:w-auto">
                    
                    {/* Matrix Rain Effect Background */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-full h-full">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute text-cyan-400/60 text-xs font-mono animate-pulse"
                            style={{
                              left: `${(i * 16.66)}%`,
                              top: '-10px',
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '3s'
                            }}
                          >
                            {['01', '10', 'FF', 'AA', '55', 'CC'][i]}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Holographic Scan Lines */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-pulse delay-300"></div>
                    </div>
                    
                    {/* Corner Glow Effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-ping"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-ping delay-200"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-ping delay-400"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-ping delay-600"></div>
                    </div>
                    
                    {/* Ethereum Tech */}
                    <div 
                      className="relative z-10 flex items-center space-x-2 sm:space-x-3 group/tech cursor-pointer hover:scale-110 transition-all duration-300"
                      onClick={() => window.open('https://ethereum.org/', '_blank', 'noopener,noreferrer')}
                    >
                      <div className="relative">
                        <FaEthereum className="text-cyan-400 text-sm drop-shadow-[0_0_8px_currentColor] group-hover/tech:text-cyan-300 transition-all duration-300" />
                        {/* Tech Glow Ring */}
                        <div className="absolute inset-0 w-full h-full rounded-full bg-cyan-400/20 blur-sm scale-0 group-hover/tech:scale-150 transition-all duration-500"></div>
                      </div>
                      <span className="text-slate-300 text-xs font-medium group-hover/tech:text-cyan-300 transition-colors duration-300 font-mono">ETH</span>
                    </div>
                    
                    {/* Separator with Animation - Hidden on mobile */}
                    <div className="relative z-10 w-px h-4 bg-gradient-to-b from-transparent via-cyan-500/60 to-transparent group-hover:bg-gradient-to-b group-hover:from-cyan-400 group-hover:via-cyan-300 group-hover:to-cyan-400 transition-all duration-500 hidden sm:block">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* IPFS Tech */}
                    <div 
                      className="relative z-10 flex items-center space-x-2 sm:space-x-3 group/tech cursor-pointer hover:scale-110 transition-all duration-300"
                      onClick={() => window.open('https://ipfs.tech/', '_blank', 'noopener,noreferrer')}
                    >
                      <div className="relative">
                        <FaSearch className="text-orange-400 text-sm drop-shadow-[0_0_8px_currentColor] group-hover/tech:text-orange-300 transition-all duration-300" />
                        {/* Tech Glow Ring */}
                        <div className="absolute inset-0 w-full h-full rounded-full bg-orange-400/20 blur-sm scale-0 group-hover/tech:scale-150 transition-all duration-500"></div>
                      </div>
                      <span className="text-slate-300 text-xs font-medium group-hover/tech:text-orange-300 transition-colors duration-300 font-mono">IPFS</span>
                    </div>
                    
                    {/* Separator with Animation - Hidden on mobile */}
                    <div className="relative z-10 w-px h-4 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent group-hover:bg-gradient-to-b group-hover:from-orange-400 group-hover:via-orange-300 group-hover:to-orange-400 transition-all duration-500 hidden sm:block">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Pinata Tech */}
                    <div 
                      className="relative z-10 flex items-center space-x-2 sm:space-x-3 group/tech cursor-pointer hover:scale-110 transition-all duration-300"
                      onClick={() => window.open('https://pinata.cloud/', '_blank', 'noopener,noreferrer')}
                    >
                      <div className="relative">
                        <FaCode className="text-green-400 text-sm drop-shadow-[0_0_8px_currentColor] group-hover/tech:text-green-300 transition-all duration-300" />
                        {/* Tech Glow Ring */}
                        <div className="absolute inset-0 w-full h-full rounded-full bg-green-400/20 blur-sm scale-0 group-hover/tech:scale-150 transition-all duration-500"></div>
                      </div>
                      <span className="text-slate-300 text-xs font-medium group-hover/tech:text-green-300 transition-colors duration-300 font-mono">PINATA</span>
                    </div>
                    
                    {/* Holographic Shimmer Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-2000"></div>
                    </div>
                    
                    {/* Neural Network Grid Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:6px_6px]"></div>
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:6px_6px]"></div>
                    </div>
                    
                    {/* Quantum Particle Effects */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-1 left-2 w-1 h-1 bg-cyan-300 rounded-full animate-ping"></div>
                      <div className="absolute top-1 right-2 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-300"></div>
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-600"></div>
                    </div>
                  </div>
                </motion.div>

                {/* Futuristic Bottom Bar - More compact */}
                <motion.div 
                  className="border-t border-slate-600/30 pt-2 sm:pt-3 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <span className="text-slate-400 text-xs text-center sm:text-left tracking-wide px-2 leading-relaxed">
                    © 2025 Soulbound NFT Certificates — Blockchain Powered
                  </span>
                  
                  <div className="flex space-x-3 px-2">
                    <a href="#" className="text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110 drop-shadow-[0_0_8px_currentColor] p-1" title="Twitter">
                      <FaTwitter className="text-sm" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-purple-400 transition-all duration-300 hover:scale-110 drop-shadow-[0_0_8px_currentColor] p-1" title="Discord">
                      <FaDiscord className="text-sm" />
                    </a>
                    <a href="#" className="text-slate-400 hover:text-slate-300 transition-all duration-300 hover:scale-110 drop-shadow-[0_0_8px_currentColor] p-1" title="GitHub">
                      <FaGithub className="text-sm" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Futuristic Scroll to Top Button */}
      {showScrollButton && (
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-16 sm:bottom-6 right-2 sm:right-6 z-[60]"
        >
          <motion.button 
            onClick={handleScrollToTop} 
            className="bg-slate-900/70 backdrop-blur-xl rounded-full p-3 sm:p-4 text-white hover:scale-110 transition-all duration-300 border border-slate-400/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] shadow-indigo-500/40 hover:shadow-indigo-500/60"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 19V5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </motion.button>
        </motion.div>
      )}

    </>
  );
};

export default Footer;
