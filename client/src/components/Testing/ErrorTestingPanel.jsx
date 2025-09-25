import React, { useState } from 'react';
import { 
  OfflineState, 
  WrongNetworkState, 
  WalletNotConnectedState,
  ContractErrorState 
} from '../Fallback/FallbackStates';
import DashboardErrorBoundary from '../ErrorBoundary/DashboardErrorBoundary';
import { StatCardSkeleton, AnalyticsCardSkeleton } from '../Loading/LoadingSkeletons';

/**
 * Error Testing Panel for Development
 * Helps test different error scenarios without actually causing real errors
 * Only shows in development mode
 */

const ErrorTestingPanel = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const errorTests = [
    {
      id: 'offline',
      name: 'Offline State',
      description: 'Test offline network state',
      component: <OfflineState onRetry={() => console.log('Offline retry')} />
    },
    {
      id: 'wrong-network',
      name: 'Wrong Network',
      description: 'Test wrong network state',
      component: <WrongNetworkState 
        expectedNetwork="Polygon" 
        currentNetwork="Ethereum Mainnet"
        onSwitchNetwork={() => console.log('Switch network')}
      />
    },
    {
      id: 'wallet-disconnected',
      name: 'Wallet Not Connected',
      description: 'Test wallet connection state',
      component: <WalletNotConnectedState onConnect={() => console.log('Connect wallet')} />
    },
    {
      id: 'contract-error',
      name: 'Contract Error',
      description: 'Test contract interaction error',
      component: <ContractErrorState 
        error={new Error('Transaction failed: insufficient funds')}
        onRetry={() => console.log('Contract retry')}
        onRefresh={() => console.log('Contract refresh')}
      />
    },
    {
      id: 'loading-skeleton',
      name: 'Loading Skeletons',
      description: 'Test loading skeleton states',
      component: (
        <div className="space-y-6">
          <StatCardSkeleton />
          <AnalyticsCardSkeleton title="Test Analytics" rows={3} />
        </div>
      )
    },
    {
      id: 'error-boundary',
      name: 'Error Boundary',
      description: 'Test React error boundary',
      component: (
        <DashboardErrorBoundary>
          <ThrowErrorComponent />
        </DashboardErrorBoundary>
      )
    }
  ];

  // Component that throws an error for testing
  const ThrowErrorComponent = () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    
    if (shouldThrow) {
      throw new Error('Test error for error boundary');
    }
    
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white mb-2">Error Boundary Test</h3>
        <button 
          onClick={() => setShouldThrow(true)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Throw Error
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="Error Testing Panel"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Testing Panel */}
      {isVisible && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Error Testing Panel</h2>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setActiveTest(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* Test List */}
              <div className="w-1/3 border-r border-gray-700 p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Test Scenarios</h3>
                <div className="space-y-2">
                  {errorTests.map((test) => (
                    <button
                      key={test.id}
                      onClick={() => setActiveTest(test)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                        activeTest?.id === test.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm opacity-75 mt-1">{test.description}</div>
                    </button>
                  ))}
                </div>

                {/* Instructions */}
                <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-medium mb-2">Instructions</h4>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Select a test scenario from the list</li>
                    <li>• View the error state in the preview</li>
                    <li>• Check console for error logs</li>
                    <li>• Test retry/refresh functionality</li>
                  </ul>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {activeTest ? (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Preview: {activeTest.name}
                    </h3>
                    <div className="bg-gray-950 p-4 rounded-lg min-h-[400px]">
                      {activeTest.component}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Select a test scenario to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorTestingPanel;
