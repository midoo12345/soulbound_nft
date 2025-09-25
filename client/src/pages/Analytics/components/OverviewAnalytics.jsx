import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
import useHistoricalMetrics from '../../../hooks/useHistoricalMetrics';

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
 * Overview Analytics Component
 * Displays key metrics and insights with futuristic charts and graphs
 */
const OverviewAnalytics = ({ 
  institutionStats = {}, 
  isLoading = false, 
  isUpdating = false,
  realTimeEnabled = false,
  contract = null
}) => {
  // Get real historical data from blockchain events
  const { historicalData, isLoading: historicalLoading } = useHistoricalMetrics(contract);

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    const {
      totalCertificates = 0,
      verifiedCertificates = 0,
      pendingCertificates = 0,
      revokedCertificates = 0,
      totalInstitutions = 0,
      issuedByCurrentInstitution = 0
    } = institutionStats;

    const total = totalCertificates;
    
    return {
      verificationRate: total > 0 ? Math.round((verifiedCertificates / total) * 100) : 0,
      pendingRate: total > 0 ? Math.round((pendingCertificates / total) * 100) : 0,
      revocationRate: total > 0 ? Math.round((revokedCertificates / total) * 100) : 0,
      averagePerInstitution: totalInstitutions > 0 ? Math.round(total / totalInstitutions) : 0,
      efficiency: total > 0 ? Math.round((verifiedCertificates / Math.max(1, total - revokedCertificates)) * 100) : 0
    };
  }, [institutionStats]);

  // Unique performance index: average of verification and efficiency (0-100)
  const performanceIndex = useMemo(() => {
    const base = Math.round((derivedMetrics.verificationRate + derivedMetrics.efficiency) / 2);
    return Math.max(0, Math.min(100, base));
  }, [derivedMetrics.verificationRate, derivedMetrics.efficiency]);

  // Simple helper to compute last-period deltas from historical arrays
  const computeDelta = (arr) => {
    if (!Array.isArray(arr) || arr.length < 2) return null;
    const prev = Number(arr[arr.length - 2] ?? 0);
    const curr = Number(arr[arr.length - 1] ?? 0);
    return Math.round((curr - prev) * 10) / 10; // 1-decimal precision
  };

  const verificationDelta = useMemo(() => computeDelta(historicalData.verificationRates), [historicalData.verificationRates]);
  const efficiencyDelta = useMemo(() => computeDelta(historicalData.efficiencyScores), [historicalData.efficiencyScores]);

  // Human-readable statuses and suggested actions for progress sections
  const verificationStatus = useMemo(() => {
    const v = derivedMetrics.verificationRate;
    if (v >= 80) return { label: 'Excellent', tone: 'success', action: 'Maintain current verification processes.' };
    if (v >= 60) return { label: 'Good', tone: 'warning', action: 'Review edge cases to raise verification success.' };
    return { label: 'Needs improvement', tone: 'danger', action: 'Audit verification steps and address failure causes.' };
  }, [derivedMetrics.verificationRate]);

  const efficiencyStatus = useMemo(() => {
    const e = derivedMetrics.efficiency;
    if (e >= 85) return { label: 'Excellent', tone: 'success', action: 'Keep workflows optimized.' };
    if (e >= 70) return { label: 'Good', tone: 'info', action: 'Identify minor bottlenecks to improve throughput.' };
    return { label: 'Needs work', tone: 'warning', action: 'Streamline processing and reduce rework.' };
  }, [derivedMetrics.efficiency]);

  const processingStatus = useMemo(() => {
    const p = 100 - derivedMetrics.revocationRate;
    if (p >= 80) return { label: 'Stable', tone: 'success', action: 'Continue monitoring for anomalies.' };
    if (p >= 60) return { label: 'Acceptable', tone: 'warning', action: 'Investigate common revocation reasons.' };
    return { label: 'Unstable', tone: 'danger', action: 'Reduce errors leading to revocations.' };
  }, [derivedMetrics.revocationRate]);

  // Minimal sparkline renderer (no extra deps): build a path from values
  const buildSparklinePath = (values, width = 160, height = 48) => {
    if (!Array.isArray(values) || values.length === 0) return '';
    const max = Math.max(...values, 100);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const step = width / Math.max(1, values.length - 1);
    return values.map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  const performanceTrendPath = useMemo(() => buildSparklinePath(historicalData.efficiencyScores), [historicalData.efficiencyScores]);

  const performanceStatus = useMemo(() => {
    if (performanceIndex >= 80) {
      return { label: 'Optimal', color: 'text-emerald-300', dot: 'bg-emerald-400', ringFrom: '#34d399', ringTo: '#2dd4bf' };
    }
    if (performanceIndex >= 60) {
      return { label: 'Stable', color: 'text-yellow-300', dot: 'bg-yellow-400', ringFrom: '#f59e0b', ringTo: '#f97316' };
    }
    return { label: 'Critical', color: 'text-red-300', dot: 'bg-red-400', ringFrom: '#ef4444', ringTo: '#ec4899' };
  }, [performanceIndex]);

  // Calculate reliability score using only real-time data (no constants)
  const calculateReliabilityScore = () => {
    const {
      totalCertificates = 0,
      verifiedCertificates = 0,
      revokedCertificates = 0
    } = institutionStats;

    // 1) Verification success (real-time)
    const verificationSuccess = totalCertificates > 0
      ? (verifiedCertificates / totalCertificates) * 100
      : 0;

    // 2) Revocation resilience (real-time)
    const revocationResilience = totalCertificates > 0
      ? Math.max(0, 100 - (revokedCertificates / totalCertificates) * 100)
      : 100; // If no revocations and no certs yet, treat as resilient

    // 3) System consistency from recent historical volatility (real-time)
    // Lower volatility -> higher consistency
    const series = Array.isArray(historicalData.efficiencyScores)
      ? historicalData.efficiencyScores
      : [];
    let consistency = 100;
    if (series.length >= 2) {
      const deltas = [];
      for (let i = 1; i < series.length; i++) {
        deltas.push(Math.abs(Number(series[i]) - Number(series[i - 1])));
      }
      const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      // Map average delta (0-100) to consistency (100-0)
      consistency = Math.max(0, Math.min(100, 100 - avgDelta));
    } else if (series.length === 1) {
      // With one point we assume stable until new data arrives
      consistency = 100;
    }

    const reliabilityScore = Math.round(
      (verificationSuccess * 0.4) + (revocationResilience * 0.3) + (consistency * 0.3)
    );

    return Math.max(0, Math.min(100, reliabilityScore));
  };

  // Chart data configurations
  const chartData = useMemo(() => {
    // Doughnut chart for certificate status distribution
    const certificateStatusData = {
      labels: ['Verified', 'Pending', 'Revoked'],
      datasets: [{
        data: [
          institutionStats.verifiedCertificates || 0,
          institutionStats.pendingCertificates || 0,
          institutionStats.revokedCertificates || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ]
      }]
    };

    // Bar chart for key metrics comparison
    const metricsComparisonData = {
      labels: ['Total', 'Verified', 'Pending', 'Revoked', 'Institutions'],
      datasets: [{
        label: 'Count',
        data: [
          institutionStats.totalCertificates || 0,
          institutionStats.verifiedCertificates || 0,
          institutionStats.pendingCertificates || 0,
          institutionStats.revokedCertificates || 0,
          institutionStats.totalInstitutions || 0
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(20, 184, 166, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(20, 184, 166, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };

    // Line chart for performance trends - ONLY REAL DATA!
    const performanceTrendsData = {
      labels: historicalData.months.length > 0 ? historicalData.months : ['No Events Yet'],
      datasets: [{
        label: 'Verification Rate (%)',
        data: historicalData.verificationRates.length > 0 
          ? historicalData.verificationRates
          : [],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }, {
        label: 'Efficiency Score (%)',
        data: historicalData.efficiencyScores.length > 0
          ? historicalData.efficiencyScores
          : [],
        borderColor: 'rgba(168, 85, 247, 1)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    // Radar chart for system health - NOW USING REAL RELIABILITY SCORE!
    const systemHealthData = {
      labels: ['Verification', 'Efficiency', 'Processing', 'Reliability', 'Performance'],
      datasets: [{
        label: 'Current Score',
        data: [
          derivedMetrics.verificationRate,
          derivedMetrics.efficiency,
          100 - derivedMetrics.revocationRate,
          calculateReliabilityScore(), // REAL calculated score
          performanceIndex // Use overall performance index for radar consistency
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    return {
      certificateStatus: certificateStatusData,
      metricsComparison: metricsComparisonData,
      performanceTrends: performanceTrendsData,
      systemHealth: systemHealthData
    };
  }, [institutionStats, derivedMetrics, historicalData]);

  // Simplified chart options to avoid errors
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(156, 163, 175, 1)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(156, 163, 175, 1)',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        cornerRadius: 8
      }
    }
  };

  // Specific options for different chart types
  const barChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 }
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 },
          callback: function(value) {
            return value + '%';
          },
          min: 0,
          max: 100,
          stepSize: 20
        },
        title: {
          display: true,
          text: 'Percentage (%)',
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 12 }
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    }
  };

  const radarChartOptions = {
    ...chartOptions,
    scales: {
      r: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 },
          backdropColor: 'transparent'
        },
        pointLabels: {
          color: 'rgba(156, 163, 175, 1)',
          font: { size: 11 }
        }
      }
    }
  };

  // Loading state
  if (isLoading || historicalLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-6 animate-pulse h-80">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-700 rounded w-full"></div>
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
          Overview Analytics
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Comprehensive insights into your blockchain certificate ecosystem. 
          Monitor key performance indicators and system health in real-time.
        </p>
        
        {/* Real-time status */}
        {realTimeEnabled && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isUpdating ? 'Updating...' : 'Live data'}
            </span>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Status Distribution - Doughnut Chart */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-indigo-500/30 transition-all duration-300 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-indigo-400 rounded-full mr-2 animate-pulse"></div>
              Certificate Status
            </h3>
            <div className="text-sm text-gray-400">
              Total: {institutionStats.totalCertificates || 0}
            </div>
          </div>
          <div className="relative h-56 sm:h-64">
            <Doughnut key="certificate-status" data={chartData.certificateStatus} options={chartOptions} />
            {/* Center stats */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {derivedMetrics.verificationRate}%
                </div>
                <div className="text-xs text-gray-400">Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Comparison - Bar Chart */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-green-500/30 transition-all duration-300 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Metrics Overview
            </h3>
            <div className="text-sm text-gray-400">
              Real-time data
            </div>
          </div>
          <div className="h-56 sm:h-64">
            <Bar key="metrics-comparison" data={chartData.metricsComparison} options={barChartOptions} />
          </div>
        </div>

        {/* Performance Trends - Line Chart - NOW WITH REAL DATA! */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              Performance Trends
            </h3>
            <div className="text-sm text-gray-400">
              {historicalData.months.length > 0 ? `${historicalData.months.length} months of real data` : 'Real-time data only'}
            </div>
          </div>
          
          {/* Current Status Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-800/40 rounded-lg border border-gray-700/30">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">
                {derivedMetrics.verificationRate}%
              </div>
              <div className="text-xs text-gray-400">Current Verification Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {derivedMetrics.efficiency}%
              </div>
              <div className="text-xs text-gray-400">Current Efficiency</div>
            </div>
          </div>
          
          {/* Chart with better options */}
          <div className="h-56 sm:h-64">
            {historicalData.months.length > 0 ? (
              <Line key="performance-trends" data={chartData.performanceTrends} options={lineChartOptions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-300 mb-2">No Historical Data Yet</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  This chart will populate automatically as certificates are<br/>
                  issued, verified, and revoked on the blockchain.
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Real-time updates every 30 seconds
                </div>
              </div>
            )}
          </div>
          
          {/* Clear explanations below the chart */}
          <div className="mt-4 space-y-3">
            {/* What This Chart Shows */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What This Chart Shows
              </h4>
              <p className="text-xs text-blue-200 leading-relaxed">
                <strong>Green Line:</strong> How many certificates were verified each month (higher = better)<br/>
                <strong>Purple Line:</strong> How efficient the system was each month (higher = better)<br/>
                <strong>Current Values:</strong> Right side shows today's performance
              </p>
            </div>

            {/* Metric Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verification Rate Explanation */}
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-white">Verification Rate</span>
                  <span className="ml-auto text-xs px-2 py-1 bg-green-900/40 text-green-300 rounded-full">
                    {derivedMetrics.verificationRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong>What it means:</strong> Out of all certificates, how many were successfully verified?<br/>
                  <span className="text-green-400 font-medium">Higher is better</span> - shows system reliability.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-green-400">🟢 Excellent:</span> 80%+ | 
                  <span className="text-yellow-400">🟡 Good:</span> 60-79% | 
                  <span className="text-red-400">🔴 Poor:</span> Below 60%
                </div>
              </div>

              {/* Efficiency Score Explanation */}
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-white">System Efficiency</span>
                  <span className="ml-auto text-xs px-2 py-1 bg-purple-900/40 text-purple-300 rounded-full">
                    {derivedMetrics.efficiency}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong>What it means:</strong> How well does the system process certificates overall?<br/>
                  <span className="text-purple-400 font-medium">Higher is better</span> - shows processing quality.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="text-purple-400">🟣 Excellent:</span> 85%+ | 
                  <span className="text-blue-400">🔵 Good:</span> 70-84% | 
                  <span className="text-orange-400">🟠 Needs Work:</span> Below 70%
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3 border border-blue-500/30">
              <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Current Performance Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Verification Rate: </span>
                  <span className={`font-medium ${
                    derivedMetrics.verificationRate >= 80 ? 'text-green-400' : 
                    derivedMetrics.verificationRate >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {derivedMetrics.verificationRate >= 80 ? '🟢 Excellent' : 
                     derivedMetrics.verificationRate >= 60 ? '🟡 Good' : '🔴 Needs Improvement'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">System Efficiency: </span>
                  <span className={`font-medium ${
                    derivedMetrics.efficiency >= 85 ? 'text-purple-400' : 
                    derivedMetrics.efficiency >= 70 ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                    {derivedMetrics.efficiency >= 85 ? '🟣 Excellent' : 
                     derivedMetrics.efficiency >= 70 ? '🔵 Good' : '🟠 Needs Work'}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Source Indicator */}
            {historicalData.months.length > 0 ? (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-2 text-center">
                <div className="text-xs text-green-400 font-medium flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ✓ Real blockchain data from {historicalData.months.length} months
                </div>
                <div className="text-xs text-green-300 mt-1">
                  Updates every 30 seconds • Real contract events
                </div>
              </div>
            ) : (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 text-center">
                <div className="text-xs text-blue-400 font-medium flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ℹ New contract - building historical data
                </div>
                <div className="text-xs text-blue-300 mt-1">
                  Chart will populate as more events occur • Real-time updates active
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Health - FUTURISTIC CYBERPUNK DASHBOARD! */}
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-cyan-500/50 hover:border-cyan-400/70 transition-all duration-500 relative overflow-hidden min-w-0">
          {/* Futuristic Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]"></div>
          
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-3 animate-pulse shadow-lg shadow-cyan-400/50"></div>
                SYSTEM HEALTH MATRIX
              </h3>
              <div className="text-sm text-cyan-300 font-mono">
                OVERALL: {Math.round((derivedMetrics.verificationRate + derivedMetrics.efficiency) / 2)}%
              </div>
            </div>

            {/* System Health Radar Chart (real-time via live stats/hooks) */}
            <div className="mb-6 h-60 sm:h-72">
              <Radar key="system-health" data={chartData.systemHealth} options={radarChartOptions} />
            </div>
            
            {/* FUTURISTIC: Cyberpunk System Health Bars */}
            <div className="space-y-5">
              {/* Verification Health - Modern & readable */}
              <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/40 to-blue-950/40 backdrop-blur-md rounded-xl p-4 border border-cyan-500/40 hover:border-cyan-400/60 ring-1 ring-cyan-400/10 transition-all duration-300 relative overflow-hidden group">
                {/* Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
                
                <div className="relative z-10 text-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      <span className="text-sm font-semibold text-cyan-200">Verification</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        verificationStatus.tone === 'success' ? 'bg-green-900/30 text-green-300 border-green-500/40' :
                        verificationStatus.tone === 'warning' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/40' :
                        'bg-red-900/30 text-red-300 border-red-500/40'
                      }`}>{verificationStatus.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {verificationDelta !== null && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                          verificationDelta > 0 ? 'text-green-300 border-green-500/40 bg-green-900/20' :
                          verificationDelta < 0 ? 'text-red-300 border-red-500/40 bg-red-900/20' :
                          'text-gray-300 border-gray-600/40 bg-gray-800/30'
                        }`}>
                          {verificationDelta > 0 ? '↑' : verificationDelta < 0 ? '↓' : '→'} {Math.abs(verificationDelta)}%
                        </span>
                      )}
                      <span className="text-lg font-bold font-mono text-cyan-200">{derivedMetrics.verificationRate}%</span>
                    </div>
                  </div>

                  {/* Circular Gauge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-1">
                    <div className="flex items-center justify-center">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <defs>
                          <linearGradient id="verGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                        <circle cx="48" cy="48" r="36" stroke="#374151" strokeWidth="10" fill="none" />
                        {(() => {
                          const c = 2 * Math.PI * 36;
                          const dash = Math.max(0, Math.min(100, derivedMetrics.verificationRate)) / 100 * c;
                          const gap = c - dash;
                          return (
                            <circle cx="48" cy="48" r="36" stroke="url(#verGrad)" strokeWidth="10" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                          );
                        })()}
                        <text x="48" y="52" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: '14px' }}>{derivedMetrics.verificationRate}%</text>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 sm:text-right">
                      {verificationDelta !== null && (
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full border mr-2 ${
                          verificationDelta > 0 ? 'text-green-300 border-green-500/40 bg-green-900/20' :
                          verificationDelta < 0 ? 'text-red-300 border-red-500/40 bg-red-900/20' :
                          'text-gray-300 border-gray-600/40 bg-gray-800/30'
                        }`}>
                          {verificationDelta > 0 ? '↑' : verificationDelta < 0 ? '↓' : '→'} {Math.abs(verificationDelta)}%
                        </div>
                      )}
                      <span className="text-gray-400">Latest verification success</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-300 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-slate-400 mb-1">Insights</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Higher verification signals stronger credential trust.</li>
                        <li>Directly affects public confidence and adoption.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Actions</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{verificationStatus.action}</li>
                        <li>Share clear verification steps with issuers.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Efficiency - Modern & readable */}
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/40 to-pink-950/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/40 hover:border-purple-400/60 ring-1 ring-purple-400/10 transition-all duration-300 relative overflow-hidden group">
                {/* Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(147,51,234,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
                
                <div className="relative z-10 text-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      <span className="text-sm font-semibold text-purple-200">Efficiency</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        efficiencyStatus.tone === 'success' ? 'bg-purple-900/30 text-purple-300 border-purple-500/40' :
                        efficiencyStatus.tone === 'info' ? 'bg-blue-900/30 text-blue-300 border-blue-500/40' :
                        'bg-orange-900/30 text-orange-300 border-orange-500/40'
                      }`}>{efficiencyStatus.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {efficiencyDelta !== null && (
                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                          efficiencyDelta > 0 ? 'text-green-300 border-green-500/40 bg-green-900/20' :
                          efficiencyDelta < 0 ? 'text-red-300 border-red-500/40 bg-red-900/20' :
                          'text-gray-300 border-gray-600/40 bg-gray-800/30'
                        }`}>
                          {efficiencyDelta > 0 ? '↑' : efficiencyDelta < 0 ? '↓' : '→'} {Math.abs(efficiencyDelta)}%
                        </span>
                      )}
                      <span className="text-lg font-bold font-mono text-purple-200">{derivedMetrics.efficiency}%</span>
                    </div>
                  </div>

                  {/* Circular Gauge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-1">
                    <div className="flex items-center justify-center">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <defs>
                          <linearGradient id="effGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        <circle cx="48" cy="48" r="36" stroke="#374151" strokeWidth="10" fill="none" />
                        {(() => {
                          const c = 2 * Math.PI * 36;
                          const dash = Math.max(0, Math.min(100, derivedMetrics.efficiency)) / 100 * c;
                          const gap = c - dash;
                          return (
                            <circle cx="48" cy="48" r="36" stroke="url(#effGrad)" strokeWidth="10" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                          );
                        })()}
                        <text x="48" y="52" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: '14px' }}>{derivedMetrics.efficiency}%</text>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 sm:text-right">
                      {efficiencyDelta !== null && (
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full border mr-2 ${
                          efficiencyDelta > 0 ? 'text-green-300 border-green-500/40 bg-green-900/20' :
                          efficiencyDelta < 0 ? 'text-red-300 border-red-500/40 bg-red-900/20' :
                          'text-gray-300 border-gray-600/40 bg-gray-800/30'
                        }`}>
                          {efficiencyDelta > 0 ? '↑' : efficiencyDelta < 0 ? '↓' : '→'} {Math.abs(efficiencyDelta)}%
                        </div>
                      )}
                      <span className="text-gray-400">Throughput after revocations</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-300 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-400 mb-1">Why it matters</div>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>Captures throughput quality after excluding revoked items.</li>
                        <li>Higher efficiency means less rework and lower costs.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Next steps</div>
                      <ul className="list-disc list-inside space-y-1 text-gray-300">
                        <li>{efficiencyStatus.action}</li>
                        <li>Automate repetitive checks to reduce manual delays.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Quality (Low revocations) - Modern & readable */}
              <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/40 to-cyan-950/40 backdrop-blur-md rounded-xl p-4 border border-blue-500/40 hover:border-blue-400/60 ring-1 ring-blue-400/10 transition-all duration-300 relative overflow-hidden group">
                {/* Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
                
                <div className="relative z-10 text-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 11 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0A1.65 1.65 0 0 0 21 11h.09a2 2 0 1 1 0 4H21a1.65 1.65 0 0 0-1.6 0z"/></svg>
                      <span className="text-sm font-semibold text-blue-200">Processing Quality</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        processingStatus.tone === 'success' ? 'bg-green-900/30 text-green-300 border-green-500/40' :
                        processingStatus.tone === 'warning' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/40' :
                        'bg-red-900/30 text-red-300 border-red-500/40'
                      }`}>{processingStatus.label}</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-blue-200">{100 - derivedMetrics.revocationRate}%</span>
                  </div>
                  
                  {/* Circular Gauge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-1">
                    <div className="flex items-center justify-center">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <defs>
                          <linearGradient id="procGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                        <circle cx="48" cy="48" r="36" stroke="#374151" strokeWidth="10" fill="none" />
                        {(() => {
                          const v = 100 - derivedMetrics.revocationRate;
                          const c = 2 * Math.PI * 36;
                          const dash = Math.max(0, Math.min(100, v)) / 100 * c;
                          const gap = c - dash;
                          return (
                            <circle cx="48" cy="48" r="36" stroke="url(#procGrad)" strokeWidth="10" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                          );
                        })()}
                        <text x="48" y="52" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: '14px' }}>{100 - derivedMetrics.revocationRate}%</text>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 sm:text-right">
                      <span className="text-gray-400">Low revocations indicate stable processing</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-300 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-slate-400 mb-1">Insights</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Low revocations reflect strong issuance quality.</li>
                        <li>Fewer reversals reduce support overhead.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">Actions</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{processingStatus.action}</li>
                        <li>Track top revocation reasons and fix root causes.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reliability Score - Futuristic */}
              <div className="bg-gradient-to-br from-teal-950/40 via-slate-900/40 to-cyan-950/40 backdrop-blur-md rounded-xl p-4 border border-teal-500/40 hover:border-teal-400/60 ring-1 ring-teal-400/10 transition-all duration-300 relative overflow-hidden group">
                {/* Holographic Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(20,184,166,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse"></div>
                
                <div className="relative z-10 text-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-teal-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      Reliability
                    </span>
                    <span className="text-lg font-bold px-3 py-1 rounded-full font-mono bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-400/50">
                      {calculateReliabilityScore()}%
                    </span>
                  </div>
                  
                  {/* Circular Gauge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex items-center justify-center">
                      <svg width="96" height="96" viewBox="0 0 96 96">
                        <defs>
                          <linearGradient id="relGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                        <circle cx="48" cy="48" r="36" stroke="#374151" strokeWidth="10" fill="none" />
                        {(() => {
                          const v = calculateReliabilityScore();
                          const c = 2 * Math.PI * 36;
                          const dash = Math.max(0, Math.min(100, v)) / 100 * c;
                          const gap = c - dash;
                          return (
                            <circle cx="48" cy="48" r="36" stroke="url(#relGrad)" strokeWidth="10" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 48 48)" />
                          );
                        })()}
                        <text x="48" y="52" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: '14px' }}>{calculateReliabilityScore()}%</text>
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300 sm:text-right">
                      <span className="text-gray-400">Shield status: </span>
                      <span className="text-teal-300 font-medium">Impenetrable</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Index - Unique Circular Gauge + Sparkline + Segmented scale */}
              <div className="bg-gray-900/70 backdrop-blur-md rounded-xl p-5 border border-indigo-500/40 hover:border-indigo-400/70 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                      <span>📊</span>
                      PERFORMANCE INDEX
                    </h4>
                    <span className="text-xs text-indigo-200">Real-time • On-chain</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    {/* Circular Gauge */}
                    <div className="flex items-center justify-center">
                      <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow">
                        <defs>
                          <linearGradient id="piGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="50%" stopColor="#A855F7" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                        <circle cx="80" cy="80" r="64" stroke="#374151" strokeWidth="14" fill="none" />
                        {(() => {
                          const circumference = 2 * Math.PI * 64;
                          const dash = Math.max(0, Math.min(100, performanceIndex)) / 100 * circumference;
                          const gap = circumference - dash;
                          return (
                            <circle cx="80" cy="80" r="64" stroke="url(#piGrad)" strokeWidth="14" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 80 80)" />
                          );
                        })()}
                        <text x="80" y="80" textAnchor="middle" dominantBaseline="central" className="fill-white font-bold" style={{ fontSize: '28px' }}>{performanceIndex}%</text>
                        <text x="80" y="112" textAnchor="middle" className="fill-indigo-200" style={{ fontSize: '12px' }}>Overall</text>
                      </svg>
                    </div>

                    {/* Trend + legend */}
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-3 border border-indigo-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-indigo-300">Efficiency trend</span>
                          <span className="text-xs text-gray-400">{historicalData.efficiencyScores?.length || 0} pts</span>
                        </div>
                        <svg width="100%" height="56" viewBox="0 0 160 48">
                          <defs>
                            <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgba(168,85,247,0.6)" />
                              <stop offset="100%" stopColor="rgba(168,85,247,0.05)" />
                            </linearGradient>
                          </defs>
                          <path d={performanceTrendPath || 'M0 48 L160 48'} stroke="#A855F7" strokeWidth="2" fill="none" />
                          <path d={`${(performanceTrendPath || 'M0 48 L160 48').replace('M','M0 48 L')} L160 48 Z`} fill="url(#sparkGrad)" opacity="0.4" />
                        </svg>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-800/40 p-2 rounded border border-gray-700/40 flex items-center justify-between">
                          <span className="text-gray-300">Verification</span>
                          <span className="font-mono text-green-300">{derivedMetrics.verificationRate}%</span>
                        </div>
                        <div className="bg-gray-800/40 p-2 rounded border border-gray-700/40 flex items-center justify-between">
                          <span className="text-gray-300">Efficiency</span>
                          <span className="font-mono text-purple-300">{derivedMetrics.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Segmented scale and marker */}
                  <div className="mt-5">
                    <div className="h-2 rounded-full overflow-hidden bg-gray-700/60">
                      <div className="h-2 w-1/2 bg-gradient-to-r from-red-500/50 to-yellow-500/50 inline-block"></div>
                      <div className="h-2 w-1/4 bg-gradient-to-r from-yellow-500/50 to-green-500/50 inline-block"></div>
                      <div className="h-2 w-1/4 bg-gradient-to-r from-green-500/50 to-emerald-500/60 inline-block"></div>
                    </div>
                    <div className="relative">
                      <div className="absolute -mt-1" style={{ left: `calc(${performanceIndex}% - 8px)` }}>
                        <div className="w-4 h-4 rounded-full bg-indigo-400 border border-white/20 shadow"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                      <span>Underutilized</span>
                      <span>Nominal</span>
                      <span>High</span>
                      <span>Peak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Summary - Compact gauge + live badge + sparkline */}
            <div className="mt-6 rounded-xl p-4 border border-cyan-400/40 bg-gray-900/70 backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20"></div>
              <div className="relative z-10 flex items-center gap-5">
                {/* Mini circular ring */}
                <svg width="84" height="84" viewBox="0 0 84 84">
                  <defs>
                    <linearGradient id="sumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={performanceStatus.ringFrom} />
                      <stop offset="100%" stopColor={performanceStatus.ringTo} />
                    </linearGradient>
                  </defs>
                  <circle cx="42" cy="42" r="32" stroke="#334155" strokeWidth="10" fill="none" />
                  {(() => {
                    const circumference = 2 * Math.PI * 32;
                    const dash = Math.max(0, Math.min(100, performanceIndex)) / 100 * circumference;
                    const gap = circumference - dash;
                    return (
                      <circle cx="42" cy="42" r="32" stroke="url(#sumGrad)" strokeWidth="10" fill="none" strokeDasharray={`${dash} ${gap}`} strokeLinecap="round" transform="rotate(-90 42 42)" />
                    );
                  })()}
                  <text x="42" y="44" textAnchor="middle" className="fill-white font-bold" style={{ fontSize: '14px' }}>{performanceIndex}%</text>
                </svg>

                <div className="flex-1 min-w-0">
                  <div className="text-sm tracking-widest text-cyan-300 font-semibold">SYSTEM STATUS</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${performanceStatus.dot} animate-pulse`}></span>
                    <span className={`text-lg font-bold ${performanceStatus.color}`}>{performanceStatus.label}</span>
                    {realTimeEnabled && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-300 border border-emerald-500/30">LIVE</span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-cyan-200 font-mono truncate">Index {performanceIndex}% • Reliability {calculateReliabilityScore()}%</div>
                  {/* tiny sparkline */}
                  <div className="mt-2">
                    <svg width="100%" height="28" viewBox="0 0 160 48">
                      <path d={performanceTrendPath || 'M0 48 L160 48'} stroke="#60a5fa" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Verification Rate', value: `${derivedMetrics.verificationRate}%`, color: 'green' },
          { label: 'Efficiency Score', value: `${derivedMetrics.efficiency}%`, color: 'purple' },
          { label: 'Pending Queue', value: institutionStats.pendingCertificates || 0, color: 'amber' },
          { label: 'Active Institutions', value: institutionStats.totalInstitutions || 0, color: 'teal' }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-900/60 backdrop-blur-md rounded-lg p-4 border border-gray-800/30 text-center">
            <div className={`text-2xl font-bold text-${stat.color}-400 mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Real-time Activity Indicator */}
      {realTimeEnabled && (
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-4 border border-indigo-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-indigo-300 font-medium">
              Real-time analytics active • Updates every 30 seconds
            </span>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
OverviewAnalytics.propTypes = {
  institutionStats: PropTypes.shape({
    totalCertificates: PropTypes.number,
    verifiedCertificates: PropTypes.number,
    pendingCertificates: PropTypes.number,
    revokedCertificates: PropTypes.number,
    totalInstitutions: PropTypes.number,
    issuedByCurrentInstitution: PropTypes.number
  }),
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool,
  contract: PropTypes.object
};

// Default props
OverviewAnalytics.defaultProps = {
  institutionStats: {},
  isLoading: false,
  isUpdating: false,
  realTimeEnabled: false,
  contract: null
};

export default OverviewAnalytics;
