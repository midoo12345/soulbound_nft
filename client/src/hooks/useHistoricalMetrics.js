import { useState, useEffect } from 'react';
import contractAddress from '../config/contractAddress.json';
import contractABI from '../config/abi.json';

/**
 * Custom hook for fetching historical metrics from blockchain events
 * Uses real contract events to calculate historical performance trends
 */
const useHistoricalMetrics = (contract) => {
  console.log('useHistoricalMetrics: Hook initialized with contract:', !!contract, !!contract?.provider);
  
  const [historicalData, setHistoricalData] = useState({
    verificationRates: [],
    efficiencyScores: [],
    months: [],
    isLoading: false,
    error: null
  });

  // Add caching to prevent unnecessary API calls
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [cachedData, setCachedData] = useState(null);
  const [lastBlockNumber, setLastBlockNumber] = useState(0);
  const CACHE_DURATION = 300000; // 5 minutes cache (longer since we're monitoring blocks)

  const fetchHistoricalData = async (forceRefresh = false) => {
    console.log('useHistoricalMetrics: fetchHistoricalData called, forceRefresh:', forceRefresh);
    
    // Check if we can use cached data
    const now = Date.now();
    if (!forceRefresh && cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('useHistoricalMetrics: Using cached data, last fetch:', Math.round((now - lastFetchTime) / 1000), 'seconds ago');
      return;
    }

    // Check if contract and provider are available
    if (!contract) {
      console.log('useHistoricalMetrics: Contract not available');
      return;
    }

    // Get provider directly from window.ethereum (same as useWalletRoles)
    let provider;
    try {
      if (window.ethereum) {
        const { BrowserProvider } = await import('ethers');
        provider = new BrowserProvider(window.ethereum);
        console.log('useHistoricalMetrics: Created new provider from window.ethereum');
      } else {
        console.log('useHistoricalMetrics: No window.ethereum available');
        return;
      }
    } catch (error) {
      console.log('useHistoricalMetrics: Error creating provider:', error);
      return;
    }
    
    if (!provider) {
      console.log('useHistoricalMetrics: No provider available');
      return;
    }

    // Create a new contract instance with the full ABI (same as useInstitutionStats)
    let fullContract;
    try {
      const { Contract } = await import('ethers');
      fullContract = new Contract(
        contractAddress.sepolia.SoulboundCertificateNFT,
        contractABI.SoulboundCertificateNFT,
        provider
      );
      console.log('useHistoricalMetrics: Created new contract instance with full ABI');
    } catch (error) {
      console.log('useHistoricalMetrics: Error creating contract instance:', error);
      return;
    }

    console.log('useHistoricalMetrics: Contract and provider available, starting fetch...');
    setHistoricalData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('useHistoricalMetrics: Fetching historical data...');
      
      // OPTIMIZED: Only fetch totalSupply first, then fetch IDs only if needed
      const totalCertificates = await fullContract.totalSupply();
      console.log('useHistoricalMetrics: Total certificates:', totalCertificates.toString());

      // If no certificates exist yet, return empty data
      if (totalCertificates.toString() === '0') {
        console.log('useHistoricalMetrics: No certificates yet - new contract');
        const emptyData = {
          verificationRates: [],
          efficiencyScores: [],
          months: [],
          isLoading: false,
          error: null
        };
        setHistoricalData(emptyData);
        setCachedData(emptyData);
        setLastFetchTime(now);
        return;
      }

      // Use direct O(1) counts from contract (no 1000 cap)
      const [verifiedCountBN, revokedCountBN] = await Promise.all([
        fullContract.countCertificatesByStatus(true, false),
        fullContract.countCertificatesByStatus(false, true)
      ]);

      const totalCount = parseInt(totalCertificates.toString());
      const verifiedCount = parseInt(verifiedCountBN.toString());
      const revokedCount = parseInt(revokedCountBN.toString());

      console.log('useHistoricalMetrics: Current state (counts):', {
        total: totalCount,
        verified: verifiedCount,
        revoked: revokedCount
      });

      // Calculate current rates using full counts
      const currentVerificationRate = totalCount > 0 
        ? Math.round((verifiedCount / totalCount) * 100) 
        : 0;
      
      const currentEfficiency = totalCount > 0 
        ? Math.round((verifiedCount / Math.max(1, totalCount - revokedCount)) * 100) 
        : 0;

      console.log('useHistoricalMetrics: Calculated rates:', {
        verificationRate: currentVerificationRate,
        efficiency: currentEfficiency
      });

      // SIMPLIFIED: Always show current data first
      let historicalData = {
        verificationRates: [currentVerificationRate],
        efficiencyScores: [currentEfficiency],
        months: ['Current']
      };

      console.log('useHistoricalMetrics: Initial historicalData created:', historicalData);

      // OPTIMIZED: Only fetch recent events if we have significant activity
      if (verifiedCount > 0 || totalCount > 0) {
        try {
          const currentBlock = await provider.getBlockNumber();
          const fromBlock = Math.max(0, currentBlock - 1000);
          
          const [issuedEvents, verifiedEvents, revokedEvents] = await Promise.all([
            fullContract.queryFilter(fullContract.filters.CertificateIssued(), fromBlock, "latest"),
            fullContract.queryFilter(fullContract.filters.CertificateVerified(), fromBlock, "latest"),
            fullContract.queryFilter(fullContract.filters.CertificateRevoked(), fromBlock, "latest")
          ]);

          console.log('useHistoricalMetrics: Recent events fetched:', {
            issued: issuedEvents.length,
            verified: verifiedEvents.length,
            revoked: revokedEvents.length
          });

          // If we have recent events, add them to the trend
          if (issuedEvents.length > 0 || verifiedEvents.length > 0) {
            const now = Date.now();
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            
            let recentIssued = 0;
            let recentVerified = 0;
            let recentRevoked = 0;
            
            // Count recent events
            for (const event of issuedEvents) {
              try {
                const block = await provider.getBlock(event.blockNumber);
                if (block.timestamp * 1000 > oneWeekAgo) {
                  recentIssued++;
                }
              } catch (error) {
                console.warn('Error processing issued event:', error);
              }
            }
            
            for (const event of verifiedEvents) {
              try {
                const block = await provider.getBlock(event.blockNumber);
                if (block.timestamp * 1000 > oneWeekAgo) {
                  recentVerified++;
                }
              } catch (error) {
                console.warn('Error processing verified event:', error);
              }
            }
            
            for (const event of revokedEvents) {
              try {
                const block = await provider.getBlock(event.blockNumber);
                if (block.timestamp * 1000 > oneWeekAgo) {
                  recentRevoked++;
                }
              } catch (error) {
                console.warn('Error processing revoked event:', error);
              }
            }

            // Add recent trend data
            if (recentIssued > 0 || recentVerified > 0) {
              const recentVerificationRate = recentIssued > 0 
                ? Math.round((recentVerified / Math.max(1, recentIssued)) * 100) 
                : currentVerificationRate;
              
              const recentEfficiency = recentIssued > 0 
                ? Math.round((recentVerified / Math.max(1, recentIssued - recentRevoked)) * 100) 
                : currentEfficiency;

              historicalData.verificationRates.unshift(recentVerificationRate);
              historicalData.efficiencyScores.unshift(recentEfficiency);
              historicalData.months.unshift('Recent');
            }
          }
        } catch (eventError) {
          console.warn('useHistoricalMetrics: Error fetching recent events, showing current data only:', eventError);
          // Continue with current data only
        }
      }

      // CRITICAL FIX: Ensure we always have data arrays with at least one element
      if (historicalData.verificationRates.length === 0) {
        historicalData.verificationRates = [currentVerificationRate];
      }
      if (historicalData.efficiencyScores.length === 0) {
        historicalData.efficiencyScores = [currentEfficiency];
      }
      if (historicalData.months.length === 0) {
        historicalData.months = ['Current'];
      }

      // ALWAYS set the data, regardless of events
      console.log('useHistoricalMetrics: Final data to set:', historicalData);
      console.log('useHistoricalMetrics: Array lengths:', {
        verificationRates: historicalData.verificationRates.length,
        efficiencyScores: historicalData.efficiencyScores.length,
        months: historicalData.months.length
      });
      
      const finalData = {
        ...historicalData,
        isLoading: false,
        error: null
      };
      
      setHistoricalData(finalData);
      setCachedData(finalData);
      setLastFetchTime(now);

    } catch (error) {
      console.error('Error fetching historical data:', error);
      setHistoricalData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
  };

  // NEW: Smart background monitoring that only checks for new blocks
  const checkForNewData = async () => {
    if (!contract) return;

    try {
      // Get provider for block checking
      if (!window.ethereum) return;
      
      const { BrowserProvider } = await import('ethers');
      const provider = new BrowserProvider(window.ethereum);
      
      // Check current block number
      const currentBlock = await provider.getBlockNumber();
      
      // Only proceed if we have a new block
      if (currentBlock > lastBlockNumber) {
        console.log('useHistoricalMetrics: New block detected:', currentBlock, 'vs', lastBlockNumber);
        
        // Check if this block contains relevant events
        const { Contract } = await import('ethers');
        const fullContract = new Contract(
          contractAddress.SoulboundCertificateNFT,
          contractABI.SoulboundCertificateNFT,
          provider
        );

        // Check for new events in this block
        const [issuedEvents, verifiedEvents, revokedEvents] = await Promise.all([
          fullContract.queryFilter(fullContract.filters.CertificateIssued(), currentBlock, currentBlock),
          fullContract.queryFilter(fullContract.filters.CertificateVerified(), currentBlock, currentBlock),
          fullContract.queryFilter(fullContract.filters.CertificateRevoked(), currentBlock, currentBlock)
        ]);

        const hasNewEvents = issuedEvents.length > 0 || verifiedEvents.length > 0 || revokedEvents.length > 0;
        
        if (hasNewEvents) {
          console.log('useHistoricalMetrics: New events detected, refreshing data...');
          setLastBlockNumber(currentBlock);
          fetchHistoricalData(true); // Force refresh
        } else {
          console.log('useHistoricalMetrics: New block but no relevant events, updating block number only');
          setLastBlockNumber(currentBlock);
        }
      }
    } catch (error) {
      console.warn('useHistoricalMetrics: Error checking for new data:', error);
    }
  };

  // Only fetch data when contract is available
  useEffect(() => {
    console.log('useHistoricalMetrics: useEffect triggered, contract:', !!contract);
    
    if (contract) {
      // Check if we can create a provider from window.ethereum
      const canCreateProvider = window.ethereum;
      console.log('useHistoricalMetrics: Can create provider:', canCreateProvider);
      
      if (canCreateProvider) {
        console.log('useHistoricalMetrics: Contract available, calling fetchHistoricalData');
        fetchHistoricalData();
        
        // NEW: Smart event listener - only updates when blockchain events actually happen!
        const setupEventListeners = async () => {
          try {
            const { BrowserProvider } = await import('ethers');
            const provider = new BrowserProvider(window.ethereum);
            
            // Listen for new blocks (this is lightweight)
            provider.on('block', async (blockNumber) => {
              console.log('useHistoricalMetrics: New block detected:', blockNumber);
              
              // Only check for events if this is a new block
              if (blockNumber > lastBlockNumber) {
                console.log('useHistoricalMetrics: Checking for new events in block:', blockNumber);
                
                const { Contract } = await import('ethers');
                const fullContract = new Contract(
                  contractAddress.SoulboundCertificateNFT,
                  contractABI.SoulboundCertificateNFT,
                  provider
                );

                // Check if this block contains relevant events
                const [issuedEvents, verifiedEvents, revokedEvents] = await Promise.all([
                  fullContract.queryFilter(fullContract.filters.CertificateIssued(), blockNumber, blockNumber),
                  fullContract.queryFilter(fullContract.filters.CertificateVerified(), blockNumber, blockNumber),
                  fullContract.queryFilter(fullContract.filters.CertificateRevoked(), blockNumber, blockNumber)
                ]);

                const hasNewEvents = issuedEvents.length > 0 || verifiedEvents.length > 0 || revokedEvents.length > 0;
                
                if (hasNewEvents) {
                  console.log('useHistoricalMetrics: New events detected! Auto-updating data...');
                  setLastBlockNumber(blockNumber);
                  fetchHistoricalData(true); // Force refresh with new data
                } else {
                  console.log('useHistoricalMetrics: New block but no relevant events, updating block number only');
                  setLastBlockNumber(blockNumber);
                }
              }
            });
            
            console.log('useHistoricalMetrics: Event listener set up - will auto-update on blockchain events');
          } catch (error) {
            console.warn('useHistoricalMetrics: Error setting up event listener:', error);
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
                console.log('useHistoricalMetrics: Event listeners cleaned up');
              } catch (error) {
                console.warn('useHistoricalMetrics: Error cleaning up listeners:', error);
              }
            };
            cleanup();
          }
        };
      } else {
        console.log('useHistoricalMetrics: Contract available but no window.ethereum, setting empty state');
        setHistoricalData({
          verificationRates: [],
          efficiencyScores: [],
          months: [],
          isLoading: false,
          error: null
        });
      }
    } else {
      console.log('useHistoricalMetrics: Contract not available, setting empty state');
      setHistoricalData({
        verificationRates: [],
        efficiencyScores: [],
        months: [],
        isLoading: false,
        error: null
      });
    }
  }, [contract]);

  console.log('useHistoricalMetrics: Returning data:', historicalData);
  
  return { 
    historicalData, 
    refreshHistoricalData: fetchHistoricalData,
    isLoading: historicalData.isLoading,
    error: historicalData.error
  };
};

export default useHistoricalMetrics;
