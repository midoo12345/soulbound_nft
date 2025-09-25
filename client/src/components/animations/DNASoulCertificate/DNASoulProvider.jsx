import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SOUL_STAGES, SOUL_STATUS } from './index';
import { processCertificatesBatch } from '../../sperates/cert_utilits.js';
import { useCertificateEvents } from '../../../hooks/useCertificateEvents.js';
import { useRealTimeUpdates } from '../../../hooks/useRealTimeUpdates.js';

const DNASoulContext = createContext();

const useDNASoul = () => {
  const context = useContext(DNASoulContext);
  if (!context) {
    throw new Error('useDNASoul must be used within a DNASoulProvider');
  }
  return context;
};

const DNASoulProvider = ({ children, userWallet, certificates = [], contract }) => {
  const [soulStage, setSoulStage] = useState(SOUL_STAGES.PORTAL_OPENING);
  const [selectedSoul, setSelectedSoul] = useState(null);
  const [soulEnergy, setSoulEnergy] = useState(0);
  const [isSoulReading, setIsSoulReading] = useState(false);
  const [liveCertificates, setLiveCertificates] = useState(certificates);
  const [burnStates, setBurnStates] = useState({}); // { [tokenId]: { requested, approved, burned, executionTime, reason } }
  const [soulMetrics, setSoulMetrics] = useState({
    knowledgeDensity: 0,
    achievementFrequency: 0,
    soulLevel: 0,
    verifiedSouls: 0,
    totalSouls: 0,
    pendingSouls: 0,
    revokedSouls: 0,
    burnedSouls: 0
  });

  // Fetch burn states for all certificates
  const fetchBurnStates = useCallback(async () => {
    if (!contract || !liveCertificates.length) return;
    
    try {
      console.log('🧬 DNA Soul: Fetching burn states for certificates');
      const timelock = Number(await contract.burnTimelock().catch(() => 0)) || 0;
      const burnStatesPromises = liveCertificates.map(async (cert) => {
        try {
          const tokenId = Number(cert.id);
          const [ts, approved, exists] = await Promise.all([
            contract.burnRequestTimestamps(tokenId).catch(() => 0),
            contract.burnApproved(tokenId).catch(() => false),
            contract.tokenExists(tokenId).catch(() => true)
          ]);
          const tsNum = Number(ts) || 0;
          const isApproved = Boolean(approved);
          const isBurned = exists === false; // if token no longer exists, treat as burned
          if (tsNum > 0 || isApproved || isBurned) {
            return {
              tokenId,
              requested: tsNum > 0,
              approved: isApproved,
              burned: isBurned,
              executionTime: tsNum > 0 ? (tsNum + timelock) * 1000 : undefined,
              reason: undefined
            };
          }
          return null;
        } catch (error) {
          console.warn('Failed to fetch burn state for certificate', cert.id, error);
          return null;
        }
      });
      
      const burnStatesResults = await Promise.all(burnStatesPromises);
      const newBurnStates = {};
      burnStatesResults.forEach(result => {
        if (result) {
          newBurnStates[result.tokenId] = result;
        }
      });
      
      console.log('🧬 DNA Soul: Fetched burn states:', newBurnStates);
      setBurnStates(prev => ({ ...prev, ...newBurnStates }));
    } catch (error) {
      console.warn('🧬 DNA Soul: Failed to fetch burn states:', error);
    }
  }, [contract, liveCertificates]);

  // Keep internal certificates in sync with parent updates
  useEffect(() => {
    setLiveCertificates(certificates);
  }, [certificates]);

  // Fetch burn states when certificates are loaded
  useEffect(() => {
    if (liveCertificates.length > 0 && contract) {
      fetchBurnStates();
    }
  }, [liveCertificates, contract, fetchBurnStates]);

  // Pre-hydrate burn state from contract for visible certificates
  useEffect(() => {
    if (!contract || !liveCertificates?.length) return;

    let cancelled = false;
    (async () => {
      try {
        const timelock = Number(await contract.burnTimelock().catch(() => 0)) || 0;
        const updates = {};
        await Promise.all(liveCertificates.map(async (c) => {
          const idNum = Number(c.id);
          try {
            const [ts, approved] = await Promise.all([
              contract.burnRequestTimestamps(idNum).catch(() => 0),
              contract.burnApproved(idNum).catch(() => false)
            ]);
            const tsNum = Number(ts) || 0;
            if (tsNum > 0 || approved) {
              updates[idNum] = {
                ...(burnStates[idNum] || {}),
                requested: tsNum > 0 || (burnStates[idNum]?.requested ?? false),
                approved: Boolean(approved) || (burnStates[idNum]?.approved ?? false),
                burned: burnStates[idNum]?.burned || false,
                executionTime: tsNum > 0 ? (tsNum + timelock) * 1000 : burnStates[idNum]?.executionTime,
                reason: burnStates[idNum]?.reason
              };
            }
          } catch {}
        }));
        if (!cancelled && Object.keys(updates).length) {
          setBurnStates(prev => ({ ...prev, ...updates }));
        }
      } catch (e) {
        console.warn('Failed to hydrate burn states', e);
      }
    })();

    return () => { cancelled = true; };
  }, [contract, liveCertificates]);

  // Calculate soul metrics from certificates with real-time status tracking
  useEffect(() => {
    if (liveCertificates.length > 0) {
      const verifiedCount = liveCertificates.filter(cert => cert.isVerified && !cert.isRevoked).length;
      const pendingCount = liveCertificates.filter(cert => !cert.isVerified && !cert.isRevoked).length;
      const revokedCount = liveCertificates.filter(cert => cert.isRevoked).length;
      const burnedCount = liveCertificates.filter(cert => {
        const tokenId = cert.id;
        const burnState = burnStates[tokenId];
        // Count as burned if: actually burned OR approved for burning
        const isBurned = burnState?.burned || burnState?.approved || false;
        if (isBurned) {
          console.log('🧬 DNA Soul: Found burned certificate', tokenId, 'burnState:', burnState);
        }
        return isBurned;
      }).length;
      
      // Debug burn states
      console.log('🧬 DNA Soul: Burn states:', burnStates);
      console.log('🧬 DNA Soul: Burned count:', burnedCount);
      const totalCount = liveCertificates.length;
      const knowledgeDensity = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;
      const soulLevel = Math.floor(knowledgeDensity / 20) + 1; // 1-5 levels
      
      setSoulMetrics({
        knowledgeDensity,
        achievementFrequency: totalCount,
        soulLevel,
        verifiedSouls: verifiedCount,
        totalSouls: totalCount,
        pendingSouls: pendingCount,
        revokedSouls: revokedCount,
        burnedSouls: burnedCount
      });
    } else {
      setSoulMetrics(prev => ({ 
        ...prev, 
        knowledgeDensity: 0, 
        achievementFrequency: 0, 
        soulLevel: 0, 
        verifiedSouls: 0, 
        totalSouls: 0,
        pendingSouls: 0,
        revokedSouls: 0,
        burnedSouls: 0
      }));
    }
  }, [liveCertificates, burnStates]);

  // Portal opening sequence
  useEffect(() => {
    if (soulStage === SOUL_STAGES.PORTAL_OPENING) {
      const timer = setTimeout(() => {
        setSoulStage(SOUL_STAGES.DNA_SCANNING);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [soulStage]);

  // DNA scanning sequence
  useEffect(() => {
    if (soulStage === SOUL_STAGES.DNA_SCANNING) {
      const timer = setTimeout(() => {
        setSoulStage(SOUL_STAGES.SOUL_REVEAL);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [soulStage]);

  // Soul reveal sequence
  useEffect(() => {
    if (soulStage === SOUL_STAGES.SOUL_REVEAL) {
      const timer = setTimeout(() => {
        setSoulStage(SOUL_STAGES.REPOSITORY_ACTIVE);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [soulStage]);

  // Get soul status for a certificate
  const getSoulStatus = useCallback((certificate) => {
    if (!certificate) return SOUL_STATUS.PENDING;
    const tokenId = certificate.id;
    if (burnStates[tokenId]?.burned) return SOUL_STATUS.BURNED;
    if (certificate.isRevoked) return SOUL_STATUS.REVOKED;
    if (certificate.isVerified) return SOUL_STATUS.VERIFIED;
    return SOUL_STATUS.PENDING;
  }, [burnStates]);

  const getBurnState = useCallback((tokenId) => {
    if (!tokenId) return undefined;
    return burnStates[tokenId];
  }, [burnStates]);

  // Start soul reading
  const startSoulReading = useCallback((certificate) => {
    setSelectedSoul(certificate);
    setIsSoulReading(true);
    setSoulStage(SOUL_STAGES.SOUL_READING);
  }, []);

  // End soul reading
  const endSoulReading = useCallback(() => {
    setIsSoulReading(false);
    setSelectedSoul(null);
    setSoulStage(SOUL_STAGES.REPOSITORY_ACTIVE);
  }, []);

  // Close soul portal
  const closeSoulPortal = useCallback(() => {
    setSoulStage(SOUL_STAGES.PORTAL_CLOSING);
    setTimeout(() => {
      // This would typically navigate away or close the component
      console.log('Soul portal closed');
    }, 2000);
  }, []);

  // Helper: refresh a single certificate by id
  const refreshCertificateById = useCallback(async (tokenId) => {
    try {
      if (!contract || !tokenId) return;
      const updated = await processCertificatesBatch(contract, [Number(tokenId)]);
      if (!updated || updated.length === 0) return;
      const updatedCert = updated[0];
      setLiveCertificates(prev => {
        const index = prev.findIndex(c => String(c.id) === String(updatedCert.id));
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = { ...copy[index], ...updatedCert };
          return copy;
        }
        return [...prev, updatedCert];
      });
    } catch (e) {
      console.warn('Failed to refresh certificate', tokenId, e);
    }
  }, [contract]);

  // Enhanced real-time certificate refresh for immediate updates
  const refreshCertificateImmediately = useCallback(async (tokenId) => {
    if (!contract || !tokenId) return;
    
    try {
      console.log('🧬 DNA Soul: Immediately refreshing certificate', tokenId);
      const updated = await processCertificatesBatch(contract, [Number(tokenId)]);
      if (updated && updated.length > 0) {
        const updatedCert = updated[0];
        setLiveCertificates(prev => {
          const index = prev.findIndex(c => String(c.id) === String(updatedCert.id));
          if (index >= 0) {
            const copy = [...prev];
            const before = copy[index];
            copy[index] = { ...copy[index], ...updatedCert };
            console.log('🧬 DNA Soul: Certificate updated immediately:', updatedCert.id, {
              before: { verified: before.isVerified, revoked: before.isRevoked, status: before.status },
              after: { verified: updatedCert.isVerified, revoked: updatedCert.isRevoked, status: updatedCert.status }
            });
            return copy;
          }
          console.log('🧬 DNA Soul: Adding new certificate:', updatedCert.id);
          return [...prev, updatedCert];
        });
      } else {
        console.warn('🧬 DNA Soul: No updated certificate data received for token', tokenId);
      }
    } catch (error) {
      console.warn('🧬 DNA Soul: Failed to refresh certificate immediately:', error);
    }
  }, [contract]);

  // Use existing real-time hooks for certificate events
  const { 
    handleCertificateEvent, 
    handleCertificateStatusEvent,
    handleCertificateBurnEvent,
    handleCertificateBurnApprovedEvent,
    handleCertificateBurnedEvent 
  } = useCertificateEvents(
    contract,
    liveCertificates,
    liveCertificates.length, // totalCertificates
    setLiveCertificates,
    () => {}, // setTotalCertificates - not needed for DNA view
    () => {}, // setLastUpdated - not needed for DNA view
    (certs, searchTerm, statusFilter, setVisible) => {
      // Custom update function for DNA view
      setVisible(certs);
    },
    setLiveCertificates, // setVisibleCertificates
    '', // searchTerm - not used in DNA view
    'all', // statusFilter - not used in DNA view
    100, // MAX_CERTIFICATES
    false, // isAdmin - DNA view is for regular users
    false, // isInstitute - DNA view is for regular users
    userWallet // userAddress
  );

  // Use existing real-time updates hook for report data refresh
  const { isRealTimeEnabled } = useRealTimeUpdates(contract, () => {
    // Custom refresh function for DNA view
    console.log('🧬 DNA Soul: Real-time data refresh triggered');
    // The certificate events will handle individual updates
  });

  // Add global admin action detection for immediate updates
  useEffect(() => {
    const handleAdminAction = (event) => {
      if (event.detail && event.detail.type === 'certificateStatusChange') {
        console.log('🧬 DNA Soul: 🚀 Admin action detected - triggering immediate refresh for certificate', event.detail.tokenId);
        if (event.detail.tokenId) {
          refreshCertificateImmediately(event.detail.tokenId);
        } else {
          // Refresh all certificates if no specific token ID
          const allIds = (liveCertificates || [])
            .filter(c => !burnStates[c.id]?.burned)
            .slice(0, 10)
            .map(c => Number(c.id));
          allIds.forEach(id => refreshCertificateImmediately(id));
        }
      }
    };

    // Listen for custom admin action events
    window.addEventListener('adminCertificateAction', handleAdminAction);
    
    return () => {
      window.removeEventListener('adminCertificateAction', handleAdminAction);
    };
  }, [liveCertificates, burnStates, refreshCertificateImmediately]);

  // Enhanced event handlers with immediate updates for ALL certificate status changes
  const handleCertificateIssued = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: 🚀 Certificate issued event detected for token', tokenId);
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleCertificateVerified = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: ✅ Certificate verified event detected for token', tokenId);
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleCertificateRevoked = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: ❌ Certificate revoked event detected for token', tokenId);
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleCertificateUpdated = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: 🔄 Certificate updated event detected for token', tokenId);
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleCertificateStatusChanged = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: 🔀 Certificate status changed event detected for token', tokenId);
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  // Additional event handlers for comprehensive status tracking
  const handleBatchMetadataUpdate = useCallback((fromTokenId, toTokenId) => {
    console.log('🧬 DNA Soul: Batch metadata update event detected from token', fromTokenId, 'to', toTokenId);
    // Refresh all certificates in the range
    for (let id = Number(fromTokenId); id <= Number(toTokenId); id++) {
      refreshCertificateImmediately(id);
    }
  }, [refreshCertificateImmediately]);

  const handleBurnTimelockChanged = useCallback((newTimelock) => {
    console.log('🧬 DNA Soul: Burn timelock changed to', newTimelock);
    // This affects all certificates, so we might want to refresh all pending burn requests
    // For now, just log it as it's a global setting change
  }, []);

  // Custom burn state handlers that integrate with existing hooks
  const handleBurnRequested = useCallback((tokenId, requester, reason, executionTime) => {
    console.log('🧬 DNA Soul: Certificate burn requested event detected for token', tokenId);
    setBurnStates(prev => ({
      ...prev,
      [Number(tokenId)]: {
        ...(prev[Number(tokenId)] || {}),
        requested: true,
        approved: prev[Number(tokenId)]?.approved || false,
        burned: false,
        executionTime: Number(executionTime) ? Number(executionTime) * 1000 : prev[Number(tokenId)]?.executionTime,
        reason: reason || prev[Number(tokenId)]?.reason
      }
    }));
    // Also refresh the certificate immediately
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleBurnApproved = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: Certificate burn approved event detected for token', tokenId);
    setBurnStates(prev => ({
      ...prev,
      [Number(tokenId)]: {
        ...(prev[Number(tokenId)] || {}),
        requested: true,
        approved: true,
        burned: false
      }
    }));
    // Also refresh the certificate immediately
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  const handleBurned = useCallback((tokenId) => {
    console.log('🧬 DNA Soul: Certificate burned event detected for token', tokenId);
    setBurnStates(prev => ({
      ...prev,
      [Number(tokenId)]: {
        ...(prev[Number(tokenId)] || {}),
        requested: true,
        approved: true,
        burned: true
      }
    }));
    // Also refresh the certificate immediately
    refreshCertificateImmediately(tokenId);
  }, [refreshCertificateImmediately]);

  // Set up comprehensive event listeners for ALL certificate status changes
  useEffect(() => {
    if (!contract) return;

    const setupEventListeners = () => {
      console.log('🧬 DNA Soul: Setting up comprehensive real-time event listeners for ALL certificate status changes');
      
      // Core certificate lifecycle events
      contract.on('CertificateIssued', handleCertificateIssued);
      contract.on('CertificateVerified', handleCertificateVerified);
      contract.on('CertificateRevoked', handleCertificateRevoked);
      contract.on('CertificateUpdated', handleCertificateUpdated);
      contract.on('CertificateStatusChanged', handleCertificateStatusChanged);
      
      // Burn-related events
      contract.on('CertificateBurnRequested', handleBurnRequested);
      contract.on('CertificateBurnApproved', handleBurnApproved);
      contract.on('CertificateBurned', handleBurned);
      contract.on('CertificateBurnRequestCanceled', (tokenId, canceler) => {
        console.log('🧬 DNA Soul: 🔥 Certificate burn request canceled for token', tokenId, 'by', canceler);
        refreshCertificateImmediately(tokenId);
      });
      
      // Metadata and batch update events
      contract.on('BatchMetadataUpdate', handleBatchMetadataUpdate);
      contract.on('BurnTimelockChanged', handleBurnTimelockChanged);
      
      // Transfer events (for soulbound tokens, these might indicate status changes)
      contract.on('Transfer', (from, to, tokenId) => {
        console.log('🧬 DNA Soul: 🔄 Transfer event detected for token', tokenId, 'from', from, 'to', to);
        // For soulbound tokens, transfers might indicate status changes
        refreshCertificateImmediately(tokenId);
      });

      // Add test functions to window for debugging
      window.testDNAImmediateRefresh = (tokenId) => {
        console.log('🧬 DNA Soul: 🧪 Testing immediate refresh for token', tokenId);
        refreshCertificateImmediately(tokenId);
      };
      
      window.refreshDNABurnStates = () => {
        console.log('🧬 DNA Soul: 🧪 Testing burn states refresh');
        fetchBurnStates();
      };
    };

    setupEventListeners();

    return () => {
      if (contract) {
        try {
          // Remove all certificate-related event listeners
          contract.removeAllListeners('CertificateIssued');
          contract.removeAllListeners('CertificateVerified');
          contract.removeAllListeners('CertificateRevoked');
          contract.removeAllListeners('CertificateUpdated');
          contract.removeAllListeners('CertificateStatusChanged');
          contract.removeAllListeners('CertificateBurnRequested');
          contract.removeAllListeners('CertificateBurnApproved');
          contract.removeAllListeners('CertificateBurned');
          contract.removeAllListeners('CertificateBurnRequestCanceled');
          contract.removeAllListeners('BatchMetadataUpdate');
          contract.removeAllListeners('BurnTimelockChanged');
          contract.removeAllListeners('Transfer');
          console.log('🧬 DNA Soul: All event listeners removed');
        } catch (error) {
          console.warn('🧬 DNA Soul: Error removing event listeners:', error);
        }
      }
    };
  }, [contract, handleCertificateIssued, handleCertificateVerified, handleCertificateRevoked, handleCertificateUpdated, handleCertificateStatusChanged, handleBurnRequested, handleBurnApproved, handleBurned, handleBatchMetadataUpdate, handleBurnTimelockChanged, refreshCertificateImmediately]);

  // Enhanced periodic refresh for ALL certificate status changes (more aggressive for DNA view)
  useEffect(() => {
    if (!contract) return;

    let lastProcessedBlock = 0;
    const provider = contract.runner && contract.runner.provider;

    const refreshAllCertificates = async () => {
      try {
        // Check all certificates, not just pending ones, for any status changes
        const allIds = (liveCertificates || [])
          .filter(c => !burnStates[c.id]?.burned) // Skip already burned certificates
          .slice(0, 15) // Increased limit for comprehensive checking
          .map(c => Number(c.id));
        if (allIds.length === 0) return;
        
        console.log('🧬 DNA Soul: Checking all certificates for status updates:', allIds);
        const updated = await processCertificatesBatch(contract, allIds);
        if (!updated || updated.length === 0) return;
        
        setLiveCertificates(prev => {
          const copy = [...prev];
          let changed = false;
          updated.forEach(u => {
            const i = copy.findIndex(c => String(c.id) === String(u.id));
            if (i >= 0) {
              const before = copy[i];
              // Check for ANY status change, not just verification/revocation
              const statusChanged = (
                before.isVerified !== u.isVerified || 
                before.isRevoked !== u.isRevoked ||
                before.status !== u.status ||
                before.lastUpdated !== u.lastUpdated ||
                before.metadataHash !== u.metadataHash
              );
              
              if (statusChanged) {
                console.log('🧬 DNA Soul: 🔄 Status change detected for certificate', u.id, {
                  verified: u.isVerified,
                  revoked: u.isRevoked,
                  status: u.status,
                  lastUpdated: u.lastUpdated
                });
                copy[i] = { ...before, ...u };
                changed = true;
              }
            }
          });
          return changed ? copy : prev;
        });
      } catch (error) {
        console.warn('🧬 DNA Soul: Error in periodic refresh:', error);
      }
    };

    // Add immediate refresh on any blockchain activity
    const handleBlockchainActivity = async () => {
      console.log('🧬 DNA Soul: 🔥 Blockchain activity detected - triggering immediate refresh');
      await refreshAllCertificates();
    };

    let intervalId;
    let unsubscribe;

    if (provider && typeof provider.on === 'function') {
      const onBlock = async (blockNumber) => {
        // Very aggressive block checking for DNA view (every block for immediate updates)
        if (blockNumber - lastProcessedBlock >= 1) {
          lastProcessedBlock = blockNumber;
          console.log('🧬 DNA Soul: New block detected', blockNumber, '- triggering refresh');
          await refreshAllCertificates();
        }
      };
      provider.on('block', onBlock);
      unsubscribe = () => provider.removeListener('block', onBlock);
    } else {
      // More frequent polling for DNA view (every 5 seconds for comprehensive updates)
      intervalId = setInterval(refreshAllCertificates, 5000);
    }

    // Add manual refresh function to window for testing
    window.refreshDNACertificates = refreshAllCertificates;

    return () => {
      if (unsubscribe) try { unsubscribe(); } catch {}
      if (intervalId) clearInterval(intervalId);
    };
  }, [contract, liveCertificates, burnStates]);

  const value = useMemo(() => ({
    soulStage,
    setSoulStage,
    selectedSoul,
    setSelectedSoul,
    soulEnergy,
    setSoulEnergy,
    isSoulReading,
    setIsSoulReading,
    soulMetrics,
    userWallet,
    certificates: liveCertificates,
    getSoulStatus,
    getBurnState,
    startSoulReading,
    endSoulReading,
    closeSoulPortal
  }), [
    soulStage,
    selectedSoul,
    soulEnergy,
    isSoulReading,
    soulMetrics,
    userWallet,
    liveCertificates,
    getSoulStatus,
    getBurnState,
    startSoulReading,
    endSoulReading,
    closeSoulPortal
  ]);

  return (
    <DNASoulContext.Provider value={value}>
      {children}
    </DNASoulContext.Provider>
  );
};

export default DNASoulProvider;
export { useDNASoul };
