import { useState, useCallback, useEffect } from 'react';

export const useRealTimeUpdates = (contract, fetchReportData) => {
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  // Real-time data refresh system
  const startRealTimeUpdates = useCallback(() => {
    if (!contract) return;

    // Set up blockchain event listeners for real-time updates using correct event names
    try {
      // Listen for certificate events that actually exist in the contract
      contract.on('CertificateIssued', () => {
        console.log('Certificate issued event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('CertificateVerified', () => {
        console.log('Certificate verified event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('CertificateRevoked', () => {
        console.log('Certificate revoked event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('CertificateStatusChanged', () => {
        console.log('Certificate status changed event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('CertificateUpdated', () => {
        console.log('Certificate updated event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('CourseNameSet', () => {
        console.log('Course name set event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('InstitutionAuthorized', () => {
        console.log('Institution authorized event detected, refreshing data...');
        fetchReportData(true);
      });

      contract.on('InstitutionRevoked', () => {
        console.log('Institution revoked event detected, refreshing data...');
        fetchReportData(true);
      });

      console.log('Blockchain event listeners attached for real-time updates');
    } catch (error) {
      console.warn('Could not attach blockchain event listeners:', error);
    }

    setIsRealTimeEnabled(true);
  }, [contract, fetchReportData]);

  const stopRealTimeUpdates = useCallback(() => {
    // Remove blockchain event listeners using correct event names
    try {
      if (contract) {
        contract.off('CertificateIssued');
        contract.off('CertificateVerified');
        contract.off('CertificateRevoked');
        contract.off('CertificateStatusChanged');
        contract.off('CertificateUpdated');
        contract.off('CourseNameSet');
        contract.off('InstitutionAuthorized');
        contract.off('InstitutionRevoked');
        console.log('Blockchain event listeners removed');
      }
    } catch (error) {
      console.warn('Error removing blockchain event listeners:', error);
    }

    setIsRealTimeEnabled(false);
  }, [contract]);

  // Initialize real-time updates when contract is available
  useEffect(() => {
    if (contract) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [contract, startRealTimeUpdates, stopRealTimeUpdates]);

  return { 
    isRealTimeEnabled, 
    setIsRealTimeEnabled,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};
