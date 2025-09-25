import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HolographicCertificate from '../animations/HolographicCertificate';

const AcademicCertificateLoader = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing wallet and network');

  useEffect(() => {
    const steps = [
      'Initializing wallet and network',
      'Syncing contract and ABI',
      'Fetching on-chain certificate schema',
      'Preparing IPFS gateway',
      'Calibrating holographic renderer',
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + Math.random() * 18, 98);
        const index = Math.min(steps.length - 1, Math.floor((next / 100) * steps.length));
        setStatus(steps[index]);
        return next;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute inset-0 quantum-field opacity-30" />
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[120vmax] h-[120vmax] rounded-full blur-3xl opacity-40 bg-gradient-to-tr from-cyan-600/20 via-purple-600/20 to-pink-600/20" />
        </motion.div>
      </div>

      {/* Centerpiece holographic certificate */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-6">
        <div className="w-full max-w-3xl aspect-[16/10] perspective-1000">
          <HolographicCertificate
            certificateData={{
              isVerified: progress > 66,
              student: '0xA1cD3f...2E9B',
              courseName: 'Academic NFT Certificate',
              completionDate: new Date(),
              tokenId: '0xLOADER',
              grade: 99.9,
            }}
            isVerifying={progress < 100}
          />
        </div>
      </div>

      {/* Bottom status + progress */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="holographic-text">{status}</span>
            <span className="text-cyan-300">{Math.floor(progress)}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-slate-800/70 overflow-hidden border border-slate-700/60">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 progress-glow"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.floor(progress)}%` }}
              transition={{ ease: 'easeOut', duration: 0.6 }}
            />
            <div className="absolute inset-0 animate-gradient-x opacity-30" />
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-green" />
            <span>Verifying chain integrity</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-neural-pulse" />
            <span>Loading assets</span>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-neural-pulse" />
            <span>Preparing UI</span>
          </div>
        </div>
      </div>

      {/* Subtle matrix rain accents */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute top-[-20%] w-px h-[140%] left-1/4 bg-gradient-to-b from-cyan-400/0 via-cyan-400/40 to-cyan-400/0 animate-matrix-rain"
            style={{
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AcademicCertificateLoader;


