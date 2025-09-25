import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Lock, Globe, Zap, Wallet, ChevronRight } from 'lucide-react';
import { TECHNOLOGIES } from '../../constants/techStack';

const TechStack = React.memo(({ isMobile }) => {
  const [activeCard, setActiveCard] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const [liveMsg, setLiveMsg] = useState('');

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  }, []);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const id = setInterval(() => {
      setActiveCard((p) => (p + 1) % TECHNOLOGIES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [reducedMotion, paused]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = TECHNOLOGIES[activeCard];
    if (t) setLiveMsg(`Active: ${t.name}, status ${t.status}`);
  }, [activeCard]);

  const handleKeyNav = useCallback((e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveCard((p) => (p + 1) % TECHNOLOGIES.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveCard((p) => (p - 1 + TECHNOLOGIES.length) % TECHNOLOGIES.length);
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full space-y-6" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="text-center">
        <div className="text-gray-400 text-sm font-mono tracking-wider mb-3">› BLOCKCHAIN TECHNOLOGY STACK ‹</div>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent mx-auto"></div>
      </div>

      <div className={`grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3 sm:gap-4 auto-rows-fr`} onKeyDown={handleKeyNav}>
        {TECHNOLOGIES.map((tech, index) => {
          const isActive = activeCard === index;
          const pulse = !reducedMotion && isActive ? 'animate-pulse' : '';
          const Icon = tech.name === 'Soulbound NFTs' ? Lock
            : tech.name === 'IPFS Storage' ? Globe
            : tech.name === 'Smart Contracts' ? Zap
            : Wallet;
          const [tilt, setTilt] = useState({ x: 0, y: 0 });

          const onMove = (e) => {
            if (reducedMotion) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (0.5 - y) * 6;
            const rotateY = (x - 0.5) * 6;
            setTilt({ x: rotateX, y: rotateY });
          };
          const onLeave = () => setTilt({ x: 0, y: 0 });

          return (
            <div
              key={tech.name}
              className="relative w-full group focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-xl"
              tabIndex={0}
              onFocus={() => setActiveCard(index)}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <div
                className={`
                  relative bg-gradient-to-br ${tech.colors.bg}
                  backdrop-blur-sm border ${tech.colors.border}
                  rounded-xl p-4 sm:p-5 transition-all duration-500
                  hover:scale-[1.02] hover:shadow-lg overflow-hidden
                  ${isActive ? 'ring-1 ring-cyan-400/20' : ''}
                  min-h-[150px] sm:min-h-[170px] lg:min-h-[190px] flex flex-col
                `}
                style={!reducedMotion ? { transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : undefined}
              >
                {/* Holographic border overlay */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-20"
                  style={{
                    background: 'conic-gradient(from 180deg at 50% 50%, rgba(59,130,246,0.25), rgba(168,85,247,0.25), rgba(34,197,94,0.25), rgba(59,130,246,0.25))',
                    maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)'
                  }}
                  aria-hidden
                />

                {/* Active ring sweep */}
                {isActive && (
                  <div className="pointer-events-none absolute -inset-1 rounded-[1.1rem] border border-transparent">
                    <div className="absolute inset-0 rounded-[1.1rem] border-2 border-cyan-400/10"></div>
                    <div className="absolute inset-0 rounded-[1.1rem] opacity-30 motion-safe:animate-spin-slow"
                         style={{
                           background: 'conic-gradient(from 0deg, rgba(34,211,238,0.4), rgba(139,92,246,0.0), rgba(34,211,238,0.0))',
                           maskImage: 'radial-gradient(circle at center, transparent 52%, black 53%)'
                         }}
                         aria-hidden />
                  </div>
                )}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${tech.colors.primary}
                      flex items-center justify-center shadow-md ${pulse}
                      transition-all duration-300 text-white
                    `}
                    aria-hidden
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div aria-hidden className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-r ${tech.colors.primary} ${pulse}`}></div>
                </div>

                <div className="space-y-2 sm:space-y-3 flex flex-col items-stretch w-full h-full">
                  <h4
                    className={`
                      text-transparent bg-gradient-to-r ${tech.colors.primary}
                      bg-clip-text font-extrabold text-base sm:text-lg lg:text-xl leading-tight tracking-tight
                      overflow-hidden min-h-[44px] sm:min-h-[48px] lg:min-h-[52px]
                      flex items-end
                    `}
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {tech.name}
                  </h4>

                  

                  {/* Info chips */}
                  <div className="flex flex-nowrap justify-center gap-2 mt-2 sm:mt-3 w-full">
                    <span className="px-2 sm:px-3 md:px-3.5 lg:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-400/20">Secure</span>
                    <span className="px-2 sm:px-3 md:px-3.5 lg:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-mono text-violet-300 bg-violet-500/10 border border-violet-400/20">On‑chain</span>
                    {tech.name === 'IPFS Storage' && (
                      <span className="px-2 sm:px-3 md:px-3.5 lg:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-mono text-amber-300 bg-amber-500/10 border border-amber-400/20">CID</span>
                    )}
                  </div>

                  <div
                    aria-label={`Status: ${tech.status}`}
                    className={`
                      mt-auto inline-flex items-center justify-center self-center px-3 py-1.5 rounded-full
                      border ${tech.colors.border} bg-black/10 backdrop-blur-sm
                    `}
                  >
                    <div aria-hidden className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gradient-to-r ${tech.colors.primary} mr-2 ${pulse}`}></div>
                    <span className={`text-transparent bg-gradient-to-r ${tech.colors.primary} bg-clip-text text-xs font-mono font-semibold`}>
                      {tech.status}
                    </span>
                  </div>
                </div>

                {/* Sheen on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-0"
                  style={{
                    background: 'linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0) 60%)',
                    backgroundSize: '200% 100%'
                  }}
                  aria-hidden
                />

                {/* Micro orbiting particles */}
                <div className="pointer-events-none absolute inset-0 opacity-60 z-0">
                  <div className="absolute left-4 top-4 w-1 h-1 rounded-full bg-cyan-400 motion-safe:animate-orbit"></div>
                  <div className="absolute right-6 bottom-6 w-1 h-1 rounded-full bg-violet-400 motion-safe:animate-orbit-delayed-2"></div>
                  <div className="absolute left-1/2 top-2 w-1 h-1 rounded-full bg-emerald-400 motion-safe:animate-orbit-delayed-3"></div>
                </div>

                {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>}

                {/* Learn more affordance removed per request */}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400/70 rounded-full"></div>
            <span>{TECHNOLOGIES.length} Technologies Active</span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400/70 rounded-full"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TechStack;


