import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import useInstitutionStats from '../../../hooks/useInstitutionStats';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Institution Analytics Component
 * Displays institution performance metrics and analytics using real-time data from useInstitutionStats hook
 */
const InstitutionAnalytics = ({ 
  contract, 
  roleConstants,
  currentAccount,
  institutionStats = {}, 
  isLoading = false, 
  isUpdating = false,
  realTimeEnabled = false 
}) => {
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [institutionData, setInstitutionData] = useState({
    institutions: [],
    performanceMetrics: {
      averageVerificationTime: '0 days',
      totalInstitutions: 0,
      activeInstitutions: 0,
      averagePerformance: 0
    }
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Use the useInstitutionStats hook for real-time data
  const { stats: realTimeStats, isLoading: statsLoading, error: statsError, refreshStats } = useInstitutionStats(
    contract, 
    roleConstants, 
    currentAccount
  );
  
  // Common chart options for consistent styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { 
          color: 'rgb(209, 213, 219)',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(107, 114, 128, 0.5)',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true,
        intersect: false
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };
  
  // Specific chart options
  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: 'rgb(209, 213, 219)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgb(209, 213, 219)' }
      }
    }
  };
  
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(75, 85, 99, 0.2)' },
        ticks: { color: 'rgb(209, 213, 219)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgb(209, 213, 219)' }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };
  
  const radarChartOptions = {
    ...chartOptions,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(148, 163, 184, 0.5)',
          lineWidth: 2
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.5)',
          circular: true,
          lineWidth: 1.5
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(226, 232, 240, 1)',
          font: { size: 11, weight: 'bold' },
          showLabelBackdrop: false,
          z: 10
        },
        pointLabels: {
          color: 'rgba(226, 232, 240, 1)',
          font: { size: 13, weight: 'bold' },
          padding: 10
        },
        suggestedMin: 0,
        suggestedMax: 100,
        beginAtZero: true
      }
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        labels: {
          ...chartOptions.plugins.legend.labels,
          font: { size: 14, weight: 'bold' },
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 10
        }
      },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        boxPadding: 6
      }
    }
  };

  // Fetch detailed institution data from contract
  const fetchInstitutionData = useCallback(async () => {
    if (!contract) return;
    
    setIsLoadingData(true);
    try {
      // Get all certificate IDs from the contract
      const [verifiedIds, pendingIds, revokedIds] = await Promise.all([
        contract.getVerifiedCertificateIds(0, 1000),
        contract.getPendingCertificateIds(0, 1000),
        contract.getRevokedCertificateIds(0, 1000)
      ]);

      // Combine all certificate IDs
      const allCertificateIds = [...verifiedIds, ...pendingIds, ...revokedIds];
      
      // Remove duplicates (in case a certificate appears in multiple arrays)
      const uniqueCertificateIds = [...new Set(allCertificateIds)];
      
      if (uniqueCertificateIds.length === 0) {
        setInstitutionData({
          institutions: [],
          performanceMetrics: {
            totalInstitutions: realTimeStats.totalInstitutions || 0,
            activeInstitutions: realTimeStats.totalInstitutions || 0,
            averagePerformance: 0,
            averageVerificationTime: '0 days'
          }
        });
        return;
      }

      // Track institution performance
      const institutionPerformance = {};
      const institutionCertificates = {};
      
      // Analyze all certificates to build institution profiles
      for (const id of uniqueCertificateIds) {
        try {
          const cert = await contract.getCertificate(id);
          if (cert && cert.institution) {
            const institutionAddress = cert.institution.toLowerCase();
            
            if (!institutionPerformance[institutionAddress]) {
              institutionPerformance[institutionAddress] = {
                total: 0,
                verified: 0,
                pending: 0,
                revoked: 0,
                totalGrade: 0
              };
              institutionCertificates[institutionAddress] = [];
            }
            
            institutionPerformance[institutionAddress].total++;
            institutionPerformance[institutionAddress].totalGrade += Number(cert.grade || 0);
            
            if (cert.isVerified) {
              institutionPerformance[institutionAddress].verified++;
            } else {
              institutionPerformance[institutionAddress].pending++;
            }
            
            institutionCertificates[institutionAddress].push(cert);
          }
        } catch (error) {
          console.warn(`Error fetching certificate ${id} for institution analysis:`, error);
        }
      }

      // Get revoked certificates
      try {
        const revokedIds = await contract.getRevokedCertificateIds(0, 1000);
        for (const id of revokedIds) {
          try {
            const cert = await contract.getCertificate(id);
            if (cert && cert.institution) {
              const institutionAddress = cert.institution.toLowerCase();
              if (institutionPerformance[institutionAddress]) {
                institutionPerformance[institutionAddress].revoked++;
                institutionPerformance[institutionAddress].verified--; // Adjust verified count
              }
            }
          } catch (error) {
            console.warn(`Error fetching revoked certificate ${id}:`, error);
          }
        }
      } catch (error) {
        console.warn('Error fetching revoked certificates:', error);
      }

      // Calculate performance metrics for each institution
      const institutionList = [];
      let totalPerformance = 0;
      let activeInstitutionCount = 0;

      Object.entries(institutionPerformance).forEach(([address, metrics]) => {
        if (metrics.total > 0) {
          const performance = metrics.total > 0 ? Math.round((metrics.verified / metrics.total) * 100) : 0;
          const averageGrade = metrics.total > 0 ? Math.round(metrics.totalGrade / metrics.total) : 0;
          
          // Calculate verification time (simplified - using issue date vs current time)
          let verificationTime = 0;
          if (metrics.verified > 0) {
            const verifiedCerts = institutionCertificates[address].filter(cert => cert.isVerified);
            if (verifiedCerts.length > 0) {
              const now = Math.floor(Date.now() / 1000);
              const totalTime = verifiedCerts.reduce((sum, cert) => {
                return sum + (now - Number(cert.completionDate || 0));
              }, 0);
              verificationTime = Math.round(totalTime / verifiedCerts.length / (24 * 60 * 60)); // Convert to days
            }
          }

          institutionList.push({
            address: address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            certificates: metrics.total,
            verified: metrics.verified,
            pending: metrics.pending,
            revoked: metrics.revoked,
            performance: performance,
            averageGrade: averageGrade,
            verificationTime: verificationTime
          });
          
          totalPerformance += performance;
          activeInstitutionCount++;
        }
      });

      // Sort by performance (descending)
      institutionList.sort((a, b) => b.performance - a.performance);

      // Calculate average verification time across all institutions
      const totalVerificationTime = institutionList.reduce((sum, inst) => sum + inst.verificationTime, 0);
      const averageVerificationTime = activeInstitutionCount > 0 ? Math.round(totalVerificationTime / activeInstitutionCount) : 0;

      // Include institutions with zero certificates using addresses from real-time stats
      const zeroCertInstitutions = (realTimeStats.activeInstitutionAddresses || [])
        .map(addr => addr.toLowerCase())
        .filter(addr => !institutionList.some(inst => inst.address === addr))
        .map(addr => ({
          address: addr,
          name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
          certificates: 0,
          verified: 0,
          pending: 0,
          revoked: 0,
          performance: 0,
          averageGrade: 0,
          verificationTime: 0
        }));

      const mergedInstitutions = [...institutionList, ...zeroCertInstitutions];

      setInstitutionData({
        institutions: mergedInstitutions,
        performanceMetrics: {
          totalInstitutions: realTimeStats.totalInstitutions || mergedInstitutions.length,
          activeInstitutions: realTimeStats.totalInstitutions || mergedInstitutions.length,
          averagePerformance: mergedInstitutions.length > 0 ? Math.round((totalPerformance) / (activeInstitutionCount || mergedInstitutions.length)) : 0,
          averageVerificationTime: `${averageVerificationTime} days`
        }
      });
    } catch (error) {
      console.error('Error fetching institution data:', error);
      setError('Failed to fetch institution data');
    } finally {
      setIsLoadingData(false);
    }
  }, [contract, realTimeStats.totalInstitutions, realTimeStats.activeInstitutionAddresses]);

  // Load institution data when contract is available
  useEffect(() => {
    if (contract) {
      fetchInstitutionData();
    }
  }, [contract, fetchInstitutionData]);

  // Refresh data when updating or when real-time stats change
  useEffect(() => {
    if ((isUpdating || realTimeStats.lastUpdated) && contract) {
      fetchInstitutionData();
    }
  }, [isUpdating, realTimeStats.lastUpdated, contract, fetchInstitutionData]);

  // Use real-time stats for error handling
  useEffect(() => {
    if (statsError) {
      setError(statsError);
    } else {
      setError(null);
    }
  }, [statsError]);

  // Loading state - now includes both local loading and stats loading
  if (isLoading || isLoadingData || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
              {/* Futuristic Page Header */}
        <div className="text-center relative">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.3)]">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 tracking-wider">
              INSTITUTION ANALYTICS
            </h2>
            <p className="text-lg text-cyan-200 max-w-3xl mx-auto font-mono leading-relaxed">
              Advanced blockchain performance monitoring with real-time cybernetic insights
            </p>
            
            {/* Futuristic status indicators */}
            <div className="mt-6 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-cyan-300 font-mono text-sm font-medium">
                  {isLoadingData ? 'SYNCING DATA...' : `${institutionData.institutions.length} INSTITUTIONS ANALYZED`}
                </span>
              </div>
              
              {realTimeStats.lastUpdated && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-mono text-xs">
                    LAST UPDATE: {new Date(realTimeStats.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

                {/* Futuristic Stats Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { 
              label: 'TOTAL CERTIFICATES', 
              value: realTimeStats.totalCertificates || 0, 
              color: 'blue',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              accent: 'from-blue-400 via-cyan-400 to-blue-600',
              bg: 'from-slate-900/80 via-blue-950/60 to-slate-900/80',
              border: 'from-blue-400/50 via-cyan-400/50 to-blue-600/50'
            },
            { 
              label: 'VERIFIED', 
              value: realTimeStats.verifiedCertificates || 0, 
              color: 'emerald',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              accent: 'from-emerald-400 via-green-400 to-emerald-600',
              bg: 'from-slate-900/80 via-emerald-950/60 to-slate-900/80',
              border: 'from-emerald-400/50 via-green-400/50 to-emerald-600/50'
            },
            { 
              label: 'PENDING', 
              value: realTimeStats.pendingCertificates || 0, 
              color: 'amber',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              accent: 'from-amber-400 via-yellow-400 to-amber-600',
              bg: 'from-slate-900/80 via-amber-950/60 to-slate-900/80',
              border: 'from-amber-400/50 via-yellow-400/50 to-amber-600/50'
            },
            { 
              label: 'REVOKED', 
              value: realTimeStats.revokedCertificates || 0, 
              color: 'rose',
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ),
              accent: 'from-rose-400 via-pink-400 to-rose-600',
              bg: 'from-slate-900/80 via-rose-950/60 to-slate-900/80',
              border: 'from-rose-400/50 via-pink-400/50 to-rose-600/50'
            }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className="relative group cursor-pointer"
            >
              {/* Futuristic Card Container */}
              <div className="relative transform transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-3 group-hover:rotate-2 perspective-1000">
                {/* Holographic Background Grid */}
                <div className="absolute -inset-6 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                
                {/* Main Card with Advanced Glass Effect */}
                <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-3xl rounded-3xl p-8 border border-slate-600/30 shadow-2xl group-hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] transition-all duration-700 overflow-hidden">
                  
                                     {/* Animated Holographic Border */}
                   <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Top Glowing Accent Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.accent} rounded-t-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(0,255,255,0.5)]`}></div>
                  
                  {/* Content Container */}
                  <div className="relative z-10 text-center">
                    
                    {/* Futuristic Icon Container */}
                    <div className="relative mb-8">
                      {/* Icon Background Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.accent} rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-500`}></div>
                      
                      {/* Icon Container with 3D Effect */}
                      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-500/50 shadow-2xl group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {/* Icon with Gradient */}
                        <div className={`text-${stat.color}-400 group-hover:text-${stat.color}-300 transition-colors duration-500`}>
                          {stat.icon}
                        </div>
                        
                        {/* Floating Particles around Icon */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl">
                          {[...Array(6)].map((_, i) => (
                            <div 
                              key={i}
                              className={`absolute w-1 h-1 bg-gradient-to-r ${stat.accent} rounded-full opacity-60`}
                              style={{
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Value with Futuristic Typography */}
                    <div className="mb-6">
                      <div className={`text-6xl font-black bg-gradient-to-r ${stat.accent} bg-clip-text text-transparent tracking-tighter group-hover:scale-110 transition-transform duration-500 drop-shadow-lg`}>
                        {stat.value}
                      </div>
                    </div>
                    
                    {/* Label with Cyberpunk Styling */}
                    <div className="text-sm font-bold text-slate-200 uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-500 font-mono">
                      {stat.label}
                    </div>
                  </div>
                  
                  {/* Bottom Glowing Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent} rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(0,255,255,0.4)]`}></div>
                  
                  {/* Corner Glow Accents */}
                  <div className={`absolute top-6 right-6 w-3 h-3 bg-gradient-to-r ${stat.accent} rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_10px_rgba(0,255,255,0.6)]`}></div>
                  <div className={`absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-r ${stat.accent} rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_10px_rgba(0,255,255,0.6)]`}></div>
                  
                  {/* Animated Corner Lines */}
                  <div className={`absolute top-4 right-4 w-8 h-0.5 bg-gradient-to-r ${stat.accent} opacity-60 group-hover:opacity-100 transition-all duration-500 transform rotate-45 origin-center`}></div>
                  <div className={`absolute bottom-4 left-4 w-8 h-0.5 bg-gradient-to-r ${stat.accent} opacity-60 group-hover:opacity-100 transition-all duration-500 transform -rotate-45 origin-center`}></div>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
                  
                  {/* Floating Data Streams */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i}
                        className={`absolute w-0.5 h-8 bg-gradient-to-b ${stat.accent} opacity-40`}
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `dataStream ${4 + Math.random() * 6}s linear infinite`,
                          animationDelay: `${Math.random() * 4}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Error Loading Data</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                refreshStats();
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Performance Overview - Now using charts with real-time stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Chart */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">Verification Status</h3>
          <div className="h-64">
            <div className="relative h-full flex items-center justify-center">
              <Doughnut 
                data={{
                  labels: ['Verified', 'Pending', 'Revoked'],
                  datasets: [{
                    data: [
                      realTimeStats.verifiedCertificates || 0,
                      realTimeStats.pendingCertificates || 0,
                      realTimeStats.revokedCertificates || 0
                    ],
                    backgroundColor: ['rgba(72, 187, 120, 0.7)', 'rgba(237, 137, 54, 0.7)', 'rgba(229, 62, 62, 0.7)'],
                    borderColor: ['rgb(72, 187, 120)', 'rgb(237, 137, 54)', 'rgb(229, 62, 62)'],
                    borderWidth: 1
                  }]
                }}
                options={{
                  ...chartOptions,
                  cutout: '70%',
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom'
                    }
                  }
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-bold text-white">
                  {(realTimeStats.verifiedCertificates || 0) + (realTimeStats.pendingCertificates || 0) + (realTimeStats.revokedCertificates || 0)}
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Institution Metrics */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">Institution Metrics</h3>
          <div className="h-64">
            <Bar
               data={{
                 labels: ['Total Institutions', 'Active Institutions', 'Verification Rate', 'Revocation Rate'],
                 datasets: [{
                   label: 'Metrics',
                   data: [
                     institutionData.institutions.length,
                     institutionData.institutions.filter(inst => inst.certificates > 0).length,
                     realTimeStats.totalCertificates > 0 
                       ? Math.round((realTimeStats.verifiedCertificates / realTimeStats.totalCertificates) * 100) 
                       : 0,
                     realTimeStats.totalCertificates > 0 
                       ? Math.round((realTimeStats.revokedCertificates / realTimeStats.totalCertificates) * 100) 
                       : 0
                   ],
                   backgroundColor: [
                     'rgba(79, 70, 229, 0.7)',
                     'rgba(16, 185, 129, 0.7)',
                     'rgba(59, 130, 246, 0.7)',
                     'rgba(239, 68, 68, 0.7)'
                   ],
                   borderColor: [
                     'rgb(79, 70, 229)',
                     'rgb(16, 185, 129)',
                     'rgb(59, 130, 246)',
                     'rgb(239, 68, 68)'
                   ],
                   borderWidth: 1
                 }]
               }}
               options={{
                 ...barChartOptions,
                 plugins: {
                   ...barChartOptions.plugins,
                   legend: { display: false }
                 }
               }}
             />
          </div>
        </div>
      </div>

      {/* Institution Performance Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Institution Certificate Distribution */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-3 h-3 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
            Institution Certificate Distribution
          </h3>
          <div className="h-80">
            {institutionData.institutions.length > 0 ? (
              <Bar
                 data={{
                   labels: institutionData.institutions.slice(0, 5).map(inst => inst.name),
                   datasets: [
                     {
                       label: 'Verified',
                       data: institutionData.institutions.slice(0, 5).map(inst => inst.verified),
                       backgroundColor: 'rgba(72, 187, 120, 0.7)',
                       borderColor: 'rgb(72, 187, 120)',
                       borderWidth: 1
                     },
                     {
                       label: 'Pending',
                       data: institutionData.institutions.slice(0, 5).map(inst => inst.pending),
                       backgroundColor: 'rgba(237, 137, 54, 0.7)',
                       borderColor: 'rgb(237, 137, 54)',
                       borderWidth: 1
                     },
                     {
                       label: 'Revoked',
                       data: institutionData.institutions.slice(0, 5).map(inst => inst.revoked || 0),
                       backgroundColor: 'rgba(229, 62, 62, 0.7)',
                       borderColor: 'rgb(229, 62, 62)',
                       borderWidth: 1
                     }
                   ]
                 }}
                 options={{
                   ...barChartOptions,
                   scales: {
                     ...barChartOptions.scales,
                     x: {
                       ...barChartOptions.scales.x,
                       stacked: true
                     },
                     y: {
                       ...barChartOptions.scales.y,
                       stacked: true
                     }
                   }
                 }}
               />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No institution data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Institution Performance Metrics */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            Performance Metrics
          </h3>
          <div className="h-80">
            {institutionData.institutions.length > 0 ? (
              <Line
                 data={{
                   labels: institutionData.institutions.slice(0, 5).map(inst => inst.name),
                   datasets: [
                     {
                       label: 'Performance %',
                       data: institutionData.institutions.slice(0, 5).map(inst => inst.performance || 0),
                       borderColor: 'rgb(59, 130, 246)',
                       backgroundColor: 'rgba(59, 130, 246, 0.1)',
                       borderWidth: 2,
                       fill: true
                     },
                     {
                       label: 'Avg Grade %',
                       data: institutionData.institutions.slice(0, 5).map(inst => inst.averageGrade || 0),
                       borderColor: 'rgb(139, 92, 246)',
                       backgroundColor: 'rgba(139, 92, 246, 0.1)',
                       borderWidth: 2,
                       fill: true,
                       yAxisID: 'y1'
                     }
                   ]
                 }}
                 options={{
                   ...lineChartOptions,
                   scales: {
                     ...lineChartOptions.scales,
                     y: {
                       ...lineChartOptions.scales.y,
                       type: 'linear',
                       display: true,
                       position: 'left',
                       title: {
                         display: true,
                         text: 'Performance %',
                         color: 'rgb(209, 213, 219)'
                       }
                     },
                     y1: {
                       type: 'linear',
                       display: true,
                       position: 'right',
                       title: {
                         display: true,
                         text: 'Average Grade %',
                         color: 'rgb(209, 213, 219)'
                       },
                       grid: { drawOnChartArea: false },
                       ticks: { color: 'rgb(209, 213, 219)' }
                     }
                   }
                 }}
               />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400">No institution data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Institutions Ranking */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Top Institution Rankings
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Top performing institutions ranked by verification efficiency
          </p>
        </div>
        
        {institutionData.institutions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Certificates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {institutionData.institutions.slice(0, 5).map((inst, index) => (
                  <tr key={inst.address} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index === 0 && <span className="text-yellow-400 mr-2">🥇</span>}
                      {index === 1 && <span className="text-gray-400 mr-2">🥈</span>}
                      {index === 2 && <span className="text-amber-600 mr-2">🥉</span>}
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-mono">
                      {inst.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{inst.certificates}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{inst.verified}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400">{inst.pending}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${
                          inst.performance >= 90 ? 'text-green-400' :
                          inst.performance >= 80 ? 'text-blue-400' :
                          inst.performance >= 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {inst.performance}%
                        </span>
                        <div className="w-16 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              inst.performance >= 90 ? 'bg-green-500' :
                              inst.performance >= 80 ? 'bg-blue-500' :
                              inst.performance >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${inst.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{inst.averageGrade}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🏛️</div>
            <div>No institutions found</div>
            <div className="text-sm mt-2">Institution data will appear here once certificates are issued</div>
          </div>
        )}
      </div>

      {/* Performance Insights with Real Data - Futuristic UI */}
      {institutionData.institutions.length > 0 && (
        <div className="relative bg-gradient-to-br from-gray-900/80 via-indigo-950/60 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:shadow-[0_0_35px_rgba(99,102,241,0.25)] transition-all duration-500 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-500 rounded-full filter blur-[80px]"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500 rounded-full filter blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500 rounded-full filter blur-[120px] opacity-20"></div>
          </div>
          
          {/* Holographic header */}
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 mb-6 flex items-center">
              <div className="relative mr-3 w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-sm opacity-75"></div>
                <svg className="w-6 h-6 text-indigo-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Performance Insights
              <div className="ml-2 text-xs font-normal text-indigo-400 bg-indigo-950/50 px-2 py-1 rounded-full border border-indigo-500/30">LIVE</div>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Key Performance Metrics - Futuristic Circular Gauges */}
            <div className="lg:col-span-7 bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
              <h4 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-6">Key Performance Metrics</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Verification Rate - Circular Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(8, 145, 178, 0.1)" strokeWidth="8" />
                      
                      {/* Progress circle with gradient and glow */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#verificationGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * institutionData.performanceMetrics.averagePerformance / 100)}
                        transform="rotate(-90 50 50)"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.5))' }}
                      />
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="verificationGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-cyan-400">{institutionData.performanceMetrics.averagePerformance}%</span>
                      <span className="text-xs text-cyan-300/80 mt-1">Verification</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h5 className="text-sm font-medium text-white">Verification Rate</h5>
                    <p className="text-xs text-gray-400 mt-1">Industry avg: 78%</p>
                  </div>
                </div>
                
                {/* Average Verification Time - Circular Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="8" />
                      
                      {/* Progress circle with gradient and glow */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#timeGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * (100 - Math.min(100, parseInt(institutionData.performanceMetrics.averageVerificationTime) * 10)) / 100)}
                        transform="rotate(-90 50 50)"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' }}
                      />
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="timeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-emerald-400">{institutionData.performanceMetrics.averageVerificationTime.split(' ')[0]}</span>
                      <span className="text-xs text-emerald-300/80 mt-1">Days</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h5 className="text-sm font-medium text-white">Verification Time</h5>
                    <p className="text-xs text-gray-400 mt-1">Industry avg: 3 days</p>
                  </div>
                </div>
                
                {/* Certificate Quality - Circular Gauge */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    {/* Background circle */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="8" />
                      
                      {/* Progress circle with gradient and glow */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="url(#qualityGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * Math.round(institutionData.institutions.reduce((sum, inst) => sum + (inst.averageGrade || 0), 0) / Math.max(1, institutionData.institutions.length)) / 100)}
                        transform="rotate(-90 50 50)"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.5))' }}
                      />
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="qualityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-purple-400">
                        {Math.round(institutionData.institutions.reduce((sum, inst) => sum + (inst.averageGrade || 0), 0) / Math.max(1, institutionData.institutions.length))}%
                      </span>
                      <span className="text-xs text-purple-300/80 mt-1">Quality</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <h5 className="text-sm font-medium text-white">Certificate Quality</h5>
                    <p className="text-xs text-gray-400 mt-1">Industry avg: 85%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 space-y-6">
              {/* Performance Distribution - Futuristic Cards */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
                <h4 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-4">Performance Distribution</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-900/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 border border-green-500/30 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all duration-500"></div>
                    <div className="relative p-3 rounded-lg z-10">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                        <div className="text-xs text-green-300 font-medium">Excellent (90%+)</div>
                      </div>
                      <div className="text-xl font-bold text-green-400 mt-1 ml-4">
                        {institutionData.institutions.filter(inst => inst.performance >= 90).length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-900/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all duration-500"></div>
                    <div className="relative p-3 rounded-lg z-10">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                        <div className="text-xs text-blue-300 font-medium">Good (80-89%)</div>
                      </div>
                      <div className="text-xl font-bold text-blue-400 mt-1 ml-4">
                        {institutionData.institutions.filter(inst => inst.performance >= 80 && inst.performance < 90).length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-yellow-900/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 border border-yellow-500/30 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:shadow-[0_0_25px_rgba(234,179,8,0.3)] transition-all duration-500"></div>
                    <div className="relative p-3 rounded-lg z-10">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                        <div className="text-xs text-yellow-300 font-medium">Fair (70-79%)</div>
                      </div>
                      <div className="text-xl font-bold text-yellow-400 mt-1 ml-4">
                        {institutionData.institutions.filter(inst => inst.performance >= 70 && inst.performance < 80).length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-900/10 rounded-lg transform group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-500"></div>
                    <div className="relative p-3 rounded-lg z-10">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                        <div className="text-xs text-red-300 font-medium">Needs Improvement (&lt;70%)</div>
                      </div>
                      <div className="text-xl font-bold text-red-400 mt-1 ml-4">
                        {institutionData.institutions.filter(inst => inst.performance < 70).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Top Performers - Futuristic Cards */}
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-5 border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-300 shadow-lg">
                <h4 className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-4">Top Performers</h4>
                <div className="space-y-3">
                  {institutionData.institutions.slice(0, 3).map((inst, index) => (
                    <div key={inst.address} className="relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-indigo-800/20 to-indigo-900/30 rounded-lg transform group-hover:scale-[1.02] transition-transform duration-500"></div>
                      <div className="absolute inset-0 border border-indigo-500/30 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-500"></div>
                      
                      <div className="relative flex items-center p-3 rounded-lg z-10">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-900/70 mr-3 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white font-mono">{inst.name}</div>
                          <div className="flex items-center mt-1 space-x-3">
                            <div className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                              {inst.verified} verified
                            </div>
                            <div className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                              {inst.averageGrade || 0}% grade
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                            {inst.performance}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated particles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 rounded-full bg-indigo-400 opacity-50"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Add floating data points with CSS animations */}
          <style>
            {`
              @keyframes float {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
              }
              
              @keyframes dataStream {
                0% { transform: translateY(100px) scaleY(0); opacity: 0; }
                50% { transform: translateY(0) scaleY(1); opacity: 0.8; }
                100% { transform: translateY(-100px) scaleY(0); opacity: 0; }
              }
            `}
          </style>
        </div>
      )}

      {/* Real-time Status */}
      {realTimeEnabled && (
        <div className="bg-gradient-to-r from-teal-900/20 to-blue-900/20 rounded-xl p-4 border border-teal-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
            <span className="text-sm text-teal-300 font-medium">
              Institution analytics updating in real-time • Last update: {realTimeStats.lastUpdated ? new Date(realTimeStats.lastUpdated).toLocaleTimeString() : 'Never'}
            </span>
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
InstitutionAnalytics.propTypes = {
  contract: PropTypes.object,
  roleConstants: PropTypes.object,
  currentAccount: PropTypes.string,
  institutionStats: PropTypes.object,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool
};

// Default props
InstitutionAnalytics.defaultProps = {
  contract: null,
  roleConstants: null,
  currentAccount: null,
  institutionStats: {},
  isLoading: false,
  isUpdating: false,
  realTimeEnabled: false
};

export default InstitutionAnalytics;
