import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * LastUpdated Component - Enhanced timestamp display with auto-refresh
 * Shows relative time, absolute time, and refresh indicators
 */
const LastUpdated = ({ 
  timestamp,
  isLoading = false,
  className = '',
  showRelativeTime = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  compact = false,
  onRefreshNeeded
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [displayFormat, setDisplayFormat] = useState('relative'); // 'relative', 'absolute', 'both'

  // Update current time for relative calculations
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for accurate relative time

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Trigger refresh callback when data gets stale
  useEffect(() => {
    if (!timestamp || !onRefreshNeeded || !autoRefresh) return;

    const lastUpdate = new Date(timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - lastUpdate.getTime();

    if (timeDiff > refreshInterval) {
      const interval = setInterval(() => {
        onRefreshNeeded();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [timestamp, onRefreshNeeded, refreshInterval, autoRefresh]);

  // Format relative time (e.g., "2 minutes ago")
  const getRelativeTime = useCallback((timestamp) => {
    if (!timestamp) return 'Never';

    const now = currentTime.getTime();
    const time = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }, [currentTime]);

  // Format absolute time
  const getAbsoluteTime = useCallback((timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // Get freshness indicator color
  const getFreshnessColor = () => {
    if (!timestamp) return 'gray';
    
    const now = currentTime.getTime();
    const time = new Date(timestamp).getTime();
    const diffInMinutes = (now - time) / (1000 * 60);

    if (diffInMinutes < 2) return 'green';      // Very fresh
    if (diffInMinutes < 5) return 'blue';       // Fresh
    if (diffInMinutes < 15) return 'yellow';    // Getting stale
    if (diffInMinutes < 60) return 'orange';    // Stale
    return 'red';                               // Very stale
  };

  // Toggle display format on click
  const handleClick = () => {
    if (displayFormat === 'relative') {
      setDisplayFormat('absolute');
    } else if (displayFormat === 'absolute') {
      setDisplayFormat('both');
    } else {
      setDisplayFormat('relative');
    }
  };

  const freshnessColor = getFreshnessColor();
  const relativeTime = getRelativeTime(timestamp);
  const absoluteTime = getAbsoluteTime(timestamp);

  // Compact version for mobile/small spaces
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <div 
          className={`w-2 h-2 rounded-full mr-2 ${
            isLoading ? 'animate-spin border border-white border-t-transparent rounded-full' : ''
          }`}
          style={{
            backgroundColor: isLoading ? 'transparent' : 
              freshnessColor === 'green' ? '#10b981' :
              freshnessColor === 'blue' ? '#3b82f6' :
              freshnessColor === 'yellow' ? '#f59e0b' :
              freshnessColor === 'orange' ? '#f97316' :
              freshnessColor === 'red' ? '#ef4444' : '#6b7280'
          }}
        />
        <span className="text-xs font-medium text-white cursor-pointer" onClick={handleClick}>
          {showRelativeTime ? relativeTime : absoluteTime}
        </span>
      </div>
    );
  }

  // Full version
  return (
    <div className={`bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-inner flex flex-col ${className}`}>
      <span className="text-xs text-violet-300/70">Last Updated</span>
      <div className="flex items-center mt-1">
        {/* Display timestamp based on format */}
        <div 
          className="font-medium text-white cursor-pointer flex-1"
          onClick={handleClick}
          title="Click to toggle time format"
        >
          {displayFormat === 'relative' && (
            <span>{relativeTime}</span>
          )}
          {displayFormat === 'absolute' && (
            <span>{absoluteTime}</span>
          )}
          {displayFormat === 'both' && (
            <div className="flex flex-col">
              <span className="text-sm">{absoluteTime}</span>
              <span className="text-xs text-gray-400">{relativeTime}</span>
            </div>
          )}
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="ml-2 w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        )}

        {/* Freshness indicator */}
        {!isLoading && (
          <div 
            className={`ml-2 w-3 h-3 rounded-full ${
              freshnessColor === 'green' ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: 
                freshnessColor === 'green' ? '#10b981' :
                freshnessColor === 'blue' ? '#3b82f6' :
                freshnessColor === 'yellow' ? '#f59e0b' :
                freshnessColor === 'orange' ? '#f97316' :
                freshnessColor === 'red' ? '#ef4444' : '#6b7280'
            }}
            title={
              freshnessColor === 'green' ? 'Data is very fresh' :
              freshnessColor === 'blue' ? 'Data is fresh' :
              freshnessColor === 'yellow' ? 'Data is getting stale' :
              freshnessColor === 'orange' ? 'Data is stale' :
              freshnessColor === 'red' ? 'Data is very stale' : 'Unknown'
            }
          />
        )}
      </div>

      {/* Additional info for stale data */}
      {freshnessColor === 'red' && !isLoading && (
        <div className="mt-1 text-xs text-red-400/70">
          ⚠️ Data may be outdated
        </div>
      )}

      {/* Additional info for fresh data */}
      {freshnessColor === 'green' && !isLoading && (
        <div className="mt-1 text-xs text-emerald-400/70">
          ✨ Real-time data
        </div>
      )}
    </div>
  );
};

LastUpdated.propTypes = {
  timestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  showRelativeTime: PropTypes.bool,
  autoRefresh: PropTypes.bool,
  refreshInterval: PropTypes.number,
  compact: PropTypes.bool,
  onRefreshNeeded: PropTypes.func
};

export default LastUpdated;
