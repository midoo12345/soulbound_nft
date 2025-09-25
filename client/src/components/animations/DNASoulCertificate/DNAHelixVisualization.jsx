import React, { useEffect, useRef, useState } from 'react';
import { useDNASoul, SOUL_STATUS } from './index';

const DNAHelixVisualization = ({ certificate, isActive = false }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { getSoulStatus } = useDNASoul();
  const helixRotationRef = useRef(0);

  const soulStatus = getSoulStatus(certificate);

  // Color mapping for soul status
  const getSoulColors = (status) => {
    switch (status) {
      case SOUL_STATUS.VERIFIED:
        return {
          primary: '#FCD34D',    // Golden
          secondary: '#F59E0B',   // Amber
          glow: '#FEF3C7'        // Light golden
        };
      case SOUL_STATUS.PENDING:
        return {
          primary: '#60A5FA',    // Blue
          secondary: '#3B82F6',  // Blue-600
          glow: '#DBEAFE'        // Light blue
        };
      case SOUL_STATUS.REVOKED:
        return {
          primary: '#F87171',    // Red
          secondary: '#EF4444',  // Red-500
          glow: '#FEE2E2'       // Light red
        };
      default:
        return {
          primary: '#A78BFA',    // Purple
          secondary: '#8B5CF6',  // Purple-600
          glow: '#EDE9FE'       // Light purple
        };
    }
  };

  const colors = getSoulColors(soulStatus);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let isAnimating = true;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    // DNA helix parameters
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);
    const radius = Math.min(centerX, centerY) * 0.3;
    const height = Math.min(centerX, centerY) * 0.8;
    const segments = 20;

    const animate = () => {
      if (!isAnimating) return;
      
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Update rotation
      helixRotationRef.current += 0.02;

      // Draw DNA helix
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const y = centerY + (t - 0.5) * height;
        const angle = helixRotationRef.current + t * Math.PI * 4;

        // Left strand
        const leftX = centerX + Math.cos(angle) * radius;
        const leftY = y;
        
        // Right strand
        const rightX = centerX + Math.cos(angle + Math.PI) * radius;
        const rightY = y;

        // Draw connecting bonds
        if (i > 0) {
          const prevT = (i - 1) / segments;
          const prevY = centerY + (prevT - 0.5) * height;
          const prevAngle = helixRotationRef.current + prevT * Math.PI * 4;
          
          const prevLeftX = centerX + Math.cos(prevAngle) * radius;
          const prevRightX = centerX + Math.cos(prevAngle + Math.PI) * radius;

          // Bond from left to right
          ctx.strokeStyle = colors.secondary;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.moveTo(prevLeftX, prevY);
          ctx.lineTo(rightX, rightY);
          ctx.stroke();

          // Bond from right to left
          ctx.beginPath();
          ctx.moveTo(prevRightX, prevY);
          ctx.lineTo(leftX, leftY);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Draw nodes
        const nodeSize = 4 + Math.sin(helixRotationRef.current * 2 + i) * 2;
        
        // Left node
        const leftGradient = ctx.createRadialGradient(leftX, leftY, 0, leftX, leftY, nodeSize);
        leftGradient.addColorStop(0, colors.primary);
        leftGradient.addColorStop(1, colors.secondary);
        
        ctx.fillStyle = leftGradient;
        ctx.beginPath();
        ctx.arc(leftX, leftY, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Right node
        const rightGradient = ctx.createRadialGradient(rightX, rightY, 0, rightX, rightY, nodeSize);
        rightGradient.addColorStop(0, colors.primary);
        rightGradient.addColorStop(1, colors.secondary);
        
        ctx.fillStyle = rightGradient;
        ctx.beginPath();
        ctx.arc(rightX, rightY, nodeSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add glow effect if active
      if (isActive) {
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.3;
        
        // Redraw helix with glow
        for (let i = 0; i < segments; i++) {
          const t = i / segments;
          const y = centerY + (t - 0.5) * height;
          const angle = helixRotationRef.current + t * Math.PI * 4;

          const leftX = centerX + Math.cos(angle) * radius;
          const rightX = centerX + Math.cos(angle + Math.PI) * radius;

          ctx.fillStyle = colors.primary;
          ctx.beginPath();
          ctx.arc(leftX, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(rightX, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isAnimating = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [helixRotationRef.current, colors, isActive]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          filter: isActive ? 'brightness(1.2)' : 'brightness(1)'
        }}
      />
      
      {/* Soul status indicator */}
      <div className="absolute top-2 right-2">
        <div 
          className={`w-3 h-3 rounded-full animate-pulse ${
            soulStatus === SOUL_STATUS.VERIFIED ? 'bg-yellow-400' :
            soulStatus === SOUL_STATUS.PENDING ? 'bg-blue-400' :
            soulStatus === SOUL_STATUS.REVOKED ? 'bg-red-400' :
            'bg-purple-400'
          }`}
        />
      </div>
    </div>
  );
};

export default DNAHelixVisualization;
