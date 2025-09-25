import React from 'react';
import PropTypes from 'prop-types';

/**
 * Analysis Navigation Component
 * Futuristic navigation with section switching and role-based access
 */
const AnalysisNavigation = ({ 
  activeSection, 
  onSectionChange, 
  userRoles = {} 
}) => {
  // Navigation sections with role-based permissions
  const navigationSections = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Key metrics and insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'indigo',
      requiredRoles: ['all'] // Everyone can access
    },
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Certificate analytics and trends',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'blue',
      requiredRoles: ['all']
    },
    {
      id: 'institutions',
      title: 'Institutions',
      description: 'Institution performance metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'teal',
      requiredRoles: ['isAdmin', 'isInstitution']
    },
    {
      id: 'network',
      title: 'Network',
      description: 'Blockchain health and performance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      color: 'purple',
      requiredRoles: ['all']
    },
    {
      id: 'activity',
      title: 'Activity',
      description: 'Real-time activity feed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'amber',
      requiredRoles: ['all']
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Custom reports and exports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'fuchsia',
      requiredRoles: ['isAdmin', 'isInstitution']
    }
  ];

  // Check if user has access to a section
  const hasAccess = (section) => {
    if (section.requiredRoles.includes('all')) return true;
    return section.requiredRoles.some(role => userRoles[role]);
  };

  // Filter accessible sections
  const accessibleSections = navigationSections.filter(hasAccess);

  // Color configurations for different themes
  const colorConfigs = {
    indigo: {
      bg: 'bg-indigo-900/40',
      bgHover: 'hover:bg-indigo-800/60',
      border: 'border-indigo-500/30',
      borderActive: 'border-indigo-400',
      text: 'text-indigo-300',
      textActive: 'text-indigo-100',
      icon: 'text-indigo-400',
      iconActive: 'text-indigo-200'
    },
    blue: {
      bg: 'bg-blue-900/40',
      bgHover: 'hover:bg-blue-800/60',
      border: 'border-blue-500/30',
      borderActive: 'border-blue-400',
      text: 'text-blue-300',
      textActive: 'text-blue-100',
      icon: 'text-blue-400',
      iconActive: 'text-blue-200'
    },
    teal: {
      bg: 'bg-teal-900/40',
      bgHover: 'hover:bg-teal-800/60',
      border: 'border-teal-500/30',
      borderActive: 'border-teal-400',
      text: 'text-teal-300',
      textActive: 'text-teal-100',
      icon: 'text-teal-400',
      iconActive: 'text-teal-200'
    },
    purple: {
      bg: 'bg-purple-900/40',
      bgHover: 'hover:bg-purple-800/60',
      border: 'border-purple-500/30',
      borderActive: 'border-purple-400',
      text: 'text-purple-300',
      textActive: 'text-purple-100',
      icon: 'text-purple-400',
      iconActive: 'text-purple-200'
    },
    amber: {
      bg: 'bg-amber-900/40',
      bgHover: 'hover:bg-amber-800/60',
      border: 'border-amber-500/30',
      borderActive: 'border-amber-400',
      text: 'text-amber-300',
      textActive: 'text-amber-100',
      icon: 'text-amber-400',
      iconActive: 'text-amber-200'
    },
    fuchsia: {
      bg: 'bg-fuchsia-900/40',
      bgHover: 'hover:bg-fuchsia-800/60',
      border: 'border-fuchsia-500/30',
      borderActive: 'border-fuchsia-400',
      text: 'text-fuchsia-300',
      textActive: 'text-fuchsia-100',
      icon: 'text-fuchsia-400',
      iconActive: 'text-fuchsia-200'
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50">
      {/* Futuristic accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
      
      <div className="px-6 py-4">
        <nav className="flex items-center space-x-1">
          {accessibleSections.map((section) => {
            const isActive = activeSection === section.id;
            const colors = colorConfigs[section.color];
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`
                  group relative flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? `${colors.bg} ${colors.borderActive} ${colors.textActive}` 
                    : `${colors.bg} ${colors.border} ${colors.text} ${colors.bgHover}`
                  }
                  border hover:scale-105 transform
                  ${isActive ? 'shadow-lg shadow-indigo-500/20' : 'shadow-md'}
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                )}
                
                {/* Icon */}
                <div className={`
                  ${isActive ? colors.iconActive : colors.icon}
                  transition-colors duration-300
                `}>
                  {section.icon}
                </div>
                
                {/* Text content */}
                <div className="text-left">
                  <div className={`
                    font-medium text-sm
                    ${isActive ? colors.textActive : colors.text}
                    transition-colors duration-300
                  `}>
                    {section.title}
                  </div>
                  <div className={`
                    text-xs opacity-75
                    ${isActive ? colors.textActive : colors.text}
                    transition-all duration-300
                  `}>
                    {section.description}
                  </div>
                </div>

                {/* Hover effect */}
                <div className={`
                  absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  ${isActive ? 'bg-indigo-500/10' : 'bg-white/5'}
                `}></div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// PropTypes validation
AnalysisNavigation.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  })
};

// Default props
AnalysisNavigation.defaultProps = {
  userRoles: {}
};

export default AnalysisNavigation;
