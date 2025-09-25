import React, { useState, useEffect } from 'react'
import CertificateForm from '../../components/IssueCerificate/CertificateForm'
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

const IssueCertificate = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userAddress, setUserAddress] = useState('');

  // Check if user is admin on page load
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        if (!window.ethereum) {
          console.error("No Ethereum provider found");
          setIsLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length === 0) {
          console.error("No accounts found");
          setIsLoading(false);
          return;
        }
        
        const address = accounts[0].address;
        setUserAddress(address);
        
        const contract = new ethers.Contract(
          contractAddress.SoulboundCertificateNFT,
          contractABI.SoulboundCertificateNFT,
          provider
        );
        
        // Default admin role is always bytes32(0)
        const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
        
        // Check if address has admin role
        const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, address);
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid-pattern animate-pulse-slow"></div>
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-violet-500/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-float animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-emerald-500/15 rounded-full blur-xl animate-float animation-delay-500"></div>
        
        {/* Neural connections */}
        <div className="neural-grid absolute inset-0 opacity-10"></div>
        
        {/* Quantum field overlay */}
        <div className="quantum-field absolute inset-0 opacity-30"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 py-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-4xl xl:max-w-5xl mx-auto">
          {/* Header section with holographic effects */}
          <div className="text-center mb-8 lg:mb-12 relative">
            {/* Holographic particles */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-4 lg:space-x-6">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-violet-400 rounded-full animate-sparkle-1"></div>
                <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-cyan-400 rounded-full animate-sparkle-2"></div>
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-emerald-400 rounded-full animate-sparkle-3"></div>
              </div>
            </div>
            
            {/* Main title with enhanced styling */}
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 relative">
                <span className="holographic-text">Issue</span>{' '}
                <span className="neon-text-shimmer">Certificate</span>
                
                {/* Scanning line effect */}
                <div className="scan-line absolute inset-0 pointer-events-none"></div>
              </h1>
              
              {/* Subtitle with glassmorphism */}
              <div className="relative max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
                <div className="glass-nav-panel rounded-xl lg:rounded-2xl p-4 lg:p-6 backdrop-blur-md">
                  <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed">
                    Create and mint blockchain-verified certificates with{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                      quantum-level security
                    </span>{' '}
                    and permanent immutable storage
                  </p>
                </div>
              </div>
            </div>
            
            {/* Admin badge with enhanced design */}
            {isAdmin && (
              <div className="mt-6 lg:mt-8 inline-flex items-center space-x-3">
                <div className="relative">
                  <div className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-violet-600/20 to-emerald-600/20 backdrop-blur-md border border-violet-400/30 rounded-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-400 rounded-full animate-pulse-fast"></div>
                      <span className="text-xs lg:text-sm font-semibold text-emerald-400">Administrator Access</span>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-400 rounded-full animate-pulse-fast animation-delay-300"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-emerald-600/10 rounded-full animate-glow"></div>
                </div>
              </div>
            )}
          </div>

          {/* Main form container with advanced glassmorphism */}
          <div className="relative">
            {/* Background glow effects */}
            <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-violet-600/20 via-transparent to-cyan-600/20 rounded-2xl lg:rounded-3xl blur-xl lg:blur-2xl"></div>
            
            {/* Main container */}
            <div className="relative glass-nav-panel rounded-2xl lg:rounded-3xl border border-white/10 overflow-hidden">
              {/* Header bar with status indicators */}
              <div className="border-b border-white/10 p-4 lg:p-6 bg-gradient-to-r from-violet-500/5 to-cyan-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="flex space-x-1.5 lg:space-x-2">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-400 rounded-full animate-pulse-fast"></div>
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-yellow-400 rounded-full animate-pulse-fast animation-delay-200"></div>
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-red-400 rounded-full animate-pulse-fast animation-delay-400"></div>
                    </div>
                    <span className="text-xs lg:text-sm font-medium text-gray-300 hidden sm:block">Certificate Minting Terminal</span>
                    <span className="text-xs font-medium text-gray-300 sm:hidden">Minting Terminal</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 lg:space-x-3">
                    <div className="text-xs text-gray-400 hidden lg:block">Blockchain: Active</div>
                    <div className="text-xs text-gray-400 lg:hidden">Active</div>
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Form content with enhanced padding */}
              <div className="p-6 sm:p-8 lg:p-12">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 lg:py-20">
                    <div className="relative">
                      <LoadingSpinner size="large" />
                      {/* Enhanced loading with holographic effects */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 animate-spin-slow"></div>
                    </div>
                    <p className="mt-6 lg:mt-8 text-lg lg:text-xl text-gray-300 font-medium text-center px-4">
                      Initializing quantum verification protocols...
                    </p>
                    <div className="mt-3 lg:mt-4 flex space-x-1">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-violet-400 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-violet-400 rounded-full animate-pulse animation-delay-200"></div>
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-violet-400 rounded-full animate-pulse animation-delay-400"></div>
                    </div>
                  </div>
                ) : (
                  <CertificateForm isAdmin={isAdmin} userAddress={userAddress} />
                )}
              </div>
            </div>
          </div>
          
          {/* Footer accent */}
          <div className="mt-8 lg:mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-xs lg:text-sm text-gray-400">
              <div className="w-1 h-1 bg-violet-400 rounded-full"></div>
              <span className="hidden sm:block">Powered by Advanced Blockchain Technology</span>
              <span className="sm:hidden">Blockchain Powered</span>
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueCertificate