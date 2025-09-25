import React, { useState, useEffect } from 'react';

const FuturisticHeroTitle = ({ isMobile }) => {
    const [letterIndex, setLetterIndex] = useState(0);
    const [showUnderline, setShowUnderline] = useState(false);

    useEffect(() => {
        // Cycle through letters for subtle highlight effect
        const letterInterval = setInterval(() => {
            setLetterIndex(prev => (prev + 1) % 30); // Total letters: BLOCKCHAIN(10) + ACADEMIC(8) + CERTIFICATES(11) = 29
        }, 200);

        // Show underline animation
        const underlineInterval = setInterval(() => {
            setShowUnderline(prev => !prev);
        }, 6000);

        return () => {
            clearInterval(letterInterval);
            clearInterval(underlineInterval);
        };
    }, []);

    const getLetterClass = (index) => {
        return letterIndex === index ? 'text-white drop-shadow-lg scale-110 z-10' : '';
    };

    return (
        <div className="relative w-full">
            {/* Main Title with Creative Typography */}
            <div className="font-black tracking-wide leading-tight text-center relative group">
                {/* Global sheen sweep */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 60%)',
                        backgroundSize: '200% 100%'
                    }}
                    aria-hidden
                />
                
                {/* BLOCKCHAIN - Blue theme */}
                <div className={`${
                    isMobile 
                        ? 'text-3xl sm:text-4xl' 
                        : 'text-5xl md:text-6xl lg:text-7xl'
                } relative mb-2 md:mb-3`}>
                    
                    {/* Background glow effect */}
                    <div className="absolute inset-0 text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text blur-sm opacity-60">
                        BLOCKCHAIN
                    </div>
                    
                    {/* Main text with letter animation */}
                    <div className="relative text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text">
                        {"BLOCKCHAIN".split('').map((letter, index) => (
                            <span
                                key={index}
                                className={`inline-block transition-all duration-300 ease-out ${getLetterClass(index)}`}
                                style={{
                                    textShadow: letterIndex === index ? '0 0 20px rgba(59, 130, 246, 0.8)' : 'none'
                                }}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    
                    {/* Floating accent dots */}
                    <div className="absolute -right-4 top-1/2 w-2 h-2 bg-blue-400 rounded-full motion-safe:animate-pulse"></div>
                    <div className="absolute -left-4 top-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full motion-safe:animate-ping opacity-75"></div>
                </div>

                {/* ACADEMIC - Purple theme */}
                <div className={`${
                    isMobile 
                        ? 'text-3xl sm:text-4xl' 
                        : 'text-5xl md:text-6xl lg:text-7xl'
                } relative mb-2 md:mb-3`}>
                    
                    {/* Background glow effect */}
                    <div className="absolute inset-0 text-transparent bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 bg-clip-text blur-sm opacity-60">
                        ACADEMIC
                    </div>
                    
                    {/* Main text with letter animation */}
                    <div className="relative text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-500 bg-clip-text">
                        {"ACADEMIC".split('').map((letter, index) => (
                            <span
                                key={index + 10}
                                className={`inline-block transition-all duration-300 ease-out ${getLetterClass(index + 10)}`}
                                style={{
                                    textShadow: letterIndex === (index + 10) ? '0 0 20px rgba(139, 92, 246, 0.8)' : 'none'
                                }}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    
                    {/* Academic crown icon */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-6 h-3 border-b-2 border-l border-r border-purple-400 rounded-b-lg opacity-50 motion-safe:animate-pulse"></div>
                    </div>
                </div>

                {/* CERTIFICATES - Cyan theme */}
                <div className={`${
                    isMobile 
                        ? 'text-2xl sm:text-3xl' 
                        : 'text-4xl md:text-5xl lg:text-6xl'
                } relative`}>
                    
                    {/* Background glow effect */}
                    <div className="absolute inset-0 text-transparent bg-gradient-to-r from-cyan-600 via-blue-500 to-violet-600 bg-clip-text blur-sm opacity-60">
                        CERTIFICATES
                    </div>
                    
                    {/* Main text with letter animation */}
                    <div className="relative text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-500 bg-clip-text">
                        {"CERTIFICATES".split('').map((letter, index) => (
                            <span
                                key={index + 18}
                                className={`inline-block transition-all duration-300 ease-out ${getLetterClass(index + 18)}`}
                                style={{
                                    textShadow: letterIndex === (index + 18) ? '0 0 20px rgba(34, 211, 238, 0.8)' : 'none'
                                }}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    
                    {/* Animated underline */}
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-1000 ease-out ${
                        showUnderline ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}></div>
                    
                    {/* Certificate badge icon */}
                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-cyan-400 rounded-full flex items-center justify-center motion-safe:animate-spin-slow">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full motion-safe:animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Subtitle */}
            <div className={`mt-6 md:mt-8 ${
                isMobile 
                    ? 'text-base sm:text-lg px-4' 
                    : 'text-lg md:text-xl lg:text-2xl'
            } text-gray-300 font-light leading-relaxed max-w-4xl mx-auto text-center`}>
                
                {/* Main subtitle with typing effect style */}
                <div className="relative">
                    <span className="text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text font-semibold">
                        Immutable academic credentials
                    </span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className="text-gray-300">
                        powered by blockchain and IPFS
                    </span>
                    
                    {/* Typing cursor effect */}
                    <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-1 motion-safe:animate-pulse"></span>
                </div>
                
                {/* Feature tags */}
                <div className={`mt-4 md:mt-6 ${
                    isMobile 
                        ? 'text-sm space-x-4' 
                        : 'text-base md:text-lg space-x-6'
                } text-gray-400 font-mono tracking-wider`}>
                    <span className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 motion-safe:animate-pulse">
                        SOULBOUND
                    </span>
                    <span className="inline-block px-3 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 motion-safe:animate-pulse" style={{ animationDelay: '0.5s' }}>
                        VERIFIABLE
                    </span>
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 motion-safe:animate-pulse" style={{ animationDelay: '1s' }}>
                        PERMANENT
                    </span>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Corner accents */}
                <div className="absolute top-4 left-1 w-8 h-8 border-l-2 border-t-2 border-blue-400/40 motion-safe:animate-pulse"></div>
                <div className="absolute top-4 right-1 w-8 h-8 border-r-2 border-t-2 border-violet-400/40 motion-safe:animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400/40 motion-safe:animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/40 motion-safe:animate-pulse" style={{ animationDelay: '3s' }}></div>
                
                {/* Floating particles with paths */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full motion-safe:animate-ping opacity-60"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-violet-400 rounded-full motion-safe:animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-cyan-400 rounded-full motion-safe:animate-ping opacity-60" style={{ animationDelay: '4s' }}></div>
            </div>
        </div>
    );
};

export default FuturisticHeroTitle; 