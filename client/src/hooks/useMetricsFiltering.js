import { useState, useEffect } from 'react';

export const useMetricsFiltering = (reportType) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['totalCertificates', 'verificationRate']);

  const availableMetrics = [
    { value: 'totalCertificates', label: 'Total Certificates', category: 'Volume', priority: 'high', reportTypes: ['overview', 'custom'] },
    { value: 'verifiedCertificates', label: 'Verified Certificates', category: 'Status', priority: 'high', reportTypes: ['overview', 'custom'] },
    { value: 'pendingCertificates', label: 'Pending Certificates', category: 'Status', priority: 'medium', reportTypes: ['overview', 'custom'] },
    { value: 'revokedCertificates', label: 'Revoked Certificates', category: 'Status', priority: 'medium', reportTypes: ['overview', 'custom'] },
    { value: 'totalInstitutions', label: 'Total Institutions', category: 'Network', priority: 'high', reportTypes: ['overview', 'institutions', 'custom'] },
    { value: 'verificationRate', label: 'Verification Rate', category: 'Performance', priority: 'critical', reportTypes: ['overview', 'custom'] },
    { value: 'averageGrade', label: 'Average Grade', category: 'Performance', priority: 'high', reportTypes: ['overview', 'certificates', 'custom'] },
    { value: 'courseDistribution', label: 'Course Distribution', category: 'Analysis', priority: 'medium', reportTypes: ['certificates', 'custom'] },
    { value: 'gradeDistribution', label: 'Grade Distribution', category: 'Analysis', priority: 'medium', reportTypes: ['certificates', 'custom'] },
    { value: 'institutionPerformance', label: 'Institution Performance', category: 'Analysis', priority: 'high', reportTypes: ['institutions', 'custom'] },
    { value: 'trendAnalysis', label: 'Trend Analysis', category: 'Insights', priority: 'critical', reportTypes: ['overview', 'certificates', 'institutions', 'custom'] },
    { value: 'complianceMetrics', label: 'Compliance Metrics', category: 'Governance', priority: 'high', reportTypes: ['overview', 'institutions', 'custom'] }
  ];

  // Get filtered metrics based on selected report type
  const getFilteredMetrics = () => {
    if (reportType === 'custom') {
      return availableMetrics; // Show all metrics for custom reports
    }
    return availableMetrics.filter(metric => 
      metric.reportTypes.includes(reportType)
    );
  };

  // Handle metric toggle
  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  // Update selected metrics when report type changes
  useEffect(() => {
    const filteredMetrics = getFilteredMetrics();
    // Keep only metrics that are available for the new report type
    const validMetrics = selectedMetrics.filter(metric => 
      filteredMetrics.some(fm => fm.value === metric)
    );
    
    // If no valid metrics remain, select the first available one
    if (validMetrics.length === 0 && filteredMetrics.length > 0) {
      setSelectedMetrics([filteredMetrics[0].value]);
    } else {
      setSelectedMetrics(validMetrics);
    }
  }, [reportType]);

  return {
    selectedMetrics,
    setSelectedMetrics,
    availableMetrics,
    getFilteredMetrics,
    handleMetricToggle
  };
};
