import React, { useState, useEffect } from 'react';
import useBlockchainStats from '../../hooks/useBlockchainStats';
import useInstitutionStats from '../../hooks/useInstitutionStats';
import useWalletRoles from '../../hooks/useWalletRoles';

const AcademicStatsDisplay = ({ isMobile }) => {
    const [activeOrb, setActiveOrb] = useState(0);
    const [verificationLevels, setVerificationLevels] = useState([100, 95, 98]);
    const [screenSize, setScreenSize] = useState('lg'); // Default to large screen

    // Handle responsive screen size
    useEffect(() => {
        const updateScreenSize = () => {
            if (typeof window !== 'undefined') {
                const width = window.innerWidth;
                if (width >= 1536) {
                    setScreenSize('2xl');
                } else if (width >= 1280) {
                    setScreenSize('xl');
                } else if (width >= 1024) {
                    setScreenSize('lg');
                } else if (width >= 768) {
                    setScreenSize('md');
                } else {
                    setScreenSize('sm');
                }
            }
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    // Fetch real blockchain data using the same hooks as Analytics
    const { 
        totalCertificates, 
        verifiedCertificates, 
        pendingCertificates,
        revokedCertificates,
        isConnectedToBlockchain,
        connectionHealth,
        realtimeActivity,
        loading: blockchainLoading 
    } = useBlockchainStats();

    // Get institution stats for verification rate and accurate institution count
    const { contract, roleConstants } = useWalletRoles();
    const { stats: institutionStats } = useInstitutionStats(contract, roleConstants);

    // Calculate real verification rate from blockchain data
    const realVerificationRate = totalCertificates > 0 
        ? Math.round((verifiedCertificates / totalCertificates) * 100)
        : 0;

    // Use real data instead of fake stats - use institutionStats for accurate institution count
    const realStats = {
        certificates: totalCertificates || 0,
        institutions: roleConstants?.INSTITUTION_ROLE ? (institutionStats.totalInstitutions || 0) : 1, // Fallback to 1 if roleConstants not ready
        verification: realVerificationRate || 0
    };

    // Update verification levels with real data
    useEffect(() => {
        if (isConnectedToBlockchain && !blockchainLoading) {
            setVerificationLevels([
                realVerificationRate,
                Math.min(100, realVerificationRate + Math.floor(Math.random() * 10)),
                Math.min(100, realVerificationRate + Math.floor(Math.random() * 5))
            ]);
        }
    }, [realVerificationRate, isConnectedToBlockchain, blockchainLoading]);

    useEffect(() => {
        const orbInterval = setInterval(() => {
            setActiveOrb(prev => (prev + 1) % 3);
        }, 4000);

        // Update verification levels more frequently when connected
        const verificationInterval = setInterval(() => {
            if (isConnectedToBlockchain && !blockchainLoading) {
                setVerificationLevels(prev => prev.map(() => 
                    Math.max(realVerificationRate - 5, Math.min(100, realVerificationRate + Math.floor(Math.random() * 10)))
                ));
            }
        }, 3000);

        return () => {
            clearInterval(orbInterval);
            clearInterval(verificationInterval);
        };
    }, [isConnectedToBlockchain, blockchainLoading, realVerificationRate]);

    // Helper functions for responsive sizing
    const getSize = (sizeMap) => {
        return sizeMap[screenSize] || sizeMap.lg;
    };

    const getOrbRadius = () => {
        const radiusMap = {
            '2xl': 250,
            'xl': 220,
            'lg': 180,
            'md': 160,
            'sm': 140
        };
        return isMobile ? 140 : getSize(radiusMap);
    };

    const getOrbSize = () => {
        const sizeMap = {
            '2xl': 'w-44 h-44',
            'xl': 'w-40 h-40',
            'lg': 'w-36 h-36',
            'md': 'w-32 h-32',
            'sm': 'w-28 h-28'
        };
        return getSize(sizeMap);
    };

    const getTextSize = () => {
        const sizeMap = {
            '2xl': 'text-2xl',
            'xl': 'text-xl',
            'lg': 'text-xl',
            'md': 'text-lg',
            'sm': 'text-base'
        };
        return getSize(sizeMap);
    };

    const getSubTextSize = () => {
        const sizeMap = {
            '2xl': 'text-sm',
            'xl': 'text-sm',
            'lg': 'text-xs',
            'md': 'text-xs',
            'sm': 'text-xs'
        };
        return getSize(sizeMap);
    };

    const orbData = [
        {
            value: blockchainLoading ? '━━━' : realStats.certificates.toLocaleString(),
            label: 'ACADEMIC CERTIFICATES',
            sublabel: 'BLOCKCHAIN SECURED',
            colors: {
                primary: 'from-blue-500 to-cyan-500',
                secondary: 'from-blue-400/20 to-cyan-400/20',
                glow: 'shadow-blue-500/40',
                particle: 'bg-blue-400'
            }
        },
        {
            value: blockchainLoading ? '━━━' : realStats.institutions,
            label: 'VERIFIED INSTITUTIONS',
            sublabel: 'TRUSTED ISSUERS',
            colors: {
                primary: 'from-violet-500 to-purple-500',
                secondary: 'from-violet-400/20 to-purple-400/20',
                glow: 'shadow-violet-500/40',
                particle: 'bg-violet-400'
            }
        },
        {
            value: blockchainLoading ? '━━━' : `${realStats.verification}%`,
            label: 'VERIFICATION RATE',
            sublabel: 'AUTHENTICITY CHECK',
            colors: {
                primary: 'from-emerald-500 to-cyan-500',
                secondary: 'from-emerald-400/20 to-cyan-400/20',
                glow: 'shadow-emerald-500/40',
                particle: 'bg-emerald-400'
            }
        }
    ];

    return (
        <div className="relative min-h-[500px] flex items-center justify-center">
            {/* Central Solar System */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Space Nebula Background */}
                <div className={`absolute ${screenSize === '2xl' ? 'w-[32rem] h-[32rem]' : screenSize === 'xl' ? 'w-[30rem] h-[30rem]' : 'w-96 h-96'} bg-gradient-radial from-yellow-400/15 via-orange-500/12 to-red-500/10 rounded-full blur-3xl`}></div>
                <div className={`absolute ${screenSize === '2xl' ? 'w-[28rem] h-[28rem]' : screenSize === 'xl' ? 'w-[26rem] h-[26rem]' : 'w-80 h-80'} bg-gradient-radial from-orange-400/10 via-yellow-500/8 to-transparent rounded-full blur-2xl`}></div>
                
                {/* Solar Corona Rings */}
                <div className={`absolute ${screenSize === '2xl' ? 'w-[24rem] h-[24rem]' : screenSize === 'xl' ? 'w-[22rem] h-[22rem]' : 'w-80 h-80'} border border-yellow-400/15 rounded-full animate-spin-slow`}></div>
                <div className={`absolute ${screenSize === '2xl' ? 'w-[20rem] h-[20rem]' : screenSize === 'xl' ? 'w-[18rem] h-[18rem]' : 'w-60 h-60'} border border-orange-400/12 rounded-full animate-spin-slow`} style={{ animationDirection: 'reverse', animationDuration: '8s' }}></div>
                <div className={`absolute ${screenSize === '2xl' ? 'w-[16rem] h-[16rem]' : screenSize === 'xl' ? 'w-[14rem] h-[14rem]' : 'w-40 h-40'} border border-red-400/10 rounded-full animate-spin-slow`} style={{ animationDuration: '6s' }}></div>
                
                {/* Solar Flares */}
                <div className={`absolute ${screenSize === '2xl' ? 'w-[22rem] h-[22rem]' : screenSize === 'xl' ? 'w-[20rem] h-[20rem]' : 'w-72 h-72'} opacity-15`}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-8 bg-gradient-to-b from-yellow-400/50 to-transparent"
                            style={{
                                left: '50%',
                                top: '50%',
                                transform: `translateX(-50%) translateY(-50%) rotate(${i * 45}deg)`
                            }}
                        ></div>
                    ))}
                </div>
                
                {/* Central Sun Core */}
                <div className={`absolute ${screenSize === '2xl' ? 'w-[12rem] h-[12rem]' : screenSize === 'xl' ? 'w-[10rem] h-[10rem]' : 'w-32 h-32'} bg-gradient-radial from-yellow-300/60 via-orange-400/50 to-red-500/40 rounded-full`}></div>
                <div className={`absolute ${screenSize === '2xl' ? 'w-[8rem] h-[8rem]' : screenSize === 'xl' ? 'w-[6rem] h-[6rem]' : 'w-24 h-24'} bg-gradient-radial from-yellow-200/70 via-yellow-300/60 to-orange-400/50 rounded-full`}></div>
            </div>

            {/* Floating Stats System */}
            <div className="relative">
                {/* Active Orb Connections */}
                {orbData.map((orb, index) => {
                    const angle = (index * 120) - 90;
                    const radius = getOrbRadius();
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    const isActive = activeOrb === index;
                    
                    if (!isActive) return null;
                    
                    return (
                        <div key={`connection-${index}`} className="absolute inset-0 pointer-events-none">
                            
                            
                            
                            {/* Central Gravitational Core */}
                            <div 
                                className={`absolute w-6 h-6 bg-gradient-to-br ${orb.colors.primary} opacity-80 rounded-full animate-pulse-fast`}
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translateX(-50%) translateY(-50%)',
                                    boxShadow: `0 0 25px ${orb.colors.primary.replace('from-', '').replace(' to-', '')}, 0 0 50px ${orb.colors.primary.replace('from-', '').replace(' to-', '')}`
                                }}
                            ></div>
                        </div>
                    );
                })}
                
                {orbData.map((orb, index) => {
                    const angle = (index * 120) - 90; // 120 degrees apart
                    const radius = getOrbRadius(); // Use responsive radius
                    const x = Math.cos(angle * Math.PI / 180) * radius;
                    const y = Math.sin(angle * Math.PI / 180) * radius;
                    const isActive = activeOrb === index;

                    return (
                        <div
                            key={index}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-hologram ${isActive ? 'scale-125 z-20' : 'scale-100 z-10'}`}
                            style={{
                                left: `calc(50% + ${x}px)`,
                                top: `calc(50% + ${y}px)`
                            }}
                        >
                            {/* Planet Container */}
                            <div className={`relative ${getOrbSize()} rounded-full ${isActive ? 'animate-glow' : 'animate-pulse'} backdrop-blur-xl`} style={{
                                background: index === 0 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)' : 
                                           index === 1 ? 'linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9)' : 
                                           'linear-gradient(135deg, #10b981, #059669, #047857)',
                                boxShadow: isActive ? `0 0 30px ${index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#10b981'}, 0 0 60px ${index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#10b981'}` : '0 0 20px rgba(0,0,0,0.3)'
                            }}>
                                
                                {/* Planet Surface Details */}
                                <div className="absolute inset-2 rounded-full opacity-30">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute bg-white/20 rounded-full animate-pulse-slow"
                                            style={{
                                                width: `${8 + Math.random() * 4}px`,
                                                height: `${8 + Math.random() * 4}px`,
                                                left: `${20 + Math.random() * 60}%`,
                                                top: `${20 + Math.random() * 60}%`,
                                                animationDelay: `${i * 0.5}s`,
                                                animationDuration: `${3 + Math.random() * 2}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                                
                                {/* Planet Atmosphere */}
                                <div className={`absolute inset-1 rounded-full bg-gradient-radial ${orb.colors.secondary} animate-pulse-fast opacity-40`}></div>
                                
                                {/* Data Display */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                                    <div className={`text-white font-black ${getTextSize()} font-mono mb-1 animate-gradient`}>
                                        {orb.value}
                                    </div>
                                    <div className={`text-white/90 ${getSubTextSize()} font-mono tracking-wider leading-tight`}>
                                        {orb.label}
                                    </div>
                                    <div className={`text-white/70 ${getSubTextSize()} font-mono tracking-wide mt-1`}>
                                        {orb.sublabel}
                                    </div>
                                </div>

                                {/* Verification Level Indicator */}
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                                    <div className="w-20 h-1 bg-black/30 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r from-white/60 to-white/90 transition-all duration-1000 ease-neural`}
                                            style={{ width: `${verificationLevels[index]}%` }}
                                        ></div>
                                    </div>
                                </div>

                                
                                {/* Space Debris */}
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white/40 rounded-full animate-ping-slow"
                                        style={{
                                            left: `${-15 + Math.random() * 30}px`,
                                            top: `${-15 + Math.random() * 30}px`,
                                            animationDelay: `${i * 0.8}s`,
                                            animationDuration: `${2 + Math.random() * 1}s`
                                        }}
                                    ></div>
                                ))}
                                
                                {/* Active Planet Glow */}
                                {isActive && (
                                    <div className={`absolute -inset-6 rounded-full border-2 border-dashed ${orb.colors.primary} opacity-60 animate-spin-slow`}></div>
                                )}

                                {/* Data Particles */}
                                {isActive && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`absolute w-1 h-1 ${orb.colors.particle} rounded-full animate-ping-slow`}
                                                style={{
                                                    left: `${-20 + Math.random() * 140}%`,
                                                    top: `${-20 + Math.random() * 140}%`,
                                                    animationDelay: `${i * 0.3}s`,
                                                    animationDuration: `${2 + Math.random() * 2}s`
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Holographic Data Field */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Floating Data Nodes */}
                                {isActive && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 8 }).map((_, i) => {
                                            const nodeAngle = (i * 45) + (index * 120);
                                            const nodeRadius = 60 + Math.sin(Date.now() * 0.001 + i) * 10;
                                            const nodeX = Math.cos(nodeAngle * Math.PI / 180) * nodeRadius;
                                            const nodeY = Math.sin(nodeAngle * Math.PI / 180) * nodeRadius;
                                            
                                            return (
                                                <div
                                                    key={i}
                                                    className={`absolute w-2 h-2 ${orb.colors.particle} rounded-full animate-pulse-slow`}
                                                    style={{
                                                        left: `calc(50% + ${nodeX}px)`,
                                                        top: `calc(50% + ${nodeY}px)`,
                                                        animationDelay: `${i * 0.2}s`,
                                                        animationDuration: `${1 + Math.random() * 0.5}s`,
                                                        opacity: 0.7 + Math.random() * 0.3
                                                    }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* Energy Vortex */}
                                {isActive && (
                                    <div className="absolute inset-0">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`absolute border border-${orb.colors.primary.split('-')[1]}-400 rounded-full animate-spin-slow`}
                                                style={{
                                                    width: `${30 + i * 20}px`,
                                                    height: `${30 + i * 20}px`,
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: `translateX(-50%) translateY(-50%)`,
                                                    animationDelay: `${i * 0.3}s`,
                                                    animationDuration: `${3 + i * 0.5}s`,
                                                    opacity: 0.3 - i * 0.05,
                                                    borderStyle: 'dashed'
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                                
                                
                                {/* Holographic Grid */}
                                {isActive && (
                                    <div className="absolute inset-0 opacity-20">
                                        <div 
                                            className={`absolute inset-0 border border-${orb.colors.primary.split('-')[1]}-400`}
                                            style={{
                                                borderRadius: '50%',
                                                animation: 'gridPulse 3s ease-in-out infinite'
                                            }}
                                        ></div>
                                        <div 
                                            className={`absolute inset-4 border border-${orb.colors.primary.split('-')[1]}-400`}
                                            style={{
                                                borderRadius: '50%',
                                                animation: 'gridPulse 3s ease-in-out infinite',
                                                animationDelay: '0.5s'
                                            }}
                                        ></div>
                                        <div 
                                            className={`absolute inset-8 border border-${orb.colors.primary.split('-')[1]}-400`}
                                            style={{
                                                borderRadius: '50%',
                                                animation: 'gridPulse 3s ease-in-out infinite',
                                                animationDelay: '1s'
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Central Sun */}
                <div className={`relative ${screenSize === '2xl' ? 'w-32 h-32' : screenSize === 'xl' ? 'w-28 h-28' : 'w-24 h-24'} rounded-full bg-gradient-radial from-yellow-400/40 via-orange-500/35 to-red-600/30`} style={{
                    boxShadow: `${isConnectedToBlockchain ? '0 0 8px #fbbf24/20, 0 0 15px #f59e0b/15' : '0 0 5px #fbbf24/15, 0 0 10px #f59e0b/10'}`,
                    filter: 'blur(0.5px)'
                }}>
                    {/* Solar Core */}
                    <div className={`${screenSize === '2xl' ? 'w-20 h-20' : screenSize === 'xl' ? 'w-18 h-18' : 'w-16 h-16'} bg-gradient-radial from-yellow-300/70 via-yellow-400/60 to-orange-500/50 rounded-full flex items-center justify-center`}>
                        <div className={`${screenSize === '2xl' ? 'w-10 h-10' : screenSize === 'xl' ? 'w-9 h-9' : 'w-8 h-8'} bg-gradient-radial from-yellow-200/80 via-yellow-300/70 to-yellow-400/60 rounded-full animate-spin-slow flex items-center justify-center`}>
                            <div className={`${screenSize === '2xl' ? 'w-4 h-4' : 'w-3 h-3'} ${isConnectedToBlockchain ? 'bg-yellow-300/80' : 'bg-yellow-400/70'} rounded-full`}></div>
                        </div>
                    </div>
                    
                    {/* Solar Flares */}
                    {isConnectedToBlockchain && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-yellow-400/20 animate-ping-slow"></div>
                            <div className="absolute -inset-2 rounded-full border border-orange-400/15 animate-ping-slow" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute -inset-4 rounded-full border border-red-400/10 animate-ping-slow" style={{ animationDelay: '2s' }}></div>
                        </>
                    )}
                    
                    {/* Solar Wind */}
                    <div className="absolute inset-0">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-2 bg-gradient-to-b from-yellow-400/40 to-transparent"
                                style={{
                                    left: '50%',
                                    top: '50%',
                                    transform: `translateX(-50%) translateY(-50%) rotate(${i * 45}deg) translateY(-15px)`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AcademicStatsDisplay; 