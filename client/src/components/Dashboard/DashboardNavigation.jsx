import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * DashboardNavigation Component
 * Header component for dashboard sections with title and system info
 * Supports customizable styling and responsive design
 */
const DashboardNavigation = memo(({
  title = "Quick Actions",
  subtitle,
  systemInfo = "sys.actions.verified",
  icon,
  className = '',
  children,
  showSystemInfo = true,
  ...props
}) => {
  // Default icon if none provided
  const defaultIcon = (
    <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  return (
    <div 
      className={`flex items-center justify-between mb-6 ${className}`}
      {...props}
    >
      {/* Title Section */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center">
          {icon || defaultIcon}
          {title}
          {subtitle && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              {subtitle}
            </span>
          )}
        </h2>
      </div>
      
      {/* System Info Section */}
      {showSystemInfo && (
        <div className="text-xs text-gray-400 bg-gray-800/60 py-1 px-2 rounded font-mono border border-gray-700/50">
          <span className="text-indigo-400">sys.</span>
          <span className="text-gray-300">actions.</span>
          <span className="text-emerald-400">verified</span>
        </div>
      )}
      
      {/* Additional content */}
      {children}
    </div>
  );
});

// PropTypes validation
DashboardNavigation.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  systemInfo: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  showSystemInfo: PropTypes.bool
};

// Default props
DashboardNavigation.defaultProps = {
  title: "Quick Actions",
  systemInfo: "sys.actions.verified",
  className: '',
  showSystemInfo: true
};

// Display name for debugging
DashboardNavigation.displayName = 'DashboardNavigation';

export default DashboardNavigation;
