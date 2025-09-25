import React from 'react';
import PropTypes from 'prop-types';

/**
 * Comprehensive Error Boundary for Dashboard Components
 * Handles blockchain-specific errors, network issues, and general React errors
 */
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorType: DashboardErrorBoundary.categorizeError(error)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorType: DashboardErrorBoundary.categorizeError(error)
    });

    // Report to error tracking service if configured
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  static categorizeError(error) {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('metamask') || message.includes('wallet')) {
      return 'wallet';
    }
    if (message.includes('contract') || message.includes('transaction')) {
      return 'blockchain';
    }
    if (message.includes('user rejected')) {
      return 'user_rejected';
    }
    return 'unknown';
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      retryCount: prevState.retryCount + 1
    }));

    // Call parent retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  renderErrorUI() {
    const { errorType, error, retryCount } = this.state;
    const { maxRetries = 3, fallbackComponent } = this.props;

    // If custom fallback provided, use it
    if (fallbackComponent) {
      return React.cloneElement(fallbackComponent, {
        error,
        errorType,
        onRetry: this.handleRetry,
        retryCount
      });
    }

    const errorConfig = {
      network: {
        title: 'Connection Problem',
        message: 'Unable to connect to the blockchain network. Please check your internet connection.',
        icon: '🌐',
        color: 'orange',
        canRetry: true
      },
      wallet: {
        title: 'Wallet Issue',
        message: 'There was a problem connecting to your wallet. Please check MetaMask.',
        icon: '🦊',
        color: 'amber',
        canRetry: true
      },
      blockchain: {
        title: 'Blockchain Error',
        message: 'Transaction failed or contract interaction error. This might be temporary.',
        icon: '⛓️',
        color: 'red',
        canRetry: true
      },
      user_rejected: {
        title: 'Action Cancelled',
        message: 'The transaction was cancelled. You can try again when ready.',
        icon: '❌',
        color: 'gray',
        canRetry: false
      },
      unknown: {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Our team has been notified.',
        icon: '⚠️',
        color: 'red',
        canRetry: true
      }
    };

    const config = errorConfig[errorType] || errorConfig.unknown;
    const canRetry = config.canRetry && retryCount < maxRetries;

    return (
      <div className="bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 relative overflow-hidden">
        {/* Subtle error accent */}
        <div className={`absolute top-0 left-0 h-1 w-full bg-${config.color}-500/60`}></div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Error Icon */}
          <div className={`text-6xl opacity-60`}>
            {config.icon}
          </div>
          
          {/* Error Title */}
          <h3 className="text-xl font-bold text-white">
            {config.title}
          </h3>
          
          {/* Error Message */}
          <p className="text-gray-400 max-w-md">
            {config.message}
          </p>
          
          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-500 max-w-full">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                Technical Details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {error.toString()}
              </pre>
            </details>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className={`px-4 py-2 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Page</span>
            </button>
          </div>
          
          {/* Retry Counter */}
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Retry attempts: {retryCount}/{maxRetries}
            </p>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

DashboardErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackComponent: PropTypes.element,
  onError: PropTypes.func,
  onRetry: PropTypes.func,
  maxRetries: PropTypes.number
};

DashboardErrorBoundary.defaultProps = {
  maxRetries: 3
};

export default DashboardErrorBoundary;
