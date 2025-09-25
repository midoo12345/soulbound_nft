import React, { useState, useEffect } from 'react';
import { usePageSwipe } from '../animations/PageSwipe/PageSwipeProvider';

const HowItWorks = () => {
    const [activeStep, setActiveStep] = useState(0);
    
    // Global page swipe animation hook
    const { isAnimating, triggerPageSwipe } = usePageSwipe();

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            number: "01",
            title: "Connect Academic Wallet",
            description: "Link your Ethereum wallet to access the academic certificate platform. Verify your institutional credentials to start issuing blockchain-verified certificates.",
            gradient: "from-blue-500 to-cyan-500",
            bgColor: "from-blue-900/20 to-cyan-900/10",
            borderColor: "border-blue-400/30",
            icon: "🔗",
            features: ["Institutional Verification", "Role-based Access", "Secure Authentication"]
        },
        {
            number: "02",
            title: "Create Academic Certificate",
            description: "Design professional academic certificates with our intuitive editor. Add student details, course information, and institutional branding with customizable templates.",
            gradient: "from-violet-500 to-purple-500",
            bgColor: "from-violet-900/20 to-purple-900/10",
            borderColor: "border-violet-400/30",
            icon: "🎓",
            features: ["Professional Templates", "Student Details", "Institutional Branding"]
        },
        {
            number: "03",
            title: "Mint & Verify Certificate",
            description: "Mint your certificate as a soulbound NFT on the blockchain. Students can instantly verify their credentials, and institutions can manage certificate lifecycle.",
            gradient: "from-emerald-500 to-cyan-500",
            bgColor: "from-emerald-900/20 to-cyan-900/10",
            borderColor: "border-emerald-400/30",
            icon: "⚡",
            features: ["Soulbound NFT", "Instant Verification", "IPFS Storage"]
        }
    ];

    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 relative overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
                    <div className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
                        <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                        <span className="text-blue-400 text-sm sm:text-base font-mono tracking-wider">ACADEMIC PLATFORM</span>
                        <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                    </div>
                    
                    <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-black leading-tight mb-6 sm:mb-8 max-w-4xl mx-auto">
                        <span className="text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text">
                            How It Works
                        </span>
                    </h2>
                    
                    <p className="max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-4xl mx-auto text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl leading-relaxed text-gray-300 px-2 sm:px-4">
                        Transform academic credentials into verifiable blockchain certificates in three simple steps. 
                        <br className="block sm:hidden" />
                        <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text font-semibold"> 
                            Secure, permanent, and instantly verifiable.
                        </span>
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-10 xl:gap-12 lg:items-stretch">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group flex">
                            {/* Connecting Lines */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-emerald-400/30 z-0"></div>
                            )}
                            
                            {/* Modern Step Card */}
                            <div className="relative group flex-1 flex flex-col">
                                {/* Card Background Effects */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-white/2 to-transparent backdrop-blur-sm" />
                                <div className={`absolute -inset-1 bg-gradient-to-r ${step.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700`} />
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.gradient} rounded-3xl opacity-10 group-hover:opacity-30 transition-all duration-500`} />
                                
                                {/* Glassmorphism Card */}
                                <div className={`
                                    relative p-6 xs:p-7 sm:p-8 md:p-9 lg:p-10 xl:p-11 rounded-3xl backdrop-blur-2xl border border-white/10
                                    transition-all duration-500 group-hover:border-white/20
                                    transform group-hover:-translate-y-2 group-hover:scale-[1.01]
                                    bg-gradient-to-br from-white/10 via-white/5 to-transparent
                                    shadow-2xl group-hover:shadow-4xl
                                    overflow-hidden flex flex-col h-full
                                    ${activeStep === index ? 'border-white/30 shadow-3xl' : ''}
                                `}>
                                    {/* Floating Background Orbs */}
                                    <div className={`absolute top-4 right-4 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-28 lg:h-28 xl:w-28 xl:h-28 bg-gradient-to-r ${step.gradient} rounded-full opacity-5 blur-2xl transition-all duration-700 group-hover:scale-125 group-hover:opacity-10`} />
                                    <div className={`absolute bottom-4 left-4 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-20 lg:h-20 xl:w-20 xl:h-20 bg-gradient-to-r ${step.gradient} rounded-full opacity-5 blur-2xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-10`} />
                                
                                    {/* Modern Step Header */}
                                    <div className="relative z-10 flex items-center justify-between mb-6 sm:mb-7 lg:mb-8">
                                        <div className="relative">
                                            <span className={`text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-6xl font-black tracking-tight leading-none bg-gradient-to-r ${step.gradient} text-transparent bg-clip-text drop-shadow-lg`}>
                                                {step.number}
                                            </span>
                                            <span className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-20 blur-xl -z-10`}></span>
                                        </div>
                                        
                                        {/* Modern Icon Container */}
                                        <div className={`
                                            relative w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-24 xl:h-24 
                                            rounded-2xl bg-gradient-to-br ${step.bgColor} border border-white/20
                                            flex items-center justify-center text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl 
                                            shadow-xl backdrop-blur-sm overflow-hidden
                                            transform group-hover:rotate-12 group-hover:scale-110 
                                            transition-all duration-500
                                            ${activeStep === index ? 'scale-110 rotate-6' : ''}
                                        `}>
                                            <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-10`} />
                                            <div className="relative z-10">
                                                {step.icon}
                                            </div>
                                            <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                                        </div>
                                    </div>

                                    {/* Modern Step Content */}
                                    <div className="relative z-10 space-y-4 sm:space-y-5 lg:space-y-6 flex-1 flex flex-col">
                                        {/* Enhanced Title */}
                                        <h3 className="relative">
                                            <span className={`
                                                block text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-tight mb-3
                                                ${activeStep === index 
                                                    ? `bg-gradient-to-r ${step.gradient} text-transparent bg-clip-text` 
                                                    : 'text-white group-hover:text-gray-200'
                                                } transition-all duration-300
                                            `}>
                                                {step.title}
                                            </span>
                                            
                                            {/* Dynamic Underline */}
                                            <div className="relative">
                                                <div className={`h-1.5 bg-gradient-to-r ${step.gradient} rounded-full transform ${
                                                    activeStep === index ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                                } origin-left transition-transform duration-500`} />
                                                <div className={`absolute top-0 h-1.5 w-full bg-gradient-to-r ${step.gradient} rounded-full blur-sm opacity-0 ${
                                                    activeStep === index ? 'opacity-60' : 'group-hover:opacity-60'
                                                } transition-opacity duration-500`} />
                                            </div>
                                        </h3>
                                        
                                        {/* Enhanced Description */}
                                        <p className="text-base xs:text-lg sm:text-lg md:text-xl lg:text-xl xl:text-xl text-gray-300/90 group-hover:text-white/95 transition-all duration-300 leading-relaxed font-light tracking-wide">
                                            {step.description}
                                        </p>

                                        {/* Modern Features List */}
                                        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 mt-auto">
                                            {step.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center space-x-3 sm:space-x-4 group/feature">
                                                    <div className={`
                                                        relative w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 xl:w-3 xl:h-3 rounded-full 
                                                        bg-gradient-to-r ${step.gradient} 
                                                        transform group-hover/feature:scale-125 transition-transform duration-300
                                                        shadow-lg
                                                    `}>
                                                        <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-full blur-sm opacity-50`}></div>
                                                    </div>
                                                    <span className="text-sm sm:text-base lg:text-base xl:text-lg text-gray-400 group-hover/feature:text-gray-300 font-medium transition-colors duration-300">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Modern Active Indicator */}
                                    <div className="absolute bottom-0 left-0 right-0">
                                        {/* Modern Gradient Line */}
                                        <div className={`h-1 bg-gradient-to-r ${step.gradient} transform ${
                                            activeStep === index ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        } origin-left transition-transform duration-700`} />
                                        
                                        {/* Corner Accents */}
                                        <div className={`absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-r ${step.gradient} opacity-0 ${
                                            activeStep === index ? 'opacity-30' : 'group-hover:opacity-30'
                                        } transition-opacity duration-500 transform rotate-45 -translate-x-4 translate-y-4`} />
                                        <div className={`absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r ${step.gradient} opacity-0 ${
                                            activeStep === index ? 'opacity-30' : 'group-hover:opacity-30'
                                        } transition-opacity duration-500 transform rotate-45 translate-x-4 translate-y-4`} />
                                    </div>
                                    
                                    {/* Modern Shimmer Effect */}
                                    <div className={`absolute inset-0 opacity-0 ${
                                        activeStep === index ? 'opacity-100' : 'group-hover:opacity-100'
                                    } transition-opacity duration-500`}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Futuristic CTA Section */}
                <div className="mt-12 sm:mt-16 lg:mt-20 flex flex-col items-center gap-6 sm:gap-8">
                    {/* Ultra-Futuristic Button */}
                    <div className="relative group perspective-1000">
                        {/* Holographic Field */}
                        <div className="absolute -inset-8 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                            <div className="absolute inset-0 bg-gradient-conic from-cyan-400 via-blue-500 via-purple-500 via-pink-500 to-cyan-400 rounded-full blur-2xl opacity-20 animate-spin-slow" />
                            <div className="absolute inset-4 bg-gradient-conic from-blue-400 via-purple-400 via-cyan-400 to-blue-400 rounded-full blur-xl opacity-30 animate-spin-slow-reverse" />
                        </div>
                        
                        {/* Neural Network Background */}
                        <div className="absolute -inset-6 opacity-0 group-hover:opacity-60 transition-all duration-1500">
                            <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full animate-float" style={{animationDelay: '0s'}} />
                            <div className="absolute top-4 right-2 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{animationDelay: '0.5s'}} />
                            <div className="absolute bottom-2 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-float" style={{animationDelay: '1s'}} />
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-pink-400 rounded-full animate-float" style={{animationDelay: '1.5s'}} />
                            
                            {/* Neural Connection Lines */}
                            <svg className="absolute inset-0 w-full h-full opacity-40">
                                <defs>
                                    <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.8"/>
                                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6"/>
                                        <stop offset="100%" stopColor="#f472b6" stopOpacity="0.8"/>
                                    </linearGradient>
                                </defs>
                                <path d="M 10 10 Q 50 30 90 20" stroke="url(#neural-gradient)" strokeWidth="1" fill="none" className="animate-pulse" />
                                <path d="M 20 80 Q 60 60 100 90" stroke="url(#neural-gradient)" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                            </svg>
                        </div>
                        
                        {/* Quantum Distortion Field */}
                        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-sm" />
                        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 blur-xl opacity-0 group-hover:opacity-80 transition-all duration-1000" />
                        
                        {/* Holographic Button Container */}
                        <div className="relative transform-gpu group-hover:rotateX-2 group-hover:rotateY-2 transition-transform duration-700">
                            {/* Energy Core */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            
                            {/* Main Holographic Surface */}
                            <button
                                onClick={() => triggerPageSwipe('/docs')}
                                disabled={isAnimating}
                                className="relative inline-flex items-center justify-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 px-4 xs:px-6 sm:px-8 md:px-10 lg:px-12 py-3 xs:py-4 sm:py-5 md:py-6 lg:py-7 rounded-2xl xs:rounded-3xl backdrop-blur-3xl border-2 border-cyan-400/30 text-white shadow-2xl hover:shadow-cyan-500/50 bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 transform hover:-translate-y-2 hover:scale-105 transition-all duration-700 overflow-hidden group relative disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{
                                    background: `
                                        linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(139,92,246,0.1) 50%, rgba(244,114,182,0.1) 100%),
                                        linear-gradient(45deg, rgba(0,0,0,0.8) 0%, rgba(17,24,39,0.6) 100%)
                                    `
                                }}
                            >
                                {/* Scanning Lines */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line" />
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan-line" style={{animationDelay: '1s'}} />
                                </div>
                                
                                {/* Holographic Distortion */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-2000" />
                                </div>
                                
                                {/* Left Icon Container */}
                                <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                                    <div className="relative w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-xl xs:rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center backdrop-blur-lg transform group-hover:rotate-45 group-hover:scale-125 transition-all duration-700 overflow-hidden">
                                        {/* Icon Energy Core */}
                                        <div className="absolute inset-0 bg-gradient-conic from-cyan-400/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
                                        
                                        {/* Futuristic Document Icon */}
                                        <svg className="relative w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-cyan-400 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        
                                        {/* Icon Particle Effects */}
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" />
                                    </div>
                                </div>
                                
                                {/* Holographic Text */}
                                <div className="relative flex flex-col flex-1 text-center">
                                    <span className="font-black tracking-tight text-base xs:text-lg sm:text-xl md:text-2xl lg:text-2xl bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 text-transparent bg-clip-text group-hover:from-cyan-200 group-hover:via-blue-200 group-hover:to-purple-200 transition-all duration-500 drop-shadow-lg">
                                        Documentation
                                    </span>
                                    <span className="text-xs xs:text-xs sm:text-sm md:text-sm text-cyan-400/80 font-medium tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                                        EXPLORE GUIDES
                                    </span>
                                </div>
                                
                                {/* Right Arrow Container */}
                                <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
                                    <div className="relative w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 border border-cyan-400/40 flex items-center justify-center transform group-hover:rotate-90 transition-all duration-700">
                                        <svg className="w-3 h-3 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-400 transform group-hover:scale-125 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                        
                                        {/* Quantum Trail */}
                                        <div className="absolute -right-2 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300" />
                                    </div>
                                </div>
                                
                                {/* Edge Glow */}
                                <div className="absolute inset-0 rounded-3xl border border-cyan-400/20 group-hover:border-cyan-400/60 transition-all duration-500" />
                                <div className="absolute inset-0 rounded-3xl border border-purple-400/20 group-hover:border-purple-400/40 transition-all duration-700 delay-200" />
                            </button>
                        </div>
                    </div>

                    <div className="inline-flex items-center flex-wrap justify-center gap-4 sm:gap-6 lg:gap-6 text-gray-400 text-sm sm:text-base lg:text-base">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full shadow-lg">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-50"></div>
                            </div>
                            <span>Academic Institutions</span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-700 hidden sm:block"></div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full shadow-lg">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-50"></div>
                            </div>
                            <span>Blockchain Verified</span>
                        </div>
                        <div className="w-px h-4 sm:h-5 bg-gray-700 hidden sm:block"></div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full shadow-lg">
                                <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm opacity-50"></div>
                            </div>
                            <span>Instant Verification</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default HowItWorks;