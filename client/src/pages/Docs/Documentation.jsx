import React, { useState, useEffect, useRef } from 'react';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverElement, setHoverElement] = useState(null);
  const cursorRef = useRef(null);
  const trailRef = useRef([]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isLargeScreen) return;

    // Direct DOM cursor elements for zero delay
    let cursorElement = null;
    let auraElement = null;
    let particleElements = [];
    let trailElements = [];
    let isHoveringElement = false;
    
    // Create cursor elements immediately
    const createCursorElements = () => {
      // Main cursor
      cursorElement = document.createElement('div');
      cursorElement.style.cssText = `
        position: fixed;
        width: 32px;
        height: 32px;
        pointer-events: none;
        z-index: 9999;
        transform: translate3d(0,0,0);
        transition: width 0.1s ease, height 0.1s ease;
      `;
      cursorElement.innerHTML = `
        <div style="position: absolute; inset: 0; animation: spin-slow 3s linear infinite;">
          <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #22d3ee, #a855f7); background-clip: border-box; opacity: 0.6; clip-path: polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%);"></div>
        </div>
        <div style="position: absolute; inset: 4px; animation: spin-reverse 2s linear infinite;">
          <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #a855f7, #10b981); background-clip: border-box; opacity: 0.4; clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%);"></div>
      </div>
        <div style="position: absolute; inset: 8px; background: radial-gradient(circle, white, #22d3ee, transparent); border-radius: 50%; animation: pulse-quantum 1.5s ease-in-out infinite;"></div>
        <div style="position: absolute; inset: 0; overflow: hidden; border-radius: 50%;">
          <div style="position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #22d3ee, transparent); top: 50%; transform: translateY(-50%); animation: scan-cursor 2s ease-in-out infinite;"></div>
          <div style="position: absolute; height: 100%; width: 2px; background: linear-gradient(0deg, transparent, #a855f7, transparent); left: 50%; transform: translateX(-50%); animation: scan-cursor-v 1.8s ease-in-out infinite;"></div>
    </div>
        <div style="position: absolute; inset: 4px; border-radius: 50%; background: linear-gradient(45deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2)); animation: glitch 3s ease-in-out infinite;"></div>
      `;

      // Aura element
      auraElement = document.createElement('div');
      auraElement.style.cssText = `
        position: fixed;
        width: 80px;
        height: 80px;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.3;
        background: radial-gradient(circle, rgba(34,211,238,0.1) 0%, rgba(139,92,246,0.05) 50%, transparent 100%);
        border-radius: 50%;
        animation: pulse-aura 2s ease-in-out infinite;
        transform: translate3d(0,0,0);
      `;

      document.body.appendChild(cursorElement);
      document.body.appendChild(auraElement);
    };

    // Ultra-fast mouse move handler
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Direct DOM manipulation - zero React delays
      if (cursorElement) {
        cursorElement.style.left = (x - 16) + 'px';
        cursorElement.style.top = (y - 16) + 'px';
      }
      if (auraElement) {
        auraElement.style.left = (x - 40) + 'px';
        auraElement.style.top = (y - 40) + 'px';
      }
      
      // Update React state for particles (non-critical)
      setMousePosition({ x, y });
      
      // Update trail with enhanced effects
      trailRef.current = [
        { 
          x, y, 
          time: Date.now(),
          velocity: Math.sqrt(Math.pow(e.movementX || 0, 2) + Math.pow(e.movementY || 0, 2)),
          angle: Math.atan2(e.movementY || 0, e.movementX || 0)
        },
        ...trailRef.current.slice(0, 29)
      ];
    };

    // Fast hover detection for non-nav elements only
    const handleMouseOver = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      const isNavElement = target && target.closest('nav');
      
      if (target && !isNavElement && !isHoveringElement) {
        isHoveringElement = true;
        setIsHovering(true);
        
        // Instant cursor transformation
        if (cursorElement) {
          cursorElement.style.width = '48px';
          cursorElement.style.height = '48px';
          cursorElement.innerHTML = `
            <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid #f59e0b; opacity: 0.8; animation: pulse-fast 1s ease-in-out infinite;"></div>
            <div style="position: absolute; inset: 0; animation: spin-fast 1s linear infinite;">
              <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #f59e0b, #f97316); background-clip: border-box; opacity: 0.6; clip-path: polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%);"></div>
    </div>
            <div style="position: absolute; inset: 4px; animation: spin-reverse-fast 0.8s linear infinite;">
              <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #f97316, #dc2626); background-clip: border-box; opacity: 0.4; clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%);"></div>
            </div>
            <div style="position: absolute; inset: 8px; background: radial-gradient(circle, #fef3c7, #fed7aa, transparent); border-radius: 50%; animation: pulse-quantum-fast 0.8s ease-in-out infinite;"></div>
            <div style="position: absolute; inset: 0; overflow: hidden; border-radius: 50%;">
              <div style="position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #f59e0b, transparent); top: 50%; transform: translateY(-50%); animation: scan-cursor-fast 1s ease-in-out infinite;"></div>
              <div style="position: absolute; height: 100%; width: 2px; background: linear-gradient(0deg, transparent, #f97316, transparent); left: 50%; transform: translateX(-50%); animation: scan-cursor-v-fast 0.9s ease-in-out infinite;"></div>
            </div>
            <div style="position: absolute; inset: 4px; border-radius: 50%; background: linear-gradient(45deg, rgba(245,158,11,0.3), rgba(249,115,22,0.3)); animation: glitch-fast 1.5s ease-in-out infinite;"></div>
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            </div>
          `;
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.relatedTarget && e.relatedTarget.closest('button, a, [role="button"]');
      const isNavElement = target && target.closest('nav');
      
      if (isHoveringElement && (!target || isNavElement)) {
        isHoveringElement = false;
        setIsHovering(false);
        
        // Instant cursor reset
        if (cursorElement) {
          cursorElement.style.width = '32px';
          cursorElement.style.height = '32px';
          cursorElement.innerHTML = `
            <div style="position: absolute; inset: 0; animation: spin-slow 3s linear infinite;">
              <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #22d3ee, #a855f7); background-clip: border-box; opacity: 0.6; clip-path: polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%);"></div>
    </div>
            <div style="position: absolute; inset: 4px; animation: spin-reverse 2s linear infinite;">
              <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; background: linear-gradient(45deg, #a855f7, #10b981); background-clip: border-box; opacity: 0.4; clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%);"></div>
    </div>
            <div style="position: absolute; inset: 8px; background: radial-gradient(circle, white, #22d3ee, transparent); border-radius: 50%; animation: pulse-quantum 1.5s ease-in-out infinite;"></div>
            <div style="position: absolute; inset: 0; overflow: hidden; border-radius: 50%;">
              <div style="position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #22d3ee, transparent); top: 50%; transform: translateY(-50%); animation: scan-cursor 2s ease-in-out infinite;"></div>
              <div style="position: absolute; height: 100%; width: 2px; background: linear-gradient(0deg, transparent, #a855f7, transparent); left: 50%; transform: translateX(-50%); animation: scan-cursor-v 1.8s ease-in-out infinite;"></div>
  </div>
            <div style="position: absolute; inset: 4px; border-radius: 50%; background: linear-gradient(45deg, rgba(34,211,238,0.2), rgba(168,85,247,0.2)); animation: glitch 3s ease-in-out infinite;"></div>
          `;
        }
      }
    };

    // Initialize immediately
    createCursorElements();
    
    // Ultra-fast event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.body.style.cursor = 'none';
    
    // Override all cursor styles
    const style = document.createElement('style');
    style.textContent = `
      *, *:hover, *:focus, *:active {
        cursor: none !important;
      }
      button, a, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // High-performance trail animation
    const animateTrail = () => {
      const now = Date.now();
      trailRef.current = trailRef.current.filter(point => now - point.time < 800);
      requestAnimationFrame(animateTrail);
    };
    animateTrail();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.body.style.cursor = 'auto';
      if (style.parentNode) document.head.removeChild(style);
      if (cursorElement) document.body.removeChild(cursorElement);
      if (auraElement) document.body.removeChild(auraElement);
    };
  }, [isLargeScreen]);

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'setup', title: 'Setup Guide', icon: '⚙️' },
    { id: 'features', title: 'Platform Features', icon: '✨' },
    { id: 'roles', title: 'User Roles', icon: '👥' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* WORLD'S MOST UNIQUE FUTURISTIC CURSOR - NOW USES DIRECT DOM FOR ZERO DELAY */}
      {isLargeScreen && (
        <>
          {/* Advanced Velocity-Based Trail */}
          {trailRef.current.map((point, index) => {
            const age = Date.now() - point.time;
            const opacity = Math.max(0, 1 - age / 800);
            const scale = Math.max(0.1, 1 - age / 800);
            const velocityScale = Math.min(2, (point.velocity || 0) / 10);
            const hue = (Date.now() / 10 + index * 30) % 360;
            
            return (
              <div
                key={`${point.x}-${point.y}-${point.time}`}
                className="fixed pointer-events-none z-[9997]"
                style={{
                  left: point.x - 3,
                  top: point.y - 3,
                  width: 6 + velocityScale * 2,
                  height: 6 + velocityScale * 2,
                  opacity: opacity * 0.8,
                  transform: `scale(${scale}) rotate(${point.angle || 0}rad)`,
                  background: `hsl(${hue}, 80%, 60%)`,
                  borderRadius: velocityScale > 1 ? '2px' : '50%',
                  boxShadow: `0 0 ${8 + velocityScale * 4}px hsla(${hue}, 80%, 60%, 0.6)`,
                  transition: 'none'
                }}
              />
            );
          })}

          {/* Quantum Particles Field */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="fixed w-1 h-1 pointer-events-none z-[9996] rounded-full opacity-40"
              style={{
                left: mousePosition.x + Math.cos(Date.now() / 500 + i * 0.5) * (30 + i * 5) - 2,
                top: mousePosition.y + Math.sin(Date.now() / 500 + i * 0.5) * (30 + i * 5) - 2,
                background: `hsl(${180 + i * 15}, 100%, 70%)`,
                boxShadow: `0 0 4px hsl(${180 + i * 15}, 100%, 70%)`,
                animation: `quantum-orbit-${i % 3} ${2 + i * 0.1}s linear infinite`
              }}
            />
          ))}

          {/* Magnetic Field Lines */}
          <svg 
            className="fixed pointer-events-none z-[9995] opacity-20"
            style={{
              left: mousePosition.x - 60,
              top: mousePosition.y - 60,
              width: 120,
              height: 120
            }}
          >
            <defs>
              <radialGradient id="magneticField" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse
                key={i}
                cx="60"
                cy="60"
                rx={15 + i * 8}
                ry={10 + i * 5}
                fill="none"
                stroke="url(#magneticField)"
                strokeWidth="1"
                transform={`rotate(${i * 30 + Date.now() / 50} 60 60)`}
              />
            ))}
          </svg>
        </>
      )}

      {/* Enhanced Futuristic background with large screen animations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.10),transparent_50%)]" />
        
        {/* Animated orbs - enhanced for large screens */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-full blur-3xl ${isLargeScreen ? 'animate-float-slow' : 'animate-pulse'}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-emerald-500/20 rounded-full blur-3xl ${isLargeScreen ? 'animate-float-reverse' : 'animate-pulse'}`} />
        
        {/* Additional floating elements for large screens */}
        {isLargeScreen && (
          <>
            <div className="absolute top-1/2 left-1/6 w-32 h-32 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-full blur-2xl animate-bounce-slow" />
            <div className="absolute top-3/4 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-drift" />
            <div className="absolute top-1/6 right-1/3 w-24 h-24 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-xl animate-pulse-slow" />
          </>
        )}
        
        {/* Enhanced grid pattern */}
        <div className={`absolute inset-0 opacity-10 ${isLargeScreen ? 'animate-grid-move' : ''}`} style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        
        {/* Scanning lines for large screens */}
        {isLargeScreen && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-2 animate-scan-vertical" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent w-2 animate-scan-horizontal" />
          </>
        )}
      </div>

      {/* Header */}
      <header className="relative bg-slate-900/80 backdrop-blur-xl border-b border-cyan-400/20 sticky top-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BC</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 to-violet-500/50 rounded-lg blur opacity-75" />
              </div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300">
                Blockchain Certificates
            </h1>
          </div>
            <div className="text-sm text-cyan-300">Documentation Guide</div>
          </div>
          </div>
        </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Mobile Navigation - MATCHING DESKTOP FUTURISTIC DESIGN */}
          <nav className="lg:hidden">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
              
              {/* Scanning Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-nav top-0" />
                <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-violet-400/50 to-transparent animate-scan-nav-v left-0" />
              </div>
              
              {/* Holographic Grid Overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                animation: 'grid-shift 10s linear infinite'
              }} />
              
              <div className="relative p-4">
                {/* Futuristic Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                    <h2 className="font-bold text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-lg">
                      Quick Navigation
                    </h2>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </div>

                {/* Futuristic Navigation Items - Mobile Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`relative overflow-hidden rounded-xl transition-all duration-500 group ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-emerald-500/20 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-cyan-400/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-102'
                      }`}
                    >
                      {/* Hover Scan Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <div className="relative flex flex-col items-center gap-3 p-4">
                        {/* Holographic Icon */}
                        <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          activeSection === section.id
                            ? 'bg-gradient-to-br from-cyan-400/30 to-violet-400/30 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                            : 'bg-slate-700/50 group-hover:bg-cyan-400/20'
                        }`}>
                          {/* Icon Ring */}
                          <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
                            activeSection === section.id
                              ? 'border-cyan-400/60 animate-pulse'
                              : 'border-slate-600 group-hover:border-cyan-400/40'
                          }`} />
                          
                          <span className={`text-xl transition-all duration-300 ${
                            activeSection === section.id
                              ? 'text-cyan-300 scale-110'
                              : 'text-gray-400 group-hover:text-cyan-400'
                          }`}>
                            {section.icon}
                          </span>
                          
                          {/* Active Indicator */}
                          {activeSection === section.id && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                          )}
                        </div>
                        
                        {/* Text Content */}
                        <span className={`font-medium transition-all duration-300 text-sm text-center leading-tight ${
                          activeSection === section.id
                            ? 'text-transparent bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text'
                            : 'text-gray-300 group-hover:text-cyan-300'
                        }`}>
                          {section.title}
                        </span>
                        
                        {/* Progress Bar */}
                        <div className={`w-full h-0.5 bg-slate-700 rounded-full overflow-hidden transition-all duration-500 ${
                          activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                        }`}>
                          <div className={`h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full transition-all duration-1000 ${
                            activeSection === section.id ? 'w-full' : 'w-0 group-hover:w-1/3'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Corner Accents */}
                      {activeSection === section.id && (
                        <>
                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-violet-400/60 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400/60 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400/60 rounded-br-lg" />
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop Sidebar Navigation - FUTURISTIC DESIGN */}
          <nav className="hidden lg:block w-72 flex-shrink-0">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)] sticky top-24">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
              
              {/* Scanning Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-nav top-0" />
                <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-violet-400/50 to-transparent animate-scan-nav-v left-0" />
              </div>
              
              {/* Holographic Grid Overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `
                  linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                animation: 'grid-shift 10s linear infinite'
              }} />
              
              <div className="relative p-6">
                {/* Futuristic Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      <span className="text-white text-lg">⚡</span>
                    </div>
                    <h2 className="font-bold text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-lg">
                      Quick Navigation
                    </h2>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                </div>

                {/* Futuristic Navigation Items */}
                <ul className="space-y-3">
                  {sections.map((section, index) => (
                    <li key={section.id} className="relative">
                      {/* Connection Lines */}
                      {index > 0 && (
                        <div className="absolute -top-3 left-4 w-px h-3 bg-gradient-to-b from-cyan-400/30 to-transparent" />
                      )}
                      
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left relative overflow-hidden rounded-xl transition-all duration-500 group ${
                          activeSection === section.id
                            ? 'bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-emerald-500/20 border border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)] scale-105'
                            : 'bg-slate-800/50 border border-slate-700/50 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:scale-102'
                        }`}
                      >
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative flex items-center gap-4 p-4">
                          {/* Holographic Icon */}
                          <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            activeSection === section.id
                              ? 'bg-gradient-to-br from-cyan-400/30 to-violet-400/30 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                              : 'bg-slate-700/50 group-hover:bg-cyan-400/20'
                          }`}>
                            {/* Icon Ring */}
                            <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
                              activeSection === section.id
                                ? 'border-cyan-400/60 animate-pulse'
                                : 'border-slate-600 group-hover:border-cyan-400/40'
                            }`} />
                            
                            <span className={`text-lg transition-all duration-300 ${
                              activeSection === section.id
                                ? 'text-cyan-300 scale-110'
                                : 'text-gray-400 group-hover:text-cyan-400'
                            } ${isLargeScreen ? 'group-hover:rotate-12 group-hover:scale-125' : ''}`}>
                              {section.icon}
                            </span>
                            
                            {/* Active Indicator */}
                            {activeSection === section.id && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            )}
                          </div>
                          
                          {/* Text Content */}
                          <div className="flex-1">
                            <span className={`font-medium transition-all duration-300 ${
                              activeSection === section.id
                                ? 'text-transparent bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text'
                                : 'text-gray-300 group-hover:text-cyan-300'
                            }`}>
                              {section.title}
                            </span>
                            
                            {/* Progress Bar */}
                            <div className={`mt-1 h-0.5 bg-slate-700 rounded-full overflow-hidden transition-all duration-500 ${
                              activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                            }`}>
                              <div className={`h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full transition-all duration-1000 ${
                                activeSection === section.id ? 'w-full' : 'w-0 group-hover:w-1/3'
                              }`} />
                            </div>
                          </div>
                          
                          {/* Arrow Indicator */}
                          <div className={`transition-all duration-300 ${
                            activeSection === section.id
                              ? 'text-cyan-400 translate-x-0 opacity-100'
                              : 'text-gray-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-cyan-400'
                          }`}>
                            <span className="text-sm">→</span>
                          </div>
                        </div>
                        
                        {/* Bottom Glow */}
                        {activeSection === section.id && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                        )}
                      </button>
                    </li>
                  ))}
          </ul>
                
                {/* Status Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span>System Online</span>
          </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
                  
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-nav top-0" />
                    <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-violet-400/50 to-transparent animate-scan-nav-v left-0" />
                  </div>
                  
                  {/* Holographic Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-shift 10s linear infinite'
                  }} />
                  
                  <div className="relative p-8">
                    {/* Futuristic Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                        {/* Icon Ring */}
                        <div className="absolute inset-0 rounded-2xl border border-cyan-400/60 animate-pulse" />
                        <span className="text-white text-3xl">🚀</span>
                        {/* Active Indicator */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text mb-2">
                          Getting Started
                        </h2>
                        <div className="h-px bg-gradient-to-r from-cyan-400/50 via-violet-400/50 to-transparent w-32" />
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                      Welcome to the Blockchain Certificate Platform. This guide will help you issue, manage, 
                      and verify digital academic credentials on the blockchain.
                    </p>

                    {/* Enhanced Requirements Callout */}
                    <div className="relative overflow-hidden rounded-2xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-8">
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                      
                      {/* Scanning Lines */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-scan-nav top-0" />
                      </div>
                      
                      <div className="relative p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                            {/* Icon Ring */}
                            <div className="absolute inset-0 rounded-xl border border-blue-400/60 animate-pulse" />
                            <span className="text-white text-lg">📋</span>
                          </div>
                          <h3 className="font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-xl">
                            What you'll need:
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            'A modern web browser (Chrome, Firefox, Safari, Edge)',
                            'MetaMask wallet extension',
                            'Access to Sepolia test network',
                            'Some test ETH for transactions'
                          ].map((requirement, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
                              <span className="text-gray-300">{requirement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      {/* For Institutions */}
                      <div className={`relative overflow-hidden rounded-2xl border border-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative text-center p-6">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className={`w-full h-full bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:animate-bounce-subtle group-hover:shadow-[0_0_30px_rgba(16,185,129,0.7)]' : ''}`}>
                              {/* Icon Ring */}
                              <div className="absolute inset-0 rounded-2xl border border-emerald-400/60 group-hover:animate-pulse" />
                              <span className="text-white text-2xl">🏫</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-transparent bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-lg mb-2">
                            For Institutions
                          </h4>
                          <p className="text-gray-300 text-sm">Issue and manage digital certificates for your students</p>
                          
                          {/* Progress Bar */}
                          <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-green-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>
                      
                      {/* For Students */}
                      <div className={`relative overflow-hidden rounded-2xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:-rotate-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative text-center p-6">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:animate-bounce-subtle group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]' : ''}`}>
                              {/* Icon Ring */}
                              <div className="absolute inset-0 rounded-2xl border border-blue-400/60 group-hover:animate-pulse" />
                              <span className="text-white text-2xl">🎓</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-lg mb-2">
                            For Students
                          </h4>
                          <p className="text-gray-300 text-sm">View and share your verified academic credentials</p>
                          
                          {/* Progress Bar */}
                          <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>
                      
                      {/* For Verifiers */}
                      <div className={`relative overflow-hidden rounded-2xl border border-purple-400/30 shadow-[0_0_30px_rgba(147,51,234,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(147,51,234,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative text-center p-6">
                          <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:animate-bounce-subtle group-hover:shadow-[0_0_30px_rgba(147,51,234,0.7)]' : ''}`}>
                              {/* Icon Ring */}
                              <div className="absolute inset-0 rounded-2xl border border-purple-400/60 group-hover:animate-pulse" />
                              <span className="text-white text-2xl">✅</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-transparent bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-lg mb-2">
                            For Verifiers
                          </h4>
                          <p className="text-gray-300 text-sm">Quickly verify the authenticity of certificates</p>
                          
                          {/* Progress Bar */}
                          <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-violet-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Setup Guide Section */}
            {activeSection === 'setup' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
                  
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-nav top-0" />
                    <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-violet-400/50 to-transparent animate-scan-nav-v left-0" />
                  </div>
                  
                  {/* Holographic Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-shift 10s linear infinite'
                  }} />
                  
                  <div className="relative p-8">
                    {/* Futuristic Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                        {/* Icon Ring */}
                        <div className="absolute inset-0 rounded-2xl border border-cyan-400/60 animate-pulse" />
                        <span className="text-white text-3xl">⚙️</span>
                        {/* Active Indicator */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text mb-2">
                          Setup Guide
                        </h2>
                        <div className="h-px bg-gradient-to-r from-cyan-400/50 via-violet-400/50 to-transparent w-32" />
                      </div>
                    </div>

                    {/* Step 1: Install MetaMask */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]">1</div>
                        <h3 className="text-xl font-semibold text-orange-300">Install MetaMask</h3>
                      </div>
                      
                      <div className="ml-11 space-y-4">
                        <p className="text-gray-300">MetaMask is a browser extension that acts as your digital wallet.</p>
                        
                        <div className="relative bg-slate-800/50 border border-orange-400/20 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-orange-300 mb-2">Installation Steps:</h4>
                            <ol className="text-gray-300 space-y-2">
                              <li>1. Go to <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">metamask.io</a></li>
                              <li>2. Click "Download" and add the extension to your browser</li>
                              <li>3. Create a new wallet or import an existing one</li>
                              <li>4. Save your recovery phrase in a secure location</li>
                            </ol>
                          </div>
                        </div>

                        <div className="relative bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-red-300 mb-2">⚠️ Security Warning</h4>
                            <p className="text-red-200 text-sm">
                              Never share your recovery phrase with anyone. Store it offline in multiple secure locations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Add Sepolia Network */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]">2</div>
                        <h3 className="text-xl font-semibold text-purple-300">Add Sepolia Test Network</h3>
                      </div>
                      
                      <div className="ml-11 space-y-4">
                        <p className="text-gray-300">Sepolia is a test network where you can safely test the platform without spending real money.</p>
                        
                        <div className="relative bg-slate-800/50 border border-purple-400/20 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-purple-300 mb-2">Network Configuration:</h4>
                            <ol className="text-gray-300 space-y-2 mb-4">
                              <li>1. Open MetaMask and click the network dropdown (usually shows "Ethereum Mainnet")</li>
                              <li>2. Click "Add Network" or "Custom RPC"</li>
                              <li>3. Enter the following details:</li>
                            </ol>
                            
                            <div className="bg-slate-900/50 border border-cyan-400/20 rounded p-3 font-mono text-sm">
                              <div className="text-cyan-300"><strong>Network Name:</strong> <span className="text-white">Sepolia</span></div>
                              <div className="text-cyan-300"><strong>RPC URL:</strong> <span className="text-white">https://rpc.sepolia.org</span></div>
                              <div className="text-cyan-300"><strong>Chain ID:</strong> <span className="text-white">11155111</span></div>
                              <div className="text-cyan-300"><strong>Symbol:</strong> <span className="text-white">ETH</span></div>
                              <div className="text-cyan-300"><strong>Block Explorer:</strong> <span className="text-white">https://sepolia.etherscan.io</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Get Test ETH */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]">3</div>
                        <h3 className="text-xl font-semibold text-green-300">Get Test ETH</h3>
                      </div>
                      
                      <div className="ml-11 space-y-4">
                        <p className="text-gray-300">You need test ETH to pay for blockchain transactions. These are free and have no real value.</p>
                        
                        <div className="relative bg-slate-800/50 border border-green-400/20 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-green-300 mb-2">Recommended Faucets:</h4>
                            <ul className="text-gray-300 space-y-2">
                              <li>• <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sepolia Faucet</a> - Simple and fast</li>
                              <li>• <a href="https://faucets.chain.link/sepolia" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Chainlink Faucet</a> - Requires social verification</li>
                              <li>• <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Alchemy Faucet</a> - Account required</li>
              </ul>
            </div>
          </div>

                        <div className="relative bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-yellow-300 mb-2">💡 Tips</h4>
                            <ul className="text-yellow-200 text-sm space-y-1">
                              <li>• Faucets may require social media verification to prevent abuse</li>
                              <li>• Wait 2-5 minutes for transactions to complete</li>
                              <li>• You only need a small amount (0.1 ETH is plenty)</li>
            </ul>
          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Connect to Platform */}
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]">4</div>
                        <h3 className="text-xl font-semibold text-blue-300">Connect to Platform</h3>
                      </div>
                      
                      <div className="ml-11 space-y-4">
                        <p className="text-gray-300">Now you're ready to connect your wallet to the platform.</p>
                        
                        <div className="relative bg-slate-800/50 border border-blue-400/20 rounded-xl p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl" />
                          <div className="relative">
                            <h4 className="font-semibold text-blue-300 mb-2">Connection Steps:</h4>
                            <ol className="text-gray-300 space-y-2">
                              <li>1. Go to the platform homepage</li>
                              <li>2. Make sure Sepolia network is selected in MetaMask</li>
                              <li>3. Click "Connect Wallet" button</li>
                              <li>4. Approve the connection in MetaMask popup</li>
                              <li>5. Your wallet address will appear in the navigation bar</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-violet-400/30 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-500/10" />
                  
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent animate-scan-nav top-0" />
                    <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent animate-scan-nav-v left-0" />
                  </div>
                  
                  {/* Holographic Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-shift 10s linear infinite'
                  }} />
                  
                  <div className="relative p-8">
                    {/* Futuristic Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        {/* Icon Ring */}
                        <div className="absolute inset-0 rounded-2xl border border-violet-400/60 animate-pulse" />
                        <span className="text-white text-3xl">✨</span>
                        {/* Active Indicator */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-violet-400 to-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-violet-300 via-emerald-300 to-cyan-300 bg-clip-text mb-2">
                          Platform Features
                        </h2>
                        <div className="h-px bg-gradient-to-r from-violet-400/50 via-emerald-400/50 to-transparent w-32" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {/* For Institutions */}
                      <div className="relative border border-emerald-400/20 rounded-xl p-6 bg-emerald-500/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-xl" />
                        <div className="relative">
                          <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
                            <span className="text-emerald-400">🏫</span>
                            For Institutions
                          </h3>
                          
          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-white mb-2">Issue Certificates</h4>
                              <p className="text-gray-300 text-sm mb-2">Create and mint digital certificates for your students.</p>
                              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>• Fill in student information</li>
                                <li>• Upload certificate image</li>
                                <li>• Store metadata on IPFS</li>
                                <li>• Mint certificate on blockchain</li>
            </ul>
          </div>

                            <div>
                              <h4 className="font-semibold text-white mb-2">Manage Courses</h4>
                              <p className="text-gray-300 text-sm mb-2">Create and organize your course catalog.</p>
                              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>• Add new courses</li>
                                <li>• Set course details and requirements</li>
                                <li>• Track issued certificates per course</li>
          </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* For Students */}
                      <div className="relative border border-blue-400/20 rounded-xl p-6 bg-blue-500/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl" />
                        <div className="relative">
                          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                            <span className="text-blue-400">🎓</span>
                            For Students
                          </h3>
                          
          <div className="space-y-4">
            <div>
                              <h4 className="font-semibold text-white mb-2">View Certificates</h4>
                              <p className="text-gray-300 text-sm mb-2">Access all your digital certificates in one place.</p>
                              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>• Browse your certificate collection</li>
                                <li>• Search and filter certificates</li>
                                <li>• View detailed certificate information</li>
              </ul>
            </div>

                            <div>
                              <h4 className="font-semibold text-white mb-2">Share Certificates</h4>
                              <p className="text-gray-300 text-sm mb-2">Generate secure QR codes for sharing.</p>
                              <ul className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>• Create time-limited sharing links</li>
                                <li>• Download QR codes</li>
                                <li>• Control access duration</li>
              </ul>
              </div>
            </div>
          </div>
                      </div>
                    </div>

                    {/* QR Code Sharing - Enhanced Power Feature */}
                    <div className="relative overflow-hidden rounded-3xl border border-blue-400/30 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                      {/* Animated Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-cyan-500/15" />
                      
                      {/* Scanning Animation */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent animate-scan-nav top-0" />
                        <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-purple-400/60 to-transparent animate-scan-nav-v left-0" />
                      </div>
                      
                      {/* Holographic Grid Overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                          linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: '25px 25px',
                        animation: 'grid-shift 12s linear infinite'
                      }} />
                      
                      <div className="relative p-8">
                        {/* Power Feature Header */}
                        <div className="flex items-center gap-4 mb-8">
                          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                            {/* Icon Ring */}
                            <div className="absolute inset-0 rounded-2xl border border-blue-400/60 animate-pulse" />
                            <span className="text-white text-3xl">🔗</span>
                            {/* Power Indicator */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                          </div>
                          <div>
                            <h3 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text mb-2">
                              Secure QR Code Sharing
                            </h3>
                            <div className="h-px bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-transparent w-40" />
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                          Revolutionary blockchain-powered QR codes that provide secure, time-limited access to certificates with military-grade encryption.
                        </p>
                        
                        <div className="grid lg:grid-cols-3 gap-8">
                          {/* QR Code Showcase */}
                          <div className="lg:col-span-1">
                            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)] bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 text-center">
                              {/* QR Code Animation Container */}
                              <div className="relative mx-auto mb-4">
                                {/* Animated QR Code SVG */}
                                <div className="relative w-32 h-32 mx-auto">
                                  <svg viewBox="0 0 128 128" className="w-full h-full">
                                    <defs>
                                      <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#22d3ee" />
                                        <stop offset="50%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#10b981" />
                                      </linearGradient>
                                      <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                        <feMerge> 
                                          <feMergeNode in="coloredBlur"/>
                                          <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                      </filter>
                                    </defs>
                                    
                                    {/* QR Code Pattern */}
                                    <g fill="url(#qrGradient)" filter="url(#glow)">
                                      {/* Corner Squares */}
                                      <rect x="8" y="8" width="24" height="24" rx="2" className="animate-pulse" />
                                      <rect x="96" y="8" width="24" height="24" rx="2" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                                      <rect x="8" y="96" width="24" height="24" rx="2" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                                      
                                      {/* Inner Corner Squares */}
                                      <rect x="12" y="12" width="16" height="16" rx="1" fill="#1e293b" />
                                      <rect x="100" y="12" width="16" height="16" rx="1" fill="#1e293b" />
                                      <rect x="12" y="100" width="16" height="16" rx="1" fill="#1e293b" />
                                      
                                      <rect x="16" y="16" width="8" height="8" rx="1" />
                                      <rect x="104" y="16" width="8" height="8" rx="1" />
                                      <rect x="16" y="104" width="8" height="8" rx="1" />
                                      
                                      {/* Data Pattern */}
                                      <rect x="8" y="40" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                                      <rect x="16" y="40" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                                      <rect x="24" y="40" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                                      <rect x="8" y="48" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                                      <rect x="20" y="48" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                                      
                                      <rect x="40" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.6s'}} />
                                      <rect x="48" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                                      <rect x="56" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.7s'}} />
                                      <rect x="64" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                                      <rect x="72" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.8s'}} />
                                      <rect x="80" y="8" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                                      
                                      <rect x="40" y="16" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                                      <rect x="52" y="16" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.9s'}} />
                                      <rect x="64" y="16" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                                      <rect x="76" y="16" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                                      
                                      {/* Center Pattern */}
                                      <rect x="56" y="56" width="16" height="16" rx="2" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                                      <rect x="60" y="60" width="8" height="8" rx="1" fill="#1e293b" />
                                      <rect x="62" y="62" width="4" height="4" rx="1" />
                                      
                                      {/* More Data Points */}
                                      <rect x="40" y="40" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                                      <rect x="48" y="44" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.6s'}} />
                                      <rect x="80" y="40" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.8s'}} />
                                      <rect x="88" y="44" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.4s'}} />
                                      
                                      <rect x="40" y="80" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.7s'}} />
                                      <rect x="48" y="84" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.1s'}} />
                                      <rect x="56" y="88" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.9s'}} />
                                      <rect x="80" y="80" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.3s'}} />
                                      <rect x="88" y="84" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                                      <rect x="96" y="88" width="4" height="4" className="animate-pulse" style={{animationDelay: '0.8s'}} />
                                    </g>
                                  </svg>
                                  
                                  {/* Scanning Effect */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent h-2 animate-scan-qr" />
                                </div>
                                
                                {/* QR Code Status */}
                                <div className="flex items-center justify-center gap-2 mt-4">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                  <span className="text-xs text-green-300 font-medium">Active & Secure</span>
                                </div>
                              </div>
                              
                              <h4 className="font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-lg mb-2">
                                Live QR Code
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Scan to verify certificate instantly
                              </p>
                            </div>
                          </div>
                          
                          {/* Features Grid */}
                          <div className="lg:col-span-2 space-y-6">
                            {/* Duration Options */}
                            <div className="relative overflow-hidden rounded-2xl border border-purple-400/30 shadow-[0_0_20px_rgba(147,51,234,0.2)] bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                                  <span className="text-white text-lg">⏱️</span>
                                </div>
                                <h4 className="font-bold text-transparent bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-xl">
                                  Time-Limited Access
                                </h4>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['1 hour', '1 day', '1 week', '1 month', '3 months', '1 year'].map((duration, index) => (
                                  <div key={duration} className="relative overflow-hidden rounded-lg border border-purple-400/30 bg-slate-800/50 p-3 text-center transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                                    <span className="relative text-purple-300 font-medium text-sm">{duration}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Power Features */}
                            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                  <span className="text-white text-lg">⚡</span>
                                </div>
                                <h4 className="font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-xl">
                                  Advanced Security Features
                                </h4>
                              </div>
                              
                              <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                  { icon: '🔐', title: 'Encrypted Access Tokens', desc: 'Military-grade encryption' },
                                  { icon: '⏰', title: 'Automatic Expiration', desc: 'Time-based security' },
                                  { icon: '📱', title: 'Multi-format Export', desc: 'PNG, URL, PDF ready' },
                                  { icon: '🔗', title: 'Shareable Links', desc: 'One-click sharing' }
                                ].map((feature, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center text-sm shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                                      {feature.icon}
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-cyan-300 text-sm">{feature.title}</h5>
                                      <p className="text-gray-400 text-xs">{feature.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roles Section */}
            {activeSection === 'roles' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10" />
                  
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-nav top-0" />
                    <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-violet-400/50 to-transparent animate-scan-nav-v left-0" />
                  </div>
                  
                  {/* Holographic Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-shift 10s linear infinite'
                  }} />
                  
                  <div className="relative p-8">
                    {/* Futuristic Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                        {/* Icon Ring */}
                        <div className="absolute inset-0 rounded-2xl border border-cyan-400/60 animate-pulse" />
                        <span className="text-white text-3xl">👥</span>
                        {/* Active Indicator */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text mb-2">
                          User Roles & Permissions
                        </h2>
                        <div className="h-px bg-gradient-to-r from-cyan-400/50 via-violet-400/50 to-transparent w-32" />
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                      The platform uses blockchain-based role management to control access to different features.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {/* Admin Role */}
                      <div className={`relative overflow-hidden rounded-2xl border border-red-400/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(239,68,68,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-14 h-14">
                              <div className={`w-full h-full bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:shadow-[0_0_30px_rgba(239,68,68,0.7)]' : ''}`}>
                                {/* Icon Ring */}
                                <div className="absolute inset-0 rounded-2xl border border-red-400/60 group-hover:animate-pulse" />
                                <span className="text-white text-xl font-bold">A</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text">Admin</h3>
                              <p className="text-red-200 text-sm">Full system access</p>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-red-300 mb-3">Permissions:</h4>
                          <div className="space-y-2">
                            {['Grant institution roles', 'Approve certificate burns', 'System management', 'Contract administration', 'View all certificates'].map((permission, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                                <span className="text-red-200">{permission}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-4 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>

                      {/* Institution Role */}
                      <div className={`relative overflow-hidden rounded-2xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:-rotate-1 hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-14 h-14">
                              <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]' : ''}`}>
                                {/* Icon Ring */}
                                <div className="absolute inset-0 rounded-2xl border border-blue-400/60 group-hover:animate-pulse" />
                                <span className="text-white text-xl font-bold">I</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">Institution</h3>
                              <p className="text-blue-200 text-sm">Certificate management</p>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-blue-300 mb-3">Permissions:</h4>
                          <div className="space-y-2">
                            {['Issue new certificates', 'Update certificate metadata', 'Manage course catalog', 'View institution analytics', 'Generate reports'].map((permission, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                                <span className="text-blue-200">{permission}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-4 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>

                      {/* Student Role */}
                      <div className={`relative overflow-hidden rounded-2xl border border-green-400/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all duration-500 group ${isLargeScreen ? 'hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(34,197,94,0.3)]' : ''}`}>
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
                        
                        {/* Hover Scan Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative w-14 h-14">
                              <div className={`w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 ${isLargeScreen ? 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.7)]' : ''}`}>
                                {/* Icon Ring */}
                                <div className="absolute inset-0 rounded-2xl border border-green-400/60 group-hover:animate-pulse" />
                                <span className="text-white text-xl font-bold">S</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text">Student</h3>
                              <p className="text-green-200 text-sm">Certificate viewing</p>
                            </div>
                          </div>
                          
                          <h4 className="font-bold text-green-300 mb-3">Permissions:</h4>
                          <div className="space-y-2">
                            {['View own certificates', 'Generate QR codes', 'Verify certificates', 'Share certificates', 'Basic platform access'].map((permission, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                                <span className="text-green-200">{permission}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-4 h-0.5 bg-slate-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full w-0 group-hover:w-full transition-all duration-1000" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Role Security Callout */}
                    <div className="relative overflow-hidden rounded-2xl border border-slate-400/30 shadow-[0_0_20px_rgba(100,116,139,0.2)] bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl">
                      {/* Scanning Lines */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-slate-400/40 to-transparent animate-scan-nav top-0" />
                      </div>
                      
                      <div className="relative p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center shadow-[0_0_15px_rgba(100,116,139,0.5)]">
                            <span className="text-white text-lg">🔒</span>
                          </div>
                          <h4 className="font-bold text-transparent bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-xl">
                            Role Security
                          </h4>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          All roles are managed by smart contracts on the blockchain. This ensures that permissions 
                          cannot be tampered with and are transparently verifiable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting Section */}
            {activeSection === 'troubleshooting' && (
              <div className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-orange-400/30 shadow-[0_0_50px_rgba(251,146,60,0.2)]">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
                  
                  {/* Scanning Animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent animate-scan-nav top-0" />
                    <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-red-400/50 to-transparent animate-scan-nav-v left-0" />
                  </div>
                  
                  {/* Holographic Grid Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `
                      linear-gradient(rgba(251,146,60,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(251,146,60,0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                    animation: 'grid-shift 10s linear infinite'
                  }} />
                  
                  <div className="relative p-8">
                    {/* Futuristic Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,146,60,0.5)]">
                        {/* Icon Ring */}
                        <div className="absolute inset-0 rounded-2xl border border-orange-400/60 animate-pulse" />
                        <span className="text-white text-3xl">🔧</span>
                        {/* Active Indicator */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-orange-300 via-red-300 to-yellow-300 bg-clip-text mb-2">
                          Troubleshooting
                        </h2>
                        <div className="h-px bg-gradient-to-r from-orange-400/50 via-red-400/50 to-transparent w-32" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Common Issues */}
                      <div>
                        <h3 className="text-lg font-semibold text-orange-300 mb-4">Common Issues</h3>
                        
                        <div className="space-y-4">
                          <div className="relative border border-red-400/20 rounded-xl p-4 bg-red-500/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-xl" />
                            <div className="relative">
                              <h4 className="font-semibold text-red-300 mb-2">❌ "Wrong Network" Error</h4>
                              <p className="text-gray-300 text-sm mb-2"><strong>Problem:</strong> You're connected to the wrong blockchain network.</p>
                              <p className="text-gray-300 text-sm mb-2"><strong>Solution:</strong></p>
                              <ol className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>1. Open MetaMask</li>
                                <li>2. Click the network dropdown</li>
                                <li>3. Select "Sepolia" network</li>
                                <li>4. Refresh the webpage</li>
                              </ol>
                            </div>
                          </div>

                          <div className="relative border border-orange-400/20 rounded-xl p-4 bg-orange-500/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-xl" />
                            <div className="relative">
                              <h4 className="font-semibold text-orange-300 mb-2">🔌 Connection Failed</h4>
                              <p className="text-gray-300 text-sm mb-2"><strong>Problem:</strong> MetaMask won't connect to the platform.</p>
                              <p className="text-gray-300 text-sm mb-2"><strong>Solution:</strong></p>
                              <ol className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>1. Check if MetaMask is unlocked</li>
                                <li>2. Clear browser cache and cookies</li>
                                <li>3. Disable other wallet extensions</li>
                                <li>4. Try refreshing the page</li>
                                <li>5. Restart your browser if needed</li>
                              </ol>
                            </div>
                          </div>

                          <div className="relative border border-yellow-400/20 rounded-xl p-4 bg-yellow-500/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-green-500/5 rounded-xl" />
                            <div className="relative">
                              <h4 className="font-semibold text-yellow-300 mb-2">💰 Insufficient Funds</h4>
                              <p className="text-gray-300 text-sm mb-2"><strong>Problem:</strong> Not enough ETH to complete transactions.</p>
                              <p className="text-gray-300 text-sm mb-2"><strong>Solution:</strong></p>
                              <ol className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>1. Get more test ETH from a Sepolia faucet</li>
                                <li>2. Wait for faucet transaction to complete</li>
                                <li>3. Check your balance in MetaMask</li>
                                <li>4. Try the transaction again</li>
                              </ol>
                            </div>
                          </div>

                          <div className="relative border border-purple-400/20 rounded-xl p-4 bg-purple-500/5">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl" />
                            <div className="relative">
                              <h4 className="font-semibold text-purple-300 mb-2">⏳ Transaction Stuck</h4>
                              <p className="text-gray-300 text-sm mb-2"><strong>Problem:</strong> Transaction is pending for too long.</p>
                              <p className="text-gray-300 text-sm mb-2"><strong>Solution:</strong></p>
                              <ol className="text-gray-400 text-sm space-y-1 ml-4">
                                <li>1. Wait 5-10 minutes (network might be busy)</li>
                                <li>2. Check transaction status on <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">Sepolia Explorer</a></li>
                                <li>3. Try increasing gas price in MetaMask</li>
                                <li>4. Cancel and retry if still stuck</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Getting Help */}
                      <div className="relative bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl" />
                        <div className="relative">
                          <h3 className="text-lg font-semibold text-blue-300 mb-4">🆘 Need More Help?</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-blue-300 mb-2">Debug Information</h4>
                              <p className="text-blue-200 text-sm mb-2">
                                If you're still having issues, please provide this information when asking for help:
                              </p>
                              <ul className="text-blue-200 text-sm space-y-1 ml-4">
                                <li>• Your wallet address</li>
                                <li>• Current network (should be Sepolia)</li>
                                <li>• Browser and version</li>
                                <li>• Steps you took before the error</li>
                                <li>• Any error messages you see</li>
          </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-blue-300 mb-2">Console Logs</h4>
                              <p className="text-blue-200 text-sm mb-2">
                                To see detailed error information:
                              </p>
                              <ol className="text-blue-200 text-sm space-y-1 ml-4">
                                <li>1. Press F12 to open browser developer tools</li>
                                <li>2. Click on "Console" tab</li>
                                <li>3. Look for red error messages</li>
                                <li>4. Take a screenshot of any errors</li>
                              </ol>
      </div>
    </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(1deg);
          }
          50% { 
            transform: translateY(-10px) translateX(-5px) rotate(-0.5deg);
          }
          75% { 
            transform: translateY(-30px) translateX(-10px) rotate(0.5deg);
          }
        }

        @keyframes float-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% { 
            transform: translateY(30px) translateX(-10px) rotate(-1deg);
          }
          50% { 
            transform: translateY(10px) translateX(5px) rotate(0.5deg);
          }
          75% { 
            transform: translateY(20px) translateX(10px) rotate(-0.5deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% { 
            transform: translateY(0px);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% { 
            transform: translateY(-25px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes drift {
          0% { 
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
          33% { 
            transform: translateX(30px) translateY(-20px) rotate(2deg);
          }
          66% { 
            transform: translateX(-20px) translateY(10px) rotate(-1deg);
          }
          100% { 
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes grid-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }

        @keyframes scan-vertical {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes scan-horizontal {
          0% {
            transform: translateX(-100vw);
          }
          100% {
            transform: translateX(100vw);
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 25s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 30s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .animate-grid-move {
          animation: grid-move 20s linear infinite;
        }

        .animate-scan-vertical {
          animation: scan-vertical 8s ease-in-out infinite;
        }

        .animate-scan-horizontal {
          animation: scan-horizontal 12s ease-in-out infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 0.6s ease-in-out;
        }

        /* REVOLUTIONARY CURSOR ANIMATIONS */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-quantum {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
            filter: brightness(1.5);
          }
        }

        @keyframes scan-cursor {
          0% { transform: translateY(-50%) translateX(-100%); }
          50% { transform: translateY(-50%) translateX(0%); }
          100% { transform: translateY(-50%) translateX(100%); }
        }

        @keyframes scan-cursor-v {
          0% { transform: translateX(-50%) translateY(-100%); }
          50% { transform: translateX(-50%) translateY(0%); }
          100% { transform: translateX(-50%) translateY(100%); }
        }

        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          10% {
            transform: translate(-1px, 1px);
            filter: hue-rotate(90deg);
          }
          20% {
            transform: translate(1px, -1px);
            filter: hue-rotate(180deg);
          }
          30% {
            transform: translate(-1px, -1px);
            filter: hue-rotate(270deg);
          }
          40% {
            transform: translate(1px, 1px);
            filter: hue-rotate(360deg);
          }
        }

        @keyframes pulse-aura {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
        }

        @keyframes quantum-orbit-0 {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }

        @keyframes quantum-orbit-1 {
          0% { transform: rotate(0deg) translateX(25px) rotate(0deg); }
          100% { transform: rotate(-360deg) translateX(25px) rotate(360deg); }
        }

        @keyframes quantum-orbit-2 {
          0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-pulse-quantum {
          animation: pulse-quantum 1.5s ease-in-out infinite;
        }

        .animate-scan-cursor {
          animation: scan-cursor 2s ease-in-out infinite;
        }

        .animate-scan-cursor-v {
          animation: scan-cursor-v 1.8s ease-in-out infinite;
        }

        .animate-glitch {
          animation: glitch 3s ease-in-out infinite;
        }

        /* HOVER STATE ANIMATIONS */
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse-fast {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-quantum-fast {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1.2);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.3);
            filter: brightness(1.8);
          }
        }

        @keyframes scan-cursor-fast {
          0% { transform: translateY(-50%) translateX(-100%); }
          50% { transform: translateY(-50%) translateX(0%); }
          100% { transform: translateY(-50%) translateX(100%); }
        }

        @keyframes scan-cursor-v-fast {
          0% { transform: translateX(-50%) translateY(-100%); }
          50% { transform: translateX(-50%) translateY(0%); }
          100% { transform: translateX(-50%) translateY(100%); }
        }

        @keyframes glitch-fast {
          0%, 100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          10% {
            transform: translate(-2px, 2px);
            filter: hue-rotate(90deg);
          }
          20% {
            transform: translate(2px, -2px);
            filter: hue-rotate(180deg);
          }
          30% {
            transform: translate(-2px, -2px);
            filter: hue-rotate(270deg);
          }
          40% {
            transform: translate(2px, 2px);
            filter: hue-rotate(360deg);
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes scan-nav {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes scan-nav-v {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(0%); }
          100% { transform: translateY(100%); }
        }

        @keyframes grid-shift {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }

        .animate-spin-fast {
          animation: spin-fast 1s linear infinite;
        }

        .animate-spin-reverse-fast {
          animation: spin-reverse-fast 0.8s linear infinite;
        }

        .animate-pulse-quantum-fast {
          animation: pulse-quantum-fast 0.8s ease-in-out infinite;
        }

        .animate-scan-cursor-fast {
          animation: scan-cursor-fast 1s ease-in-out infinite;
        }

        .animate-scan-cursor-v-fast {
          animation: scan-cursor-v-fast 0.9s ease-in-out infinite;
        }

        .animate-glitch-fast {
          animation: glitch-fast 1.5s ease-in-out infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }

        .animate-scan-nav {
          animation: scan-nav 3s ease-in-out infinite;
        }

        .animate-scan-nav-v {
          animation: scan-nav-v 2.5s ease-in-out infinite;
        }

        /* QR Code Scanning Animation */
        @keyframes scan-qr {
          0% { 
            top: 0;
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          75% {
            opacity: 1;
          }
          100% { 
            top: 100%;
            opacity: 0;
          }
        }

        .animate-scan-qr {
          animation: scan-qr 3s ease-in-out infinite;
        }

        /* Gradient utilities */
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }

        /* Hover scale utilities */
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Responsive text scaling */
        @media (max-width: 768px) {
          .text-responsive {
            font-size: 0.875rem;
          }
        }

        /* Hide scrollbar for custom cursor on large screens */
        ${isLargeScreen ? `
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.1);
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(34, 211, 238, 0.3);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 211, 238, 0.5);
          }
        ` : ''}
      `}</style>
    </div>
  );
};

export default Documentation;