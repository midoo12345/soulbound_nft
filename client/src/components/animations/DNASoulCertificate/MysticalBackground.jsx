import React, { useEffect, useRef } from 'react';

const MysticalBackground = ({ intensity = 'normal' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let isAnimating = true;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // DNA particles
    const particles = [];
    const particleCount = intensity === 'high' ? 50 : intensity === 'normal' ? 30 : 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? '#60A5FA' : '#A78BFA' // Blue or Purple
      });
    }

    // Soul energy streams
    const streams = [];
    const streamCount = 8;

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * canvas.width,
        y: -50,
        speed: Math.random() * 1 + 0.5,
        length: Math.random() * 80 + 40,
        opacity: Math.random() * 0.4 + 0.1,
        angle: Math.random() * Math.PI * 2
      });
    }

    const animate = () => {
      if (!isAnimating) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cosmic DNA field
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.02;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow effect
        const pulseSize = particle.size + Math.sin(particle.pulse) * 1;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 3
        );
        gradient.addColorStop(0, `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw soul energy streams
      streams.forEach(stream => {
        stream.y += stream.speed;
        if (stream.y > canvas.height + stream.length) {
          stream.y = -stream.length;
          stream.x = Math.random() * canvas.width;
        }

        // Draw stream with gradient
        const gradient = ctx.createLinearGradient(
          stream.x, stream.y - stream.length,
          stream.x, stream.y
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(96, 165, 250, ${stream.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stream.x, stream.y - stream.length);
        ctx.lineTo(stream.x, stream.y);
        ctx.stroke();
      });

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
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)'
      }}
    />
  );
};

export default MysticalBackground;
