import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ActionCard Component
 * Reusable action card with hover effects and animations
 * Supports role-based visibility and customizable styling
 */
const ActionCard = memo(({
  to,
  title,
  description,
  icon,
  color = 'indigo',
  onClick,
  isVisible = true,
  className = '',
  disabled = false,
  ...props
}) => {
  // Color configuration for different themes
  const colorConfig = {
    indigo: {
      bg: 'bg-indigo-900/40',
      bgHover: 'group-hover:bg-indigo-800/60',
      border: 'border-indigo-500/30',
      gradient: 'from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/10 group-hover:to-indigo-600/0',
      glow: 'bg-indigo-500/10',
      shadow: 'shadow-indigo-950/30',
      borderHover: 'hover:border-indigo-500/70',
      shadowHover: 'hover:shadow-indigo-500/10',
      text: 'text-indigo-400',
      textSecondary: 'text-indigo-400/80'
    },
    teal: {
      bg: 'bg-teal-900/40',
      bgHover: 'group-hover:bg-teal-800/60',
      border: 'border-teal-500/30',
      gradient: 'from-teal-600/0 to-teal-600/0 group-hover:from-teal-600/10 group-hover:to-teal-600/0',
      glow: 'bg-teal-500/10',
      shadow: 'shadow-teal-950/30',
      borderHover: 'hover:border-teal-500/70',
      shadowHover: 'hover:shadow-teal-500/10',
      text: 'text-teal-400',
      textSecondary: 'text-teal-400/80'
    },
    blue: {
      bg: 'bg-blue-900/40',
      bgHover: 'group-hover:bg-blue-800/60',
      border: 'border-blue-500/30',
      gradient: 'from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/0',
      glow: 'bg-blue-500/10',
      shadow: 'shadow-blue-950/30',
      borderHover: 'hover:border-blue-500/70',
      shadowHover: 'hover:shadow-blue-500/10',
      text: 'text-blue-400',
      textSecondary: 'text-blue-400/80'
    },
    fuchsia: {
      bg: 'bg-fuchsia-900/40',
      bgHover: 'group-hover:bg-fuchsia-800/60',
      border: 'border-fuchsia-500/30',
      gradient: 'from-fuchsia-600/0 to-fuchsia-600/0 group-hover:from-fuchsia-600/10 group-hover:to-fuchsia-600/0',
      glow: 'bg-fuchsia-500/10',
      shadow: 'shadow-fuchsia-950/30',
      borderHover: 'hover:border-fuchsia-500/70',
      shadowHover: 'hover:shadow-fuchsia-500/10',
      text: 'text-fuchsia-400',
      textSecondary: 'text-fuchsia-400/80'
    },
    amber: {
      bg: 'bg-amber-900/40',
      bgHover: 'group-hover:bg-amber-800/60',
      border: 'border-amber-500/30',
      gradient: 'from-amber-600/0 to-amber-600/0 group-hover:from-amber-600/10 group-hover:to-amber-600/0',
      glow: 'bg-amber-500/10',
      shadow: 'shadow-amber-950/30',
      borderHover: 'hover:border-amber-500/70',
      shadowHover: 'hover:shadow-amber-500/10',
      text: 'text-amber-400',
      textSecondary: 'text-amber-400/80'
    }
  };

  const colors = colorConfig[color] || colorConfig.indigo;

  // Don't render if not visible
  if (!isVisible) return null;

  // Base classes for the card
  const cardClasses = `
    group flex flex-col items-center p-5 
    bg-gray-900/90 hover:bg-gray-800/90 
    rounded-lg transition-all duration-300 
    border border-gray-800 ${colors.borderHover} 
    hover:shadow-lg ${colors.shadowHover}
    relative overflow-hidden
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  // Handle click events
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
      // Don't prevent default for Link components - let React Router handle navigation
    }
  };

  // Card content component
  const CardContent = () => (
    <>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} transition-all duration-500`}></div>
      
      {/* Floating glow effect */}
      <div className={`absolute -top-6 -right-6 w-12 h-12 ${colors.glow} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Icon container */}
      <div className={`${colors.bg} p-3 rounded-lg mb-3 ${colors.bgHover} transition-colors duration-300 shadow-lg ${colors.shadow} z-10 relative`}>
        <div className={`absolute inset-0 border ${colors.border} rounded-lg`}></div>
        <div className={`w-6 h-6 ${colors.text}`}>
          {icon}
        </div>
      </div>
      
      {/* Text content */}
      <span className="text-gray-300 group-hover:text-white font-medium z-10">{title}</span>
      <span className={`text-xs ${colors.textSecondary} mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
        {description}
      </span>
    </>
  );

  // Return Link or div based on whether 'to' prop is provided
  if (to && !disabled) {
    return (
      <Link
        to={to}
        className={cardClasses}
        onClick={handleClick}
        {...props}
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      } : undefined}
      {...props}
    >
      <CardContent />
    </div>
  );
});

// PropTypes validation
ActionCard.propTypes = {
  to: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['indigo', 'teal', 'blue', 'fuchsia', 'amber']),
  onClick: PropTypes.func,
  isVisible: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

// Default props
ActionCard.defaultProps = {
  color: 'indigo',
  isVisible: true,
  className: '',
  disabled: false
};

// Display name for debugging
ActionCard.displayName = 'ActionCard';

export default ActionCard;
