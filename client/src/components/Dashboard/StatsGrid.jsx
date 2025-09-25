import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatsGrid Component
 * Responsive grid layout for displaying dashboard statistics
 * Handles responsive breakpoints and consistent spacing
 */
const StatsGrid = ({ 
  children, 
  columns = 4,
  gap = 6,
  className = '',
  minColumns = 1,
  mdColumns = 2,
  lgColumns = 3,
  xlColumns = 4,
  ...props 
}) => {
  // Generate responsive grid classes based on props
  const getGridClasses = () => {
    const baseClasses = 'grid';
    const gapClass = `gap-${gap}`;
    
    // Build responsive column classes
    const columnClasses = [
      `grid-cols-${minColumns}`,
      mdColumns && `md:grid-cols-${mdColumns}`,
      lgColumns && `lg:grid-cols-${lgColumns}`,
      xlColumns && `xl:grid-cols-${xlColumns}`
    ].filter(Boolean).join(' ');
    
    return `${baseClasses} ${columnClasses} ${gapClass} ${className}`.trim();
  };

  return (
    <div 
      className={getGridClasses()}
      role="grid"
      aria-label="Dashboard statistics grid"
      {...props}
    >
      {children}
    </div>
  );
};

// PropTypes validation
StatsGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.number,
  gap: PropTypes.number,
  className: PropTypes.string,
  minColumns: PropTypes.number,
  mdColumns: PropTypes.number,
  lgColumns: PropTypes.number,
  xlColumns: PropTypes.number
};

// Default props
StatsGrid.defaultProps = {
  columns: 4,
  gap: 6,
  className: '',
  minColumns: 1,
  mdColumns: 2,
  lgColumns: 3,
  xlColumns: 4
};

export default StatsGrid;
