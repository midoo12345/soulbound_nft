import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import ActionCard from './ActionCard';
import DashboardNavigation from './DashboardNavigation';
import DashboardErrorBoundary from '../ErrorBoundary/DashboardErrorBoundary';
import { QuickActionSkeleton } from '../Loading/LoadingSkeletons';
import { filterActionsByRole, DASHBOARD_ACTIONS } from './actions.config.jsx';

/**
 * QuickActions Component
 * Main container for dashboard action cards with role-based filtering
 * Handles responsive layout and error boundaries
 */
const QuickActions = memo(({
  userRoles = {},
  actions = DASHBOARD_ACTIONS,
  title = "Quick Actions",
  subtitle,
  className = '',
  gridCols = {
    default: 1,
    md: 2,
    lg: 4,
    xl: 4
  },
  onActionClick,
  isLoading = false,
  ...props
}) => {
  // Memoized filtered actions based on user roles
  const availableActions = useMemo(() => {
    return filterActionsByRole(userRoles, actions);
  }, [userRoles, actions]);

  // Handle action card clicks
  const handleActionClick = (action, event) => {
    if (onActionClick) {
      onActionClick(action, event);
    }
  };

  // Generate responsive grid classes
  const getGridClasses = () => {
    return `
      grid grid-cols-${gridCols.default} 
      md:grid-cols-${gridCols.md} 
      lg:grid-cols-${gridCols.lg} 
      xl:grid-cols-${gridCols.xl} 
      gap-4
    `.trim();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-indigo-500/20 p-6 ${className}`}>
        <DashboardNavigation title={title} subtitle={subtitle} />
        <div className={getGridClasses()}>
          {[...Array(4)].map((_, i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // No actions available
  if (availableActions.length === 0) {
    return (
      <div className={`bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-indigo-500/20 p-6 ${className}`}>
        <DashboardNavigation title={title} subtitle={subtitle} />
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Actions Available</h3>
          <p className="text-gray-500 text-sm">
            You don't have permission to access any quick actions. Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary 
      fallbackComponent={
        <div className="bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-indigo-500/20 p-6">
          <div className={getGridClasses()}>
            {[...Array(4)].map((_, i) => <QuickActionSkeleton key={i} />)}
          </div>
        </div>
      }
    >
      <div 
        className={`bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-indigo-500/20 overflow-hidden relative group ${className}`}
        {...props}
      >
        {/* Accent borders and glowing elements */}
        <div className="absolute top-0 left-10 h-1 w-20 bg-indigo-500/60"></div>
        <div className="absolute bottom-0 right-10 h-1 w-20 bg-indigo-500/60"></div>
        <div className="absolute top-0 right-[20%] w-0.5 h-12 bg-indigo-500/10"></div>
        <div className="absolute bottom-0 left-[35%] w-0.5 h-8 bg-indigo-500/10"></div>
        
        <div className="p-6">
          {/* Navigation Header */}
          <DashboardNavigation 
            title={title} 
            subtitle={subtitle}
            icon={
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
          
          {/* Actions Grid */}
          <div className={getGridClasses()}>
            {availableActions.map((action) => (
              <DashboardErrorBoundary 
                key={action.id}
                fallbackComponent={<QuickActionSkeleton />}
              >
                <ActionCard
                  to={action.to}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={action.color}
                  onClick={onActionClick ? (event) => handleActionClick(action, event) : undefined}
                  isVisible={true}
                />
              </DashboardErrorBoundary>
            ))}
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
});

// PropTypes validation
QuickActions.propTypes = {
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  }),
  actions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    to: PropTypes.string,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string,
    requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    priority: PropTypes.number
  })),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  gridCols: PropTypes.shape({
    default: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number
  }),
  onActionClick: PropTypes.func,
  isLoading: PropTypes.bool
};

// Default props
QuickActions.defaultProps = {
  userRoles: {},
  actions: DASHBOARD_ACTIONS,
  title: "Quick Actions",
  className: '',
  gridCols: {
    default: 1,
    md: 2,
    lg: 4,
    xl: 4
  },
  isLoading: false
};

// Display name for debugging
QuickActions.displayName = 'QuickActions';

export default QuickActions;
