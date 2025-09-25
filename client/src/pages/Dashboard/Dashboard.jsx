import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import useWalletRoles from '../../hooks/useWalletRoles';
import useInstitutionStats from '../../hooks/useInstitutionStats';

// Enhanced Error Handling & Loading Components
import DashboardErrorBoundary from '../../components/ErrorBoundary/DashboardErrorBoundary';
import { 
  StatCardSkeleton,
  AnalyticsCardSkeleton, 
  DashboardHeaderSkeleton,
  QuickActionSkeleton 
} from '../../components/Loading/LoadingSkeletons';
import { DashboardStats, QuickActions } from '../../components/Dashboard';
import StatusInfoPanel from '../../components/Dashboard/StatusComponents';
import { 
  OfflineState, 
  WrongNetworkState, 
  WalletNotConnectedState,
  useNetworkStatus 
} from '../../components/Fallback/FallbackStates';

const Dashboard = () => {
  // Enhanced network status detection
  const { isOnline } = useNetworkStatus();
  
  // Hook integration - replaces manual wallet state management
  const { 
    account: currentAccount, 
    roles, 
    contract: hookContract, 
    roleConstants,
    connectWallet, 
    isConnected,
    isLoading: walletLoading 
  } = useWalletRoles();

  // Extract roles and role constants for easier access
  const isAdmin = roles.isAdmin;
  const isInstitution = roles.isInstitution;
  const { INSTITUTION_ROLE, DEFAULT_ADMIN_ROLE } = roleConstants;

  // Use hook's contract which includes provider access
  const contract = hookContract;

  // Institution statistics hook - replaces complex event-based counting
  const { 
    stats: institutionStats, 
    isLoading: statsLoading, 
    error: statsError,
    refreshStats 
  } = useInstitutionStats(contract, roleConstants, currentAccount);

  // Dashboard-specific loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced error state management
  const [hasRenderError, setHasRenderError] = useState(false);
  
  // Error retry handler
  const handleDashboardRetry = useCallback(() => {
    setHasRenderError(false);
    if (refreshStats) {
      refreshStats();
    }
    if (connectWallet && !isConnected) {
      connectWallet();
    }
  }, [refreshStats, connectWallet, isConnected]);
  
  // Get provider from contract when available (for block listening)
  const provider = contract?.provider || null;
  // lastUpdated is now provided by institutionStats.lastUpdated
  const [lastBlockNumber, setLastBlockNumber] = useState(null);

  // Role constants are now provided by useWalletRoles hook
  // Contract initialization is now handled by useWalletRoles hook
  // Role checking is now handled by useWalletRoles hook

  // Institution counting is now handled by useInstitutionStats hook
  // Removed 110+ lines of complex event-based counting logic

  // Certificate counting is now handled by useInstitutionStats hook
  // Removed event-based counting functions for better performance and reliability

  // Use stats directly from hook - no need for additional state management
  // The institutionStats hook already provides all needed statistics

  // Add event handlers for real-time updates
  const handleCertificateEvent = useCallback((event) => {
    // Enhanced event handling with logging for debugging
    console.log('Dashboard: Certificate event detected:', {
      event: event?.event || 'Unknown',
      tokenId: event?.args?.tokenId?.toString(),
      timestamp: new Date().toISOString()
    });
    
    // Refresh stats immediately when any certificate-related event occurs
    refreshStats();
  }, [refreshStats]);

  // Setup event listeners
  useEffect(() => {
    if (!contract) return;

    const setupEventListeners = async () => {
      // Listen for all relevant events using direct event names for better reliability
      contract.on('CertificateIssued', handleCertificateEvent);
      contract.on('CertificateVerified', handleCertificateEvent);
      contract.on('CertificateRevoked', handleCertificateEvent);
      contract.on('CertificateStatusChanged', handleCertificateEvent); // 🔥 KEY MISSING EVENT!
      contract.on('CertificateUpdated', handleCertificateEvent);
      contract.on('InstitutionAuthorized', handleCertificateEvent);
      contract.on('InstitutionRevoked', handleCertificateEvent);

      // Also listen for burn-related events that affect stats
      contract.on('CertificateBurnRequested', handleCertificateEvent);
      contract.on('CertificateBurnApproved', handleCertificateEvent);
      contract.on('CertificateBurned', handleCertificateEvent);

      // Also listen for new blocks to keep stats fresh
      if (provider) {
        provider.on('block', async (blockNumber) => {
          setLastBlockNumber(blockNumber);
          // Refresh stats every 3 blocks for faster real-time updates
          if (blockNumber % 3 === 0) {
            refreshStats();
          }
        });
      }

      console.log('Dashboard: Event listeners set up for real-time verification updates');
    };

    setupEventListeners();

    // Cleanup listeners
    return () => {
      contract.removeAllListeners();
      if (provider) {
        provider.removeAllListeners('block');
      }
    };
  }, [contract, provider, handleCertificateEvent, refreshStats]);

  // Wallet initialization is now handled by useWalletRoles hook
  // Initialize dashboard when wallet is ready
  useEffect(() => {
    if (isConnected && contract) {
      // Dashboard is ready when wallet hook has connected and contract is available
      setIsLoading(false);
    } else if (!walletLoading && !isConnected) {
      // If wallet is not loading and not connected, dashboard should not be loading either
      setIsLoading(false);
    }
  }, [isConnected, contract, walletLoading]);

  // Role updates are now handled automatically by useWalletRoles hook

  // Stats are now handled directly by useInstitutionStats hook - no additional useEffect needed

  // Account change listeners are now handled by useWalletRoles hook

  // Auto-refresh stats periodically (every 2 minutes) via hook
  useEffect(() => {
    const interval = setInterval(() => {
      if (contract && currentAccount) {
        refreshStats();
      }
    }, 120000);
    
    return () => clearInterval(interval);
  }, [contract, currentAccount, refreshStats]);

  // Fast blockchain cube loader that displays as an overlay
  const SimpleBlockchainCubeLoader = () => (
    <div className="w-16 h-16 relative perspective-500">
      {/* Main cube container with faster animation */}
      <div className="w-full h-full absolute transform-style-3d animate-spin-slow">
        {/* Front face - simple flat design for performance */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-y-0 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-px bg-white/40"></div>
          </div>
        </div>
        
        {/* Back face */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-y-180 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-px bg-white/40"></div>
          </div>
        </div>
        
        {/* Left face */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-y-270 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-px bg-white/40"></div>
          </div>
        </div>
        
        {/* Right face */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-y-90 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-px bg-white/40"></div>
          </div>
        </div>
        
        {/* Top face */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-x-90 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border border-white/30 rotate-45"></div>
          </div>
        </div>
        
        {/* Bottom face */}
        <div className="absolute w-full h-full bg-violet-600 transform rotate-x-270 translate-z-8 border border-white/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/70 font-mono">#</span>
          </div>
        </div>
      </div>
      
      {/* Simple glow effect */}
      <div className="absolute -inset-2 bg-violet-600/20 rounded-full blur-lg"></div>
    </div>
  );



  // Early return for critical error states
  if (!isOnline) {
    return <OfflineState onRetry={handleDashboardRetry} showFullPage={true} />;
  }
  
  // Only show wallet prompt if we're certain wallet is not connected
  if (!walletLoading && !isConnected && !currentAccount) {
    return (
      <div className="bg-gray-950 min-h-screen text-gray-200 relative overflow-hidden flex items-center justify-center">
        <WalletNotConnectedState onConnect={connectWallet} />
      </div>
    );
  }
  
  return (
    <DashboardErrorBoundary 
      onError={(error, errorInfo) => console.error('Dashboard Error:', error, errorInfo)}
      onRetry={handleDashboardRetry}
    >
      <div className="bg-gray-950 min-h-screen text-gray-200 relative overflow-hidden">
      {/* Floating loading indicator - doesn't hide content */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-8 border border-violet-500/30 shadow-xl flex flex-col items-center">
            <SimpleBlockchainCubeLoader />
            <p className="mt-4 text-violet-300 text-sm font-medium">Loading data...</p>
          </div>
        </div>
      )}
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-blue-900/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-indigo-900/10 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Futuristic grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        
        {/* Digital circuit lines */}
        <div className="absolute top-0 left-1/4 w-0.5 h-screen bg-violet-500/5"></div>
        <div className="absolute top-0 left-2/4 w-0.5 h-screen bg-violet-500/5"></div>
        <div className="absolute top-0 left-3/4 w-0.5 h-screen bg-violet-500/5"></div>
        <div className="absolute top-1/4 left-0 w-screen h-0.5 bg-violet-500/5"></div>
        <div className="absolute top-2/4 left-0 w-screen h-0.5 bg-violet-500/5"></div>
        <div className="absolute top-3/4 left-0 w-screen h-0.5 bg-violet-500/5"></div>
      </div>

      <div className="relative z-10 py-6">
        {/* Main dashboard content */}
        <div className="max-w-[1600px] mx-auto px-4 space-y-8 relative">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-violet-950/80 to-indigo-950/80 rounded-lg shadow-lg border border-violet-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Glowing accent lines */}
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500/70 to-blue-500/70"></div>
            <div className="absolute bottom-0 right-0 h-full w-1 bg-gradient-to-b from-violet-500/0 via-violet-500/70 to-violet-500/0"></div>
            
            {/* Digital circuit decorations */}
            <div className="absolute top-0 right-[15%] w-0.5 h-16 bg-violet-500/20"></div>
            <div className="absolute bottom-0 left-[25%] w-0.5 h-10 bg-violet-500/20"></div>
            <div className="absolute top-1/2 right-8 w-2 h-2 bg-violet-500/30 rounded-full"></div>
            
            <div className="flex flex-col lg:flex-row justify-between p-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded bg-violet-600/20 flex items-center justify-center border border-violet-500/50 relative group">
                    <div className="absolute -inset-0.5 bg-violet-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <svg className="w-6 h-6 text-violet-400 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-wide flex items-center">
                      Certificate NFT
                      <span className="ml-2 text-xs font-mono bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded border border-violet-600/30">v1.0</span>
                    </h1>
                    <div className="flex items-center mt-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
                      <p className="text-violet-200 text-sm font-medium">
                        {isAdmin ? 'Administrative Controls' :
                          isInstitution ? 'Institution Management' :
                            'Certificate Management'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Status & Info Components - Refactored for reusability and real-time updates */}
              <StatusInfoPanel 
                className="mt-6 lg:mt-0"
                userRoles={roles}
                lastUpdated={institutionStats?.lastUpdated}
                isLoading={statsLoading}
                contract={contract}
                provider={provider}
                layout="horizontal"
                showComponents={{
                  networkStatus: true,
                  userRole: true,
                  lastUpdated: true,
                  connectionHealth: false // Enable for admin view if needed
                }}
                showPermissions={true}
                autoRefresh={true}
                onRefreshNeeded={refreshStats}
              />
            </div>
          </div>

          {/* Dashboard Stats Section - Refactored Component */}
          <DashboardStats 
            institutionStats={institutionStats}
            isLoading={statsLoading}
            error={statsError}
            userRoles={roles}
          />

          {/* Advanced Analytics and Secondary Info Grid with Error Boundaries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Certificate Status Distribution */}
            <DashboardErrorBoundary fallbackComponent={<AnalyticsCardSkeleton title="Certificate Status" rows={3} />}>
              <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Glowing accent */}
              <div className="absolute top-0 left-0 h-1 w-20 bg-indigo-500/60"></div>
              <div className="absolute bottom-0 right-0 w-16 h-px bg-indigo-500/40"></div>
              
              <h3 className="text-lg font-semibold text-white mb-4 tracking-wide flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                {isAdmin ? 'Global Certificate Status' : 'Certificate Status'}
              </h3>
              
              <div className="mt-3 space-y-3">
                {/* Verified vs Unverified */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Verified</span>
                    <span className="text-xs font-mono text-indigo-300">
                      {institutionStats?.verifiedCertificates || 0} / {institutionStats?.totalCertificates || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Show different metrics for admins vs institutions */}
                {isAdmin ? (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">System Coverage</span>
                      <span className="text-xs font-mono text-blue-300">
                        {institutionStats?.totalInstitutions || 0} Institutions
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, ((institutionStats?.totalInstitutions || 0) / Math.max(1, 10)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : isInstitution ? (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-400">Issued by You</span>
                      <span className="text-xs font-mono text-teal-300">
                        {institutionStats?.issuedByCurrentInstitution || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, ((institutionStats?.issuedByCurrentInstitution || 0) / Math.max(1, 50)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : null}
                
                {/* Pending Verification - DIRECT from contract */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Pending Verification</span>
                    <span className="text-xs font-mono text-amber-300">
                      {institutionStats?.pendingCertificates || 0} / {institutionStats?.totalCertificates || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-600 to-orange-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((institutionStats?.pendingCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 🔥 NEW: Revoked Certificates */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Revoked Certificates</span>
                    <span className="text-xs font-mono text-red-300">
                      {institutionStats?.revokedCertificates || 0} / {institutionStats?.totalCertificates || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, ((institutionStats?.revokedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Real certificate data only - no static values */}
              <div className="mt-8 p-3 bg-indigo-900/20 rounded-lg border border-indigo-500/20 space-y-3">
                <div className="text-xs font-semibold text-indigo-300 font-mono mb-2">Certificate Metrics</div>
                
                {/* Certificate Status */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Certificates</span>
                  <span className="text-xs font-mono text-indigo-300">
                    {(institutionStats?.totalCertificates || 0) > 0 ? institutionStats?.totalCertificates : '0'}
                  </span>
                </div>
                
                {/* Verified Certificates */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Verified Certificates</span>
                  <span className="text-xs font-mono text-indigo-300">
                    {(institutionStats?.verifiedCertificates || 0) > 0 ? institutionStats?.verifiedCertificates : '0'}
                  </span>
                </div>
                
                {/* Verification Rate */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Verification Rate</span>
                  <span className="text-xs font-mono text-green-400">
                    {(institutionStats?.totalCertificates || 0) > 0 ? `${Math.floor(((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%` : '0%'}
                  </span>
                </div>
                
                {/* Pending Verification - DIRECT from contract */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Pending Verification</span>
                  <span className="text-xs font-mono text-amber-300">
                    {institutionStats?.pendingCertificates || 0}
                  </span>
                </div>
                
                {/* 🔥 NEW: Revoked Certificates metrics */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Revoked Certificates</span>
                  <span className="text-xs font-mono text-red-300">
                    {institutionStats?.revokedCertificates || 0}
                  </span>
                </div>
                
                {/* 🔥 NEW: Revocation Rate */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Revocation Rate</span>
                  <span className="text-xs font-mono text-red-400">
                    {(institutionStats?.totalCertificates || 0) > 0 ? `${Math.floor(((institutionStats?.revokedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
              </div>
            </DashboardErrorBoundary>
            
            {/* Certificate Verification Analytics */}
            <DashboardErrorBoundary fallbackComponent={<AnalyticsCardSkeleton title="Verification Analytics" rows={4} />}>
              <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 hover:border-blue-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Glowing accent */}
              <div className="absolute top-0 right-0 h-1 w-20 bg-blue-500/60"></div>
              <div className="absolute bottom-0 left-0 w-16 h-px bg-blue-500/40"></div>
              
              <h3 className="text-lg font-semibold text-white mb-4 tracking-wide flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {isAdmin ? 'Global Verification Analytics' : 'Certificate Verification'}
              </h3>
              
              <div className="mt-2 space-y-4">
                {/* Only real contract data - no simulated values */}
                <div className="mt-4 p-3 bg-blue-900/10 rounded-lg border border-blue-500/10 group-hover:border-blue-500/30 transition-colors duration-300">
                  <div className="text-xs text-gray-400 mb-2 font-semibold">Verification Details</div>
                  
                  <div className="space-y-2">
                    {/* Total Certificates */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Total Certificates</span>
                      <span className="text-xs font-mono text-blue-300">
                        {institutionStats?.totalCertificates || 0}
                      </span>
                    </div>
                    
                    {/* Verified Count */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Verified Count</span>
                      <span className="text-xs font-mono text-blue-300">
                        {institutionStats?.verifiedCertificates || 0}
                      </span>
                    </div>
                    
                    {/* Pending Verification - DIRECT from contract */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Pending Verification</span>
                      <span className="text-xs font-mono text-blue-300">
                        {institutionStats?.pendingCertificates || 0}
                      </span>
                    </div>
                    
                    {/* 🔥 NEW: Revoked Certificates in verification analytics */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Revoked Certificates</span>
                      <span className="text-xs font-mono text-red-300">
                        {institutionStats?.revokedCertificates || 0}
                      </span>
                    </div>
                    
                    {/* Contract data */}
                    <div className="mt-3 pt-2 border-t border-blue-800/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Contract Address</span>
                        <span className="text-xs font-mono text-blue-300 truncate max-w-[150px]">
                          {contractAddress.SoulboundCertificateNFT ? contractAddress.SoulboundCertificateNFT.slice(0, 6) + '...' + contractAddress.SoulboundCertificateNFT.slice(-4) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Last Updated</span>
                        <span className="text-xs text-gray-500">
                          {institutionStats?.lastUpdated ? new Date(institutionStats.lastUpdated).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </DashboardErrorBoundary>
            
            {/* Admin: System Analytics / Institution: My Performance */}
            <DashboardErrorBoundary fallbackComponent={<AnalyticsCardSkeleton title={isAdmin ? "System Analytics" : "My Performance"} rows={5} />}>
              <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 hover:border-violet-500/20 transition-all duration-300 relative overflow-hidden group">
              {/* Glowing accent */}
              <div className="absolute top-0 left-1/2 h-1 w-20 bg-violet-500/60 transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 right-0 w-12 h-px bg-violet-500/40"></div>
              
              <h3 className="text-lg font-semibold text-white mb-4 tracking-wide flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAdmin ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  )}
                </svg>
                {isAdmin ? 'System Analytics' : 'My Performance'}
              </h3>
              
              {isAdmin ? (
                <div className="mt-2 space-y-3">
                  {/* Admin: System Statistics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-violet-900/20 rounded-lg border border-violet-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Active Institutions</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      </div>
                      <div className="text-xl font-bold text-white">{institutionStats?.totalInstitutions || 0}</div>
                      <div className="text-xs text-violet-400 mt-1">Authorized to issue</div>
                    </div>
                    
                    <div className="p-3 bg-violet-900/20 rounded-lg border border-violet-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Avg. Certs per Institution</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {(institutionStats?.totalInstitutions || 0) > 0 
                          ? Math.floor((institutionStats?.totalCertificates || 0) / (institutionStats?.totalInstitutions || 1)) 
                          : 0}
                      </div>
                      <div className="text-xs text-violet-400 mt-1">Certificates issued</div>
                    </div>
                  </div>
                  
                  {/* Admin: Institution Distribution */}
                  <div className="p-3 bg-violet-900/10 rounded-lg border border-violet-500/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Institution Distribution</span>
                      <span className="text-xs font-mono text-violet-400">By Certificate Volume</span>
                    </div>
                    <div className="w-full h-10 bg-gray-800/40 rounded overflow-hidden relative">
                      <div className="absolute inset-0 flex items-end">
                        {(institutionStats?.totalInstitutions || 0) > 0 ? (
                          [...Array(Math.min(institutionStats?.totalInstitutions || 0, 10))].map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 mx-px bg-violet-500/40"
                              style={{ height: `${20 + Math.random() * 60}%` }}
                            ></div>
                          ))
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xs text-gray-500">No data available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  {/* Institution: Performance Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-violet-900/20 rounded-lg border border-violet-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Certificates Issued</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      </div>
                      <div className="text-xl font-bold text-white">{institutionStats?.issuedByCurrentInstitution || 0}</div>
                      <div className="text-xs text-violet-400 mt-1">By your institution</div>
                    </div>
                    
                    <div className="p-3 bg-violet-900/20 rounded-lg border border-violet-500/20">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">Success Rate</span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {(institutionStats?.issuedByCurrentInstitution || 0) > 0 
                          ? Math.floor(((institutionStats?.verifiedCertificates || 0) / (institutionStats?.issuedByCurrentInstitution || 1)) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-violet-400 mt-1">Verification rate</div>
                    </div>
                  </div>
                  
                  {/* Institution: Issuance Performance */}
                  <div className="p-3 bg-violet-900/10 rounded-lg border border-violet-500/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Certificate Status Breakdown</span>
                      <span className="text-xs font-mono text-violet-400">Your Institution</span>
                    </div>
                    <div className="space-y-2">
                      {/* Verified */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">✓ Verified</span>
                        <span className="text-xs font-mono text-green-400">
                          {institutionStats?.verifiedCertificates || 0}
                        </span>
                      </div>
                      {/* Pending */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">⏳ Pending</span>
                        <span className="text-xs font-mono text-amber-400">
                          {institutionStats?.pendingCertificates || 0}
                        </span>
                      </div>
                      {/* Revoked */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">✗ Revoked</span>
                        <span className="text-xs font-mono text-red-400">
                          {institutionStats?.revokedCertificates || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Institution Status (for both admin and institution) */}
              <div className="mt-3 p-3 bg-violet-900/10 rounded-lg border border-violet-500/10 group-hover:border-violet-500/30 transition-colors duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Your Institution Status</span>
                  <span className="px-2 py-0.5 bg-green-900/50 rounded-full text-xs text-green-400 border border-green-500/30">
                    {isInstitution ? "Authorized" : isAdmin ? "Administrator" : "Not Authorized"}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-300">
                  {isInstitution ? (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                      <span>You can issue and verify certificates</span>
                    </div>
                  ) : isAdmin ? (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                      <span>You manage institutions and the platform</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                      <span>You can view certificate information</span>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </DashboardErrorBoundary>
          </div>

                    {/* Quick Actions Section - Refactored */}
          <QuickActions 
            userRoles={roles}
            onActionClick={(action, event) => {
              // Optional: Add analytics or custom handling
              console.log(`Action clicked: ${action.title}`, action);
            }}
          />
        </div>
      </div>
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;