import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FuturisticActionPanel = React.memo(({ roleInfo, isConnected, connectWallet, isMobile, isLoading }) => {
    const [isActivating, setIsActivating] = useState(false);
    const [pulseIndex, setPulseIndex] = useState(0);

    // Optimize animation intervals
    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setPulseIndex(prev => (prev + 1) % 4);
        }, 1000);
        
        return () => clearInterval(pulseInterval);
    }, []); // Empty dependency array is fine for this animation

    // Memoize demo click handler to prevent unnecessary re-renders
    const handleDemoClick = React.useCallback(() => {
        // Scroll to the certificates section
        const certificateSection = document.getElementById('certificates');
        if (certificateSection) {
            certificateSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            // Fallback: try to find it by class name
            const fallbackSection = document.querySelector('.certificate-display-section');
            if (fallbackSection) {
                fallbackSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }, []); // No dependencies needed for DOM manipulation

    // Memoize role data to prevent unnecessary re-computations
    const data = React.useMemo(() => {
        if (!isConnected) {
            return {
                title: 'Wallet Interface',
                subtitle: 'Connect your wallet to access certificates',
                icon: '🔗',
                primary: { text: 'Connect Wallet', action: connectWallet },
                secondary: { text: 'Explore Demo', action: handleDemoClick },
                colors: {
                    bg: 'from-slate-900/90 via-gray-800/80 to-slate-900/90',
                    accent: 'from-blue-500 via-cyan-400 to-blue-600',
                    border: 'border-blue-400/50',
                    glow: 'shadow-blue-500/30',
                    particle: 'bg-blue-400'
                }
            };
        }

        const roleData = {
            admin: {
                title: 'Platform Administrator',
                subtitle: 'Full system management access',
                icon: '👑',
                primary: { text: 'Management Dashboard', link: '/dashboard' },
                secondary: { text: 'Analytics & Reports', link: '/dashboard/analytics' },
                colors: {
                    bg: 'from-purple-900/90 via-violet-800/80 to-indigo-900/90',
                    accent: 'from-purple-500 via-violet-400 to-indigo-500',
                    border: 'border-purple-400/50',
                    glow: 'shadow-purple-500/40',
                    particle: 'bg-purple-400'
                }
            },
            institution: {
                title: 'Educational Institution',
                subtitle: 'Certificate creation and management',
                icon: '🏛️',
                primary: { text: 'Create Certificates', link: '/dashboard' },
                secondary: { text: 'Manage Certificates', link: '/dashboard/certificates' },
                colors: {
                    bg: 'from-blue-900/90 via-cyan-800/80 to-teal-900/90',
                    accent: 'from-blue-500 via-cyan-400 to-teal-500',
                    border: 'border-cyan-400/50',
                    glow: 'shadow-cyan-500/40',
                    particle: 'bg-cyan-400'
                }
            },
            student: {
                title: 'Certificate Holder',
                subtitle: 'View and share your academic credentials',
                icon: '🎓',
                primary: { text: 'View Certificates', link: '/dashboard' },
                secondary: { text: 'Share & Verify', link: '/dashboard/certificates' },
                colors: {
                    bg: 'from-emerald-900/90 via-green-800/80 to-teal-900/90',
                    accent: 'from-emerald-500 via-green-400 to-cyan-500',
                    border: 'border-emerald-400/50',
                    glow: 'shadow-emerald-500/40',
                    particle: 'bg-emerald-400'
                }
            }
        };

        return roleData[roleInfo?.role] || roleData.student;
    }, [isConnected, roleInfo?.role, connectWallet, handleDemoClick]);

    const handleAction = async (action) => {
        if (action) {
            setIsActivating(true);
            await action();
            setTimeout(() => setIsActivating(false), 2000);
        }
    };

    return (
        <div className="relative group w-full">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/10 via-violet-500/5 to-cyan-500/10 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-1000 ease-hologram animate-pulse-slow"></div>
            
            {/* Main Glassmorphism Panel */}
            <div className={`relative bg-gradient-to-br ${data.colors.bg} backdrop-blur-xl border-2 ${data.colors.border} rounded-3xl overflow-hidden ${data.colors.glow} shadow-2xl transition-all duration-700 ease-neural group-hover:scale-[1.02]`}>
                
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                                linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)
                            `
                        }}
                    ></div>
                </div>

                {/* Top Scanning Line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-scanline"></div>

                {/* Content */}
                <div className="relative z-10 p-6 md:p-8">
                    
                    {/* Header with Icon and Status */}
                    <div className="text-center mb-6 md:mb-8">
                        
                        {/* Role Icon with Animation Ring */}
                        <div className="relative inline-block mb-4">
                            <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${data.colors.accent} flex items-center justify-center text-2xl md:text-3xl ${data.colors.glow} shadow-2xl animate-float`}>
                                {data.icon}
                                
                                {/* Rotating Ring */}
                                <div className={`absolute -inset-2 rounded-2xl border-2 border-dashed ${data.colors.border} animate-spin-slow opacity-50`}></div>
                                
                                {/* Pulse Rings */}
                                <div className={`absolute -inset-4 rounded-2xl border ${data.colors.border} animate-ping opacity-20`}></div>
                                <div className={`absolute -inset-6 rounded-2xl border ${data.colors.border} animate-ping opacity-10`} style={{ animationDelay: '1s' }}></div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-center mb-3 md:mb-4">
                            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${data.colors.accent} animate-pulse-fast mr-3 ${data.colors.glow} shadow-lg`}></div>
                            <div className="text-cyan-300 text-xs md:text-sm font-mono tracking-wider uppercase">Access Status</div>
                        </div>

                        {/* Title with Gradient Background */}
                        <div className="relative mb-3 md:mb-4">
                            <div className={`text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r ${data.colors.accent} bg-clip-text tracking-wide animate-gradient`}>
                                {data.title}
                            </div>
                            {/* Underline Effect */}
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r ${data.colors.accent} opacity-60 animate-pulse`}></div>
                        </div>

                        {/* Subtitle */}
                        <div className="text-gray-300 text-sm md:text-base font-light tracking-wide opacity-90 max-w-md mx-auto">
                            {data.subtitle}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 md:space-y-0 md:flex md:space-x-4">
                        
                        {/* Primary Action Button */}
                        {data.primary.action ? (
                            <button
                                onClick={() => handleAction(data.primary.action)}
                                disabled={isLoading}
                                className={`group relative w-full md:flex-1 py-4 px-6 md:px-8 bg-gradient-to-r ${data.colors.accent} text-black font-bold text-base md:text-lg tracking-wider overflow-hidden transform transition-all duration-500 ease-neural hover:scale-105 ${isLoading || isActivating ? 'animate-pulse-fast' : ''} rounded-2xl ${data.colors.glow} shadow-2xl`}
                            >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-quantum"></div>
                                
                                {/* Button Content */}
                                <div className="relative z-10 flex items-center justify-center space-x-2">
                                    {(isLoading || isActivating) && (
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    )}
                                    <span className="font-mono">
                                        {isLoading ? 'CONNECTING...' : isActivating ? 'PROCESSING...' : data.primary.text}
                                    </span>
                                </div>

                                {/* Floating Particles */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow"
                                            style={{
                                                left: `${20 + i * 15}%`,
                                                top: `${30 + Math.random() * 40}%`,
                                                animationDelay: `${i * 0.2}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </button>
                        ) : (
                            <Link
                                to={data.primary.link}
                                className={`group relative w-full md:flex-1 py-4 px-6 md:px-8 bg-gradient-to-r ${data.colors.accent} text-white font-bold text-base md:text-lg tracking-wider overflow-hidden transform transition-all duration-500 ease-neural hover:scale-105 rounded-2xl ${data.colors.glow} shadow-2xl flex items-center justify-center`}
                            >
                                {/* Enhanced shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-quantum"></div>
                                
                                {/* Properly centered button content */}
                                <span className="relative z-10 font-medium text-center">{data.primary.text}</span>

                                {/* Floating Particles */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping-slow"
                                            style={{
                                                left: `${20 + i * 15}%`,
                                                top: `${30 + Math.random() * 40}%`,
                                                animationDelay: `${i * 0.2}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </Link>
                        )}
                        
                        {/* Secondary Action Button */}
                        {data.secondary.action ? (
                            <button
                                onClick={data.secondary.action}
                                className={`group relative w-full md:flex-1 py-4 px-6 md:px-8 border-2 ${data.colors.border} bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 font-semibold text-base md:text-lg tracking-wide rounded-xl hover:scale-105 overflow-hidden`}
                            >
                                {/* Subtle hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                
                                <div className="relative z-10 flex items-center justify-center space-x-2">
                                    <span className="font-medium">{data.secondary.text}</span>
                                    <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-110 transition-all duration-300"></div>
                                </div>
                            </button>
                        ) : (
                            <Link
                                to={data.secondary.link}
                                className={`group relative w-full md:flex-1 py-4 px-6 md:px-8 border-2 ${data.colors.border} bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 font-semibold text-base md:text-lg tracking-wide rounded-xl text-center hover:scale-105 overflow-hidden`}
                            >
                                {/* Subtle hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                
                                <div className="relative z-10 flex items-center justify-center space-x-2">
                                    <span className="font-medium">{data.secondary.text}</span>
                                    <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-110 transition-all duration-300"></div>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Corner Accents with Pulse Animation */}
                <div className="absolute top-4 left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 md:border-l-3 border-t-2 md:border-t-3 border-cyan-400 opacity-60 animate-pulse" style={{ animationDelay: `${pulseIndex * 0.25}s` }}></div>
                <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 md:border-r-3 border-t-2 md:border-t-3 border-violet-400 opacity-60 animate-pulse" style={{ animationDelay: `${(pulseIndex + 1) * 0.25}s` }}></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 md:w-8 md:h-8 border-l-2 md:border-l-3 border-b-2 md:border-b-3 border-blue-400 opacity-60 animate-pulse" style={{ animationDelay: `${(pulseIndex + 2) * 0.25}s` }}></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 md:w-8 md:h-8 border-r-2 md:border-r-3 border-b-2 md:border-b-3 border-purple-400 opacity-60 animate-pulse" style={{ animationDelay: `${(pulseIndex + 3) * 0.25}s` }}></div>

                {/* Floating Data Particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: isMobile ? 6 : 8 }).map((_, i) => (
                        <div
                            key={i}
                            className={`absolute w-0.5 h-0.5 ${data.colors.particle} rounded-full animate-float opacity-40`}
                            style={{
                                left: `${10 + Math.random() * 80}%`,
                                top: `${10 + Math.random() * 80}%`,
                                animationDelay: `${i * 0.7}s`,
                                animationDuration: `${4 + Math.random() * 2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
});

// Add display name for debugging
FuturisticActionPanel.displayName = 'FuturisticActionPanel';

export default FuturisticActionPanel; 