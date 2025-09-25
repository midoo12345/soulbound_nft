import { useState, useEffect, useCallback } from 'react';

export const useQuantumEffects = () => {
    const [quantumState, setQuantumState] = useState({
        currentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        blockHeight: 19847362,
        networkStatus: 'SYNCING',
        verificationPulse: false,
        networkLatency: 0,
        gasPrice: 0,
        quantumEntanglement: 0
    });

    const [effectsActive, setEffectsActive] = useState(true);

    // Generate realistic blockchain hash
    const generateQuantumHash = useCallback(() => {
        const chars = '0123456789abcdef';
        let hash = '0x';
        
        // Create a more realistic hash pattern
        for (let i = 0; i < 64; i++) {
            if (i % 8 === 0 && Math.random() > 0.7) {
                // Add some patterns that look more blockchain-like
                hash += '00';
                i++;
            } else {
                hash += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        return hash;
    }, []);

    // Simulate network latency
    const simulateNetworkMetrics = useCallback(() => {
        return {
            latency: Math.floor(Math.random() * 150) + 50, // 50-200ms
            gasPrice: (Math.random() * 50 + 20).toFixed(2), // 20-70 gwei
            tps: Math.floor(Math.random() * 15) + 5 // 5-20 TPS
        };
    }, []);

    // Quantum entanglement effect (visual synchronization)
    useEffect(() => {
        if (!effectsActive) return;

        const entanglementInterval = setInterval(() => {
            setQuantumState(prev => ({
                ...prev,
                quantumEntanglement: (prev.quantumEntanglement + 0.1) % (Math.PI * 2)
            }));
        }, 100);

        return () => clearInterval(entanglementInterval);
    }, [effectsActive]);

    // Main blockchain simulation
    useEffect(() => {
        if (!effectsActive) return;

        const blockchainInterval = setInterval(() => {
            const metrics = simulateNetworkMetrics();
            
            setQuantumState(prev => ({
                ...prev,
                currentHash: generateQuantumHash(),
                blockHeight: prev.blockHeight + Math.floor(Math.random() * 3) + 1,
                networkLatency: metrics.latency,
                gasPrice: metrics.gasPrice,
                networkStatus: metrics.latency < 100 ? 'OPTIMAL' : metrics.latency < 150 ? 'STABLE' : 'CONGESTED'
            }));
        }, 3000 + Math.random() * 2000); // 3-5 second intervals

        return () => clearInterval(blockchainInterval);
    }, [effectsActive, generateQuantumHash, simulateNetworkMetrics]);

    // Verification pulse effect
    useEffect(() => {
        if (!effectsActive) return;

        const pulseInterval = setInterval(() => {
            setQuantumState(prev => ({ ...prev, verificationPulse: true }));
            setTimeout(() => {
                setQuantumState(prev => ({ ...prev, verificationPulse: false }));
            }, 1000);
        }, 5000 + Math.random() * 5000); // Random 5-10 second intervals

        return () => clearInterval(pulseInterval);
    }, [effectsActive]);

    // Quantum interference patterns
    const getQuantumPattern = useCallback((index) => {
        const phase = quantumState.quantumEntanglement + (index * 0.2);
        return {
            opacity: (Math.sin(phase) + 1) / 2 * 0.7 + 0.3,
            scale: (Math.cos(phase * 1.5) + 1) / 2 * 0.3 + 0.8,
            rotation: Math.sin(phase * 0.5) * 10
        };
    }, [quantumState.quantumEntanglement]);

    // Network health indicator
    const getNetworkHealth = useCallback(() => {
        const { networkLatency, networkStatus } = quantumState;
        
        switch (networkStatus) {
            case 'OPTIMAL':
                return { color: 'text-green-400', status: 'QUANTUM_SYNC', pulse: 'bg-green-400' };
            case 'STABLE':
                return { color: 'text-yellow-400', status: 'STABLE_LINK', pulse: 'bg-yellow-400' };
            case 'CONGESTED':
                return { color: 'text-red-400', status: 'HIGH_LATENCY', pulse: 'bg-red-400' };
            default:
                return { color: 'text-cyan-400', status: 'SYNCING', pulse: 'bg-cyan-400' };
        }
    }, [quantumState]);

    // Format numbers with quantum-style prefixes
    const formatQuantumNumber = useCallback((num) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }, []);

    // Generate particle coordinates for quantum field
    const generateQuantumField = useCallback((count = 50) => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            z: Math.random() * 100,
            phase: Math.random() * Math.PI * 2,
            frequency: 0.01 + Math.random() * 0.02,
            amplitude: 5 + Math.random() * 15
        }));
    }, []);

    return {
        quantumState,
        effectsActive,
        setEffectsActive,
        getQuantumPattern,
        getNetworkHealth,
        formatQuantumNumber,
        generateQuantumField,
        // Utility functions
        isVerifying: quantumState.verificationPulse,
        isOptimalNetwork: quantumState.networkStatus === 'OPTIMAL',
        currentPhase: quantumState.quantumEntanglement
    };
};

export default useQuantumEffects; 