import React, { useState, useEffect, useRef } from 'react';

const NavigationSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const sidebarRef = useRef(null);

  // Minimum swipe distance to trigger close
  const minSwipeDistance = 50;

  const sections = [
    { 
      id: 'hero', 
      label: 'Home', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'how-it-works', 
      label: 'How It Works', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      id: 'features', 
      label: 'Features', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'certificates', 
      label: 'Certificates', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'certificate-checker', 
      label: 'Certificate Checker', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      id: 'team', 
      label: 'Team', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      // Don't update active section during programmatic scrolling
      if (isScrolling) return;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 150; // Increased offset for better detection
          const windowHeight = window.innerHeight;
          
          // Find which section is currently in view
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i].id);
            if (section) {
              const sectionTop = section.offsetTop;
              const sectionBottom = sectionTop + section.offsetHeight;
              
              // Check if section is in viewport
              if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                setActiveSection(sections[i].id);
                break;
              }
              // Also check if we're at the bottom of the page
              else if (scrollPosition + windowHeight >= document.documentElement.scrollHeight - 100) {
                setActiveSection(sections[sections.length - 1].id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, isScrolling]);

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
        if (setIsMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsMobileMenuOpen]);

  // Touch gesture handlers for mobile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe) {
      // Swipe left to close sidebar
      setIsOpen(false);
      if (setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      console.warn(`Section with id "${sectionId}" not found`);
      return;
    }

    // Set active section immediately for better UX
    setActiveSection(sectionId);

    // Set scrolling state to prevent scroll detection interference
    setIsScrolling(true);

    // Compute target Y with navbar offset using bounding rect (works in nested scroll contexts)
    const navbarHeight = 80; // Approximate navbar height
    const targetY = section.getBoundingClientRect().top + window.scrollY - navbarHeight;

    const performScroll = () => {
      // Use instant scroll for mobile to avoid broken transitions
      const isMobile = window.innerWidth < 1024;
      const scrollBehavior = isMobile ? 'auto' : (sectionId === 'team' ? 'auto' : 'smooth');
      
      window.scrollTo({ top: targetY, behavior: scrollBehavior });
      
      if (isMobile || sectionId === 'team') {
        // Instant scroll - reset state immediately
        setIsScrolling(false);
      } else {
        // Smooth scroll - wait for completion
        let scrollTimeout;
        const handleScrollEnd = () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
            window.removeEventListener('scroll', handleScrollEnd);
          }, 150);
        };
        window.addEventListener('scroll', handleScrollEnd, { passive: true });
      }
    };

    // On mobile, close the sidebar first so the overlay doesn't block scrolling
    if (window.innerWidth < 1024) {
      setIsOpen(false);
      if (setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      // Use immediate scroll for mobile to avoid transition issues
      setTimeout(performScroll, 50);
    } else {
      performScroll();
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(!isOpen);
    }
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="fixed top-1/2 left-6 z-50 transform -translate-y-1/2 hidden lg:block">
      {/* Glassy Modern Navigation Panel */}
      <div className="glass-nav-panel rounded-3xl p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-white/20">
          <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="glass-dot w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`glass-nav-button group relative w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                activeSection === section.id
                  ? 'active text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="group-hover:scale-110 transition-transform duration-200">
                {section.icon}
              </div>
              
              {/* Active indicator */}
              {activeSection === section.id && (
                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-l-full shadow-lg"></div>
              )}
              
              {/* Hover tooltip */}
              <div className="tooltip absolute left-full ml-3 px-3 py-2 bg-black/80 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl backdrop-blur-sm z-50">
                {section.label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-r-black/80 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
              </div>
            </button>
          ))}
        </nav>

        {/* Progress Indicator */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-xs text-gray-300 mb-3 font-medium">
              {Math.round((sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100)}%
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 progress-glow">
              <div
                className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 right-4 z-50 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-110 mobile-toggle-button"
        aria-label="Toggle navigation"
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 mobile-sidebar-overlay mobile-backdrop">
          <div 
            ref={sidebarRef}
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-l border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out mobile-sidebar-content"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Mobile Header */}
            <div className="p-6 border-b border-white/20 mobile-sidebar-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Navigation</h3>
                    <p className="text-gray-400 text-sm">Quick access to sections</p>
                  </div>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-200 mobile-close-button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Swipe Indicator */}
            <div className="mobile-swipe-indicator"></div>

            {/* Mobile Navigation Items */}
            <nav className="p-6 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 text-left mobile-nav-item ${
                    activeSection === section.id
                      ? 'active'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg mobile-nav-icon ${
                    activeSection === section.id 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-500' 
                      : 'bg-white/10'
                  }`}>
                    {section.icon}
                  </div>
                  <span className={`font-medium mobile-nav-text ${
                    activeSection === section.id ? 'text-white' : ''
                  }`}>{section.label}</span>
                  {activeSection === section.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Progress Indicator */}
            <div className="p-6 border-t border-white/20">
              <div className="text-center mobile-progress-container">
                <div className="text-sm text-gray-300 mb-3 font-medium">
                  Progress: {Math.round((sections.findIndex(s => s.id === activeSection) + 1) / sections.length * 100)}%
                </div>
                <div className="mobile-progress-bar">
                  <div
                    className="mobile-progress-fill"
                    style={{
                      width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default NavigationSidebar;
