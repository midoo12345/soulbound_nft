import React, { useState, useEffect, useMemo } from 'react';

const AcademicCertificateDisplay = ({ isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [verificationLevel, setVerificationLevel] = useState(85);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    const reducedMotion = useMemo(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
    }, []);

    useEffect(() => {
        const scanInterval = setInterval(() => {
            setScanProgress(prev => (prev + 1) % 100);
        }, 100);

        const verificationInterval = setInterval(() => {
            setVerificationLevel(prev => 80 + Math.random() * 20);
        }, 3000);

        return () => {
            clearInterval(scanInterval);
            clearInterval(verificationInterval);
        };
    }, []);

    const handleMouseMove = (e) => {
        if (isMobile || reducedMotion) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1
        const rotateX = (0.5 - y) * 12; // degrees
        const rotateY = (x - 0.5) * 12; // degrees
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    return (
        <div className="flex items-center justify-center min-h-[600px] relative certificate-display-section">
            {/* Academic Field Background */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-radial from-blue-500/10 via-violet-500/5 to-cyan-500/10 rounded-full animate-pulse-fast"></div>
                
                {/* Verification Rings */}
                <div className="absolute w-96 h-96 border border-blue-400/30 rounded-full animate-spin-slow"></div>
                <div className="absolute w-80 h-80 border border-violet-400/25 rounded-full animate-spin-slow-reverse"></div>
                <div className="absolute w-64 h-64 border border-cyan-400/20 rounded-full animate-orbit"></div>
            </div>

            {/* Main Certificate Container */}
            <div 
                className="group relative transform transition-all duration-700 ease-hologram hover:scale-110"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); handleMouseLeave(); }}
                onMouseMove={handleMouseMove}
                style={!isMobile && !reducedMotion ? { transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : undefined}
            >
                {/* Certificate Card */}
                <div className={`relative w-96 h-80 bg-gradient-to-br from-gray-900/90 via-slate-800/80 to-black/90 border-2 border-blue-400/60 rounded-3xl backdrop-blur-xl shadow-2xl transition-all duration-1000 ease-neural ${isHovered ? 'shadow-blue-500/40' : 'shadow-black/20'}`}>
                    
                    {/* Holographic Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-violet-400/5 to-cyan-400/10 rounded-3xl motion-safe:animate-gradient opacity-60"></div>

                    {/* Sheen sweep */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                         style={{
                             background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 70%)',
                             backgroundSize: '200% 100%'
                         }}
                    />
                    
                    {/* Scanning Effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div 
                            className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-pulse"
                            style={{ 
                                top: `${scanProgress}%`,
                                transition: 'top 0.1s ease-cyber'
                            }}
                        ></div>
                    </div>

                    {/* Data Streams */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-full bg-gradient-to-b from-blue-400/40 via-transparent to-violet-400/40 motion-safe:animate-pulse-fast"
                                style={{
                                    left: `${15 + i * 10}%`,
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '2s'
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Certificate Content */}
                    <div className="relative p-8 h-full flex flex-col z-10">
                        
                        {/* Header */}
                        <div className="flex items-center mb-6">
                            {/* Academic Icon */}
                            <div className="relative mr-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 motion-safe:animate-glow">
                                    <div className="relative">
                                        <div className="w-6 h-6 border-2 border-white rounded-full motion-safe:animate-spin-slow">
                                            <div className="absolute inset-1 bg-white rounded-full motion-safe:animate-pulse-fast"></div>
                                        </div>
                                        <div className="absolute -inset-2 border border-white/30 rounded-full motion-safe:animate-ping-slow"></div>
                                    </div>
                                </div>
                                
                                {/* Verification Connections */}
                                <div className="absolute -right-3 top-1/2 w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent motion-safe:animate-pulse"></div>
                                <div className="absolute -bottom-3 left-1/2 w-px h-8 bg-gradient-to-b from-blue-400 to-transparent motion-safe:animate-pulse"></div>
                            </div>
                            
                            <div>
                                <div className="text-blue-400 text-sm font-bold tracking-wide motion-safe:animate-pulse">ACADEMIC CERTIFICATE</div>
                                <div className="text-white text-lg font-bold">Blockchain Verified</div>
                                <div className="text-cyan-300 text-xs font-mono">SOULBOUND NFT</div>
                            </div>
                        </div>

                        {/* Student Data */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mr-3 motion-safe:animate-pulse-fast"></div>
                                <div className="text-gray-300">Student: <span className="text-white font-semibold">Alex Johnson</span></div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full mr-3 motion-safe:animate-pulse-fast" style={{ animationDelay: '0.3s' }}></div>
                                <div className="text-gray-300">Program: <span className="text-white font-semibold">Computer Science</span></div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-3 motion-safe:animate-pulse-fast" style={{ animationDelay: '0.6s' }}></div>
                                <div className="text-gray-300">Institution: <span className="text-white font-semibold">Tech University</span></div>
                            </div>
                        </div>

                        {/* Verification Visualization */}
                        <div className="mb-6">
                            <div className="text-xs text-gray-400 mb-2 font-mono">VERIFICATION LEVELS</div>
                            <div className="space-y-2">
                                <div className="h-1 bg-gradient-to-r from-blue-400/80 via-cyan-400/60 to-violet-400/40 motion-safe:animate-gradient" style={{ width: `${verificationLevel}%` }}></div>
                                <div className="h-1 bg-gradient-to-r from-violet-400/80 via-purple-400/60 to-indigo-400/40 motion-safe:animate-gradient" style={{ width: `${verificationLevel * 0.8}%`, animationDelay: '0.5s' }}></div>
                                <div className="h-1 bg-gradient-to-r from-cyan-400/80 via-blue-400/60 to-violet-400/40 motion-safe:animate-gradient" style={{ width: `${verificationLevel * 0.9}%`, animationDelay: '1s' }}></div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto border-t border-blue-400/30 pt-4">
                            <div className="flex justify-between items-center">
                                <div className="text-xs font-mono text-gray-400">
                                    Hash: <span className="text-blue-400">0xACADEMIC...2024</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full motion-safe:animate-pulse-fast mr-2 shadow-green-400/50 shadow-lg"></div>
                                    <div className="text-green-400 text-sm font-semibold">VERIFIED</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Corner Academic Brackets */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-400 opacity-60 animate-pulse"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400 opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-violet-400 opacity-60 animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400 opacity-60 animate-pulse"></div>
                </div>

                {/* Floating Academic Particles */}
                {isHovered && (
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-blue-400 rounded-full motion-safe:animate-ping-slow"
                                style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    top: `${20 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`
                                }}
                            ></div>
                        ))}
                    </div>
                )}

                {/* IPFS Academic Badge */}
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-black px-4 py-2 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/30 animate-pulse-fast">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
                        <span>IPFS STORED</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicCertificateDisplay; 