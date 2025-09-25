import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNetworkStatus } from '../../Fallback/FallbackStates';

/**
 * NetworkStatus Component - Enhanced network connection indicator
 * Shows real-time connection status with speed and latency information
 */
const NetworkStatus = ({ 
  className = '',
  showSpeed = false,
  showLatency = false,
  compact = false
}) => {
  const { isOnline, networkSpeed } = useNetworkStatus();
  const [latency, setLatency] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('unknown');

  // Enhanced network monitoring with latency detection
  useEffect(() => {
    if (!isOnline) return;

    const measureLatency = async () => {
      try {
        const startTime = performance.now();
        await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache'
        }).catch(() => {
          // Fallback to a reliable external endpoint if local ping fails
          return fetch('https://www.google.com/favicon.ico', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
        });
        const endTime = performance.now();
        const currentLatency = Math.round(endTime - startTime);
        setLatency(currentLatency);

        // Determine connection quality based on latency
        if (currentLatency < 100) setConnectionQuality('excellent');
        else if (currentLatency < 300) setConnectionQuality('good');
        else if (currentLatency < 600) setConnectionQuality('fair');
        else setConnectionQuality('poor');
      } catch (error) {
        setLatency(null);
        setConnectionQuality('unknown');
      }
    };

    // Initial measurement
    measureLatency();

    // Periodic latency checks every 30 seconds
    const interval = setInterval(measureLatency, 30000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Status color mapping
  const getStatusColor = () => {
    if (!isOnline) return 'red';
    switch (connectionQuality) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'orange';
      default: return 'gray';
    }
  };

  // Status text mapping
  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    switch (connectionQuality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Connected';
    }
  };

  // Speed mapping for display
  const getSpeedText = () => {
    switch (networkSpeed) {
      case 'slow-2g': return '2G';
      case '2g': return '2G';
      case '3g': return '3G';
      case '4g': return '4G';
      case '5g': return '5G';
      default: return networkSpeed || 'Unknown';
    }
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();

  // Compact version for mobile/small spaces
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: 
              statusColor === 'green' ? '#10b981' :
              statusColor === 'blue' ? '#3b82f6' :
              statusColor === 'yellow' ? '#f59e0b' :
              statusColor === 'orange' ? '#f97316' :
              statusColor === 'red' ? '#ef4444' : '#6b7280'
          }}
        />
        <span className="text-xs font-medium text-white">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  // Full version
  return (
    <div className={`bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-inner flex flex-col ${className}`}>
      <span className="text-xs text-violet-300/70">Network Status</span>
      <div className="flex items-center mt-1">
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: 
              statusColor === 'green' ? '#10b981' :
              statusColor === 'blue' ? '#3b82f6' :
              statusColor === 'yellow' ? '#f59e0b' :
              statusColor === 'orange' ? '#f97316' :
              statusColor === 'red' ? '#ef4444' : '#6b7280'
          }}
        />
        <span className="font-medium text-white">{statusText}</span>
        
        {/* Speed indicator */}
        {showSpeed && networkSpeed && networkSpeed !== 'unknown' && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
            {getSpeedText()}
          </span>
        )}
        
        {/* Latency indicator */}
        {showLatency && latency !== null && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
            {latency}ms
          </span>
        )}
      </div>
      
      {/* Detailed info for excellent connections */}
      {isOnline && connectionQuality === 'excellent' && (showSpeed || showLatency) && (
        <div className="mt-1 text-xs text-emerald-400/70">
          ⚡ Optimal performance
        </div>
      )}
      
      {/* Warning for poor connections */}
      {isOnline && connectionQuality === 'poor' && (
        <div className="mt-1 text-xs text-amber-400/70">
          ⚠️ Slow connection detected
        </div>
      )}
    </div>
  );
};

NetworkStatus.propTypes = {
  className: PropTypes.string,
  showSpeed: PropTypes.bool,
  showLatency: PropTypes.bool,
  compact: PropTypes.bool
};

export default NetworkStatus;
