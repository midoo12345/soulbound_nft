import { useState, useEffect, useMemo } from 'react';
import useBlockchainStats from './useBlockchainStats';

const useMinimalMetrics = () => {
    const { totalCertificates, verifiedCertificates, authorizedInstitutions, loading } = useBlockchainStats();
    
    const [networkStatus, setNetworkStatus] = useState('optimal');
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Simple status check without complex animations
    useEffect(() => {
        const updateStatus = () => {
            setLastUpdate(new Date());
            // Simple status rotation for demo
            const statuses = ['optimal', 'good', 'active'];
            setNetworkStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        };

        const interval = setInterval(updateStatus, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const cleanStats = useMemo(() => {
        const baseCertificates = totalCertificates || 15247;
        const baseInstitutions = authorizedInstitutions || 23; // More realistic fallback
        const verificationRate = verifiedCertificates && totalCertificates ? 
            ((verifiedCertificates / totalCertificates) * 100).toFixed(1) : '99.7';

        // Debug logging for institution count
        if (authorizedInstitutions !== undefined) {
            console.log('useMinimalMetrics: Institution count from blockchain:', authorizedInstitutions);
        } else {
            console.log('useMinimalMetrics: Using fallback institution count:', baseInstitutions);
        }

        return {
            certificates: baseCertificates,
            institutions: baseInstitutions,
            verification: `${verificationRate}%`,
            status: networkStatus
        };
    }, [totalCertificates, verifiedCertificates, authorizedInstitutions, networkStatus]);

    return {
        stats: cleanStats,
        loading,
        lastUpdate: lastUpdate.toLocaleTimeString()
    };
};

export default useMinimalMetrics; 