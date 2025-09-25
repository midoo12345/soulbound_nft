import { useState, useCallback } from 'react';

const usePageSwipe = (navigationCallback) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const triggerPageSwipe = useCallback(() => {
        if (isAnimating) return; // Prevent multiple triggers
        
        setIsAnimating(true);
        
        // Set a timeout to complete the animation and navigate
        setTimeout(() => {
            setIsAnimating(false);
            
            // Navigate after animation
            if (navigationCallback) {
                navigationCallback('/docs');
            }
        }, 1200); // Match the animation duration
        
    }, [isAnimating, navigationCallback]);

    return {
        isAnimating,
        triggerPageSwipe,
        setIsAnimating
    };
};

export default usePageSwipe;
