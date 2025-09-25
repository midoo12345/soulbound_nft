import React, { useEffect, useState } from 'react';

const FuturisticBackground = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Generate random particles
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 3 + Math.random() * 4
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-gray-950"></div>
            
            {/* Animated Grid (motion-safe) */}
            <div className="absolute inset-0 opacity-15 motion-safe:opacity-20">
                <div 
                    className="w-full h-full motion-safe:animate-gradient"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px, 50px 50px, 25px 25px, 25px 25px'
                    }}
                ></div>
            </div>

            {/* Floating Energy Orbs (reduced intensity for clarity/perf) */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-radial from-blue-500/20 to-transparent rounded-full motion-safe:animate-float blur-sm"></div>
            <div className="absolute bottom-32 right-32 w-40 h-40 bg-gradient-radial from-violet-500/15 to-transparent rounded-full motion-safe:animate-orbit blur-sm"></div>
            <div className="absolute top-1/2 left-16 w-24 h-24 bg-gradient-radial from-cyan-500/25 to-transparent rounded-full motion-safe:animate-pulse-fast blur-sm"></div>

            {/* Scanning Lines */}
            <div className="absolute inset-0 opacity-30">
                {/* <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line"></div> */}
                {/* <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-violet-400 to-transparent animate-scanline left-1/3"></div> */}
            </div>

            {/* Particle System */}
            <div className="absolute inset-0">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full motion-safe:animate-ping-slow"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default FuturisticBackground; 