import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';

/**
 * ConnectionHealth Component - Advanced network diagnostics
 * Monitors blockchain connectivity, RPC status, and contract accessibility
 */
const ConnectionHealth = ({ 
  contract,
  provider,
  className = '',
  showDetails = false,
  autoCheck = true,
  checkInterval = 60000, // 1 minute
  compact = false
}) => {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'unknown',
    rpc: 'unknown',
    contract: 'unknown',
    blockchain: 'unknown',
    blockHeight: null,
    gasPrice: null,
    lastCheck: null
  });
  const [isChecking, setIsChecking] = useState(false);

  // Comprehensive health check
  const performHealthCheck = useCallback(async () => {
    if (!provider) return;

    setIsChecking(true);
    const startTime = Date.now();

    try {
      const results = {
        lastCheck: new Date(),
        rpc: 'unknown',
        contract: 'unknown',
        blockchain: 'unknown',
        blockHeight: null,
        gasPrice: null
      };

      // Test RPC connection
      try {
        const network = await Promise.race([
          provider.getNetwork(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        results.rpc = network ? 'healthy' : 'unhealthy';
      } catch (error) {
        results.rpc = 'unhealthy';
        console.warn('RPC check failed:', error.message);
      }

      // Test blockchain connectivity
      try {
        const [blockNumber, gasPrice] = await Promise.all([
          Promise.race([
            provider.getBlockNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]),
          Promise.race([
            provider.getGasPrice(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ])
        ]);

        results.blockHeight = blockNumber;
        results.gasPrice = gasPrice;
        results.blockchain = 'healthy';
      } catch (error) {
        results.blockchain = 'unhealthy';
        console.warn('Blockchain check failed:', error.message);
      }

      // Test contract accessibility
      if (contract) {
        try {
          await Promise.race([
            contract.totalSupply(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]);
          results.contract = 'healthy';
        } catch (error) {
          results.contract = 'unhealthy';
          console.warn('Contract check failed:', error.message);
        }
      } else {
        results.contract = 'unavailable';
      }

      // Determine overall health
      const healthyCount = Object.values(results).filter(
        status => status === 'healthy'
      ).length;
      const totalChecks = 3; // RPC, blockchain, contract

      if (healthyCount === totalChecks) {
        results.overall = 'excellent';
      } else if (healthyCount >= totalChecks - 1) {
        results.overall = 'good';
      } else if (healthyCount >= 1) {
        results.overall = 'poor';
      } else {
        results.overall = 'critical';
      }

      setHealthStatus(results);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(prev => ({
        ...prev,
        overall: 'critical',
        lastCheck: new Date()
      }));
    } finally {
      setIsChecking(false);
    }
  }, [provider, contract]);

  // Auto health checks
  useEffect(() => {
    if (!autoCheck || !provider) return;

    // Initial check
    performHealthCheck();

    // Periodic checks
    const interval = setInterval(performHealthCheck, checkInterval);
    return () => clearInterval(interval);
  }, [performHealthCheck, autoCheck, checkInterval, provider]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#10b981';  // green
      case 'healthy': return '#10b981';    // green
      case 'good': return '#3b82f6';       // blue
      case 'poor': return '#f59e0b';       // yellow
      case 'unhealthy': return '#f97316';  // orange
      case 'critical': return '#ef4444';   // red
      case 'unavailable': return '#6b7280'; // gray
      default: return '#6b7280';           // gray
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'healthy': return 'Healthy';
      case 'good': return 'Good';
      case 'poor': return 'Poor';
      case 'unhealthy': return 'Unhealthy';
      case 'critical': return 'Critical';
      case 'unavailable': return 'N/A';
      default: return 'Unknown';
    }
  };

  // Format gas price for display
  const formatGasPrice = (gasPrice) => {
    if (!gasPrice) return 'N/A';
    try {
      const gwei = ethers.utils.formatUnits(gasPrice, 'gwei');
      return `${parseFloat(gwei).toFixed(1)} Gwei`;
    } catch {
      return 'N/A';
    }
  };

  // Compact version
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            isChecking ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: getStatusColor(healthStatus.overall) }}
        />
        <span className="text-xs font-medium text-white">
          {getStatusText(healthStatus.overall)}
        </span>
      </div>
    );
  }

  // Full version
  return (
    <div className={`bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-inner flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-violet-300/70">Connection Health</span>
        {autoCheck && (
          <button 
            onClick={performHealthCheck}
            disabled={isChecking}
            className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh health check"
          >
            {isChecking ? '⟳' : '↻'}
          </button>
        )}
      </div>
      
      <div className="flex items-center mt-1">
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            isChecking ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: getStatusColor(healthStatus.overall) }}
        />
        <span className="font-medium text-white">
          {getStatusText(healthStatus.overall)}
        </span>
        
        {isChecking && (
          <div className="ml-2 w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        )}
      </div>

      {/* Detailed status indicators */}
      {showDetails && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">RPC</span>
            <div className="flex items-center">
              <div 
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: getStatusColor(healthStatus.rpc) }}
              />
              <span className="text-gray-300">{getStatusText(healthStatus.rpc)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Blockchain</span>
            <div className="flex items-center">
              <div 
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: getStatusColor(healthStatus.blockchain) }}
              />
              <span className="text-gray-300">{getStatusText(healthStatus.blockchain)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Contract</span>
            <div className="flex items-center">
              <div 
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: getStatusColor(healthStatus.contract) }}
              />
              <span className="text-gray-300">{getStatusText(healthStatus.contract)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional metrics */}
      {healthStatus.blockHeight && (
        <div className="mt-2 text-xs text-gray-400">
          Block: {healthStatus.blockHeight.toLocaleString()}
        </div>
      )}

      {healthStatus.gasPrice && (
        <div className="text-xs text-gray-400">
          Gas: {formatGasPrice(healthStatus.gasPrice)}
        </div>
      )}

      {/* Status warnings */}
      {healthStatus.overall === 'critical' && (
        <div className="mt-1 text-xs text-red-400/70">
          🔴 Connection issues detected
        </div>
      )}
      
      {healthStatus.overall === 'excellent' && (
        <div className="mt-1 text-xs text-emerald-400/70">
          🟢 All systems operational
        </div>
      )}
    </div>
  );
};

ConnectionHealth.propTypes = {
  contract: PropTypes.object,
  provider: PropTypes.object,
  className: PropTypes.string,
  showDetails: PropTypes.bool,
  autoCheck: PropTypes.bool,
  checkInterval: PropTypes.number,
  compact: PropTypes.bool
};

export default ConnectionHealth;
