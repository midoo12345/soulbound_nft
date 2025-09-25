import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import useNetworkAnalytics from '../../../hooks/useNetworkAnalytics';

/**
 * Network Analytics Component
 * Displays blockchain network health and performance metrics using real contract data
 */
const NetworkAnalytics = ({ 
  contract, 
  isLoading = false, 
  isUpdating = false,
  realTimeEnabled = false 
}) => {
  // State to track if MetaMask is installed and connected
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [metaMaskError, setMetaMaskError] = useState(null);

  // Check MetaMask connection
  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          setIsMetaMaskConnected(accounts.length > 0);
          setMetaMaskError(null);
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
          setIsMetaMaskConnected(false);
          setMetaMaskError('Failed to connect to MetaMask');
        }
      } else {
        setIsMetaMaskConnected(false);
        setMetaMaskError('MetaMask not installed');
      }
    };

    checkMetaMask();
  }, []);

  // Use our custom hook for network analytics
  const { 
    networkData, 
    isLoadingData, 
    trends,
    refreshData,
    initializeContract,
    error: networkError,
    isInitializing
  } = useNetworkAnalytics(contract, {
    refreshInterval: 30000, // 30 seconds
    realTimeEnabled: realTimeEnabled, // Assume MetaMask is connected if contract exists
    maxHistoryPoints: 20
  });
  
  // Combine component loading state with hook loading state
  const isComponentLoading = isLoading || isLoadingData || isInitializing;
  
  // Trigger manual refresh when isUpdating changes
  React.useEffect(() => {
    if (isUpdating && contract) {
      refreshData();
    }
  }, [isUpdating, contract, refreshData]);

  // Check if contract is available - assume MetaMask is connected if contract exists
  // This ensures we don't show the connection message when the user says it's already connected
  const isContractAvailable = !!contract;

  // If contract is not available, show a message prompting to connect MetaMask
  if (!isContractAvailable && !isComponentLoading && !metaMaskError && !networkError) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center text-blue-400 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Blockchain Connection Required</span>
          </div>
          <p className="text-gray-400 mb-4">Please connect your MetaMask wallet to view real-time network analytics. Make sure you're connected to the correct network.</p>
          <div className="space-y-3">
            <button
              onClick={async () => {
                if (window.ethereum) {
                  try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    // Initialize contract after wallet connection
                    await initializeContract();
                  } catch (err) {
                    console.error('User rejected connection', err);
                  }
                } else {
                  window.open('https://metamask.io/download/', '_blank');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {window.ethereum ? 'Connect Wallet' : 'Install MetaMask'}
            </button>
            
            <button
              onClick={async () => {
                try {
                  await initializeContract();
                } catch (err) {
                  console.error('Error initializing contract:', err);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              Initialize Contract
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'optimal':
        return { color: 'text-green-400', bg: 'bg-green-900/40', border: 'border-green-500/30', icon: '🟢' };
      case 'moderate':
        return { color: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-500/30', icon: '🟡' };
      case 'congested':
        return { color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/30', icon: '🔴' };
      case 'slow':
        return { color: 'text-orange-400', bg: 'bg-orange-900/40', border: 'border-orange-500/30', icon: '🟠' };
      case 'error':
        return { color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/30', icon: '❌' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-900/40', border: 'border-gray-500/30', icon: '⚫' };
    }
  };

  // Loading state
  if (isLoading || isLoadingData || isInitializing) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="text-center text-gray-400 mt-4">
            {isInitializing ? 'Initializing blockchain connection...' : 'Loading network data...'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // MetaMask error state
  if (metaMaskError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center text-red-400 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>MetaMask Error: {metaMaskError}</span>
          </div>
          <p className="text-gray-400 mb-4">Please make sure MetaMask is installed and connected to view network analytics.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Network error state
  if (networkError) {
    return (
      <div className="space-y-6">
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-6">
          <div className="flex items-center text-orange-400 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Network Error: {networkError}</span>
          </div>
          <p className="text-gray-400 mb-4">There was an issue fetching network data. This could be due to network congestion or contract issues.</p>
          <button
            onClick={refreshData}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if we have valid network data
  if (!networkData || !networkData.currentBlock) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center text-yellow-400 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No Network Data Available</span>
          </div>
          <p className="text-gray-400 mb-4">Network data is not available. Please try refreshing or reconnecting your wallet.</p>
          <button
            onClick={refreshData}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Network Analytics
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Monitor blockchain network health, gas prices, and network performance metrics in real-time.
        </p>
        
        {/* Data Status and Refresh Button */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLoadingData ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isLoadingData ? 'Loading network data...' : 'Network data updated'}
            </span>
          </div>
          
          <button 
            onClick={refreshData}
            disabled={isLoadingData}
            className={`px-3 py-1 rounded-md text-sm flex items-center space-x-1 transition-all duration-200 ${isLoadingData ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
          >
            <svg className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoadingData ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Network Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: 'Current Block', 
            value: networkData.currentBlock.toLocaleString(), 
            icon: '🔗', 
            color: 'indigo',
            description: 'Latest blockchain block'
          },
          { 
            title: 'Gas Price', 
            value: `${networkData.gasPrice} Gwei`, 
            icon: '⛽', 
            color: 'green',
            description: 'Current gas price'
          },
          { 
            title: 'Network Status', 
            value: networkData.networkStatus.charAt(0).toUpperCase() + networkData.networkStatus.slice(1), 
            icon: '📡', 
            color: 'blue',
            description: 'Overall network health'
          },
          { 
            title: 'Last Update', 
            value: networkData.lastUpdate ? new Date(networkData.lastUpdate).toLocaleTimeString() : 'Just now', 
            icon: '🕒', 
            color: 'purple',
            description: 'Data freshness'
          }
        ].map((metric) => {
          const statusInfo = metric.title === 'Network Status' ? getStatusInfo(networkData.networkStatus) : null;
          
          return (
            <div key={metric.title} className="group relative bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-indigo-500/20">
              <div className="text-2xl mb-4">{metric.icon}</div>
              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
              <div className="text-sm text-gray-400 mb-2">{metric.title}</div>
              <div className="text-xs text-gray-500">{metric.description}</div>
              
              {/* Status indicator for network status */}
              {statusInfo && (
                <div className={`absolute top-4 right-4 ${statusInfo.bg} ${statusInfo.border} rounded-full p-2`}>
                  <span className="text-lg">{statusInfo.icon}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Network Health Dashboard */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Network Health Dashboard
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">Network Performance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Block Confirmation</span>
                <span className={`font-medium ${
                  networkData.networkHealth.blockConfirmation === 'fast' ? 'text-green-400' :
                  networkData.networkHealth.blockConfirmation === 'moderate' ? 'text-yellow-400' :
                  networkData.networkHealth.blockConfirmation === 'slow' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {networkData.networkHealth.blockConfirmation.charAt(0).toUpperCase() + networkData.networkHealth.blockConfirmation.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Network Congestion</span>
                <span className={`font-medium ${
                  networkData.networkHealth.congestion === 'low' ? 'text-green-400' :
                  networkData.networkHealth.congestion === 'medium' ? 'text-yellow-400' :
                  networkData.networkHealth.congestion === 'high' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {networkData.networkHealth.congestion.charAt(0).toUpperCase() + networkData.networkHealth.congestion.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Gas Efficiency</span>
                <span className={`font-medium ${
                  networkData.networkHealth.gasEfficiency === 'excellent' ? 'text-green-400' :
                  networkData.networkHealth.gasEfficiency === 'good' ? 'text-blue-400' :
                  networkData.networkHealth.gasEfficiency === 'fair' ? 'text-yellow-400' :
                  networkData.networkHealth.gasEfficiency === 'poor' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {networkData.networkHealth.gasEfficiency.charAt(0).toUpperCase() + networkData.networkHealth.gasEfficiency.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-300">System Metrics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400 font-medium">{networkData.networkHealth.uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time</span>
                <span className="text-blue-400 font-medium">{networkData.networkHealth.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Security Score</span>
                <span className={`font-medium ${
                  networkData.networkHealth.securityScore === 'A+' ? 'text-green-400' :
                  networkData.networkHealth.securityScore === 'A' ? 'text-green-400' :
                  networkData.networkHealth.securityScore === 'B+' ? 'text-blue-400' :
                  networkData.networkHealth.securityScore === 'B' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {networkData.networkHealth.securityScore}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Performance Metrics */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Contract Performance Metrics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: 'Total Transactions', 
              value: networkData.contractMetrics.totalTransactions.toLocaleString(), 
              icon: '📊',
              color: 'blue'
            },
            { 
              title: 'Avg Gas Used', 
              value: `${networkData.contractMetrics.averageGasUsed} Gwei`, 
              icon: '⛽',
              color: 'green'
            },
            { 
              title: 'Last Activity', 
              value: networkData.contractMetrics.lastActivity || 'None', 
              icon: '🕒',
              color: 'purple'
            },
            { 
              title: 'Error Rate', 
              value: `${networkData.contractMetrics.errorRate}%`, 
              icon: '⚠️',
              color: 'red'
            }
          ].map((metric) => (
            <div key={metric.title} className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
              <div className="text-xl mb-2">{metric.icon}</div>
              <div className="text-lg font-semibold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Network Recommendations */}
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Network Recommendations
        </h3>
        
        <div className="space-y-3">
          {networkData.networkStatus === 'optimal' && (
            <div className="flex items-center space-x-2 text-green-400">
              <span>✅</span>
              <span>Network is performing optimally. Continue with normal operations.</span>
            </div>
          )}
          
          {networkData.networkStatus === 'moderate' && (
            <div className="flex items-center space-x-2 text-yellow-400">
              <span>⚠️</span>
              <span>Network is moderately congested. Consider timing transactions during off-peak hours.</span>
            </div>
          )}
          
          {networkData.networkStatus === 'congested' && (
            <div className="flex items-center space-x-2 text-red-400">
              <span>🚨</span>
              <span>Network is highly congested. Delay non-urgent transactions and monitor gas prices.</span>
            </div>
          )}
          
          {networkData.networkStatus === 'slow' && (
            <div className="flex items-center space-x-2 text-orange-400">
              <span>🐌</span>
              <span>Network is experiencing slow block confirmations. Be patient with transaction processing.</span>
            </div>
          )}
          
          {networkData.networkStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-400">
              <span>❌</span>
              <span>Unable to fetch network data. Check your connection and try again.</span>
            </div>
          )}
        </div>
      </div>

      {/* Network Trends */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Network Trends
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Gas Price Trend</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${trends.gasPrice === 'rising' ? 'bg-red-900/40 text-red-400' : trends.gasPrice === 'falling' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                {trends.gasPrice === 'rising' ? '↗ Rising' : trends.gasPrice === 'falling' ? '↘ Falling' : '→ Stable'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {trends.gasPrice === 'rising' ? 'Gas prices are trending upward. Consider delaying non-urgent transactions.' : 
               trends.gasPrice === 'falling' ? 'Gas prices are trending downward. Good time for transactions.' : 
               'Gas prices are stable.'}
            </p>
          </div>
          
          <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Block Time Trend</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${trends.blockTime === 'slow' ? 'bg-red-900/40 text-red-400' : trends.blockTime === 'fast' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'}`}>
                {trends.blockTime === 'slow' ? '🐢 Slowing' : trends.blockTime === 'fast' ? '🚀 Accelerating' : '⏱️ Consistent'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {trends.blockTime === 'slow' ? 'Block confirmation times are increasing. Expect longer transaction times.' : 
               trends.blockTime === 'fast' ? 'Block confirmation times are decreasing. Transactions should be faster.' : 
               'Block confirmation times are consistent.'}
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      {realTimeEnabled && (
        <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-300 font-medium">
              Network analytics updating in real-time • Last update: {isLoadingData ? 'Now' : 'Just now'}
            </span>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      )}


    </div>
  );
};

// PropTypes validation
NetworkAnalytics.propTypes = {
  contract: PropTypes.object,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool
};

// Default props
NetworkAnalytics.defaultProps = {
  contract: null,
  isLoading: false,
  isUpdating: false,
  realTimeEnabled: false
};

export default NetworkAnalytics;
