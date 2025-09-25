import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Analysis Header Component
 * Futuristic header with real-time status, controls, and user role display
 */
const AnalysisHeader = ({ 
  lastUpdate, 
  isUpdating, 
  realTimeEnabled, 
  userRoles = {} 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showControls, setShowControls] = useState(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format last update time
  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Get status color and text
  const getStatusInfo = () => {
    if (isUpdating) {
      return { color: 'text-yellow-400', text: 'Updating...', icon: '🔄' };
    }
    if (realTimeEnabled) {
      return { color: 'text-green-400', text: 'Live', icon: '🟢' };
    }
    return { color: 'text-gray-400', text: 'Offline', icon: '⚫' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative bg-gray-900/90 backdrop-blur-md border-b border-indigo-500/20">
      {/* Futuristic accent lines */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div className="absolute bottom-0 left-10 h-px w-20 bg-indigo-500/40"></div>
      <div className="absolute bottom-0 right-10 h-px w-20 bg-indigo-500/40"></div>
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Title and Status */}
          <div className="flex items-center space-x-6">
            {/* Main Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                {/* Animated pulse effect */}
                <div className="absolute inset-0 bg-indigo-500/30 rounded-lg animate-ping"></div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Blockchain Certificate Intelligence Platform
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <span className="text-lg">{statusInfo.icon}</span>
              <span className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
              {isUpdating && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>

          {/* Right Section - Controls and Info */}
          <div className="flex items-center space-x-4">
            {/* Real-time Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-3 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-indigo-500/50 rounded-lg transition-all duration-200 text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Time Display */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-700/50">
              <div className="text-center">
                <div className="text-xs text-gray-400">Current Time</div>
                <div className="text-sm font-mono text-white">{formatTime(currentTime)}</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Last Update</div>
                <div className="text-sm font-mono text-gray-300">
                  {formatLastUpdate(lastUpdate)}
                </div>
              </div>
            </div>

            {/* User Role Display */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/60 rounded-lg border border-gray-700/50">
              {userRoles.isAdmin ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-blue-300 font-medium">Admin</span>
                </div>
              ) : userRoles.isInstitution ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span className="text-sm text-teal-300 font-medium">Institution</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-300 font-medium">User</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls Panel (Collapsible) */}
        {showControls && (
          <div className="mt-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="realTimeToggle"
                    checked={realTimeEnabled}
                    onChange={() => {}} // Controlled by parent
                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label htmlFor="realTimeToggle" className="text-sm text-gray-300">
                    Real-time Updates
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Update Interval:</span>
                  <select className="text-sm bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300">
                    <option value="15">15s</option>
                    <option value="30" selected>30s</option>
                    <option value="60">1m</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors">
                  Export Data
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                  Save Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// PropTypes validation
AnalysisHeader.propTypes = {
  lastUpdate: PropTypes.number,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool,
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  })
};

// Default props
AnalysisHeader.defaultProps = {
  lastUpdate: null,
  isUpdating: false,
  realTimeEnabled: false,
  userRoles: {}
};

export default AnalysisHeader;
