import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StatCardSkeleton } from '../Loading/LoadingSkeletons';

/**
 * Enhanced Statistics Card Component with Loading Support
 * Reusable stat card with multiple color themes, tooltips, and progress indicators
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'violet', 
  progress = 100, 
  tooltip, 
  bgImage, 
  isLoading = false,
  onClick,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Show skeleton during loading
  if (isLoading) {
    return <StatCardSkeleton showProgress={!!progress} />;
  }

  // Color theme configuration
  const colors = {
    violet: {
      icon: "bg-violet-900/60 text-violet-400",
      progress: "from-violet-600 to-purple-500",
      hover: "hover:border-violet-500/50 hover:shadow-violet-500/10",
      tooltip: "bg-violet-900 border-violet-400",
      tooltipArrow: "border-t-violet-900"
    },
    blue: {
      icon: "bg-blue-900/60 text-blue-400",
      progress: "from-blue-600 to-indigo-500",
      hover: "hover:border-blue-500/50 hover:shadow-blue-500/10",
      tooltip: "bg-blue-900 border-blue-400",
      tooltipArrow: "border-t-blue-900"
    },
    teal: {
      icon: "bg-teal-900/60 text-teal-400",
      progress: "from-teal-600 to-emerald-500",
      hover: "hover:border-teal-500/50 hover:shadow-teal-500/10",
      tooltip: "bg-teal-900 border-teal-400",
      tooltipArrow: "border-t-teal-900"
    },
    fuchsia: {
      icon: "bg-fuchsia-900/60 text-fuchsia-400",
      progress: "from-fuchsia-600 to-pink-500",
      hover: "hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/10",
      tooltip: "bg-fuchsia-900 border-fuchsia-400",
      tooltipArrow: "border-t-fuchsia-900"
    },
    red: {
      icon: "bg-red-900/60 text-red-400",
      progress: "from-red-600 to-rose-500",
      hover: "hover:border-red-500/50 hover:shadow-red-500/10",
      tooltip: "bg-red-900 border-red-400",
      tooltipArrow: "border-t-red-900"
    },
    orange: {
      icon: "bg-orange-900/60 text-orange-400",
      progress: "from-orange-600 to-amber-500",
      hover: "hover:border-orange-500/50 hover:shadow-orange-500/10",
      tooltip: "bg-orange-900 border-orange-400",
      tooltipArrow: "border-t-orange-900"
    }
  };

  const currentColors = colors[color] || colors.violet;

  // Handle click events if onClick is provided
  const handleClick = () => {
    if (onClick) {
      onClick({ title, value, color });
    }
  };

  return (
    <div 
      className={`bg-gray-900/80 backdrop-blur-md rounded-lg shadow-xl p-6 border border-gray-800 ${currentColors.hover} transition-all duration-300 relative group overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Optional background image */}
      {bgImage && (
        <div className="absolute inset-0 opacity-5 z-0">
          <img src={bgImage} alt="" className="object-cover w-full h-full" />
        </div>
      )}
      
      {/* Digital corner accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gray-700 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gray-700 rounded-bl-lg"></div>
      
      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 ${currentColors.tooltip} text-white text-xs rounded border opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 shadow-lg z-30`}>
          {tooltip}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent ${currentColors.tooltipArrow}`}></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`${currentColors.icon} p-3 rounded-lg shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm font-medium tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight flex items-center justify-end">
            <span className="mr-1 text-xs font-mono text-gray-500">#</span>
            {value}
          </h3>
        </div>
      </div>
      
      {/* Digital lines */}
      <div className="absolute h-px w-full bg-gray-800/60 left-0 top-[4.5rem]"></div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-800/80 h-1.5 rounded-full overflow-hidden relative mt-6">
        <div className="absolute inset-0 bg-gray-800 opacity-30 blur-sm"></div>
        <div 
          className={`bg-gradient-to-r ${currentColors.progress} h-full rounded-full relative z-10`} 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      
      {/* Data metrics visualization */}
      <div className="flex justify-between mt-3">
        <div className="flex space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-3 ${i < Math.floor(Math.min(100, Math.max(0, progress)) / 20) ? `bg-${color}-500/40` : 'bg-gray-700/40'} rounded-sm`}
            ></div>
          ))}
        </div>
        <span className="text-xs text-gray-500 font-mono">{Math.min(100, Math.max(0, progress))}%</span>
      </div>
    </div>
  );
};

// PropTypes validation
StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]).isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['violet', 'blue', 'teal', 'fuchsia']),
  progress: PropTypes.number,
  tooltip: PropTypes.string,
  bgImage: PropTypes.string,
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

// Default props
StatCard.defaultProps = {
  color: 'violet',
  progress: 100,
  isLoading: false,
  className: ''
};

export default StatCard;
