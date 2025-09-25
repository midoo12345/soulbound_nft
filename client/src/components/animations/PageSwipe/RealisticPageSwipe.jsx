import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RealisticPageSwipe = ({ isActive, onComplete, duration = 1200 }) => {
    const [animationPhase, setAnimationPhase] = useState('idle'); // idle, lifting, sliding, complete

    useEffect(() => {
        if (isActive && animationPhase === 'idle') {
            // Phase 1: Lift the page slightly
            setAnimationPhase('lifting');
            
            setTimeout(() => {
                // Phase 2: Slide the page across
                setAnimationPhase('sliding');
            }, 300);

            setTimeout(() => {
                // Phase 3: Complete and callback
                setAnimationPhase('complete');
                onComplete?.();
            }, duration);
        }
    }, [isActive, animationPhase, duration, onComplete]);

    useEffect(() => {
        if (!isActive) {
            setAnimationPhase('idle');
        }
    }, [isActive]);

    if (!isActive && animationPhase === 'idle') {
        return null;
    }

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-[9999] overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Background with blur effect */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Current Page (slides away) */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"
                        initial={{ x: 0, rotateY: 0 }}
                        animate={{
                            x: animationPhase === 'sliding' ? '-100%' : 0,
                            rotateY: animationPhase === 'lifting' ? -5 : animationPhase === 'sliding' ? -45 : 0,
                            scale: animationPhase === 'lifting' ? 1.02 : 1,
                            z: animationPhase === 'lifting' ? 50 : 0
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            duration: animationPhase === 'sliding' ? 0.8 : 0.3
                        }}
                        style={{
                            transformOrigin: 'right center',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* Current page content */}
                        <div className="p-8 h-full flex flex-col justify-center items-center text-white">
                            <div className="max-w-4xl text-center space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                                    How It Works
                                </h1>
                                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                    Transform academic credentials into verifiable blockchain certificates
                                </p>
                                
                                {/* Animated content lines */}
                                <div className="space-y-4 mt-12">
                                    {[...Array(6)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="h-2 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full mx-auto"
                                            style={{ width: `${60 + Math.random() * 40}%` }}
                                            initial={{ opacity: 1, scaleX: 1 }}
                                            animate={{
                                                opacity: animationPhase === 'sliding' ? 0 : 1,
                                                scaleX: animationPhase === 'sliding' ? 0.8 : 1
                                            }}
                                            transition={{ delay: i * 0.1 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Page corner curl effect */}
                        <motion.div
                            className="absolute top-0 right-0 w-32 h-32"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: animationPhase === 'lifting' ? 0.6 : 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
                            }}
                        />

                        {/* Page shadow */}
                        <motion.div
                            className="absolute inset-0 bg-black/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: animationPhase === 'lifting' ? 0.3 : 0 }}
                            style={{
                                background: 'linear-gradient(to left, rgba(0,0,0,0.3) 0%, transparent 10%)'
                            }}
                        />
                    </motion.div>

                    {/* New Page (Documentation) - slides in */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
                        initial={{ x: '100%' }}
                        animate={{
                            x: animationPhase === 'sliding' ? 0 : '100%'
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 25,
                            delay: 0.2
                        }}
                    >
                        {/* Futuristic background effects */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                        </div>
                        {/* Documentation page content */}
                        <div className="relative p-8 h-full flex flex-col justify-center items-center z-10">
                            <motion.div
                                className="max-w-4xl text-center space-y-8"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{
                                    opacity: animationPhase === 'sliding' ? 1 : 0,
                                    y: animationPhase === 'sliding' ? 0 : 30
                                }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                {/* Documentation header */}
                                <div className="flex items-center justify-center space-x-4 mb-8">
                                    <motion.div
                                        className="text-6xl filter drop-shadow-lg"
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    >
                                        📚
                                    </motion.div>
                                    <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">
                                        Documentation
                                    </h1>
                                </div>

                                <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                                    Complete guides, API references, and examples for 
                                    <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text font-semibold"> blockchain certificate management</span>
                                </p>

                                {/* Documentation sections */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                    {[
                                        { icon: '🚀', title: 'Getting Started', desc: 'Quick setup guide', gradient: 'from-cyan-400 to-blue-500' },
                                        { icon: '⚡', title: 'API Reference', desc: 'Complete API docs', gradient: 'from-blue-400 to-purple-500' },
                                        { icon: '💡', title: 'Examples', desc: 'Code examples', gradient: 'from-purple-400 to-pink-500' },
                                        { icon: '📖', title: 'Guides', desc: 'Step-by-step tutorials', gradient: 'from-pink-400 to-cyan-500' }
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            className="relative group"
                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                            animate={{
                                                opacity: animationPhase === 'sliding' ? 1 : 0,
                                                y: animationPhase === 'sliding' ? 0 : 20,
                                                scale: animationPhase === 'sliding' ? 1 : 0.9
                                            }}
                                            transition={{ delay: 0.7 + i * 0.1 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                        >
                                            {/* Glassmorphism card with dark theme */}
                                            <div className="relative p-6 rounded-2xl backdrop-blur-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl overflow-hidden">
                                                {/* Gradient background effect */}
                                                <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-2xl opacity-10 group-hover:opacity-30 transition-opacity duration-300`} />
                                                
                                                {/* Content */}
                                                <div className="relative z-10">
                                                    <div className="text-3xl mb-3 filter drop-shadow-lg">{item.icon}</div>
                                                    <h3 className={`text-lg font-bold mb-2 bg-gradient-to-r ${item.gradient} text-transparent bg-clip-text`}>
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                                
                                                {/* Floating orb */}
                                                <div className={`absolute top-2 right-2 w-8 h-8 bg-gradient-to-r ${item.gradient} rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* New page enter effect with futuristic shimmer */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-400/10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: animationPhase === 'sliding' ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                        />
                        
                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12"
                            initial={{ x: '-100%' }}
                            animate={{ x: animationPhase === 'sliding' ? '100%' : '-100%' }}
                            transition={{ duration: 1, delay: 0.3 }}
                        />
                    </motion.div>

                    {/* Floating particles during transition */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: animationPhase === 'sliding' ? [0, 1, 0] : 0,
                                    scale: animationPhase === 'sliding' ? [0, 1, 0] : 0,
                                    y: animationPhase === 'sliding' ? [0, -100] : 0
                                }}
                                transition={{
                                    duration: 1,
                                    delay: Math.random() * 0.5,
                                    ease: "easeOut"
                                }}
                            />
                        ))}
                    </div>

                    {/* Futuristic progress indicator */}
                    <motion.div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div
                            className="relative w-3 h-3 bg-cyan-400 rounded-full shadow-lg"
                            animate={{
                                scale: animationPhase === 'lifting' ? [1, 1.2, 1] : 1,
                                opacity: animationPhase === 'lifting' ? [1, 0.7, 1] : 0.5
                            }}
                            transition={{ duration: 0.5, repeat: animationPhase === 'lifting' ? Infinity : 0 }}
                        >
                            <div className="absolute inset-0 bg-cyan-400 rounded-full blur-sm opacity-50"></div>
                        </motion.div>
                        <motion.div
                            className="relative w-3 h-3 bg-blue-400 rounded-full shadow-lg"
                            animate={{
                                scale: animationPhase === 'sliding' ? [1, 1.2, 1] : 1,
                                opacity: animationPhase === 'sliding' ? [1, 0.7, 1] : 0.5
                            }}
                            transition={{ duration: 0.5, repeat: animationPhase === 'sliding' ? Infinity : 0 }}
                        >
                            <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-50"></div>
                        </motion.div>
                        <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-sm font-medium tracking-wide">
                            {animationPhase === 'lifting' ? 'Initializing...' : 
                             animationPhase === 'sliding' ? 'Loading Documentation...' : 
                             'Ready'}
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RealisticPageSwipe;
