import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import useWalletRoles from '../../hooks/useWalletRoles';
import useResponsiveDesign from '../../hooks/useResponsiveDesign';

// Import new futuristic components
import FuturisticBackground from './FuturisticBackground';
import FuturisticHeroTitle from './FuturisticHeroTitle';
import FuturisticActionPanel from './FuturisticActionPanel';
import AcademicStatsDisplay from './QuantumStatsDisplay';
import TechStack from './TechStack';

const AcademicCertificateDisplay = lazy(() => import('./AcademicCertificateDisplay'));

const ModernMinimalHero = () => {
    const { account, connectWallet, getRoleInfo, isLoading, isConnected } = useWalletRoles();
    const { isMobile } = useResponsiveDesign();
    
    // Optimize role info computation and add loading optimization
    const roleInfo = useMemo(() => getRoleInfo(), [getRoleInfo]);
    
    // Add a short delay to smooth loading transitions
    const [showContent, setShowContent] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 100); // Minimal delay to smooth loading
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Futuristic Background */}
            <FuturisticBackground />

            {/* Main Content */}
            <div className="relative z-10 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className={`grid ${
                        isMobile 
                            ? 'grid-cols-1 gap-8 py-12' 
                            : 'lg:grid-cols-2 gap-12 xl:gap-20 items-center py-16 lg:py-20'
                    }`}>
                        
                        {/* Left Content */}
                        <div className={`${isMobile ? 'text-center order-1' : 'order-1'} space-y-8 lg:space-y-12`}>
                            {/* Futuristic Title */}
                            <FuturisticHeroTitle isMobile={isMobile} />

                            {/* Action Panel with Smooth Loading */}
                            <div className={`w-full transition-opacity duration-300 ${
                                showContent ? 'opacity-100' : 'opacity-0'
                            }`}>
                                <FuturisticActionPanel
                                    roleInfo={roleInfo}
                                    isConnected={isConnected}
                                    connectWallet={connectWallet}
                                    isMobile={isMobile}
                                    isLoading={isLoading}
                                />
                            </div>

                            {/* Tech Stack */}
                            <TechStack isMobile={isMobile} />
                        </div>

                        {/* Right Certificate Display */}
                        <div className={`${isMobile ? 'order-2' : 'order-2'} flex justify-center lg:justify-end pr-0 lg:pr-2 xl:pr-4 2xl:pr-8`}>
                            <div className="transform transition-transform duration-500 origin-center lg:scale-110 xl:scale-125 2xl:scale-[1.35] lg:-translate-y-16 xl:-translate-y-20 2xl:-translate-y-24">
                                <Suspense
                                    fallback={
                                        <div className="w-full max-w-md h-[300px] rounded-xl bg-gray-800/40 border border-gray-700/40 animate-pulse lg:max-w-xl lg:h-[420px] xl:max-w-2xl xl:h-[520px]" />
                                    }
                                >
                                    <AcademicCertificateDisplay isMobile={isMobile} />
                                </Suspense>
                            </div>
                        </div>
                    </div>

                    {/* Academic Stats */}
                    <div className="pb-16 lg:pb-24">
                        <AcademicStatsDisplay isMobile={isMobile} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernMinimalHero;
 