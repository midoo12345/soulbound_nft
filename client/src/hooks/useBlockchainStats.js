import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import contractABI from '../config/abi.json';
import contractAddress from '../config/contractAddress.json';

// Cache management for instant loading
const CACHE_KEY = 'blockchain_stats_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Block querying configuration
const BLOCK_QUERY_CONFIG = {
    MAX_BLOCK_RANGE: 500,         // Maximum blocks to query in one chunk (RPC provider limit)
    MAX_HISTORY_BLOCKS: 10000,    // Maximum blocks to look back
    QUERY_TIMEOUT: 30000,         // Timeout for queries in ms
    RETRY_DELAY: 100,             // Delay between chunks in ms
    FALLBACK_BLOCKS: 5000         // Fallback to recent blocks if query fails
};

// Helper function to convert BigInt values to strings for serialization
const serializeData = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

const getCachedData = () => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                // Restore Date objects from cached data
                if (data.recentCertificate && data.recentCertificate.completionDate) {
                    data.recentCertificate.completionDate = new Date(data.recentCertificate.completionDate);
                }
                return data;
            }
        }
    } catch (error) {
        // Silently handle cache read errors
    }
    return null;
};

const setCachedData = (data) => {
    try {
        const serializedData = serializeData(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: serializedData,
            timestamp: Date.now()
        }));
    } catch (error) {
        // Silently handle cache write errors
    }
};

const useBlockchainStats = () => {
    const [stats, setStats] = useState(() => {
        // Try to load from cache immediately for instant display
        const cached = getCachedData();
        if (cached && !cached.loading) {
            return cached;
        }
        
        // Show loading state while fetching real data
        return {
            totalCertificates: 0,
            verifiedCertificates: 0,
            pendingCertificates: 0,
            revokedCertificates: 0,
            authorizedInstitutions: 0,
            recentCertificate: null,
            loading: true,
            error: null
        };
    });

    const [realtimeActivity, setRealtimeActivity] = useState([]);

    const [isConnectedToBlockchain, setIsConnectedToBlockchain] = useState(false);
    const [connectionHealth, setConnectionHealth] = useState({ latency: 0, stability: 'unknown' });
    const [retryCount, setRetryCount] = useState(0);
    const retryTimeoutRef = useRef(null);
    const connectionStartTime = useRef(Date.now());

    // Enhanced connection with health monitoring
    const testConnection = useCallback(async (provider) => {
        const start = Date.now();
        try {
            await provider.getBlockNumber();
            const latency = Date.now() - start;
            setConnectionHealth({ 
                latency, 
                stability: latency < 1000 ? 'excellent' : latency < 3000 ? 'good' : 'slow' 
            });
            return true;
        } catch (error) {
            setConnectionHealth({ latency: 0, stability: 'failed' });
            return false;
        }
    }, []);

    // Smart retry logic with exponential backoff
    const scheduleRetry = useCallback((attempt) => {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
        
        retryTimeoutRef.current = setTimeout(() => {
            setRetryCount(attempt + 1);
        }, delay);
    }, []);

    const fetchBlockchainData = useCallback(async (isRetry = false) => {
        try {
            if (!isRetry) {
                connectionStartTime.current = Date.now();
            }

            // Create provider with timeout
            const rpcUrl = import.meta.env.REACT_APP_RPC_URL;
            
            if (!rpcUrl) {
                throw new Error("RPC URL not configured");
            }
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            
            // Test connection health first
            const isHealthy = await testConnection(provider);
            if (!isHealthy && !isRetry) {
                throw new Error("Network connectivity test failed");
            }

            const contract = new ethers.Contract(
                contractAddress.SoulboundCertificateNFT,
                contractABI.SoulboundCertificateNFT,
                provider
            );

            // SIMPLE APPROACH: Direct contract calls like Analytics components
            
            // 1. Get total certificates (totalSupply)
            const totalSupply = await contract.totalSupply();
            const totalCerts = Number(totalSupply);
            
            // 2. Get verified certificates count
            const verifiedCount = await contract.countCertificatesByStatus(true, false);
            const verifiedCerts = Number(verifiedCount);
            
            // 3. Get pending certificates count
            const pendingCount = await contract.countCertificatesByStatus(false, false);
            const pendingCerts = Number(pendingCount);
            
            // 4. Get revoked certificates count
            const revokedCount = await contract.countCertificatesByStatus(false, true);
            const revokedCerts = Number(revokedCount);

            // 5. Get recent certificates if any exist
            let recentCertificate = null;
            if (totalCerts > 0) {
                try {
                    const recentCerts = await contract.getRecentCertificates(1);
                    if (recentCerts.length > 0) {
                        const certDetails = await contract.getCertificate(recentCerts[0]);
                        const courseName = await contract.getCourseName(certDetails.courseId);
                        
                        recentCertificate = {
                            tokenId: recentCerts[0].toString(),
                            student: certDetails.student,
                            courseName: courseName,
                            completionDate: new Date(Number(certDetails.completionDate) * 1000),
                            grade: Number(certDetails.grade),
                            isVerified: certDetails.isVerified,
                            institution: certDetails.institution
                        };
                    }
                } catch (err) {
                }
            }

            const newStats = {
                totalCertificates: totalCerts,
                verifiedCertificates: verifiedCerts,
                pendingCertificates: pendingCerts,
                revokedCertificates: revokedCerts,
                authorizedInstitutions: 0, // Will be provided by useInstitutionStats
                recentCertificate,
                loading: false,
                error: null
            };
            
            // Cache the successful data
            setCachedData(newStats);
            setStats(newStats);
            setIsConnectedToBlockchain(true);
            setRetryCount(0); // Reset retry count on success

        } catch (error) {
            setIsConnectedToBlockchain(false);
            
            // Smart retry logic
            if (retryCount < 3) {
                scheduleRetry(retryCount);
                return; // Don't set fallback data yet, keep retrying
            }
            
            // After retries, show error state but keep trying in background
            setStats(prev => ({
                ...prev,
                loading: false,
                error: `Failed to fetch blockchain data: ${error.message}`
            }));
            
            // Keep trying to reconnect in background
            setTimeout(() => {
                setRetryCount(0);
                fetchBlockchainData(true);
            }, 10000); // Try again in 10 seconds
        }
    }, [testConnection, scheduleRetry, retryCount]);

    // Manual refresh function for users
    const refreshData = useCallback(() => {
        setRetryCount(0);
        setStats(prev => ({ ...prev, loading: true, error: null }));
        fetchBlockchainData();
    }, [fetchBlockchainData]);

    // Initial fetch and interval setup
    useEffect(() => {
        // Always try to fetch real blockchain data immediately
        fetchBlockchainData();
        
        // Refresh data every 30 seconds to keep it current
        const interval = setInterval(() => fetchBlockchainData(), 30000);
        
        return () => {
            clearInterval(interval);
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [fetchBlockchainData]);

    return { 
        ...stats, 
        realtimeActivity, 
        connectionHealth,
        isConnectedToBlockchain,
        refreshData,
        // Add the new fields explicitly
        pendingCertificates: stats.pendingCertificates || 0,
        revokedCertificates: stats.revokedCertificates || 0
    };
};

export default useBlockchainStats;