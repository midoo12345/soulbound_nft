import React, { useState, useEffect } from 'react';

const HolographicCertificate = ({ certificateData, isVerifying }) => {
    const [scanLine, setScanLine] = useState(0);
    const [glitchPhase, setGlitchPhase] = useState(0);
    const [particleField, setParticleField] = useState([]);

    useEffect(() => {
        // Create particle field
        const particles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.8 + 0.2
        }));
        setParticleField(particles);

        // Scanning animation
        const scanInterval = setInterval(() => {
            setScanLine(prev => (prev + 2) % 100);
        }, 50);

        // Glitch effect
        const glitchInterval = setInterval(() => {
            setGlitchPhase(prev => (prev + 0.1) % (Math.PI * 2));
        }, 100);

        return () => {
            clearInterval(scanInterval);
            clearInterval(glitchInterval);
        };
    }, []);

    const formatAddress = (address) => {
        if (!address) return "0x0000...0000";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="relative w-full h-full perspective-1000">
            {/* Holographic Container */}
            <div className="relative transform-gpu preserve-3d hover:rotateY-5 transition-transform duration-700 group">
                {/* Outer Hologram Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 rounded-3xl blur-2xl animate-pulse scale-110"></div>
                
                {/* Scanning Beam */}
                <div 
                    className="absolute inset-0 pointer-events-none z-10 rounded-3xl overflow-hidden"
                    style={{
                        background: `linear-gradient(to bottom, transparent ${scanLine}%, rgba(0, 255, 255, 0.3) ${scanLine + 2}%, transparent ${scanLine + 4}%)`
                    }}
                ></div>

                {/* Particle Field */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {particleField.map(particle => (
                        <div
                            key={particle.id}
                            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                            style={{
                                left: `${particle.x}%`,
                                top: `${particle.y}%`,
                                opacity: particle.opacity,
                                animation: `quantumFloat ${3 + particle.id % 3}s infinite ease-in-out ${particle.id * 0.1}s`
                            }}
                        ></div>
                    ))}
                </div>

                {/* Main Certificate */}
                <div className={`relative bg-slate-900/95 border-2 border-cyan-500/60 p-8 rounded-3xl backdrop-blur-xl shadow-2xl transform transition-all duration-500 ${
                    isVerifying ? 'animate-pulse border-green-400/80' : ''
                } ${Math.sin(glitchPhase) > 0.95 ? 'translate-x-1' : ''}`}>
                    
                    {/* Neural Network Border */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
                        <div className="absolute right-0 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-purple-400 to-transparent"></div>
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute top-6 right-6">
                        <div className={`w-4 h-4 rounded-full ${
                            certificateData?.isVerified ? 'bg-green-400' : 'bg-yellow-400'
                        } animate-pulse shadow-lg ${
                            certificateData?.isVerified ? 'shadow-green-400/50' : 'shadow-yellow-400/50'
                        }`}></div>
                    </div>

                    {/* Quantum Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/50 to-purple-600/50 rounded-full blur animate-pulse"></div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        {/* Title */}
                        <h3 className="text-sm font-mono text-cyan-400 uppercase tracking-[0.3em] mb-4 animate-glow">
                            QUANTUM CERTIFICATE PROTOCOL
                        </h3>
                        
                        <p className="text-xs text-slate-400/80 font-mono">AUTHENTICATED ENTITY</p>
                        
                        {/* Student Address */}
                        <div className="relative">
                            <p className="text-2xl font-bold font-mono bg-gradient-to-r from-cyan-400 via-white to-purple-400 text-transparent bg-clip-text mb-2">
                                {formatAddress(certificateData?.student)}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur rounded-lg"></div>
                        </div>
                        
                        <p className="text-xs text-slate-400/80 font-mono">HAS SUCCESSFULLY COMPLETED</p>
                        
                        {/* Course Name */}
                        <h4 className="text-lg font-bold text-white mb-6 tracking-wide">
                            {certificateData?.courseName || "QUANTUM BLOCKCHAIN DEVELOPMENT"}
                        </h4>

                        {/* Data Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-800/60 p-4 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
                                <div className="text-slate-400 mb-2 font-mono">MINT_DATE</div>
                                <div className="text-cyan-300 font-mono text-sm">
                                    {certificateData?.completionDate instanceof Date 
                                        ? certificateData.completionDate.toLocaleDateString()
                                        : certificateData?.completionDate 
                                        ? new Date(certificateData.completionDate).toLocaleDateString()
                                        : new Date().toLocaleDateString()}
                                </div>
                            </div>
                            
                            <div className="bg-slate-800/60 p-4 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                                <div className="text-slate-400 mb-2 font-mono">TOKEN_ID</div>
                                <div className="text-purple-300 font-mono text-sm">#{certificateData?.tokenId || "0x" + Math.random().toString(16).substr(2, 4).toUpperCase()}</div>
                            </div>
                            
                            <div className="bg-slate-800/60 p-4 rounded-xl border border-green-500/30 backdrop-blur-sm">
                                <div className="text-slate-400 mb-2 font-mono">PERFORMANCE</div>
                                <div className="text-green-400 font-bold text-sm">{certificateData?.grade || "98.7"}%</div>
                            </div>
                            
                            <div className="bg-slate-800/60 p-4 rounded-xl border border-yellow-500/30 backdrop-blur-sm">
                                <div className="text-slate-400 mb-2 font-mono">STATUS</div>
                                <div className={`font-bold text-sm ${
                                    certificateData?.isVerified ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                    {certificateData?.isVerified ? 'VERIFIED' : 'PENDING'}
                                </div>
                            </div>
                        </div>

                        {/* Quantum Hash */}
                        <div className="mt-6 p-3 bg-slate-800/40 rounded-lg border border-slate-600/50">
                            <div className="text-xs text-slate-400 mb-1 font-mono">QUANTUM_HASH</div>
                            <div className="text-xs text-cyan-300 font-mono break-all opacity-70">
                                0x{Math.random().toString(16).substr(2, 32)}...{Math.random().toString(16).substr(2, 8)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Verification Nodes */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-levitate">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>

                <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl animate-levitate-delayed">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default HolographicCertificate; 