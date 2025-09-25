import React from 'react';

export const StatusIndicators = ({ 
  isRealTimeEnabled, 
  lastUpdate, 
  isLoadingData, 
  blockNumber, 
  isUpdating, 
  contract 
}) => {
  return (
    <div className="mt-6 flex items-center justify-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isLoadingData ? 'bg-yellow-400 animate-pulse' : isRealTimeEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></div>
        <span className="text-sm text-gray-400">
          {isLoadingData ? 'Loading...' : isRealTimeEnabled ? 'Event Listening Active' : 'Manual Mode'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
        <span className="text-sm text-gray-400">
          Block: {blockNumber || 'N/A'}
        </span>
      </div>
      
      {lastUpdate && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
          <span className="text-sm text-gray-400">
            Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      )}

      {isUpdating && (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
          <span className="text-sm text-orange-400 animate-pulse">
            Updating...
          </span>
        </div>
      )}

      {/* Connection Health Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${contract?.provider ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-sm text-gray-400">
          {contract?.provider ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
