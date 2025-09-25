import React, { useState, useEffect } from 'react';

/**
 * Comprehensive Fallback UI Components for Different Error States
 * Handles offline, wrong network, wallet issues, and other blockchain-specific scenarios
 */

// Network Detection Hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkSpeed, setNetworkSpeed] = useState('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect network speed
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      setNetworkSpeed(connection.effectiveType || 'unknown');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, networkSpeed };
};

// Offline State Component
export const OfflineState = ({ onRetry, showFullPage = false }) => {
  const Component = showFullPage ? 'div' : 'div';
  const containerClasses = showFullPage 
    ? "fixed inset-0 bg-gray-950 flex items-center justify-center z-50"
    : "bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-8 border border-gray-800 text-center";

  return (
    <Component className={containerClasses}>
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Offline Icon Animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white">You're Offline</h3>
          <p className="text-gray-400">
            No internet connection detected. Please check your network settings and try again.
          </p>
        </div>

        {/* Network Tips */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-left">
          <h4 className="text-sm font-semibold text-white mb-2">Troubleshooting Tips:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Check your WiFi or mobile data connection</li>
            <li>• Try refreshing the page</li>
            <li>• Restart your router if using WiFi</li>
            <li>• Check if other websites are working</li>
          </ul>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Check Connection</span>
          </button>
        )}
      </div>
    </Component>
  );
};

// Wrong Network State
export const WrongNetworkState = ({ expectedNetwork = 'Polygon', currentNetwork, onSwitchNetwork }) => {
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    try {
      if (onSwitchNetwork) {
        await onSwitchNetwork();
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-8 border border-amber-500/30 text-center">
      <div className="space-y-6">
        {/* Network Warning Icon */}
        <div className="w-24 h-24 mx-auto bg-amber-900/30 rounded-full flex items-center justify-center border border-amber-500/50">
          <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white">Wrong Network</h3>
          <p className="text-gray-400">
            You're connected to <span className="text-amber-400">{currentNetwork || 'an unsupported network'}</span>.
            Please switch to <span className="text-green-400">{expectedNetwork}</span> to continue.
          </p>
        </div>

        {/* Network Info */}
        <div className="bg-amber-900/20 rounded-lg p-4 border border-amber-500/30">
          <div className="text-sm text-amber-200">
            <div className="flex justify-between mb-2">
              <span>Current:</span>
              <span className="font-mono">{currentNetwork || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>Required:</span>
              <span className="font-mono text-green-400">{expectedNetwork}</span>
            </div>
          </div>
        </div>

        {/* Switch Network Button */}
        <button
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isSwitching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Switching...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>Switch to {expectedNetwork}</span>
            </>
          )}
        </button>

        {/* Manual Instructions */}
        <div className="text-xs text-gray-500 bg-gray-800/30 rounded p-3">
          <p>If automatic switching doesn't work, please switch networks manually in your wallet.</p>
        </div>
      </div>
    </div>
  );
};

// Wallet Not Connected State
export const WalletNotConnectedState = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (onConnect) {
        await onConnect();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-8 border border-violet-500/30 text-center">
      <div className="space-y-6">
        {/* Wallet Icon */}
        <div className="w-24 h-24 mx-auto bg-violet-900/30 rounded-full flex items-center justify-center border border-violet-500/50">
          <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
          <p className="text-gray-400">
            Connect your wallet to access the Certificate Management Dashboard
          </p>
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>

        {/* Supported Wallets */}
        <div className="text-xs text-gray-500 bg-gray-800/30 rounded p-3">
          <p className="mb-2">Supported Wallets:</p>
          <div className="flex justify-center space-x-4">
            <span>🦊 MetaMask</span>
            <span>🌈 Rainbow</span>
            <span>⚡ WalletConnect</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contract Error State
export const ContractErrorState = ({ error, onRetry, onRefresh }) => {
  const getErrorType = (error) => {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'user_rejected';
    }
    if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
      return 'insufficient_funds';
    }
    if (message.includes('gas')) {
      return 'gas_error';
    }
    if (message.includes('nonce')) {
      return 'nonce_error';
    }
    return 'contract_error';
  };

  const errorType = getErrorType(error);
  
  const errorConfig = {
    user_rejected: {
      title: 'Transaction Cancelled',
      message: 'You cancelled the transaction. No changes were made.',
      icon: '❌',
      color: 'gray',
      canRetry: true
    },
    insufficient_funds: {
      title: 'Insufficient Funds',
      message: 'You don\'t have enough tokens to complete this transaction.',
      icon: '💰',
      color: 'yellow',
      canRetry: false
    },
    gas_error: {
      title: 'Gas Error',
      message: 'Transaction failed due to gas estimation issues. Try adjusting gas settings.',
      icon: '⛽',
      color: 'orange',
      canRetry: true
    },
    nonce_error: {
      title: 'Transaction Nonce Error',
      message: 'Transaction order issue. Try refreshing and attempting again.',
      icon: '🔄',
      color: 'blue',
      canRetry: true
    },
    contract_error: {
      title: 'Contract Error',
      message: 'Smart contract interaction failed. This might be temporary.',
      icon: '⚠️',
      color: 'red',
      canRetry: true
    }
  };

  const config = errorConfig[errorType];

  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 text-center">
      <div className="space-y-4">
        {/* Error Icon */}
        <div className="text-4xl">{config.icon}</div>
        
        {/* Error Details */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">{config.title}</h3>
          <p className="text-gray-400 text-sm">{config.message}</p>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-400">
              Technical Details
            </summary>
            <pre className="mt-2 p-2 bg-gray-800 rounded text-xs text-red-400 overflow-auto max-h-32">
              {error.toString()}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {config.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`flex-1 px-3 py-2 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded text-sm transition-colors duration-200`}
            >
              Try Again
            </button>
          )}
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors duration-200"
            >
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading State with Network Status
export const LoadingWithNetworkStatus = ({ message = "Loading...", showNetworkInfo = true }) => {
  const { isOnline, networkSpeed } = useNetworkStatus();

  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      {/* Loading Animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-300 rounded-full animate-spin animate-reverse" style={{ animationDuration: '1.5s' }}></div>
      </div>

      {/* Loading Message */}
      <p className="text-white font-medium">{message}</p>

      {/* Network Status */}
      {showNetworkInfo && (
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-gray-400">
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>
          
          {isOnline && networkSpeed !== 'unknown' && (
            <p className="text-xs text-gray-500">
              Connection: {networkSpeed}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default {
  OfflineState,
  WrongNetworkState,
  WalletNotConnectedState,
  ContractErrorState,
  LoadingWithNetworkStatus,
  useNetworkStatus
};
