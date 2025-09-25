import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * UserRoleDisplay Component - Enhanced user role indicator with permissions
 * Shows role badge with hover tooltip displaying permissions and capabilities
 */
const UserRoleDisplay = ({ 
  userRoles = {},
  className = '',
  showPermissions = true,
  compact = false
}) => {
  const { isAdmin = false, isInstitution = false } = userRoles;
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  // Determine role information
  const getRoleInfo = () => {
    if (isAdmin) {
      return {
        label: 'Administrator',
        color: 'blue',
        icon: '👑',
        permissions: [
          'Manage institutions and users',
          'View all platform analytics',
          'Configure system settings',
          'Handle burn approvals',
          'Override verification status'
        ],
        bgClass: 'bg-blue-500/20 border-blue-400/50',
        textClass: 'text-blue-300',
        dotClass: 'bg-blue-400'
      };
    } else if (isInstitution) {
      return {
        label: 'Institution',
        color: 'teal',
        icon: '🏛️',
        permissions: [
          'Issue certificates to students',
          'Verify certificate authenticity',
          'Manage course information',
          'Request certificate burns',
          'View institution analytics'
        ],
        bgClass: 'bg-teal-500/20 border-teal-400/50',
        textClass: 'text-teal-300',
        dotClass: 'bg-teal-400'
      };
    } else {
      return {
        label: 'User',
        color: 'gray',
        icon: '👤',
        permissions: [
          'View owned certificates',
          'Verify certificate authenticity',
          'Request certificate information',
          'Access public certificate data'
        ],
        bgClass: 'bg-gray-500/20 border-gray-400/50',
        textClass: 'text-gray-300',
        dotClass: 'bg-gray-400'
      };
    }
  };

  const roleInfo = getRoleInfo();

  // Handle tooltip positioning
  useEffect(() => {
    if (!showTooltip || !tooltipRef.current || !containerRef.current) return;

    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    // Check if tooltip would go off-screen and adjust position
    if (containerRect.left + tooltipRect.width > window.innerWidth) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '0';
    } else {
      tooltip.style.left = '0';
      tooltip.style.right = 'auto';
    }
  }, [showTooltip]);

  // Compact version for mobile/small spaces
  if (compact) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${roleInfo.dotClass}`} />
        <span className={`text-xs font-medium ${roleInfo.textClass}`}>
          {roleInfo.label}
        </span>
      </div>
    );
  }

  // Full version with tooltip
  return (
    <div 
      ref={containerRef}
      className={`bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10 shadow-inner flex flex-col relative ${className}`}
      onMouseEnter={() => showPermissions && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-xs text-violet-300/70">Access Level</span>
      <div className="flex items-center mt-1">
        <span className="mr-2 text-sm">{roleInfo.icon}</span>
        <span className={`font-medium ${roleInfo.textClass}`}>
          {roleInfo.label}
        </span>
        
        {/* Role indicator badge */}
        <div 
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border ${roleInfo.bgClass}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${roleInfo.dotClass} inline-block mr-1`} />
          Active
        </div>
      </div>

      {/* Permissions Tooltip */}
      {showPermissions && showTooltip && (
        <div 
          ref={tooltipRef}
          className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-50 p-4"
          style={{ pointerEvents: 'none' }}
        >
          {/* Tooltip arrow */}
          <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-900 border-l border-t border-gray-600 transform rotate-45" />
          
          <div className="relative">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">{roleInfo.icon}</span>
              <h4 className={`font-semibold ${roleInfo.textClass}`}>
                {roleInfo.label} Permissions
              </h4>
            </div>
            
            <ul className="space-y-2">
              {roleInfo.permissions.map((permission, index) => (
                <li key={index} className="flex items-start text-sm text-gray-300">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  {permission}
                </li>
              ))}
            </ul>
            
            {/* Role-specific additional info */}
            {isAdmin && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  🔒 Highest privilege level - Handle with care
                </p>
              </div>
            )}
            
            {isInstitution && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  🎓 Educational institution verified account
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

UserRoleDisplay.propTypes = {
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  }),
  className: PropTypes.string,
  showPermissions: PropTypes.bool,
  compact: PropTypes.bool
};

export default UserRoleDisplay;
