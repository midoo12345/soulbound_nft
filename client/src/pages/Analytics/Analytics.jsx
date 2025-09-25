import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import useWalletRoles from '../../hooks/useWalletRoles';
import useInstitutionStats from '../../hooks/useInstitutionStats';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import UnauthorizedAccess from '../../components/Auth/UnauthorizedAccess';

// Analytics Components
import AnalysisHeader from './components/AnalysisHeader';
import AnalysisNavigation from './components/AnalysisNavigation';
import OverviewAnalytics from './components/OverviewAnalytics';
import CertificateAnalytics from './components/CertificateAnalytics';
import InstitutionAnalytics from './components/InstitutionAnalytics';
import NetworkAnalytics from './components/NetworkAnalytics';
import ActivityFeed from './components/ActivityFeed';
import ReportsBuilder from './components/ReportsBuilder';

// Loading & Error Components
import { AnalyticsSkeleton } from '../../components/Loading/LoadingSkeletons';
import { OfflineState, WrongNetworkState, WalletNotConnectedState } from '../../components/Fallback/FallbackStates';

const Analytics = () => {
  // Wallet and contract state
  const { 
    account: currentAccount, 
    roles, 
    contract: hookContract, 
    roleConstants,
    connectWallet, 
    isConnected,
    isLoading: walletLoading 
  } = useWalletRoles();

  // Extract roles for easier access
  const isAdmin = roles.isAdmin;
  const isInstitution = roles.isInstitution;
  const { INSTITUTION_ROLE, DEFAULT_ADMIN_ROLE } = roleConstants;

  // Use hook's contract
  const contract = hookContract;

  // Institution statistics for analytics
  const { 
    stats: institutionStats, 
    isLoading: statsLoading, 
    error: statsError,
    refreshStats 
  } = useInstitutionStats(contract, roleConstants, currentAccount);

  // Analytics state
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);

  // Real-time update state
  const [lastBlockNumber, setLastBlockNumber] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if real-time features are available
  useEffect(() => {
    const testRealTimeCapabilities = async () => {
      if (contract && contract.provider) {
        try {
          const blockNumber = await contract.provider.getBlockNumber();
          setRealTimeEnabled(true);
          setLastBlockNumber(blockNumber);
        } catch (error) {
          console.warn('Real-time features not available:', error);
          setRealTimeEnabled(false);
        }
      }
    };

    testRealTimeCapabilities();
  }, [contract]);

  // Real-time updates via contract polling - REMOVED DUPLICATE INTERVAL
  useEffect(() => {
    if (!contract || !realTimeEnabled) return;

    const checkForUpdates = async () => {
      try {
        // Check if we have a valid provider before trying to get block number
        if (!contract.provider) {
          console.log('Analytics: No provider available for real-time updates');
          return;
        }

        const currentBlock = await contract.provider.getBlockNumber();
        if (currentBlock > lastBlockNumber) {
          console.log('Analytics: New block detected, updating stats...');
          setIsUpdating(true);
          
          // Only refresh stats if the function exists and works
          if (refreshStats && typeof refreshStats === 'function') {
            try {
              await refreshStats();
              console.log('Analytics: Stats refreshed successfully');
            } catch (statsError) {
              console.warn('Analytics: Error refreshing stats:', statsError);
            }
          }
          
          setLastBlockNumber(currentBlock);
          setLastUpdate(Date.now());
          setIsUpdating(false);
        }
      } catch (error) {
        console.warn('Analytics: Error checking for updates:', error);
        setIsUpdating(false);
      }
    };

    // REMOVED: No more duplicate interval - useHistoricalMetrics handles this
    // const interval = setInterval(checkForUpdates, 30000); // 30 seconds
    // return () => clearInterval(interval);
    
    // Only check once on mount, then let useHistoricalMetrics handle updates
    checkForUpdates();
  }, [contract, realTimeEnabled, lastBlockNumber, refreshStats]);

  // Auto-refresh analytics when dependencies change
  useEffect(() => {
    if (contract && roleConstants?.INSTITUTION_ROLE) {
      setIsLoading(false);
      setLastUpdate(Date.now());
    }
  }, [contract, roleConstants]);

  // Handle section navigation
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  // Error retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    if (refreshStats) {
      refreshStats();
    }
    if (connectWallet && !isConnected) {
      connectWallet();
    }
  }, [refreshStats, connectWallet, isConnected]);

  // Loading state
  if (walletLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="p-6">
          <AnalyticsSkeleton />
        </div>
      </div>
    );
  }

  // Block institution users (non-admin) from accessing analytics
  if (isInstitution && !isAdmin) {
    return <UnauthorizedAccess />;
  }

  // Error states
  if (error || statsError) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="p-6">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center text-red-400 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error loading analytics: {error?.message || statsError?.message || 'Unknown error'}</span>
            </div>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Network status checks
  if (!isConnected) {
    return <WalletNotConnectedState onConnect={connectWallet} />;
  }

  // Render analytics page
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Futuristic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black opacity-100"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <AnalysisHeader 
          lastUpdate={lastUpdate}
          isUpdating={isUpdating}
          realTimeEnabled={realTimeEnabled}
          userRoles={roles}
        />

        {/* Navigation */}
        <AnalysisNavigation 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userRoles={roles}
        />

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <OverviewAnalytics 
                institutionStats={institutionStats}
                isLoading={statsLoading}
                isUpdating={isUpdating}
                realTimeEnabled={realTimeEnabled}
                contract={contract}
              />
            )}

            {/* Certificate Analytics Section */}
            {activeSection === 'certificates' && (
              <CertificateAnalytics 
                contract={contract}
                institutionStats={institutionStats}
                isLoading={statsLoading}
                isUpdating={isUpdating}
                realTimeEnabled={realTimeEnabled}
              />
            )}

            {/* Institution Analytics Section */}
            {activeSection === 'institutions' && (
              <InstitutionAnalytics 
                contract={contract}
                roleConstants={roleConstants}
                currentAccount={currentAccount}
                institutionStats={institutionStats}
                isLoading={statsLoading}
                isUpdating={isUpdating}
                realTimeEnabled={realTimeEnabled}
              />
            )}

            {/* Network Analytics Section */}
            {activeSection === 'network' && (
              <NetworkAnalytics 
                contract={contract}
                isLoading={statsLoading}
                isUpdating={isUpdating}
                realTimeEnabled={realTimeEnabled}
              />
            )}

            {/* Activity Feed Section */}
            {activeSection === 'activity' && (
              <ActivityFeed 
                contract={contract}
                isLoading={statsLoading}
                isUpdating={isUpdating}
                realTimeEnabled={realTimeEnabled}
              />
            )}

            {/* Reports Builder Section */}
            {activeSection === 'reports' && (
              <ReportsBuilder 
                contract={contract}
                institutionStats={institutionStats}
                isLoading={statsLoading}
                userRoles={roles}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
