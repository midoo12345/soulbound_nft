import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useReportData } from '../../../hooks/useReportData';
import { useRealTimeUpdates } from '../../../hooks/useRealTimeUpdates';
import { useMetricsFiltering } from '../../../hooks/useMetricsFiltering';
import { useReportGeneration } from '../../../hooks/useReportGeneration';
import { useExportFunctions } from '../../../hooks/useExportFunctions';
import { 
  ReportConfiguration, 
  MetricsSelection, 
  StatusIndicators, 
  ExportControls 
} from '../../../components/ReportBuilder';

/**
 * Reports Builder Component
 * Allows users to create custom analytics reports using real contract data
 * Enhanced with event-driven updates and live data synchronization
 * Refactored into clean, maintainable components and hooks
 */
const ReportsBuilder = ({ 
  contract, 
  institutionStats = {}, 
  isLoading = false,
  userRoles = {} 
}) => {
  // Core state
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);

  // Custom hooks
  const { 
    reportData, 
    isLoadingData, 
    error, 
    lastUpdate, 
    blockNumber, 
    isUpdating, 
    fetchReportData, 
    setError 
  } = useReportData(contract);

  const { 
    isRealTimeEnabled, 
    setIsRealTimeEnabled 
  } = useRealTimeUpdates(contract, fetchReportData);

  const { 
    selectedMetrics, 
    setSelectedMetrics, 
    availableMetrics, 
    getFilteredMetrics, 
    handleMetricToggle 
  } = useMetricsFiltering(reportType);

  const { 
    isGeneratingReport, 
    currentReport, 
    generateReport 
  } = useReportGeneration(
    reportData, 
    reportType, 
    timeRange, 
    selectedMetrics, 
    blockNumber, 
    lastUpdate, 
    isRealTimeEnabled
  );

  const { 
    exportToCSV, 
    exportToPDF, 
    exportToJSON 
  } = useExportFunctions();

  // Constants
  const reportTypes = [
    { value: 'overview', label: 'Overview Report', description: 'High-level system metrics' },
    { value: 'certificates', label: 'Certificate Report', description: 'Detailed certificate analytics' },
    { value: 'institutions', label: 'Institution Report', description: 'Institution performance analysis' },
    { value: 'custom', label: 'Custom Report', description: 'Build your own report' }
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Effects
  useEffect(() => {
    if (contract) {
      fetchReportData(true);
    }
  }, [contract, fetchReportData]);

  // Show update notification when data updates
  useEffect(() => {
    if (lastUpdate && lastUpdate !== lastNotification) {
      setShowUpdateNotification(true);
      setLastNotification(lastUpdate);
      setTimeout(() => setShowUpdateNotification(false), 3000);
    }
  }, [lastUpdate, lastNotification]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchReportData(true);
  };

  // Loading state with enhanced skeleton
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
      {/* Real-time Update Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right-2 duration-300">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Data Updated!</span>
            <span className="text-sm opacity-90">
              {lastNotification ? new Date(lastNotification).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Page Header with Real-time Status */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Professional Analytics Reports Builder
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Create enterprise-grade analytics reports with executive insights, strategic recommendations, and blockchain-verified data for stakeholders and decision-makers.
        </p>
        
        {/* Event-Driven Sync Status */}
        <div className="mt-2 flex items-center justify-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-400' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isRealTimeEnabled ? 'EVENT LISTENING' : 'EVENTS DISABLED'}
            </span>
          </div>
          {isRealTimeEnabled && (
            <>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate ? Math.round((Date.now() - new Date(lastUpdate).getTime()) / 1000) : 0}s ago
              </span>
            </>
          )}
        </div>
        
        {/* Status Indicators */}
        <StatusIndicators 
          isRealTimeEnabled={isRealTimeEnabled}
          lastUpdate={lastUpdate}
          isLoadingData={isLoadingData}
          blockNumber={blockNumber}
          isUpdating={isUpdating}
          contract={contract}
        />

        {/* Event-Driven Controls */}
        <div className="mt-4 flex items-center justify-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRealTimeEnabled}
              onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Listen to Events</span>
          </label>
          
          <button
            onClick={handleManualRefresh}
            disabled={isLoadingData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Now</span>
          </button>
        </div>
      </div>

      {/* Error Display with Retry Option */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-400">Error Loading Data</h3>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchReportData(true)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Configuration */}
      <ReportConfiguration 
        reportType={reportType}
        setReportType={setReportType}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        reportTypes={reportTypes}
        timeRanges={timeRanges}
      />

      {/* Metrics Selection */}
      <MetricsSelection 
        selectedMetrics={selectedMetrics}
        handleMetricToggle={handleMetricToggle}
        getFilteredMetrics={getFilteredMetrics}
      />

      {/* Enhanced Report Preview with Real-time Data */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-xl font-semibold text-white mb-4">Event-Driven Report Preview</h3>
        
        <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">Report Summary</div>
          <div className="text-white">
            <strong>{reportTypes.find(t => t.value === reportType)?.label}</strong> for the last{' '}
            <strong>{timeRanges.find(t => t.value === timeRange)?.label}</strong> including{' '}
            <strong>{selectedMetrics.length} metrics</strong>
          </div>
          {isRealTimeEnabled && (
            <div className="mt-2 text-sm text-green-400">
              🔴 Event-driven updates from blockchain
            </div>
          )}
        </div>

        {/* Enhanced Quick Stats Preview with Real-time Indicators */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Certificates', value: reportData.overview.totalCertificates, trend: 'up' },
              { label: 'Verification Rate', value: `${reportData.overview.verificationRate}%`, trend: 'stable' },
              { label: 'Total Institutions', value: reportData.overview.totalInstitutions, trend: 'up' },
              { label: 'Recent Activity', value: `${reportData.certificates.recentActivity.length} certs`, trend: 'up' }
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800/40 rounded-lg p-3 text-center relative">
                <div className="text-lg font-semibold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
                {isUpdating && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                {lastUpdate && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Real-time Performance Metrics */}
        {reportData && (
          <div className="bg-gray-800/40 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">Event-Driven Performance & Data Quality</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-white">
                  {isRealTimeEnabled ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-400">Event Listening</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {lastUpdate ? Math.round((Date.now() - new Date(lastUpdate).getTime()) / 1000) : 'N/A'}s
                </div>
                <div className="text-xs text-gray-400">Last Update</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {blockNumber || 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Current Block</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-white">
                  {reportData.overview.totalCertificates || 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Total Certs</div>
              </div>
            </div>
            
            {/* Data Quality Indicators */}
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="text-sm text-gray-400 mb-2">Data Quality</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {reportData.overview.totalCertificates > 0 ? '✓ Valid' : '⚠ Empty'}
                  </div>
                  <div className="text-xs text-gray-400">Data Integrity</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {contract?.provider ? '✓ Active' : '✗ Inactive'}
                  </div>
                  <div className="text-xs text-gray-400">Contract Connection</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {isRealTimeEnabled ? '✓ Event-Driven' : '✗ Manual'}
                  </div>
                  <div className="text-xs text-gray-400">Update Mode</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Controls */}
        <ExportControls 
          isGeneratingReport={isGeneratingReport}
          reportData={reportData}
          currentReport={currentReport}
          generateReport={generateReport}
          exportToPDF={exportToPDF}
          exportToCSV={exportToCSV}
          exportToJSON={exportToJSON}
        />
      </div>

      {/* Professional Generated Report Display with Executive Insights */}
      {currentReport && (
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-semibold text-white mb-4">Generated Professional Report</h3>
          
          <div className="bg-gray-800/40 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-400 mb-2">Report Details</div>
            <div className="text-white space-y-1">
              <div><strong>Type:</strong> {reportTypes.find(t => t.value === currentReport.type)?.label}</div>
              <div><strong>Time Range:</strong> {timeRanges.find(t => t.value === currentReport.timeRange)?.label}</div>
              <div><strong>Generated:</strong> {new Date(currentReport.generatedAt).toLocaleString()}</div>
              <div><strong>Metrics:</strong> {currentReport.metrics.join(', ')}</div>
              <div><strong>Block Number:</strong> {currentReport.metadata?.blockNumber || 'N/A'}</div>
              <div><strong>Real-time:</strong> {currentReport.metadata?.realTimeEnabled ? 'Enabled' : 'Disabled'}</div>
              <div><strong>Version:</strong> {currentReport.metadata?.reportVersion || 'N/A'}</div>
            </div>
          </div>

          {/* Executive Summary */}
          {currentReport.executiveSummary && (
            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-blue-400 mb-2 font-semibold">📊 Executive Summary</div>
              <div className="text-white space-y-2">
                <div><strong>Performance Status:</strong> <span className="text-blue-300">{currentReport.executiveSummary.performanceStatus}</span></div>
                <div><strong>Network Health:</strong> <span className="text-blue-300">{currentReport.executiveSummary.networkHealth || currentReport.executiveSummary.academicDiversity}</span></div>
                <div><strong>Data Quality:</strong> <span className="text-blue-300">{currentReport.executiveSummary.dataQuality}</span></div>
                {currentReport.executiveSummary.keyHighlights && (
                  <div>
                    <strong>Key Highlights:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      {currentReport.executiveSummary.keyHighlights.map((highlight, index) => (
                        <li key={index} className="text-blue-200">• {highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strategic Insights */}
          {currentReport.insights && currentReport.insights.length > 0 && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-green-400 mb-2 font-semibold">💡 Strategic Insights</div>
              <div className="text-white space-y-2">
                {currentReport.insights.map((insight, index) => (
                  <div key={index} className="text-green-200">• {insight}</div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentReport.recommendations && currentReport.recommendations.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-yellow-400 mb-2 font-semibold">🎯 Strategic Recommendations</div>
              <div className="text-white space-y-2">
                {currentReport.recommendations.map((rec, index) => (
                  <div key={index} className="text-yellow-200">• {rec}</div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Assessment */}
          {currentReport.riskAssessment && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-400 mb-2 font-semibold">⚠️ Risk Assessment</div>
              <div className="text-white space-y-2">
                <div><strong>Verification Risk:</strong> <span className="text-red-300">{currentReport.riskAssessment.verificationRisk}</span></div>
                <div><strong>Network Risk:</strong> <span className="text-red-300">{currentReport.riskAssessment.networkRisk}</span></div>
                <div><strong>Data Integrity Risk:</strong> <span className="text-red-300">{currentReport.riskAssessment.dataIntegrityRisk}</span></div>
                <div><strong>Compliance Risk:</strong> <span className="text-red-300">{currentReport.riskAssessment.complianceRisk}</span></div>
              </div>
            </div>
          )}

          <div className="bg-gray-800/40 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Event-Driven Report Data</div>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(currentReport.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
ReportsBuilder.propTypes = {
  contract: PropTypes.object,
  institutionStats: PropTypes.object,
  isLoading: PropTypes.bool,
  userRoles: PropTypes.object
};

// Default props
ReportsBuilder.defaultProps = {
  contract: null,
  institutionStats: {},
  isLoading: false,
  userRoles: {}
};

export default ReportsBuilder;
