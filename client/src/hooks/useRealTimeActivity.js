import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

/**
 * Real-time Activity Feed Hook
 * Tracks live blockchain events and provides formatted activity feed
 */
const useRealTimeActivity = (contract, provider) => {
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, certificates, institutions, system
  
  const MAX_ACTIVITIES = 1000; // Keep last 1000 activities
  const eventListenersRef = useRef(new Map());
  const lastBlockRef = useRef(null);

  // Activity types and formatting
  const formatActivity = useCallback((eventName, args, blockNumber, transactionHash, timestamp) => {
    const baseActivity = {
      id: `${transactionHash}-${blockNumber}-${Date.now()}`,
      blockNumber,
      transactionHash,
      timestamp: timestamp || Date.now(),
      type: eventName
    };

    switch (eventName) {
      case 'CertificateIssued':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Certificate Issued',
          description: `New certificate issued to student`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            student: args?.student || 'Unknown',
            institution: args?.institution || 'Unknown',
            courseId: args?.courseId ? Number(args.courseId) : null,
            grade: args?.grade ? Number(args.grade) : null,
            completionDate: args?.completionDate ? Number(args.completionDate) : null
          },
          icon: '🎓',
          color: 'from-emerald-500 to-teal-600',
          priority: 'high'
        };

      case 'CertificateVerified':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Certificate Verified',
          description: `Certificate verification completed`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            verifier: args?.verifier || 'Unknown'
          },
          icon: '✅',
          color: 'from-green-500 to-emerald-600',
          priority: 'medium'
        };

      case 'CertificateRevoked':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Certificate Revoked',
          description: `Certificate has been revoked`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            revoker: args?.revoker || 'Unknown',
            reason: args?.reason || 'No reason provided'
          },
          icon: '🚫',
          color: 'from-red-500 to-rose-600',
          priority: 'high'
        };

      case 'CertificateStatusChanged':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Status Updated',
          description: `Certificate status changed`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            isVerified: args?.isVerified || false,
            isRevoked: args?.isRevoked || false,
            updatedBy: args?.updatedBy || 'Unknown',
            timestamp: args?.timestamp ? Number(args.timestamp) : null
          },
          icon: '🔄',
          color: 'from-blue-500 to-indigo-600',
          priority: 'medium'
        };

      case 'CertificateUpdated':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Certificate Updated',
          description: `Certificate details updated`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            newGrade: args?.newGrade ? Number(args.newGrade) : null,
            updateReason: args?.updateReason || 'No reason provided'
          },
          icon: '📝',
          color: 'from-yellow-500 to-amber-600',
          priority: 'low'
        };

      case 'CertificateBurned':
        return {
          ...baseActivity,
          category: 'certificates',
          title: 'Certificate Burned',
          description: `Certificate permanently removed`,
          details: {
            tokenId: args?.tokenId ? Number(args.tokenId) : null,
            burner: args?.burner || 'Unknown',
            reason: args?.reason || 'No reason provided'
          },
          icon: '🔥',
          color: 'from-orange-500 to-red-600',
          priority: 'high'
        };

      case 'InstitutionAuthorized':
        return {
          ...baseActivity,
          category: 'institutions',
          title: 'Institution Authorized',
          description: `New institution granted permissions`,
          details: {
            institution: args?.institution || 'Unknown'
          },
          icon: '🏛️',
          color: 'from-purple-500 to-violet-600',
          priority: 'high'
        };

      case 'InstitutionRevoked':
        return {
          ...baseActivity,
          category: 'institutions',
          title: 'Institution Revoked',
          description: `Institution access revoked`,
          details: {
            institution: args?.institution || 'Unknown'
          },
          icon: '⛔',
          color: 'from-red-500 to-pink-600',
          priority: 'high'
        };

      case 'CourseNameSet':
        return {
          ...baseActivity,
          category: 'system',
          title: 'Course Created',
          description: `New course added to system`,
          details: {
            courseId: args?.courseId ? Number(args.courseId) : null,
            name: args?.name || 'Unknown Course'
          },
          icon: '📚',
          color: 'from-indigo-500 to-blue-600',
          priority: 'low'
        };

      case 'RoleGranted':
        return {
          ...baseActivity,
          category: 'system',
          title: 'Role Granted',
          description: `User role permissions updated`,
          details: {
            role: args?.role || 'Unknown',
            account: args?.account || 'Unknown',
            sender: args?.sender || 'Unknown'
          },
          icon: '👤',
          color: 'from-cyan-500 to-blue-600',
          priority: 'medium'
        };

      default:
        return {
          ...baseActivity,
          category: 'system',
          title: eventName,
          description: `System event: ${eventName}`,
          details: args || {},
          icon: '⚡',
          color: 'from-gray-500 to-slate-600',
          priority: 'low'
        };
    }
  }, []);

  // Setup event listeners
  const setupEventListeners = useCallback(async () => {
    if (!contract || !provider) return;

    try {
      // Clear existing listeners
      eventListenersRef.current.forEach((removeListener, eventName) => {
        try {
          removeListener();
        } catch (error) {
          console.warn(`Failed to remove listener for ${eventName}:`, error);
        }
      });
      eventListenersRef.current.clear();

      // Event names to listen for
      const eventNames = [
        'CertificateIssued',
        'CertificateVerified', 
        'CertificateRevoked',
        'CertificateStatusChanged',
        'CertificateUpdated',
        'CertificateBurned',
        'InstitutionAuthorized',
        'InstitutionRevoked',
        'CourseNameSet',
        'RoleGranted',
        'RoleRevoked'
      ];

      // Setup listeners for each event
      for (const eventName of eventNames) {
        try {
          const listener = async (...args) => {
            if (isPaused) return;

            const event = args[args.length - 1]; // Last argument is the event object
            const eventArgs = args.slice(0, -1); // All other arguments are event parameters

            try {
              // Get block info for timestamp
              const block = await event.getBlock();
              const timestamp = block.timestamp * 1000;

              // Format the activity
              const activity = formatActivity(
                eventName,
                event.args,
                event.blockNumber,
                event.transactionHash,
                timestamp
              );

              // Add to activities (only if not paused)
              setActivities(prev => {
                const updated = [activity, ...prev];
                return updated.slice(0, MAX_ACTIVITIES);
              });

              console.log(`📡 Real-time event: ${eventName}`, {
                tokenId: event.args?.tokenId?.toString(),
                block: event.blockNumber,
                tx: event.transactionHash
              });

            } catch (error) {
              console.warn(`Failed to process ${eventName} event:`, error);
            }
          };

          // Add listener
          contract.on(eventName, listener);
          
          // Store removal function
          eventListenersRef.current.set(eventName, () => {
            contract.off(eventName, listener);
          });

        } catch (error) {
          console.warn(`Failed to setup listener for ${eventName}:`, error);
        }
      }

      // Setup block listener for heartbeat
      const blockListener = async (blockNumber) => {
        lastBlockRef.current = blockNumber;
        
        // Add system activity for new blocks (throttled)
        if (blockNumber % 10 === 0 && !isPaused) { // Every 10th block
          const activity = {
            id: `block-${blockNumber}-${Date.now()}`,
            type: 'block',
            category: 'system',
            title: 'New Block',
            description: `Block #${blockNumber} mined`,
            details: { blockNumber },
            icon: '⛏️',
            color: 'from-gray-400 to-gray-600',
            priority: 'low',
            blockNumber,
            timestamp: Date.now()
          };

          setActivities(prev => [activity, ...prev.slice(0, MAX_ACTIVITIES - 1)]);
        }
      };

      provider.on('block', blockListener);
      
      eventListenersRef.current.set('block', () => {
        provider.off('block', blockListener);
      });

      setIsConnected(true);
      setError(null);

      console.log(`🎯 Real-time activity monitoring started for ${eventNames.length} events`);

    } catch (error) {
      console.error('Failed to setup event listeners:', error);
      setError(error.message);
      setIsConnected(false);
    }
  }, [contract, provider, isPaused, formatActivity]);

  // Load historical activities (last 100 events)
  const loadHistoricalActivities = useCallback(async () => {
    if (!contract) return;

    try {
      const fromBlock = Math.max(0, (await contract.provider.getBlockNumber()) - 1000);
      
      // Get recent events in parallel
      const eventPromises = [
        contract.queryFilter('CertificateIssued', fromBlock, 'latest'),
        contract.queryFilter('CertificateVerified', fromBlock, 'latest'),
        contract.queryFilter('CertificateRevoked', fromBlock, 'latest'),
        contract.queryFilter('InstitutionAuthorized', fromBlock, 'latest'),
        contract.queryFilter('InstitutionRevoked', fromBlock, 'latest')
      ];

      const eventArrays = await Promise.all(eventPromises);
      const allEvents = eventArrays.flat();

      // Sort by block number (most recent first)
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      // Format activities
      const historicalActivities = await Promise.all(
        allEvents.slice(0, 50).map(async (event) => {
          try {
            const block = await event.getBlock();
            return formatActivity(
              event.event,
              event.args,
              event.blockNumber,
              event.transactionHash,
              block.timestamp * 1000
            );
          } catch (error) {
            console.warn('Failed to process historical event:', error);
            return null;
          }
        })
      );

      const validActivities = historicalActivities.filter(Boolean);
      setActivities(validActivities);

    } catch (error) {
      console.warn('Failed to load historical activities:', error);
    }
  }, [contract, formatActivity]);

  // Filter activities based on current filter
  const filteredActivities = activities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.category === filterType;
  });

  // Initialize
  useEffect(() => {
    if (contract && provider) {
      loadHistoricalActivities();
      setupEventListeners();
    }

    // Cleanup on unmount
    return () => {
      eventListenersRef.current.forEach((removeListener) => {
        try {
          removeListener();
        } catch (error) {
          console.warn('Failed to cleanup event listener:', error);
        }
      });
      eventListenersRef.current.clear();
    };
  }, [contract, provider, setupEventListeners, loadHistoricalActivities]);

  // Utility functions
  const pauseUpdates = useCallback(() => setIsPaused(true), []);
  const resumeUpdates = useCallback(() => setIsPaused(false), []);
  
  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const getActivityStats = useCallback(() => {
    const stats = {
      total: activities.length,
      certificates: activities.filter(a => a.category === 'certificates').length,
      institutions: activities.filter(a => a.category === 'institutions').length,
      system: activities.filter(a => a.category === 'system').length,
      highPriority: activities.filter(a => a.priority === 'high').length
    };
    return stats;
  }, [activities]);

  return {
    activities: filteredActivities,
    isConnected,
    error,
    isPaused,
    filterType,
    
    // Controls
    setFilterType,
    pauseUpdates,
    resumeUpdates,
    clearActivities,
    
    // Utils
    getActivityStats,
    activityCount: filteredActivities.length,
    lastBlock: lastBlockRef.current,
    
    // Activity categories for filtering
    categories: [
      { id: 'all', label: 'All Activities', count: activities.length },
      { id: 'certificates', label: 'Certificates', count: activities.filter(a => a.category === 'certificates').length },
      { id: 'institutions', label: 'Institutions', count: activities.filter(a => a.category === 'institutions').length },
      { id: 'system', label: 'System', count: activities.filter(a => a.category === 'system').length }
    ]
  };
};

export default useRealTimeActivity;
