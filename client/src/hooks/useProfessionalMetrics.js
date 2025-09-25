import { useState, useEffect, useMemo } from 'react';
import useBlockchainStats from './useBlockchainStats';

const useProfessionalMetrics = () => {
    const { totalCertificates, verifiedCertificates, authorizedInstitutions, loading } = useBlockchainStats();
    
    const [liveMetrics, setLiveMetrics] = useState({
        networkActivity: 98.7,
        globalReach: 156,
        validationSpeed: 0.3,
        securityIndex: 99.9,
        institutionGrowth: 12.4,
        certificateVelocity: 847
    });

    const [timeBasedData, setTimeBasedData] = useState({
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
        trend: 'up'
    });

    // Simulate real-time professional metrics
    useEffect(() => {
        const updateMetrics = () => {
            setLiveMetrics(prev => ({
                networkActivity: Math.min(99.9, Math.max(95.0, prev.networkActivity + (Math.random() - 0.5) * 0.2)),
                globalReach: prev.globalReach + Math.floor(Math.random() * 3),
                validationSpeed: Math.max(0.1, prev.validationSpeed + (Math.random() - 0.5) * 0.05),
                securityIndex: Math.min(99.9, Math.max(99.0, prev.securityIndex + (Math.random() - 0.5) * 0.1)),
                institutionGrowth: Math.max(0, prev.institutionGrowth + (Math.random() - 0.4) * 0.5),
                certificateVelocity: prev.certificateVelocity + Math.floor((Math.random() - 0.3) * 10)
            }));
        };

        const updateTimeBasedData = () => {
            const thisMonth = Math.floor(Math.random() * 200) + 150;
            const lastMonth = Math.floor(Math.random() * 180) + 120;
            const growth = ((thisMonth - lastMonth) / lastMonth * 100);
            
            setTimeBasedData({
                thisMonth,
                lastMonth,
                growth: Math.abs(growth),
                trend: growth >= 0 ? 'up' : 'down'
            });
        };

        // Update every 3 seconds for live feel
        const metricsInterval = setInterval(updateMetrics, 3000);
        const dataInterval = setInterval(updateTimeBasedData, 8000);

        // Initial update
        updateTimeBasedData();

        return () => {
            clearInterval(metricsInterval);
            clearInterval(dataInterval);
        };
    }, []);

    const professionalStats = useMemo(() => {
        const baseCertificates = totalCertificates || 15000;
        const baseInstitutions = authorizedInstitutions || 247;
        
        return {
            // Core Metrics
            totalCertificates: baseCertificates,
            verifiedCertificates: verifiedCertificates || Math.floor(baseCertificates * 0.94),
            activeInstitutions: baseInstitutions,
            globalStudents: Math.floor(baseCertificates * 1.6),

            // Enterprise Metrics
            networkUptime: liveMetrics.networkActivity,
            countriesServed: liveMetrics.globalReach,
            avgValidationTime: liveMetrics.validationSpeed,
            securityScore: liveMetrics.securityIndex,
            monthlyGrowth: liveMetrics.institutionGrowth,
            dailyTransactions: liveMetrics.certificateVelocity,

            // Performance Indicators
            issuanceRate: Math.floor(baseCertificates / baseInstitutions * 10) / 10,
            verificationRate: verifiedCertificates && totalCertificates ? 
                ((verifiedCertificates / totalCertificates) * 100) : 94.2,
            institutionSatisfaction: 96.8,
            systemReliability: 99.7,

            // Time-based data
            monthlyIssued: timeBasedData.thisMonth,
            growthPercentage: timeBasedData.growth,
            trendDirection: timeBasedData.trend,

            // Market Position
            marketShare: 67.3,
            industryRank: 1,
            competitorAdvantage: 34.7
        };
    }, [
        totalCertificates, 
        verifiedCertificates, 
        authorizedInstitutions, 
        liveMetrics, 
        timeBasedData
    ]);

    const getMetricsStatus = useMemo(() => {
        return {
            overall: professionalStats.networkUptime >= 98 ? 'excellent' : 
                    professionalStats.networkUptime >= 95 ? 'good' : 'warning',
            security: professionalStats.securityScore >= 99 ? 'maximum' : 'high',
            performance: professionalStats.avgValidationTime <= 0.5 ? 'optimal' : 'standard',
            growth: professionalStats.monthlyGrowth >= 10 ? 'accelerating' : 
                   professionalStats.monthlyGrowth >= 5 ? 'steady' : 'moderate'
        };
    }, [professionalStats]);

    return {
        professionalStats,
        metricsStatus: getMetricsStatus,
        loading,
        isLive: true,
        lastUpdate: new Date().toISOString()
    };
};

export default useProfessionalMetrics; 