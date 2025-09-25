import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../config/contractAddress.json';
import contractABI from '../config/abi.json';

/**
 * Custom hook for fetching institution-related statistics
 * Uses direct contract calls instead of complex event parsing for better reliability
 */
const useInstitutionStats = (contract, roleConstants, currentAccount) => {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalCertificates: 0,
    verifiedCertificates: 0,
    pendingCertificates: 0,    // 🔥 DIRECT pending count
    revokedCertificates: 0,    // 🔥 DIRECT revoked count
    issuedByCurrentInstitution: 0,
    activeInstitutionAddresses: [],
    lastUpdated: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get active institution addresses using role-based approach
  const getActiveInstitutionAddresses = useCallback(async () => {
    if (!contract || !roleConstants?.INSTITUTION_ROLE) {
      return [];
    }

    try {
      // Get RoleGranted events for INSTITUTION_ROLE to find all addresses that ever had the role
      const grantFilter = contract.filters.RoleGranted(roleConstants.INSTITUTION_ROLE);
      const grantEvents = await contract.queryFilter(grantFilter, 0, "latest");
      
      // Get RoleRevoked events to subtract revoked institutions
      const revokeFilter = contract.filters.RoleRevoked(roleConstants.INSTITUTION_ROLE);
      const revokeEvents = await contract.queryFilter(revokeFilter, 0, "latest");

      // Build set of addresses that currently have the role
      const institutionsSet = new Set();
      
      // Add all granted addresses
      grantEvents.forEach(event => {
        if (event.args?.account) {
          institutionsSet.add(event.args.account.toLowerCase());
        }
      });
      
      // Remove all revoked addresses
      revokeEvents.forEach(event => {
        if (event.args?.account) {
          institutionsSet.delete(event.args.account.toLowerCase());
        }
      });

      // Verify each address still has the role (for accuracy)
      // IMPORTANT: Exclude admins from institution counts
      const activeAddresses = [];
      const verificationPromises = Array.from(institutionsSet).map(async (address) => {
        try {
          const hasRole = await contract.hasRole(roleConstants.INSTITUTION_ROLE, address);
          // Check if this address is an admin (we want to exclude admins from institution stats)
          const DEFAULT_ADMIN_ROLE = roleConstants.DEFAULT_ADMIN_ROLE || ethers.ZeroHash;
          const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, address);
          
          // Only include if they have institution role AND are not admins
          if (hasRole && !isAdmin) {
            activeAddresses.push(address);
          }
        } catch (err) {
          console.warn(`Error verifying role for ${address}:`, err);
        }
      });

      await Promise.all(verificationPromises);
      return activeAddresses;

    } catch (error) {
      console.error('Error counting active institutions:', error);
      throw new Error('Failed to count active institutions');
    }
  }, [contract, roleConstants]);

  // Fetch all institution statistics
  const fetchInstitutionStats = useCallback(async () => {
    if (!contract) {
      setError('Contract not available');
      console.log('useInstitutionStats: Contract not available');
      return;
    }

    if (!roleConstants?.INSTITUTION_ROLE) {
      setError('Role constants not available');
      console.log('useInstitutionStats: Role constants not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('useInstitutionStats: Fetching institution statistics...');
      console.log('useInstitutionStats: Contract available:', !!contract);
      console.log('useInstitutionStats: Role constants available:', !!roleConstants?.INSTITUTION_ROLE);
      console.log('useInstitutionStats: Current account:', currentAccount);

      // Check if current account is an institution (not admin)
      const isCurrentAccountInstitution = currentAccount && 
        (await contract.hasRole(roleConstants.INSTITUTION_ROLE, currentAccount).catch(() => false)) &&
        !(await contract.hasRole(roleConstants.DEFAULT_ADMIN_ROLE || ethers.ZeroHash, currentAccount).catch(() => false));

      console.log('useInstitutionStats: Current account is institution (not admin):', isCurrentAccountInstitution);

      // Fetch all statistics using DIRECT O(1) contract calls where possible (no 1000 cap)
      const [
        totalSupply,
        verifiedCountBN,
        revokedCountBN,
        pendingCountBN,
        activeInstitutionAddresses,
        currentInstitutionCount
      ] = await Promise.all([
        // Total certificates (global, uncapped)
        contract.totalSupply(),
        // Global verified count (verified=true, revoked=false)
        contract.countCertificatesByStatus(true, false),
        // Global revoked count (verified=false, revoked=true)
        contract.countCertificatesByStatus(false, true),
        // Global pending count (verified=false, revoked=false)
        contract.countCertificatesByStatus(false, false),
        // Active institution addresses
        getActiveInstitutionAddresses(),
        // Certificates issued by current institution (if applicable)
        currentAccount ? 
          contract.countCertificatesByInstitution(currentAccount).catch(() => 0) : 
          Promise.resolve(0)
      ]);

      // Calculate institution-specific pending counts if this is an institution
      let institutionSpecificPendingCount = Number(pendingCountBN?.toString?.() || pendingCountBN || 0); // Default to global
      
      if (isCurrentAccountInstitution && currentAccount) {
        try {
          // Paginate through all certificates issued by this institution
          const pageSize = 1000;
          let startIndex = 0;
          let allTokenIds = [];
          for (;;) {
            const ids = await contract.getCertificatesByInstitution(currentAccount, startIndex, pageSize).catch(() => []);
            if (!ids || ids.length === 0) break;
            allTokenIds = allTokenIds.concat(ids);
            if (ids.length < pageSize) break;
            startIndex += pageSize;
          }
          
          // Batch fetch certificate statuses to count pending (= not verified and not revoked)
          let pendingForInstitution = 0;
          const batchSize = 500;
          for (let i = 0; i < allTokenIds.length; i += batchSize) {
            const batch = allTokenIds.slice(i, i + batchSize);
            try {
              const batchDetails = await contract.getCertificatesBatch(batch);
              const verificationStatuses = batchDetails?.verificationStatuses || [];
              const revocationStatuses = batchDetails?.revocationStatuses || [];
              for (let j = 0; j < batch.length; j++) {
                const isVerified = Boolean(verificationStatuses[j]);
                const isRevoked = Boolean(revocationStatuses[j]);
                if (!isVerified && !isRevoked) pendingForInstitution++;
              }
            } catch (batchErr) {
              console.warn('useInstitutionStats: Error in getCertificatesBatch, falling back to single fetch for this batch:', batchErr);
              // Fallback to single calls (slower)
              for (const tokenId of batch) {
                try {
                  const cert = await contract.getCertificate(tokenId);
                  const isVerified = Boolean(cert[6]);
                  const isRevoked = Boolean(cert[8]);
                  if (!isVerified && !isRevoked) pendingForInstitution++;
                } catch (singleErr) {
                  console.warn(`useInstitutionStats: Failed to fetch certificate ${tokenId}:`, singleErr);
                }
              }
            }
          }
          institutionSpecificPendingCount = pendingForInstitution;
          console.log('useInstitutionStats: Institution-specific pending count computed with pagination:', institutionSpecificPendingCount);
        } catch (error) {
          console.warn('useInstitutionStats: Error calculating institution-specific pending count, using global:', error);
        }
      }

      // Extract counts from direct contract arrays
      const verifiedCount = Number(verifiedCountBN?.toString?.() || verifiedCountBN || 0);
      const revokedCount = Number(revokedCountBN?.toString?.() || revokedCountBN || 0);
      const pendingCountGlobal = Number(pendingCountBN?.toString?.() || pendingCountBN || 0);
      const pendingCount = isCurrentAccountInstitution ? institutionSpecificPendingCount : pendingCountGlobal;

      console.log('useInstitutionStats: Direct contract call results:', {
        totalSupply: totalSupply.toString(),
        verifiedCount: verifiedCount,
        pendingCount: pendingCount,
        revokedCount: revokedCount,
        institutionCount: activeInstitutionAddresses.length,
        currentInstitutionCount: currentInstitutionCount.toString()
      });

      const newStats = {
        totalInstitutions: activeInstitutionAddresses.length,
        totalCertificates: Number(totalSupply.toString()),
        verifiedCertificates: verifiedCount,
        pendingCertificates: pendingCount,  // 🔥 DIRECT pending count
        revokedCertificates: revokedCount,  // 🔥 DIRECT revoked count
        issuedByCurrentInstitution: Number(currentInstitutionCount.toString()),
        activeInstitutionAddresses,
        lastUpdated: Date.now()
      };

      setStats(newStats);
      
      console.log('useInstitutionStats: Institution statistics updated:', newStats);

    } catch (err) {
      console.error('Error fetching institution statistics:', err);
      setError(err.message || 'Failed to fetch institution statistics');
    } finally {
      setIsLoading(false);
    }
  }, [contract, roleConstants, currentAccount, getActiveInstitutionAddresses]);

  // Refresh stats manually
  const refreshStats = useCallback(() => {
    fetchInstitutionStats();
  }, [fetchInstitutionStats]);

  // Auto-fetch stats when dependencies change
  useEffect(() => {
    if (contract && roleConstants?.INSTITUTION_ROLE) {
      fetchInstitutionStats();
      
      // NEW: Smart event listener - only updates when blockchain events actually happen!
      const setupEventListeners = async () => {
        try {
          const { BrowserProvider } = await import('ethers');
          const provider = new BrowserProvider(window.ethereum);
          
          // Listen for new blocks (this is lightweight)
          provider.on('block', async (blockNumber) => {
            console.log('useInstitutionStats: New block detected:', blockNumber);
            
            // Check if this block contains relevant events
            const { Contract } = await import('ethers');
            const fullContract = new Contract(
              contractAddress.SoulboundCertificateNFT,
              contractABI.SoulboundCertificateNFT,
              provider
            );

            // Check for new events in this block
            const [issuedEvents, verifiedEvents, revokedEvents] = await Promise.all([
              fullContract.queryFilter(fullContract.filters.CertificateIssued(), blockNumber, blockNumber),
              fullContract.queryFilter(fullContract.filters.CertificateVerified(), blockNumber, blockNumber),
              fullContract.queryFilter(fullContract.filters.CertificateRevoked(), blockNumber, blockNumber)
            ]);

            const hasNewEvents = issuedEvents.length > 0 || verifiedEvents.length > 0 || revokedEvents.length > 0;
            
            if (hasNewEvents) {
              console.log('useInstitutionStats: New events detected! Auto-updating stats...');
              fetchInstitutionStats(); // Refresh stats automatically
            } else {
              console.log('useInstitutionStats: New block but no relevant events, no update needed');
            }
          });
          
          console.log('useInstitutionStats: Event listener set up - will auto-update on blockchain events');
        } catch (error) {
          console.warn('useInstitutionStats: Error setting up event listener:', error);
        }
      };
      
      setupEventListeners();
      
      // Cleanup function
      return () => {
        if (window.ethereum) {
          const cleanup = async () => {
            try {
              const { BrowserProvider } = await import('ethers');
              const provider = new BrowserProvider(window.ethereum);
              provider.removeAllListeners('block');
              console.log('useInstitutionStats: Event listeners cleaned up');
            } catch (error) {
              console.warn('useInstitutionStats: Error cleaning up listeners:', error);
            }
          };
          cleanup();
        }
      };
    }
  }, [contract, roleConstants, currentAccount, fetchInstitutionStats]);

  // Enhanced statistics with direct contract values (no calculations)
  const derivedStats = {
    ...stats,
    // 🔥 Use DIRECT pending count from contract (not calculated)
    pendingVerification: stats.pendingCertificates || 0,
    verificationRate: stats.totalCertificates > 0 
      ? Math.round((stats.verifiedCertificates / stats.totalCertificates) * 100) 
      : 0,
    revocationRate: stats.totalCertificates > 0 
      ? Math.round((stats.revokedCertificates / stats.totalCertificates) * 100) 
      : 0,
    institutionUtilization: stats.totalInstitutions > 0 
      ? Math.round((stats.totalCertificates / stats.totalInstitutions) * 100) / 100
      : 0
  };

  return {
    stats: derivedStats,
    isLoading,
    error,
    refreshStats,
    clearError: () => setError(null)
  };
};

export default useInstitutionStats;
