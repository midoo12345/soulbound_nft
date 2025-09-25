import React, { useState, useEffect } from 'react';
import { useDNASoul, SOUL_STAGES, SOUL_STATUS } from './index';
import SoulCertificateCard from './SoulCertificateCard';
import MysticalBackground from './MysticalBackground';
import SoulPortal from './SoulPortal';
import { useCertificateMetadataLoader } from '../../../hooks/useCertificateMetadataLoader';

const DNASoulRepository = ({ 
  openMetadataModal, 
  handleViewImage, 
  openQRModal 
}) => {
  const { 
    soulStage, 
    certificates, 
    soulMetrics, 
    userWallet, 
    isSoulReading, 
    selectedSoul,
    endSoulReading,
    getSoulStatus,
    getBurnState 
  } = useDNASoul();

  // Helpers: safe timestamp to milliseconds and date formatting
  const toNumber = (value) => {
    if (value === undefined || value === null) return undefined;
    try {
      if (typeof value === 'bigint') return Number(value);
      if (typeof value === 'object' && typeof value.toString === 'function') {
        const s = value.toString();
        if (/^\d+$/.test(s)) return Number(s);
      }
      return Number(value);
    } catch {
      return undefined;
    }
  };
  const toMs = (value) => {
    const n = toNumber(value);
    if (n === undefined || Number.isNaN(n)) return undefined;
    return n < 1e12 ? n * 1000 : n;
  };
  const formatDate = (value) => {
    const ms = toMs(value);
    if (ms === undefined) return 'Unknown';
    try { return new Date(ms).toLocaleString(); } catch { return 'Unknown'; }
  };

  // Use the metadata loader hook
  const { 
    loadCertificateMetadata, 
    loadMultipleCertificateMetadata,
    getEnhancedCertificate, 
    isMetadataLoading, 
    isMetadataLoaded 
  } = useCertificateMetadataLoader();

  const [enhancedSelectedSoul, setEnhancedSelectedSoul] = useState(selectedSoul);

  // Handle metadata loading for selected soul
  useEffect(() => {
    if (selectedSoul) {
      console.log('Soul Reading Complete modal: Loading metadata for certificate', selectedSoul.id);
      
      // Update enhanced selected soul
      setEnhancedSelectedSoul(getEnhancedCertificate(selectedSoul));
      
      // Try to load metadata in background if not already loaded
      if (selectedSoul.metadataCID && !isMetadataLoaded(selectedSoul)) {
        loadCertificateMetadata(selectedSoul).then((loadedMetadata) => {
          if (loadedMetadata) {
            console.log('Soul Reading Complete: Metadata loaded for certificate', selectedSoul.id, 'updating enhanced soul');
            setEnhancedSelectedSoul(getEnhancedCertificate(selectedSoul));
          }
        });
      }
    }
  }, [selectedSoul, getEnhancedCertificate, isMetadataLoaded, loadCertificateMetadata]);

  // Resubscribe: when certificates update via realtime, refresh selected soul status by id
  useEffect(() => {
    if (!selectedSoul || !certificates?.length) return;
    const latest = certificates.find(c => String(c.id) === String(selectedSoul.id));
    if (!latest) return;
    const statusChanged = latest.isVerified !== selectedSoul.isVerified || latest.isRevoked !== selectedSoul.isRevoked;
    const gradeChanged = latest.grade !== selectedSoul.grade;
    const imageChanged = (latest.imageUrl || '') !== (enhancedSelectedSoul?.imageUrl || '');
    if (statusChanged || gradeChanged || imageChanged) {
      setEnhancedSelectedSoul(getEnhancedCertificate(latest));
    }
  }, [certificates, selectedSoul, enhancedSelectedSoul?.imageUrl, getEnhancedCertificate]);

  // Eagerly prefetch metadata for all certificates in the repository
  useEffect(() => {
    if (certificates && certificates.length > 0) {
      loadMultipleCertificateMetadata(certificates);
    }
  }, [certificates, loadMultipleCertificateMetadata]);

  // Force refresh enhanced selected soul every 500ms to catch metadata loading
  useEffect(() => {
    if (selectedSoul) {
      const interval = setInterval(() => {
        const enhanced = getEnhancedCertificate(selectedSoul);
        if (enhanced.imageUrl && enhanced.imageUrl !== (enhancedSelectedSoul?.imageUrl || '')) {
          console.log('Soul Reading Complete: Force refresh enhanced soul image URL found:', enhanced.imageUrl);
          setEnhancedSelectedSoul(enhanced);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [selectedSoul, getEnhancedCertificate, enhancedSelectedSoul?.imageUrl]);

  const formatWallet = (wallet) => {
    if (!wallet) return "0x0000...0000";
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  // Don't render repository until portal is complete
  if (soulStage !== SOUL_STAGES.REPOSITORY_ACTIVE && !isSoulReading) {
    return (
      <>
        <MysticalBackground intensity="normal" />
        <SoulPortal />
      </>
    );
  }

  // Soul Reading Modal
  if (isSoulReading && selectedSoul) {
    // Debug logging
    console.log('Soul Reading Complete modal rendering for certificate:', selectedSoul.id);
    console.log('Enhanced selected soul imageUrl:', enhancedSelectedSoul?.imageUrl);
    console.log('Original selected soul imageUrl:', selectedSoul.imageUrl);
    console.log('Enhanced selected soul metadata:', enhancedSelectedSoul?.metadata);
    const burnState = getBurnState?.(selectedSoul?.id);
    const status = getSoulStatus(enhancedSelectedSoul || selectedSoul);
    
    return (
      <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        onClick={endSoulReading}
      >
        <div 
          className="w-full max-w-5xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="soul-reading-modal rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 flex-shrink-0">
              <div className="relative">
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  🧬 Soul Reading Complete
                </h2>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-lg blur-sm"></div>
                  <p className="relative text-transparent bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-sm font-bold font-mono tracking-widest text-center">
                    ◈ ADVANCED_DNA_SEQUENCE_ANALYSIS_COMPLETE ◈
                  </p>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-mono">DNA SEQUENCE ANALYZED</span>
                </div>
              </div>
              <button
                onClick={endSoulReading}
                className="text-gray-400 hover:text-red-400 transition-colors text-2xl font-bold p-2 hover:bg-red-500/10 rounded-lg"
                title="Close Soul Portal"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2">
              {/* Soul Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Certificate Info */}
              <div className="space-y-6">
                <div className="dna-soul-panel p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🧬</span>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Soul Fragment Details
                    </h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="dna-data-field">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-purple-300 text-sm font-mono">DNA_SEQUENCE_NAME</span>
                      </div>
                      <div className="text-white font-bold text-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 rounded-lg border border-purple-500/30">
                        {enhancedSelectedSoul?.certificateName || enhancedSelectedSoul?.metadata?.name || selectedSoul.certificateName || selectedSoul.metadata?.name || `Soul Fragment #${selectedSoul.id}`}
                      </div>
                    </div>
                    
                    <div className="dna-data-field">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-blue-300 text-sm font-mono">KNOWLEDGE_DOMAIN</span>
                      </div>
                      <div className="text-blue-400 font-bold text-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 rounded-lg border border-blue-500/30">
                        {selectedSoul.courseName || `Course ${selectedSoul.courseId}`}
                      </div>
                    </div>
                    
                    <div className="dna-data-field">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-green-300 text-sm font-mono">ACQUISITION_DATE</span>
                      </div>
                      <div className="text-green-400 font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30">
                        {formatDate(selectedSoul.completionDate)}
                      </div>
                    </div>
                    
                    <div className="dna-data-field">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-yellow-300 text-sm font-mono">SOUL_DENSITY</span>
                      </div>
                      <div className="text-yellow-400 font-bold text-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30">
                        {selectedSoul.grade ? `${selectedSoul.grade}%` : 'N/A'}
                      </div>
                    </div>

                    {/* Additional Metadata Fields */}
                    {selectedSoul.metadata && (
                      <>
                        {selectedSoul.metadata.description && (
                          <div className="dna-data-field">
                            <div className="flex items-center mb-4">
                              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full mr-4 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                              <span className="text-emerald-300 text-sm font-mono font-bold tracking-wider">◊ DNA_SEQUENCE_INFO ◊</span>
                              <div className="ml-3 px-3 py-1.5 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-lg text-emerald-300 text-xs font-mono border border-emerald-500/40 shadow-lg">
                                ◈ CERTIFICATE_DETAILS ◈
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-xl blur-sm"></div>
                              <div className="relative text-emerald-200 text-sm bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-blue-500/40 p-5 rounded-xl border border-emerald-500/60 shadow-2xl backdrop-blur-sm">
                                <div className="flex items-start">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 mt-1 animate-pulse"></div>
                                  <div className="flex-1">{selectedSoul.metadata.description}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedSoul.metadata.instructor && (
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Instructor</div>
                            <div className="text-cyan-400 font-semibold">
                              {selectedSoul.metadata.instructor}
                            </div>
                          </div>
                        )}
                        
                        {selectedSoul.metadata.duration && (
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Duration</div>
                            <div className="text-white">
                              {selectedSoul.metadata.duration}
                            </div>
                          </div>
                        )}
                        
                        {selectedSoul.metadata.skills && (
                          <div>
                            <div className="text-gray-400 text-sm mb-1">Skills Acquired</div>
                            <div className="text-yellow-400 text-sm">
                              {Array.isArray(selectedSoul.metadata.skills) 
                                ? selectedSoul.metadata.skills.join(', ')
                                : selectedSoul.metadata.skills
                              }
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Soul Owner */}
                <div className="dna-soul-panel p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      Soul Owner
                    </h3>
                  </div>
                  <div className="dna-data-field">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-blue-300 text-sm font-mono">DNA_SIGNATURE</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-blue-400 text-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 rounded-lg border border-blue-500/30 flex-1">
                        {formatWallet(selectedSoul.student)}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedSoul.student)}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg border border-blue-500/30 transition-all duration-200 text-sm font-mono"
                        title="Copy Address"
                      >
                        ⧉
                      </button>
                    </div>
                      <div className="text-blue-300 text-sm mt-2 font-mono">
                        Your DNA signature
                      </div>
                  </div>
                </div>

                {/* Institution Info */}
                <div className="dna-soul-panel p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🏛️</span>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Soul Institution
                    </h3>
                  </div>
                  <div className="dna-data-field">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-purple-300 text-sm font-mono">DNA_ISSUER</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="font-mono text-purple-400 text-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-500/30 flex-1">
                        {formatWallet(selectedSoul.institution)}
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedSoul.institution)}
                        className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg border border-purple-500/30 transition-all duration-200 text-sm font-mono"
                        title="Copy Address"
                      >
                        ⧉
                      </button>
                    </div>
                      <div className="text-purple-300 text-sm mt-2 font-mono">
                        Institution that created your DNA
                      </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Soul Analysis */}
              <div className="space-y-6">
                {/* Soul Status */}
                <div className="dna-soul-panel p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🔬</span>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      Soul Analysis
                    </h3>
                  </div>
                  
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-semibold">Certificate Status</span>
                        <span className={`font-bold ${
                          status === SOUL_STATUS.VERIFIED ? 'text-green-400' : 
                          status === SOUL_STATUS.REVOKED ? 'text-red-400' :
                          status === SOUL_STATUS.BURNED ? 'text-gray-300' : 
                          'text-yellow-400'
                        }`}>
                          {status === SOUL_STATUS.VERIFIED ? '◉ Verified' : 
                           status === SOUL_STATUS.REVOKED ? '◈ Revoked' :
                           status === SOUL_STATUS.BURNED ? '◇ Burned' : '◐ Pending'}
                        </span>
                      </div>

                      {burnState && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 font-semibold">Burn Progress</span>
                          <span className="text-sm font-mono flex items-center gap-2">
                            {burnState.requested && !burnState.approved && !burnState.burned && (
                              <span className="text-orange-300">Requested</span>
                            )}
                            {burnState.approved && !burnState.burned && (
                              <span className="text-yellow-300">Approved</span>
                            )}
                            {burnState.burned && (
                              <span className="text-red-300">Executed</span>
                            )}
                          </span>
                        </div>
                      )}

                      {burnState?.executionTime && !burnState.burned && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 font-semibold">Execution Time</span>
                          <span className="text-gray-400 text-sm font-mono">{formatDate(burnState.executionTime)}</span>
                        </div>
                      )}

                      {status === SOUL_STATUS.REVOKED && (selectedSoul.revocationReason || enhancedSelectedSoul?.revocationReason) && (
                        <div className="pt-2">
                          <div className="text-gray-300 font-semibold mb-1">Revocation Reason</div>
                          <div className="text-red-300 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded p-3">
                            {enhancedSelectedSoul?.revocationReason || selectedSoul.revocationReason}
                          </div>
                        </div>
                      )}

                      {(selectedSoul.version || selectedSoul.lastUpdateDate || selectedSoul.updateReason || enhancedSelectedSoul?.version || enhancedSelectedSoul?.lastUpdateDate || enhancedSelectedSoul?.updateReason) && (
                        <div className="pt-2 space-y-2">
                          <div className="text-gray-300 font-semibold">Update Details</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            {(enhancedSelectedSoul?.version || selectedSoul.version) && (
                              <div className="bg-black/20 p-2 rounded border border-gray-600/30">
                                <div className="text-gray-400 mb-1">Version</div>
                                <div className="text-cyan-300 font-mono">{enhancedSelectedSoul?.version || selectedSoul.version}</div>
                              </div>
                            )}
                            {(enhancedSelectedSoul?.lastUpdateDate || selectedSoul.lastUpdateDate) && (
                              <div className="bg-black/20 p-2 rounded border border-gray-600/30">
                                <div className="text-gray-400 mb-1">Last Update</div>
                                <div className="text-cyan-300 font-mono">{formatDate(enhancedSelectedSoul?.lastUpdateDate || selectedSoul.lastUpdateDate)}</div>
                              </div>
                            )}
                            {(enhancedSelectedSoul?.updateReason || selectedSoul.updateReason) && (
                              <div className="bg-black/20 p-2 rounded border border-gray-600/30 sm:col-span-3">
                                <div className="text-gray-400 mb-1">Update Reason</div>
                                <div className="text-cyan-300 font-mono">{enhancedSelectedSoul?.updateReason || selectedSoul.updateReason}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                </div>

                {/* Blockchain DNA Cell - Transaction Hash Only */}
                {(selectedSoul.metadata.attributes && selectedSoul.metadata.attributes.find(attr => attr.trait_type === "Transaction Hash")) || selectedSoul.transactionHash || selectedSoul.metadata?.transactionHash ? (
                  <div className="dna-soul-panel p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">⛓️</span>
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                        Blockchain Data
                      </h3>
                    </div>
                    <div className="dna-data-field">
                        <div className="flex items-center mb-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mr-3 animate-pulse"></div>
                           <span className="text-violet-300 text-sm font-mono font-bold">DNA_PROOF</span>
                           <div className="ml-2 px-2 py-1 bg-violet-500/20 rounded text-violet-400 text-xs font-mono">
                             BLOCKCHAIN_PROOF
                           </div>
                        </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-violet-300 text-base font-mono bg-gradient-to-r from-violet-500/30 to-purple-500/30 p-4 rounded-xl border border-violet-500/50 flex-1 shadow-lg">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${selectedSoul.metadata.attributes?.find(attr => attr.trait_type === "Transaction Hash")?.value || selectedSoul.transactionHash || selectedSoul.metadata.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-200 transition-colors duration-200 break-all"
                            title="View on Sepolia Etherscan"
                          >
                            {selectedSoul.metadata.attributes?.find(attr => attr.trait_type === "Transaction Hash")?.value || selectedSoul.transactionHash || selectedSoul.metadata.transactionHash}
                          </a>
                        </div>
                                <button
                                  onClick={() => navigator.clipboard.writeText(selectedSoul.metadata.attributes?.find(attr => attr.trait_type === "Transaction Hash")?.value || selectedSoul.transactionHash || selectedSoul.metadata.transactionHash)}
                                  className="px-4 py-3 bg-gradient-to-r from-violet-500/30 to-purple-500/30 hover:from-violet-500/50 hover:to-purple-500/50 text-violet-300 hover:text-violet-200 rounded-xl border border-violet-500/50 transition-all duration-200 text-sm font-mono shadow-lg hover:shadow-violet-500/25"
                                  title="Copy Transaction Hash"
                                >
                                  ⧉
                                </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* IPFS Data - Image CID and Metadata CID */}
                {(enhancedSelectedSoul?.imageCID || selectedSoul.imageCID || enhancedSelectedSoul?.metadataCID || selectedSoul.metadataCID) && (
                  <div className="dna-soul-panel p-6 rounded-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">🗃️</span>
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        IPFS Data
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {(enhancedSelectedSoul?.imageCID || selectedSoul.imageCID) && (
                        <div className="dna-data-field">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-emerald-300 text-sm font-mono">Image CID</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-emerald-300 text-xs font-mono bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-3 rounded-lg border border-emerald-500/30 flex-1 break-all">
                              {enhancedSelectedSoul?.imageCID || selectedSoul.imageCID}
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(enhancedSelectedSoul?.imageCID || selectedSoul.imageCID)}
                              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-500/30 transition-all duration-200 text-xs font-mono"
                              title="Copy Image CID"
                            >
                              ⧉
                            </button>
                          </div>
                        </div>
                      )}

                      {(enhancedSelectedSoul?.metadataCID || selectedSoul.metadataCID) && (
                        <div className="dna-data-field">
                          <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-teal-300 text-sm font-mono">Metadata CID</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-teal-300 text-xs font-mono bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-3 rounded-lg border border-teal-500/30 flex-1 break-all">
                              {enhancedSelectedSoul?.metadataCID || selectedSoul.metadataCID}
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(enhancedSelectedSoul?.metadataCID || selectedSoul.metadataCID)}
                              className="px-3 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 hover:text-teal-200 rounded-lg border border-teal-500/30 transition-all duration-200 text-xs font-mono"
                              title="Copy Metadata CID"
                            >
                              ⧉
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-center space-x-4 flex-shrink-0">
              <button
                onClick={endSoulReading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-purple-500/25 border border-purple-500/30 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-2">🧬</span>
                  Return to Soul Repository
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 text-white">
      <MysticalBackground intensity="normal" />
      
      <div className="relative z-10 pt-16 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
              Digital Soul Repository
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Your educational DNA collection
            </p>
            
            {/* Soul Signature */}
            <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg px-6 py-3">
              <div className="text-purple-400 font-mono text-sm">
                Soul Signature: {formatWallet(userWallet)}
              </div>
            </div>
          </div>

          {/* Soul Metrics - Enhanced with Real-time Status Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{soulMetrics.soulLevel}</div>
              <div className="text-gray-400 text-sm">Soul Level</div>
              <div className="text-xs text-purple-300 mt-1">DNA Evolution</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{soulMetrics.totalSouls}</div>
              <div className="text-gray-400 text-sm">Total Souls</div>
              <div className="text-xs text-blue-300 mt-1">DNA Fragments</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{soulMetrics.verifiedSouls}</div>
              <div className="text-gray-400 text-sm">Verified Souls</div>
              <div className="text-xs text-green-300 mt-1">Authenticated DNA</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{soulMetrics.knowledgeDensity.toFixed(1)}%</div>
              <div className="text-gray-400 text-sm">Knowledge Density</div>
              <div className="text-xs text-yellow-300 mt-1">DNA Purity</div>
            </div>
          </div>

          {/* Real-time Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-2">{soulMetrics.pendingSouls}</div>
              <div className="text-gray-400 text-sm">Pending Souls</div>
              <div className="text-xs text-orange-300 mt-1">Awaiting Verification</div>
              <div className="text-xs text-orange-200 mt-1 animate-pulse">⚡ Real-time Updates</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-red-400 mb-2">{soulMetrics.revokedSouls}</div>
              <div className="text-gray-400 text-sm">Revoked Souls</div>
              <div className="text-xs text-red-300 mt-1">Invalidated DNA</div>
              <div className="text-xs text-red-200 mt-1 animate-pulse">⚡ Real-time Updates</div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-500/30 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-400 mb-2">{soulMetrics.burnedSouls}</div>
              <div className="text-gray-400 text-sm">Burned Souls</div>
              <div className="text-xs text-gray-300 mt-1">Destroyed DNA</div>
              <div className="text-xs text-gray-200 mt-1 animate-pulse">⚡ Real-time Updates</div>
            </div>
          </div>

          {/* Certificates Grid */}
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((certificate) => (
                <SoulCertificateCard 
                  key={`${certificate.id}-${certificate.isVerified ? 'v' : certificate.isRevoked ? 'r' : 'p'}`}
                  certificate={getEnhancedCertificate(certificate)}
                  handleViewImage={handleViewImage}
                  openQRModal={openQRModal}
                  metadataLoader={{
                    loadCertificateMetadata,
                    getEnhancedCertificate,
                    isMetadataLoaded
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🧬</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Soul Fragments Found</h3>
              <p className="text-gray-400 mb-8">
                Your educational DNA repository is empty. Complete courses to begin building your digital soul.
              </p>
              <div className="text-sm text-gray-500">
                Soul Signature: {formatWallet(userWallet)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNASoulRepository;
