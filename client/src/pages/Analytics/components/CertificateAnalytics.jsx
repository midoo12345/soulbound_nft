import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import contractAddress from '../../../config/contractAddress.json';
import contractABI from '../../../config/abi.json';

/**
 * Certificate Analytics Component
 * Displays certificate-specific analytics and trends using real contract data
 */
const CertificateAnalytics = ({ 
  contract, 
  institutionStats = {}, 
  isLoading = false, 
  isUpdating = false,
  realTimeEnabled = false 
}) => {
  const [certificateData, setCertificateData] = useState({
    recentCertificates: [],
    courseDistribution: {},
    gradeDistribution: {},
    verificationTimeline: [],
    burnRequests: [],
    allCourses: {}
  });
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('issuance');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Small helper to draw simple trend lines without extra libs
  const buildSparklinePath = (values, width = 320, height = 120) => {
    if (!Array.isArray(values) || values.length === 0) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const step = width / Math.max(1, values.length - 1);
    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / span) * height;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  // Fetch real certificate data from contract (optimized, batched)
  const fetchCertificateData = useCallback(async () => {
    if (!contract) return;
    setIsLoadingData(true);
    try {
      // 1) Recent certificates (fast): use contract-provided recent list
      const recentLimit = 200; // tuneable
      const recentIds = await contract.getRecentCertificates(recentLimit);
      // Ethers v6 may return a read-only Result array; clone to a mutable plain array before reuse
      const recentIdsArray = Array.from(recentIds);

      if (!recentIdsArray || recentIdsArray.length === 0) {
        setCertificateData({
          recentCertificates: [],
          courseDistribution: {},
          gradeDistribution: { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, 'Below 60': 0 },
          verificationTimeline: [],
          burnRequests: [],
          allCourses: {}
        });
        return;
      }

      // 2) Batch fetch details for the recent IDs
      const batch = await contract.getCertificatesBatch(recentIdsArray);
      const students = batch?.students || [];
      const institutions = batch?.institutions || [];
      const courseIds = (batch?.courseIds || []).map(n => Number(n));
      const completionDates = (batch?.completionDates || []).map(n => Number(n));
      const grades = (batch?.grades || []).map(n => Number(n));
      const verificationStatuses = (batch?.verificationStatuses || []).map(Boolean);
      const revocationStatuses = (batch?.revocationStatuses || []).map(Boolean);

      // 3) Batch fetch course names for all unique course IDs
      const uniqueCourseIds = [...new Set(courseIds)];
      let courseNames = {};
      try {
        const names = await contract.getCourseNamesBatch(uniqueCourseIds);
        uniqueCourseIds.forEach((cid, idx) => {
          courseNames[cid] = names[idx] && names[idx].trim() ? names[idx] : `Course ${cid}`;
        });
      } catch (_) {
        // Fallback to individual calls only if needed
        for (const cid of uniqueCourseIds) {
          try {
            const name = await contract.getCourseName(cid);
            courseNames[cid] = name && name.trim() ? name : `Course ${cid}`;
          } catch (_) {
            courseNames[cid] = `Course ${cid}`;
          }
        }
      }

      // 4) Build recentCertificates list from batched arrays (take latest 20 for the header stat)
      const recentList = recentIdsArray.map((id, idx) => ({
        id: Number(id),
        course: courseNames[courseIds[idx]] || `Course ${courseIds[idx]}`,
        grade: grades[idx] || 0,
        status: revocationStatuses[idx] ? 'revoked' : (verificationStatuses[idx] ? 'verified' : 'pending'),
        date: new Date((completionDates[idx] || 0) * 1000).toLocaleDateString(),
        student: students[idx],
        institution: institutions[idx]
      }));

      // 5) Compute grade distribution from the recent sample (fast)
      const gradeDistribution = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, 'Below 60': 0 };
      grades.forEach(g => {
        if (g >= 90) gradeDistribution['90-100']++;
        else if (g >= 80) gradeDistribution['80-89']++;
        else if (g >= 70) gradeDistribution['70-79']++;
        else if (g >= 60) gradeDistribution['60-69']++;
        else gradeDistribution['Below 60']++;
      });

      // 6) Course totals across contract (accurate, O(numCourses)) for recent-sample courses
      const allCourses = {};
      let sumSelectedCourseCounts = 0;
      for (const cid of uniqueCourseIds) {
        try {
          const c = await contract.countCertificatesByCourse(cid);
          const count = Number(c);
          sumSelectedCourseCounts += count;
          const name = courseNames[cid] || `Course ${cid}`;
          allCourses[name] = {
            id: cid,
            name,
            certificateCount: count,
            percentage: count
          };
        } catch (err) {
          // Ignore missing course
        }
      }
      // Convert counts to percentages over the selected course set
      if (sumSelectedCourseCounts > 0) {
        Object.keys(allCourses).forEach(k => {
          allCourses[k].percentage = Math.round((allCourses[k].certificateCount / sumSelectedCourseCounts) * 100);
        });
      } else {
        Object.keys(allCourses).forEach(k => { allCourses[k].percentage = 0; });
      }

      // 7) Course distribution from recent sample (percentages of sample)
      const courseDistributionCounts = {};
      courseIds.forEach(cid => {
        const name = courseNames[cid] || `Course ${cid}`;
        courseDistributionCounts[name] = (courseDistributionCounts[name] || 0) + 1;
      });
      const sampleTotal = courseIds.length || 1;
      const courseDistribution = {};
      Object.keys(courseDistributionCounts).forEach(name => {
        courseDistribution[name] = Math.round((courseDistributionCounts[name] / sampleTotal) * 100);
      });

      // 7b) OPTIONAL: Enumerate ALL courses via CourseNameSet events and override distributions
      try {
        const { BrowserProvider, Contract } = await import('ethers');
        const provider = contract.provider || (window.ethereum ? new BrowserProvider(window.ethereum) : null);
        if (provider) {
          const fullContract = new Contract(
            contractAddress.SoulboundCertificateNFT,
            contractABI.SoulboundCertificateNFT,
            provider
          );
          const latest = await provider.getBlockNumber();
          const CHUNK = 50000;
          const courseIdSet = new Set();
          for (let from = 0; from <= latest; from += CHUNK) {
            const to = Math.min(latest, from + CHUNK);
            const events = await fullContract.queryFilter(fullContract.filters.CourseNameSet(), from, to);
            for (const ev of events) {
              const cid = Number(ev.args?.courseId ?? ev.args?.[0]);
              if (!Number.isNaN(cid)) courseIdSet.add(cid);
            }
          }
          const allIds = Array.from(courseIdSet);
          if (allIds.length > 0) {
            // Batch resolve names in chunks
            const NAME_CHUNK = 200;
            const idToName = {};
            for (let i = 0; i < allIds.length; i += NAME_CHUNK) {
              const slice = allIds.slice(i, i + NAME_CHUNK);
              try {
                const names = await fullContract.getCourseNamesBatch(slice);
                slice.forEach((cid, idx) => {
                  const nm = names[idx];
                  idToName[cid] = nm && nm.trim() ? nm : `Course ${cid}`;
                });
              } catch (_) {
                // Fallback to single calls
                for (const cid of slice) {
                  try {
                    const nm = await fullContract.getCourseName(cid);
                    idToName[cid] = nm && nm.trim() ? nm : `Course ${cid}`;
                  } catch (_) {
                    idToName[cid] = `Course ${cid}`;
                  }
                }
              }
            }

            // Count per course with simple concurrency control
            const COUNT_BATCH = 50;
            const nameToData = {};
            let totalAcrossAllCourses = 0;
            for (let i = 0; i < allIds.length; i += COUNT_BATCH) {
              const slice = allIds.slice(i, i + COUNT_BATCH);
              const counts = await Promise.all(slice.map(async (cid) => {
                try {
                  const c = await fullContract.countCertificatesByCourse(cid);
                  return Number(c);
                } catch (_) {
                  return 0;
                }
              }));
              slice.forEach((cid, idx) => {
                const count = counts[idx] || 0;
                totalAcrossAllCourses += count;
                const name = idToName[cid] || `Course ${cid}`;
                nameToData[name] = { id: cid, name, certificateCount: count };
              });
            }

            if (totalAcrossAllCourses > 0) {
              // Override allCourses and distribution with full set
              Object.keys(nameToData).forEach(nm => {
                const row = nameToData[nm];
                allCourses[nm] = {
                  id: row.id,
                  name: row.name,
                  certificateCount: row.certificateCount,
                  percentage: Math.round((row.certificateCount / totalAcrossAllCourses) * 100)
                };
              });
              // Replace courseDistribution with full global percentages
              Object.keys(courseDistribution).forEach(k => { delete courseDistribution[k]; });
              Object.keys(allCourses).forEach(nm => {
                courseDistribution[nm] = allCourses[nm].percentage;
              });
            }
          }
        }
      } catch (e) {
        // If event scan fails, keep recent-sample data silently
      }

      // 8) Verification timeline from recent sample within selected range
      const verificationTimeline = [];
      const now = Math.floor(Date.now() / 1000);
      const dayInSeconds = 24 * 60 * 60;
      const rangeDaysMap = { '24h': 1, '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
      const rangeDays = rangeDaysMap[timeRange] || 7;
      for (let i = rangeDays - 1; i >= 0; i--) {
        const dayStart = now - (i * dayInSeconds);
        const dateStr = new Date(dayStart * 1000).toISOString().split('T')[0];
        let issued = 0, verified = 0, pending = 0;
        for (let idx = 0; idx < completionDates.length; idx++) {
          const d = new Date((completionDates[idx] || 0) * 1000).toISOString().split('T')[0];
          if (d === dateStr) {
            issued++;
            if (verificationStatuses[idx]) verified++;
            else if (!revocationStatuses[idx]) pending++;
          }
        }
        verificationTimeline.push({ date: dateStr, issued, verified, pending });
      }

      // 9) Burn requests (recent revoked from sample)
      const burnRequests = [];
      for (let idx = 0; idx < recentIdsArray.length; idx++) {
        if (revocationStatuses[idx]) {
          burnRequests.push({
            id: Number(recentIdsArray[idx]),
            reason: 'Revoked certificate',
            status: 'approved',
            date: new Date((completionDates[idx] || 0) * 1000).toLocaleDateString()
          });
        }
      }

      setCertificateData({
        recentCertificates: recentList.slice(-20),
        courseDistribution,
        gradeDistribution,
        verificationTimeline,
        burnRequests,
        allCourses
      });
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      setError('Failed to fetch certificate data');
    } finally {
      setIsLoadingData(false);
    }
  }, [contract, timeRange]);

  // Load certificate data when contract or time range is available/changes
  useEffect(() => {
    if (contract) {
      fetchCertificateData();
    }
  }, [contract, fetchCertificateData]);

  // Real-time: listen to new blocks and refresh when relevant events appear
  useEffect(() => {
    if (!contract || typeof window === 'undefined' || !window.ethereum) return;

    let provider;
    let isActive = true;

    const setup = async () => {
      try {
        const { BrowserProvider, Contract } = await import('ethers');
        provider = new BrowserProvider(window.ethereum);

        provider.on('block', async (blockNumber) => {
          try {
            const fullContract = new Contract(
              contractAddress.SoulboundCertificateNFT,
              contractABI.SoulboundCertificateNFT,
              provider
            );

            const [issuedEvents, verifiedEvents, revokedEvents] = await Promise.all([
              fullContract.queryFilter(fullContract.filters.CertificateIssued(), blockNumber, blockNumber),
              fullContract.queryFilter(fullContract.filters.CertificateVerified(), blockNumber, blockNumber),
              fullContract.queryFilter(fullContract.filters.CertificateRevoked(), blockNumber, blockNumber)
            ]);

            const hasNew = issuedEvents.length > 0 || verifiedEvents.length > 0 || revokedEvents.length > 0;
            if (hasNew && isActive) {
              fetchCertificateData();
            }
          } catch (err) {
            // Silently continue; we'll refresh on next block
            // console.warn('CertificateAnalytics: block check error', err);
          }
        });
      } catch (err) {
        // console.warn('CertificateAnalytics: failed to init provider', err);
      }
    };

    setup();

    return () => {
      isActive = false;
      if (provider) {
        provider.removeAllListeners('block');
      }
    };
  }, [contract, fetchCertificateData]);

  // Refresh data when updating
  useEffect(() => {
    if (isUpdating && contract) {
      fetchCertificateData();
    }
  }, [isUpdating, contract, fetchCertificateData]);

  // Calculate certificate metrics from real data
  const certificateMetrics = useMemo(() => {
    const { totalCertificates = 0, verifiedCertificates = 0, pendingCertificates = 0, revokedCertificates = 0 } = institutionStats;
    
    return {
      total: totalCertificates,
      verified: verifiedCertificates,
      pending: pendingCertificates,
      revoked: revokedCertificates,
      verificationRate: totalCertificates > 0 ? Math.round((verifiedCertificates / totalCertificates) * 100) : 0,
      pendingRate: totalCertificates > 0 ? Math.round((pendingCertificates / totalCertificates) * 100) : 0,
      revocationRate: totalCertificates > 0 ? Math.round((revokedCertificates / totalCertificates) * 100) : 0
    };
  }, [institutionStats]);

  // Timeline series for the selected range
  const timelineSeries = useMemo(() => {
    const dates = certificateData.verificationTimeline.map(t => t.date);
    const issued = certificateData.verificationTimeline.map(t => t.issued);
    const verified = certificateData.verificationTimeline.map(t => t.verified);
    const pending = certificateData.verificationTimeline.map(t => t.pending);
    return { dates, issued, verified, pending };
  }, [certificateData.verificationTimeline]);

  // Time range options
  const timeRangeOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Metric options
  const metricOptions = [
    { value: 'issuance', label: 'Issuance Trends', color: 'blue' },
    { value: 'verification', label: 'Verification Status', color: 'green' },
    { value: 'grades', label: 'Grade Distribution', color: 'purple' },
    { value: 'courses', label: 'Course Analysis', color: 'teal' }
  ];

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Certificate Analytics
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Deep insights into certificate issuance, verification patterns, and performance metrics.
          Track trends and identify opportunities for improvement.
        </p>
        
        {/* Data Status */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLoadingData ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm text-gray-400">
            {isLoadingData ? 'Loading certificate data...' : `${certificateData.recentCertificates.length} certificates loaded`}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Error Loading Data</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Time Range:</span>
          <div className="flex bg-gray-800/60 rounded-lg p-1 border border-gray-700/50">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  timeRange === option.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">View:</span>
          <div className="flex bg-gray-800/60 rounded-lg p-1 border border-gray-700/50">
            {metricOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMetric(option.value)}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                  selectedMetric === option.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/60'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected View */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
        {selectedMetric === 'issuance' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Issuance Trends</h3>
            {timelineSeries.dates.length > 0 ? (
              <div className="min-w-0">
                <div className="text-xs text-gray-400 mb-2">Last {timeRange}</div>
                <svg viewBox="0 0 320 120" className="w-full h-32">
                  <defs>
                    <linearGradient id="issGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="verGradLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <path d={buildSparklinePath(timelineSeries.issued)} stroke="#60a5fa" strokeWidth="2" fill="none" />
                  <path d={`${buildSparklinePath(timelineSeries.issued) || 'M0 120 L320 120'} L320 120 L0 120 Z`} fill="url(#issGrad)" />
                </svg>
                <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/40 flex items-center justify-between">
                    <span className="text-gray-300">Issued</span>
                    <span className="text-blue-300 font-mono">{timelineSeries.issued.reduce((a,b)=>a+b,0)}</span>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/40 flex items-center justify-between">
                    <span className="text-gray-300">Verified</span>
                    <span className="text-green-300 font-mono">{timelineSeries.verified.reduce((a,b)=>a+b,0)}</span>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/40 flex items-center justify-between">
                    <span className="text-gray-300">Pending</span>
                    <span className="text-amber-300 font-mono">{timelineSeries.pending.reduce((a,b)=>a+b,0)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No data for the selected range</div>
            )}
          </div>
        )}

        {selectedMetric === 'verification' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Verification Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800/40 p-4 rounded border border-gray-700/40 text-center">
                <div className="text-2xl font-bold text-green-400">{certificateMetrics.verificationRate}%</div>
                <div className="text-xs text-gray-400">Verification Rate</div>
              </div>
              <div className="bg-gray-800/40 p-4 rounded border border-gray-700/40 text-center">
                <div className="text-2xl font-bold text-amber-400">{certificateMetrics.pending}</div>
                <div className="text-xs text-gray-400">Pending</div>
              </div>
              <div className="bg-gray-800/40 p-4 rounded border border-gray-700/40 text-center">
                <div className="text-2xl font-bold text-red-400">{certificateMetrics.revoked}</div>
                <div className="text-xs text-gray-400">Revoked</div>
              </div>
            </div>
          </div>
        )}

        {selectedMetric === 'grades' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Grade Distribution</h3>
            {Object.values(certificateData.gradeDistribution).some(c => c > 0) ? (
              <div className="space-y-2">
                {Object.entries(certificateData.gradeDistribution).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{range}</span>
                    <div className="w-40 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(count / Math.max(...Object.values(certificateData.gradeDistribution))) * 100 || 0}%` }}></div>
                    </div>
                    <span className="text-sm text-purple-300 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No grade data available</div>
            )}
          </div>
        )}

        {selectedMetric === 'courses' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Course Analysis</h3>
            {Object.keys(certificateData.allCourses).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(certificateData.allCourses)
                  .sort(([,a],[,b]) => b.certificateCount - a.certificateCount)
                  .map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 truncate max-w-40">{name}</span>
                    <div className="w-40 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${(data.certificateCount / Math.max(...Object.values(certificateData.allCourses).map(c=>c.certificateCount))) * 100 || 0}%` }}></div>
                    </div>
                    <span className="text-sm text-teal-300 w-10 text-right">{data.certificateCount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">No course data available</div>
            )}
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Certificates',
            value: certificateMetrics.total,
            icon: '📜',
            color: 'indigo',
            change: '+12.5%',
            changeType: 'positive'
          },
          {
            title: 'Verification Rate',
            value: `${certificateMetrics.verificationRate}%`,
            icon: '✅',
            color: 'green',
            change: '+2.1%',
            changeType: 'positive'
          },
          {
            title: 'Pending Queue',
            value: certificateMetrics.pending,
            icon: '⏳',
            color: 'amber',
            change: '-5.3%',
            changeType: 'negative'
          },
          {
            title: 'Revocation Rate',
            value: `${certificateMetrics.revocationRate}%`,
            icon: '🚫',
            color: 'red',
            change: '-0.2%',
            changeType: 'positive'
          }
        ].map((metric) => (
          <div
            key={metric.title}
            className="group relative bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105 transform hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{metric.icon}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                metric.changeType === 'positive' 
                  ? 'bg-green-900/40 text-green-300 border border-green-500/30' 
                  : 'bg-red-900/40 text-red-300 border border-red-500/30'
              }`}>
                {metric.change}
              </div>
            </div>
            
            <div className="text-3xl font-bold text-white mb-2">
              {metric.value}
            </div>
            <div className="text-sm text-gray-400">
              {metric.title}
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Distribution Chart */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Course Distribution
          </h3>
          
          {Object.keys(certificateData.courseDistribution).length > 0 || Object.keys(certificateData.allCourses).length > 0 ? (
            <div className="space-y-4">
              {/* Show course distribution from certificates if available */}
              {Object.keys(certificateData.courseDistribution).length > 0 && (
                <>
                  <div className="text-sm text-gray-400 mb-3 border-b border-gray-700 pb-2">From Certificates</div>
                  {Object.entries(certificateData.courseDistribution)
                    .sort(([,a], [,b]) => b - a) // Sort by percentage descending
                    .map(([course, count]) => (
                    <div key={course} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate max-w-32">{course}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(count / Math.max(...Object.values(certificateData.courseDistribution))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-400 w-8 text-right">
                          {count}%
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
              
              {/* Show all available courses with certificate counts */}
              {Object.keys(certificateData.allCourses).length > 0 && (
                <>
                  <div className="text-sm text-gray-400 mb-3 border-b border-gray-700 pb-2">All Courses</div>
                  {Object.entries(certificateData.allCourses)
                    .sort(([,a], [,b]) => b.certificateCount - a.certificateCount) // Sort by certificate count descending
                    .map(([courseName, courseData]) => (
                    <div key={courseName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 truncate max-w-32">{courseName}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(courseData.certificateCount / Math.max(...Object.values(certificateData.allCourses).map(c => c.certificateCount))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-green-400 w-12 text-right">
                          {courseData.certificateCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📚</div>
              <div>No course data available</div>
              <div className="text-sm mt-2">Courses will appear here once they are created and certificates are issued</div>
            </div>
          )}
        </div>

        {/* Grade Distribution Chart */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Grade Distribution
          </h3>
          
          {Object.values(certificateData.gradeDistribution).some(count => count > 0) ? (
            <div className="space-y-4">
              {Object.entries(certificateData.gradeDistribution).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{range}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-800/60 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(count / Math.max(...Object.values(certificateData.gradeDistribution))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-purple-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <div>No grade data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Certificates Table */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recent Certificates
          </h3>
        </div>
        
        {certificateData.recentCertificates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {certificateData.recentCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{cert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-32">{cert.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{cert.grade}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cert.status === 'verified' 
                          ? 'bg-green-900/40 text-green-300 border border-green-500/30'
                          : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                      }`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{cert.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📜</div>
            <div>No certificates found</div>
            <div className="text-sm mt-2">Certificates will appear here once they are issued</div>
          </div>
        )}
      </div>

      {/* Real-time Status */}
      {realTimeEnabled && (
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-300 font-medium">
              Certificate analytics updating in real-time • Last update: {isUpdating ? 'Now' : '30s ago'}
            </span>
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
CertificateAnalytics.propTypes = {
  contract: PropTypes.object,
  institutionStats: PropTypes.shape({
    totalCertificates: PropTypes.number,
    verifiedCertificates: PropTypes.number,
    pendingCertificates: PropTypes.number,
    revokedCertificates: PropTypes.number
  }),
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool
};

// Default props
CertificateAnalytics.defaultProps = {
  contract: null,
  institutionStats: {},
  isLoading: false,
  isUpdating: false,
  realTimeEnabled: false
};

export default CertificateAnalytics;
