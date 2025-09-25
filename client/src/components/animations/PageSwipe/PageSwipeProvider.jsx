import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RealisticPageSwipe from './RealisticPageSwipe';

const PageSwipeContext = createContext();

export const usePageSwipe = () => {
    const context = useContext(PageSwipeContext);
    if (!context) {
        throw new Error('usePageSwipe must be used within a PageSwipeProvider');
    }
    return context;
};

export const PageSwipeProvider = ({ children }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [targetUrl, setTargetUrl] = useState(null);
    const navigate = useNavigate();

    const triggerPageSwipe = useCallback((url) => {
        if (isAnimating) return; // Prevent multiple triggers
        
        setTargetUrl(url);
        setIsAnimating(true);
        
        // Set a timeout to complete the animation and navigate
        setTimeout(() => {
            setIsAnimating(false);
            setTargetUrl(null);
            
            // Navigate after animation
            if (url) {
                navigate(url);
            }
        }, 1200); // Match the animation duration
        
    }, [isAnimating, navigate]);

    const value = {
        isAnimating,
        triggerPageSwipe,
        setIsAnimating
    };

    return (
        <PageSwipeContext.Provider value={value}>
            {children}
            {/* Global Page Swipe Animation - rendered at app level */}
            <RealisticPageSwipe 
                isActive={isAnimating}
                onComplete={() => {}} // Empty function as navigation is handled by the provider
                duration={1200}
            />
        </PageSwipeContext.Provider>
    );
};
