import { useState, useEffect } from 'react';

const useResponsiveDesign = () => {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
        height: typeof window !== 'undefined' ? window.innerHeight : 768
    });

    const [deviceType, setDeviceType] = useState('desktop');
    const [orientation, setOrientation] = useState('landscape');

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            setScreenSize({ width, height });
            setOrientation(width > height ? 'landscape' : 'portrait');
            
            // Determine device type
            if (width < 640) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = deviceType === 'mobile';
    const isTablet = deviceType === 'tablet';
    const isDesktop = deviceType === 'desktop';
    const isTouchDevice = isMobile || isTablet;

    const responsiveClasses = {
        container: `
            ${isMobile ? 'px-4 py-12' : ''}
            ${isTablet ? 'px-6 py-16' : ''}
            ${isDesktop ? 'px-6 py-20' : ''}
        `,
        grid: `
            ${isMobile ? 'grid-cols-1 gap-8' : ''}
            ${isTablet ? 'grid-cols-1 gap-12' : ''}
            ${isDesktop ? 'lg:grid-cols-2 gap-16' : ''}
        `,
        title: `
            ${isMobile ? 'text-4xl' : ''}
            ${isTablet ? 'text-5xl' : ''}
            ${isDesktop ? 'text-6xl lg:text-7xl' : ''}
        `,
        statsGrid: `
            ${isMobile ? 'grid-cols-2 gap-3' : ''}
            ${isTablet ? 'grid-cols-2 gap-4' : ''}
            ${isDesktop ? 'grid-cols-2 lg:grid-cols-4 gap-4' : ''}
        `
    };

    return {
        screenSize,
        deviceType,
        orientation,
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        responsiveClasses
    };
};

export default useResponsiveDesign; 