import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Contract, JsonRpcProvider } from 'ethers';
import StatCard from './StatCard';
import StatsGrid from './StatsGrid';
import DashboardErrorBoundary from '../ErrorBoundary/DashboardErrorBoundary';
import { StatCardSkeleton } from '../Loading/LoadingSkeletons';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';

/**
 * DashboardStats Component
 * Container component that manages dashboard statistics display
 * Handles data from useInstitutionStats hook and user role permissions
 */
const DashboardStats = ({ 
  institutionStats = {},
  isLoading = false,
  error = null,
  userRoles = {},
  className = '',
  onStatClick,
  contract = null
}) => {
  const { isInstitution = false, isAdmin = false } = userRoles;
  
  // State for derived institution count (same approach as QuantumStatsDisplay)
  const [derivedInstitutionCount, setDerivedInstitutionCount] = useState(0);
  const [fallbackContract, setFallbackContract] = useState(null);

  // Setup fallback contract when no contract provided
  useEffect(() => {
    const setupFallbackContract = async () => {
      if (contract) return; // Use primary contract if available
      
      try {
        // Prefer env-defined RPC, then browser-friendly Sepolia RPC fallbacks
        const ENV_RPC = import.meta?.env?.VITE_RPC_URL;
        const RPC_URLS = [
          ENV_RPC,
          'https://ethereum-sepolia.publicnode.com',
          'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          'https://eth-sepolia.g.alchemy.com/v2/demo'
        ].filter(Boolean);

        let provider;
        for (const rpcUrl of RPC_URLS) {
          try {
            const rpcProvider = new JsonRpcProvider(rpcUrl);
            await rpcProvider.getNetwork();
            provider = rpcProvider;
            console.log(`DashboardStats: Connected to fallback RPC: ${rpcUrl}`);
            break;
          } catch (rpcError) {
            console.warn(`DashboardStats: Failed to connect to RPC ${rpcUrl}:`, rpcError?.message || rpcError);
          }
        }
        
        if (provider) {
          const fallbackContract = new Contract(
            contractAddress.sepolia.SoulboundCertificateNFT,
            contractABI.SoulboundCertificateNFT,
            provider
          );
          setFallbackContract(fallbackContract);
        }
      } catch (error) {
        console.warn('DashboardStats: Failed to setup fallback contract:', error);
      }
    };

    setupFallbackContract();
  }, [contract]);

  // Derived institution count (Dashboard/InstitutionAnalytics approach)
  useEffect(() => {
    const compute = async () => {
      const activeContract = contract || fallbackContract;
      if (!activeContract) { setDerivedInstitutionCount(0); return; }
      
      try {
        const [verifiedIds, pendingIds, revokedIds] = await Promise.all([
          activeContract.getVerifiedCertificateIds(0, 1000).catch(() => []),
          activeContract.getPendingCertificateIds(0, 1000).catch(() => []),
          activeContract.getRevokedCertificateIds(0, 1000).catch(() => [])
        ]);
        const uniqueIds = Array.from(new Set([...(verifiedIds || []), ...(pendingIds || []), ...(revokedIds || [])]));
        const issuerSet = new Set();
        const batchSize = 200;
        for (let i = 0; i < uniqueIds.length; i += batchSize) {
          const batch = uniqueIds.slice(i, i + batchSize);
          await Promise.all(batch.map(async (id) => {
            try {
              const cert = await activeContract.getCertificate(id);
              const issuer = cert?.institution || cert?.institutionAddress;
              if (issuer) issuerSet.add(issuer.toLowerCase());
            } catch {}
          }));
        }
        const zeroCert = (institutionStats?.activeInstitutionAddresses || []).map(a => a.toLowerCase());
        zeroCert.forEach(a => issuerSet.add(a));
        setDerivedInstitutionCount(issuerSet.size);
      } catch {
        setDerivedInstitutionCount(0);
      }
    };
    compute();
  }, [contract, fallbackContract, institutionStats?.activeInstitutionAddresses]);

  // Memoized stats configuration to prevent unnecessary re-renders
  // Different stats based on user role
  const statsConfig = useMemo(() => {
    // Admin gets global statistics (admin role takes priority over institution role)
    if (isAdmin) {
      return [
        {
          id: 'global-total-certificates',
          title: 'Global Total Certificates',
          value: institutionStats?.totalCertificates || 0,
          color: 'red',
          progress: 100,
          tooltip: 'Total number of certificates across all institutions on the blockchain',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )
        },
        {
          id: 'global-verified-certificates',
          title: 'Global Verified',
          value: institutionStats?.verifiedCertificates || 0,
          color: 'green',
          progress: Math.min(
            100, 
            ((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
          ),
          tooltip: 'Verified certificates across all institutions',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          )
        },
        {
          id: 'global-pending-certificates',
          title: 'Global Pending',
          value: institutionStats?.pendingCertificates || 0,
          color: 'orange',
          progress: Math.min(
            100, 
            ((institutionStats?.pendingCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
          ),
          tooltip: 'Pending verification across all institutions',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          )
        },
        {
          id: 'global-revoked-certificates',
          title: 'Global Revoked',
          value: institutionStats?.revokedCertificates || 0,
          color: 'red',
          progress: Math.min(
            100, 
            ((institutionStats?.revokedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
          ),
          tooltip: 'Revoked certificates across all institutions',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          )
        },
        {
          id: 'total-institutions',
          title: 'Active Institutions',
          value: (derivedInstitutionCount && derivedInstitutionCount > 0)
            ? derivedInstitutionCount
            : ((institutionStats.totalInstitutionsActive ?? institutionStats.totalInstitutions) || 0),
          color: 'purple',
          progress: 100,
          tooltip: 'Authorized institutions registered on the blockchain (excludes admin accounts)',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
              />
            </svg>
          )
        },
        {
          id: 'admin-verification-rate',
          title: 'System Verification Rate',
          value: `${Math.floor(((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100)}%`,
          color: 'blue',
          progress: Math.min(
            100, 
            ((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
          ),
          tooltip: 'Overall verification rate across the platform',
          icon: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" 
              />
            </svg>
          )
        }
      ];
    }
    
    // Institution users get institution-specific statistics
    return [
    {
      id: 'institution-certificates',
      title: 'Our Institution Certificates',
      value: institutionStats?.issuedByCurrentInstitution || 0,
      color: 'violet',
      progress: 100,
      tooltip: 'Total certificates issued by your institution',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
          />
        </svg>
      )
    },
    {
      id: 'verified-certificates',
      title: 'Verified Certificates',
      value: institutionStats?.verifiedCertificates || 0,
      color: 'blue',
      progress: Math.min(
        100, 
        ((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
      ),
      tooltip: 'Certificates that have been verified by authorized institutions on the blockchain',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      )
    },
    {
      id: 'pending-certificates',
      title: 'Pending Verification',
      value: institutionStats?.pendingCertificates || 0,
      color: 'orange',
      progress: Math.min(
        100, 
        ((institutionStats?.pendingCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
      ),
      tooltip: 'Certificates awaiting verification from authorized institutions',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
          <circle cx="8" cy="8" r="1" fill="currentColor" />
          <circle cx="12" cy="8" r="1" fill="currentColor" />
          <circle cx="16" cy="8" r="1" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'institution-verification-rate',
      title: 'Institution Verification Rate',
      value: `${Math.floor(((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.issuedByCurrentInstitution || 1)) * 100)}%`,
      color: 'teal',
      progress: Math.min(
        100, 
        ((institutionStats?.verifiedCertificates || 0) / Math.max(1, institutionStats?.issuedByCurrentInstitution || 1)) * 100
      ),
      tooltip: "Verification rate for certificates issued by your institution",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" 
          />
        </svg>
      )
    },
    {
      id: 'revoked-certificates',
      title: 'Revoked Certificates',
      value: institutionStats?.revokedCertificates || 0,
      color: 'red',
      progress: Math.min(
        100, 
        ((institutionStats?.revokedCertificates || 0) / Math.max(1, institutionStats?.totalCertificates || 1)) * 100
      ),
      tooltip: 'Certificates that have been revoked and are no longer valid',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      )
    },
    {
      id: 'institution-status',
      title: 'Institution Status',
      value: isInstitution ? 'Authorized' : 'Not Authorized',
      color: 'fuchsia',
      progress: isInstitution ? 100 : 0,
      tooltip: 'Your institution authorization status for issuing certificates',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
      )
    }
    ];
  }, [institutionStats, isInstitution, isAdmin]);

  // Handle stat card clicks
  const handleStatClick = (statData) => {
    if (onStatClick) {
      onStatClick(statData);
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-lg p-6 ${className}`}>
        <div className="flex items-center text-red-400">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading statistics: {error.message || 'Unknown error'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className} role="region" aria-label="Dashboard Statistics">
      <StatsGrid>
        {statsConfig.map((stat) => (
          <DashboardErrorBoundary 
            key={stat.id}
            fallbackComponent={<StatCardSkeleton showProgress={!!stat.progress} />}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              progress={stat.progress}
              tooltip={stat.tooltip}
              isLoading={isLoading}
              onClick={onStatClick ? () => handleStatClick(stat) : undefined}
            />
          </DashboardErrorBoundary>
        ))}
      </StatsGrid>
    </div>
  );
};

// PropTypes validation
DashboardStats.propTypes = {
  institutionStats: PropTypes.shape({
    totalCertificates: PropTypes.number,
    verifiedCertificates: PropTypes.number,
    issuedByCurrentInstitution: PropTypes.number,
    totalInstitutions: PropTypes.number,
    totalInstitutionsActive: PropTypes.number,
    activeInstitutionAddresses: PropTypes.array,
    lastUpdated: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  userRoles: PropTypes.shape({
    isAdmin: PropTypes.bool,
    isInstitution: PropTypes.bool
  }),
  className: PropTypes.string,
  onStatClick: PropTypes.func,
  contract: PropTypes.object
};

// Default props
DashboardStats.defaultProps = {
  institutionStats: {},
  isLoading: false,
  error: null,
  userRoles: {},
  className: '',
  contract: null
};

export default DashboardStats;
