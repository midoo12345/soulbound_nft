import React from 'react';
import { useDNASoul, SOUL_STATUS } from './index';
import './dna-soul-animations.css';

const SoulStatusIndicator = ({ certificate }) => {
  const { getSoulStatus, certificates, getBurnState } = useDNASoul();
  // Prefer the freshest certificate from context (updated by realtime hooks)
  const liveCertificate = certificates?.find?.((c) => String(c.id) === String(certificate?.id)) || certificate;
  const soulStatus = getSoulStatus(liveCertificate);
  const burnState = getBurnState?.(liveCertificate?.id);

  const getStatusConfig = (status) => {
    switch (status) {
      case SOUL_STATUS.VERIFIED:
        return {
          text: 'Soul Verified',
          icon: '✨',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          borderColor: 'border-yellow-400/50',
          glowColor: 'shadow-yellow-400/50',
          description: 'Your educational achievement has been verified and secured'
        };
      case SOUL_STATUS.PENDING:
        return {
          text: 'Soul Awakening',
          icon: '🌊',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          borderColor: 'border-blue-400/50',
          glowColor: 'shadow-blue-400/50',
          description: 'Your educational DNA is being processed'
        };
      case SOUL_STATUS.REVOKED:
        return {
          text: 'Soul Fragment Lost',
          icon: '💔',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          borderColor: 'border-red-400/50',
          glowColor: 'shadow-red-400/50',
          description: 'This educational fragment has been revoked'
        };
      case SOUL_STATUS.BURNED:
        return {
          text: 'Soul Extinguished',
          icon: '🕯️',
          color: 'text-gray-300',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-400/50',
          glowColor: 'shadow-gray-400/50',
          description: 'This certificate has been permanently burned'
        };
      default:
        return {
          text: 'Unknown Soul State',
          icon: '❓',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/50',
          glowColor: 'shadow-gray-400/50',
          description: 'Soul state cannot be determined'
        };
    }
  };

  const config = getStatusConfig(soulStatus);

  return (
    <div className={`dna-soul-panel relative p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} backdrop-blur-sm`}>
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-lg ${config.glowColor} shadow-lg blur-sm opacity-50`}></div>
      
      <div className="relative z-10">
        {/* Status header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{config.icon}</span>
            <span className={`font-bold text-lg ${config.color}`}>
              {config.text}
            </span>
          </div>
          {/* Burn badges */}
          {burnState && (
            <div className="flex items-center gap-2">
              {burnState.requested && !burnState.approved && !burnState.burned && (
                <span className="px-2 py-1 text-xs font-mono rounded bg-orange-500/20 text-orange-300 border border-orange-400/40">BURN REQUESTED</span>
              )}
              {burnState.approved && !burnState.burned && (
                <span className="px-2 py-1 text-xs font-mono rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">BURN APPROVED</span>
              )}
              {burnState.burned && (
                <span className="px-2 py-1 text-xs font-mono rounded bg-red-500/20 text-red-300 border border-red-400/40">BURNED</span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="dna-data-field mb-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-2"></div>
            <span className="text-purple-300 text-xs font-mono font-bold">DNA_STATUS_MESSAGE</span>
          </div>
          <div className="text-blue-300 text-sm font-mono bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 rounded-lg border border-purple-500/30">
            {config.description}
            {burnState?.executionTime && !burnState.burned && (
              <div className="text-xs text-gray-400 mt-2">
                Burn executes ~ {new Date(burnState.executionTime).toLocaleString()}
              </div>
            )}
            {burnState?.reason && (
              <div className="text-xs text-gray-400 mt-1">
                Reason: {burnState.reason}
              </div>
            )}
          </div>
        </div>

        {/* Soul metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="dna-data-field bg-black/20 p-2 rounded border border-gray-600/30">
            <div className="flex items-center mb-1">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-2"></div>
              <span className="text-gray-400 text-xs font-mono">SOUL_DENSITY</span>
            </div>
            <div className={`font-mono ${config.color}`}>
              {soulStatus === SOUL_STATUS.VERIFIED ? '98.7%' : 
               soulStatus === SOUL_STATUS.PENDING ? 'Processing...' : 
               soulStatus === SOUL_STATUS.REVOKED ? '0%' : 
               soulStatus === SOUL_STATUS.BURNED ? '0%' : 'Unknown'}
            </div>
          </div>
          
          <div className="dna-data-field bg-black/20 p-2 rounded border border-gray-600/30">
            <div className="flex items-center mb-1">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-400 text-xs font-mono">DNA_INTEGRITY</span>
            </div>
            <div className={`font-mono ${config.color}`}>
              {soulStatus === SOUL_STATUS.VERIFIED ? 'Verified' : 
               soulStatus === SOUL_STATUS.PENDING ? 'Scanning' : 
               soulStatus === SOUL_STATUS.REVOKED ? 'Corrupted' : 
               soulStatus === SOUL_STATUS.BURNED ? 'Extinguished' : 'Unknown'}
            </div>
          </div>
        </div>

        {/* Static border */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className={`absolute inset-0 border-2 ${config.borderColor} rounded-lg opacity-30`}></div>
        </div>
      </div>
    </div>
  );
};

export default SoulStatusIndicator;
