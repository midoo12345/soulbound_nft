import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Chrome, Globe, Download, Zap, Shield, Monitor } from 'lucide-react';

const BrowserRecommendation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [browserInfo, setBrowserInfo] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [featureSupport, setFeatureSupport] = useState({});

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('browser-recommendation-dismissed');
    if (dismissed) return;

    // Detect browser and show recommendation if needed
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browser = 'unknown';
      let version = 0;
      let isCompatible = false;

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browser = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+)/);
        version = match ? parseInt(match[1]) : 0;
        isCompatible = version >= 90;
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+)/);
        version = match ? parseInt(match[1]) : 0;
        isCompatible = version >= 88;
      } else if (userAgent.includes('Edg')) {
        browser = 'Edge';
        const match = userAgent.match(/Edg\/(\d+)/);
        version = match ? parseInt(match[1]) : 0;
        isCompatible = version >= 90;
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        const match = userAgent.match(/Version\/(\d+)/);
        version = match ? parseInt(match[1]) : 0;
        isCompatible = version >= 14;
      }

      setBrowserInfo({ browser, version, isCompatible });
      
      // Show recommendation if browser is not fully compatible
      if (!isCompatible) {
        setIsVisible(true);
      }
    };

    // Detect feature support
    const detectFeatures = () => {
      const features = {
        web3: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
        webgl: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
              (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
          } catch (e) {
            return false;
          }
        })(),
        intersectionObserver: typeof IntersectionObserver !== 'undefined',
        localStorage: typeof Storage !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        es6: (() => {
          try {
            new Function('const a = 1; const b = 2; const c = a + b;');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        webp: (() => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        })(),
        webm: (() => {
          const video = document.createElement('video');
          return video.canPlayType && video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
        })()
      };
      
      setFeatureSupport(features);
    };

    detectBrowser();
    detectFeatures();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('browser-recommendation-dismissed', 'true');
  };

  const getBrowserIcon = (browserName) => {
    switch (browserName.toLowerCase()) {
      case 'chrome': return <Chrome className="w-5 h-5" />;
      case 'firefox': return <Globe className="w-5 h-5" />;
      case 'edge': return <Monitor className="w-5 h-5" />;
      case 'safari': return <Globe className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getRecommendationText = () => {
    if (!browserInfo) return '';
    
    if (browserInfo.isCompatible) {
      return `Your ${browserInfo.browser} ${browserInfo.version} is fully compatible! 🚀`;
    }
    
    return `For optimal experience, we recommend using:`;
  };

  const getFeatureIcon = (featureName) => {
    switch (featureName) {
      case 'web3': return <Globe className="w-4 h-4" />;
      case 'webgl': return <Zap className="w-4 h-4" />;
      case 'intersectionObserver': return <Zap className="w-4 h-4" />;
      case 'localStorage': return <Shield className="w-4 h-4" />;
      case 'fetch': return <Globe className="w-4 h-4" />;
      case 'es6': return <Zap className="w-4 h-4" />;
      case 'webp': return <Zap className="w-4 h-4" />;
      case 'webm': return <Zap className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const recommendedBrowsers = [
    { 
      name: 'Chrome', 
      version: '90+', 
      icon: <Chrome className="w-4 h-4" />, 
      color: 'from-green-500 to-green-600',
      downloadUrl: 'https://www.google.com/chrome/',
      features: ['web3', 'webgl', 'intersectionObserver', 'localStorage', 'fetch', 'es6', 'webp', 'webm']
    },
    { 
      name: 'Firefox', 
      version: '88+', 
      icon: <Globe className="w-4 h-4" />, 
      color: 'from-orange-500 to-orange-600',
      downloadUrl: 'https://www.mozilla.org/firefox/',
      features: ['web3', 'webgl', 'intersectionObserver', 'localStorage', 'fetch', 'es6', 'webp', 'webm']
    },
    { 
      name: 'Edge', 
      version: '90+', 
      icon: <Monitor className="w-4 h-4" />, 
      color: 'from-blue-500 to-blue-600',
      downloadUrl: 'https://www.microsoft.com/edge',
      features: ['web3', 'webgl', 'intersectionObserver', 'localStorage', 'fetch', 'es6', 'webp', 'webm']
    },
    { 
      name: 'Safari', 
      version: '14+', 
      icon: <Globe className="w-4 h-4" />, 
      color: 'from-purple-500 to-purple-600',
      downloadUrl: 'https://www.apple.com/safari/',
      features: ['web3', 'webgl', 'intersectionObserver', 'localStorage', 'fetch', 'es6', 'webp']
    }
  ];

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl mx-4"
      >
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-400/30 rounded-2xl shadow-2xl backdrop-blur-xl">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
          
          {/* Scan line effect */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan-line"></div>
          
          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  {browserInfo?.isCompatible ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Browser Compatibility Check
                  </h3>
                  <p className="text-sm text-slate-300">
                    {getRecommendationText()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-slate-700/50 rounded-full transition-colors duration-200 group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
              </button>
            </div>

            {/* Current Browser Status */}
            {browserInfo && (
              <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-600/30">
                <div className="flex items-center space-x-3 mb-3">
                  {getBrowserIcon(browserInfo.browser)}
                  <span className="text-slate-200 font-medium">
                    {browserInfo.browser} {browserInfo.version}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    browserInfo.isCompatible 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {browserInfo.isCompatible ? 'Compatible' : 'Limited Support'}
                  </span>
                </div>
                
                {/* Feature Support Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(featureSupport).map(([feature, supported]) => (
                    <div key={feature} className="flex items-center space-x-2 text-xs">
                      {getFeatureIcon(feature)}
                      <span className={`${supported ? 'text-green-400' : 'text-red-400'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Browsers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {recommendedBrowsers.map((browser, index) => (
                <motion.div
                  key={browser.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group cursor-pointer"
                >
                  <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl border border-slate-600/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${browser.color}`}>
                        {browser.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-200">
                        {browser.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      Version {browser.version}
                    </div>
                    <button
                      onClick={() => handleDownload(browser.downloadUrl)}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg text-white text-xs font-medium transition-all duration-200 hover:scale-105"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Explanation */}
            <div className="mb-4 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20">
              <h4 className="text-sm font-medium text-slate-200 mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Why These Features Matter</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                <div><strong>Web3:</strong> Blockchain wallet integration</div>
                <div><strong>WebGL:</strong> Smooth 3D animations</div>
                <div><strong>ES6+:</strong> Modern JavaScript features</div>
                <div><strong>IntersectionObserver:</strong> Scroll animations</div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-600/30">
              <p className="text-xs text-slate-400 text-center">
                💡 Modern browsers ensure optimal blockchain integration, smooth animations, and enhanced security
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrowserRecommendation;
