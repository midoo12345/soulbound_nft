import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading spinner component with customizable size, text, and variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner: 'small', 'medium', 'large', or 'xl'
 * @param {string} props.variant - Spinner variant: 'default', 'quantum', 'cube', 'dots'
 * @param {string} props.text - Optional loading text to display
 * @param {string} props.color - Optional color for the spinner
 * @param {string} props.className - Optional additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'default',
  text, 
  color = 'text-blue-500', 
  className = '' 
}) => {
  // Determine spinner size based on the prop
  let spinnerSize, containerSize;
  switch (size) {
    case 'small':
      spinnerSize = 'w-4 h-4 border-2';
      containerSize = 'w-8 h-8';
      break;
    case 'large':
      spinnerSize = 'w-12 h-12 border-4';
      containerSize = 'w-16 h-16';
      break;
    case 'xl':
      spinnerSize = 'w-16 h-16 border-4';
      containerSize = 'w-24 h-24';
      break;
    case 'medium':
    default:
      spinnerSize = 'w-8 h-8 border-3';
      containerSize = 'w-12 h-12';
      break;
  }

  // Quantum spinner variant for futuristic analytics
  const QuantumSpinner = () => (
    <div className={`relative ${containerSize}`}>
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full"
      />
      
      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 border-2 border-purple-500/30 border-t-purple-400 rounded-full"
      />
      
      {/* Inner ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 border-2 border-blue-500/30 border-t-blue-400 rounded-full"
      />
      
      {/* Center pulse */}
      <motion.div
        animate={{ 
          scale: [0.5, 1, 0.5],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
      />
      
      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [0, 1, 0],
            rotate: 360,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: '50%',
            top: '20%',
            transformOrigin: '0 200%'
          }}
        />
      ))}
    </div>
  );

  // Cube spinner variant
  const CubeSpinner = () => (
    <div className={`relative ${containerSize}`}>
      <motion.div
        animate={{ 
          rotateX: 360,
          rotateY: 360 
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 rounded border border-cyan-400/50" />
      </motion.div>
    </div>
  );

  // Dots spinner variant
  const DotsSpinner = () => (
    <div className="flex space-x-2">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="w-3 h-3 bg-cyan-400 rounded-full"
        />
      ))}
    </div>
  );

  // Default spinner
  const DefaultSpinner = () => (
    <div 
      className={`${spinnerSize} ${color} border-t-transparent border-solid rounded-full animate-spin`}
      role="status" 
      aria-label="Loading"
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'quantum':
        return <QuantumSpinner />;
      case 'cube':
        return <CubeSpinner />;
      case 'dots':
        return <DotsSpinner />;
      default:
        return <DefaultSpinner />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && (
        <span className="ml-3 text-gray-300">{text}</span>
      )}
    </div>
  );
};

// Named exports for specific components
export { LoadingSpinner };

export default LoadingSpinner;
