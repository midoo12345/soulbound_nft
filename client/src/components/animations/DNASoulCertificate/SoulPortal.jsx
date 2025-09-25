import React, { useEffect, useState } from 'react';
import { useDNASoul, SOUL_STAGES } from './index';

const SoulPortal = () => {
  const { soulStage, userWallet } = useDNASoul();
  const [portalProgress, setPortalProgress] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let interval;
    
    if (soulStage === SOUL_STAGES.PORTAL_OPENING) {
      interval = setInterval(() => {
        setPortalProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    } else if (soulStage === SOUL_STAGES.DNA_SCANNING) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 30);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [soulStage]);

  const formatWallet = (wallet) => {
    if (!wallet) return "0x0000...0000";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  if (soulStage === SOUL_STAGES.PORTAL_CLOSING) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 relative">
            <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            <div className="absolute inset-8 border-4 border-cyan-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sealing Soul Repository</h2>
          <p className="text-gray-400">Your digital soul is safely stored</p>
        </div>
      </div>
    );
  }

  if (soulStage === SOUL_STAGES.PORTAL_OPENING) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto">
          {/* Portal Door Animation */}
          <div className="relative mb-8">
            <div className="w-64 h-96 mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg border-2 border-purple-500 overflow-hidden">
              {/* Closing door effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-blue-900/80 transition-all duration-1000"
                style={{ 
                  transform: `translateY(${100 - portalProgress}%)`,
                  transition: 'transform 0.1s linear'
                }}
              />
              
              {/* Holographic scan lines */}
              <div className="absolute inset-0">
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"
                  style={{ 
                    top: `${portalProgress}%`,
                    transition: 'top 0.1s linear'
                  }}
                />
              </div>
              
              {/* Portal seal */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-purple-400 rounded-full animate-pulse">
                  <div className="w-full h-full border-2 border-blue-400 rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Loading Certificate Portal
          </h1>
          <p className="text-gray-400 mb-6">
            Connecting to your educational DNA...
          </p>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${portalProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            Portal Status: {portalProgress}% Complete
          </p>
        </div>
      </div>
    );
  }

  if (soulStage === SOUL_STAGES.DNA_SCANNING) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center max-w-lg mx-auto">
          {/* DNA Scanning Animation */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto relative">
              {/* DNA Helix */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-64">
                  {/* Left strand */}
                  <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                  {/* Right strand */}
                  <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                  
                  {/* Connecting bonds */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-1 top-0 w-28 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 opacity-60"
                      style={{ 
                        top: `${i * 12.5}%`,
                        transform: `rotate(${Math.sin(i) * 5}deg)`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Scanning beam */}
              <div 
                className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-spin"
                style={{ 
                  animationDuration: '3s',
                  borderImage: 'linear-gradient(45deg, transparent, cyan, transparent) 1'
                }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Scanning Educational DNA
          </h2>
          <p className="text-gray-400 mb-6">
            Analyzing your digital soul signature...
          </p>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            DNA Analysis: {scanProgress}% Complete
          </p>
        </div>
      </div>
    );
  }

  if (soulStage === SOUL_STAGES.SOUL_REVEAL) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto">
          {/* Soul Reveal Animation */}
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto relative">
              {/* Soul core */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse scale-110 blur-xl"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-cyan-300 to-purple-300 rounded-full animate-pulse"></div>
              
              {/* Soul signature */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white font-mono text-sm text-center">
                  <div className="font-bold">{formatWallet(userWallet)}</div>
                  <div className="text-xs opacity-70">Digital Soul</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Soul Repository Unlocked
          </h2>
          <p className="text-gray-400 mb-6">
            Welcome to your educational DNA collection
          </p>
          
          <div className="animate-pulse">
            <div className="w-8 h-8 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SoulPortal;
