import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import NetworkStatus from './NetworkStatus';
import UserRoleDisplay from './UserRoleDisplay';
import LastUpdated from './LastUpdated';
import ConnectionHealth from './ConnectionHealth';

/**
 * StatusInfoPanel Component - Container for all status and info components
 * Responsive layout that adapts to different screen sizes and use cases
 */
const StatusInfoPanel = ({
  // Data props
  userRoles = {},
  lastUpdated,
  isLoading = false,
  contract,
  provider,
  
  // Configuration props
  className = '',
  layout = 'horizontal', // 'horizontal', 'vertical', 'grid', 'compact'
  showComponents = {
    networkStatus: true,
    userRole: true,
    lastUpdated: true,
    connectionHealth: false
  },
  
  // Feature flags
  showNetworkSpeed = false,
  showLatency = false,
  showPermissions = true,
  showHealthDetails = false,
  autoRefresh = true,
  
  // Callbacks
  onRefreshNeeded,
  onComponentClick
}) => {

  // Memoized component configurations to prevent unnecessary re-renders
  const componentConfig = useMemo(() => ({
    networkStatus: {
      component: NetworkStatus,
      props: {
        showSpeed: showNetworkSpeed,
        showLatency: showLatency,
        compact: layout === 'compact'
      }
    },
    userRole: {
      component: UserRoleDisplay,
      props: {
        userRoles,
        showPermissions,
        compact: layout === 'compact'
      }
    },
    lastUpdated: {
      component: LastUpdated,
      props: {
        timestamp: lastUpdated,
        isLoading,
        autoRefresh,
        compact: layout === 'compact',
        onRefreshNeeded
      }
    },
    connectionHealth: {
      component: ConnectionHealth,
      props: {
        contract,
        provider,
        showDetails: showHealthDetails,
        autoCheck: autoRefresh,
        compact: layout === 'compact'
      }
    }
  }), [
    userRoles, lastUpdated, isLoading, contract, provider,
    showNetworkSpeed, showLatency, showPermissions, showHealthDetails,
    autoRefresh, layout, onRefreshNeeded
  ]);

  // Layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-4';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
      case 'compact':
        return 'flex flex-wrap items-center gap-2';
      case 'horizontal':
      default:
        return 'flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0';
    }
  };

  // Render individual component
  const renderComponent = (key, config) => {
    if (!showComponents[key]) return null;

    const Component = config.component;
    const componentProps = {
      ...config.props,
      onClick: onComponentClick ? () => onComponentClick(key) : undefined
    };

    return <Component key={key} {...componentProps} />;
  };

  // Get enabled components count for responsive adjustments
  const enabledComponents = Object.keys(showComponents).filter(
    key => showComponents[key]
  );

  // Responsive container classes
  const containerClasses = useMemo(() => {
    const baseClasses = 'status-info-panel';
    const layoutClasses = getLayoutClasses();
    const responsiveClasses = layout === 'horizontal' && enabledComponents.length > 2 
      ? 'flex-wrap' 
      : '';
    
    return `${baseClasses} ${layoutClasses} ${responsiveClasses} ${className}`.trim();
  }, [layout, enabledComponents.length, className]);

  // Handle no components enabled
  if (enabledComponents.length === 0) {
    return (
      <div className={`text-center text-gray-500 text-sm ${className}`}>
        No status components enabled
      </div>
    );
  }

  return (
    <div className={containerClasses} role="status" aria-label="System Status Information">
      {/* Render components in order */}
      {Object.entries(componentConfig).map(([key, config]) => 
        renderComponent(key, config)
      )}
      
      {/* Mobile-specific adjustments */}
      {layout === 'horizontal' && enabledComponents.length > 3 && (
        <div className="lg:hidden w-full">
          <div className="text-xs text-gray-400 text-center mt-2">
            Swipe to see more status info →
          </div>
        </div>
      )}
    </div>
  );
};

// Preset configurations for common use cases
StatusInfoPanel.presets = {
  // Full dashboard header
  dashboard: {
    layout: 'horizontal',
    showComponents: {
      networkStatus: true,
      userRole: true,
      lastUpdated: true,
      connectionHealth: false
    },
    showPermissions: true,
    showNetworkSpeed: false,
    showLatency: false
  },
  
  // Admin panel with full diagnostics
  admin: {
    layout: 'grid',
    showComponents: {
      networkStatus: true,
      userRole: true,
      lastUpdated: true,
      connectionHealth: true
    },
    showPermissions: true,
    showNetworkSpeed: true,
    showLatency: true,
    showHealthDetails: true
  },
  
  // Mobile compact view
  mobile: {
    layout: 'compact',
    showComponents: {
      networkStatus: true,
      userRole: true,
      lastUpdated: true,
      connectionHealth: false
    },
    showPermissions: false,
    showNetworkSpeed: false,
    showLatency: false
  },
  
  // Minimal status bar
  minimal: {
    layout: 'horizontal',
    showComponents: {
      networkStatus: true,
      userRole: false,
      lastUpdated: true,
      connectionHealth: false
    },
    showPermissions: false,
    showNetworkSpeed: false,
    showLatency: false
  }
};

// Helper function to apply presets
StatusInfoPanel.withPreset = (presetName, overrides = {}) => {
  const preset = StatusInfoPanel.presets[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return overrides;
  }
  
  return {
    ...preset,
    ...overrides,
    showComponents: {
      ...preset.showComponents,
      ...(overrides.showComponents || {})
    }
  };
};

StatusInfoPanel.propTypes = {
  // Data props
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  }),
  lastUpdated: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date)
  ]),
  isLoading: PropTypes.bool,
  contract: PropTypes.object,
  provider: PropTypes.object,
  
  // Configuration props
  className: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'grid', 'compact']),
  showComponents: PropTypes.shape({
    networkStatus: PropTypes.bool,
    userRole: PropTypes.bool,
    lastUpdated: PropTypes.bool,
    connectionHealth: PropTypes.bool
  }),
  
  // Feature flags
  showNetworkSpeed: PropTypes.bool,
  showLatency: PropTypes.bool,
  showPermissions: PropTypes.bool,
  showHealthDetails: PropTypes.bool,
  autoRefresh: PropTypes.bool,
  
  // Callbacks
  onRefreshNeeded: PropTypes.func,
  onComponentClick: PropTypes.func
};

export default StatusInfoPanel;
