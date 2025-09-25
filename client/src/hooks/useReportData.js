import { useState, useCallback, useRef, useEffect } from 'react';

export const useReportData = (contract) => {
  const [reportData, setReportData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [blockNumber, setBlockNumber] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const lastDataFetchRef = useRef(0);
  const eventListenersRef = useRef([]);

  // Utility function to safely convert BigInt to Number
  const safeBigIntToNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'string') return Number(value) || 0;
    if (typeof value === 'number') return value;
    return 0;
  };

  // Enhanced data fetching with real-time capabilities - ONLY from contract events
  const fetchReportData = useCallback(async (forceRefresh = false) => {
    if (!contract) return;
    
    // Prevent excessive API calls
    const now = Date.now();
    if (!forceRefresh && (now - lastDataFetchRef.current) < 2000) {
      return; // Skip if last fetch was less than 2 seconds ago
    }
    
    setIsLoadingData(true);
    setIsUpdating(true);
    setError(null);
    
    try {
      const data = {
        overview: {},
        certificates: {},
        institutions: {},
        custom: {}
      };

      // Get REAL data from contract - no hardcoded values
      console.log('Fetching real data from contract...');
      
      // Get the TOTAL number of certificates using the correct contract method
      let totalCertificates = 0;
      try {
        // First try to use totalSupply() - this is the most accurate method
        const totalSupplyResult = await contract.totalSupply();
        // Convert BigInt to number safely
        totalCertificates = safeBigIntToNumber(totalSupplyResult);
        console.log('Total certificates from contract.totalSupply():', totalCertificates);
      } catch (error) {
        console.warn('Could not get totalSupply, trying alternative methods:', error);
        
        try {
          // Try to get a higher limit to catch all certificates
          const [verifiedResult, pendingResult, revokedResult] = await Promise.allSettled([
            contract.getVerifiedCertificateIds(0, 10000),  // Increased limit
            contract.getPendingCertificateIds(0, 10000),   // Increased limit
            contract.getRevokedCertificateIds(0, 10000)    // Increased limit
          ]);

          // Handle successful and failed responses
          const verifiedIds = verifiedResult.status === 'fulfilled' ? verifiedResult.value : [];
          const pendingIds = pendingResult.status === 'fulfilled' ? pendingResult.value : [];
          const revokedIds = revokedResult.status === 'fulfilled' ? revokedResult.value : [];

          console.log('Contract data received with higher limits:', {
            verified: verifiedIds.length,
            pending: pendingIds.length,
            revoked: revokedIds.length
          });

          // Combine all certificate IDs and remove duplicates
          const allCertificateIds = [...verifiedIds, ...pendingIds, ...revokedIds];
          totalCertificates = [...new Set(allCertificateIds)].length;
          
          console.log('Total unique certificates found:', totalCertificates);
        } catch (fallbackError) {
          console.error('All methods failed, using estimated count:', fallbackError);
          // Last resort: try to count by checking certificate existence
          let count = 0;
          for (let i = 0; i < 1000; i++) {
            try {
              const exists = await contract.tokenExists(i);
              if (exists) count++;
            } catch (error) {
              break; // Stop if we can't check anymore
            }
          }
          totalCertificates = count;
          console.log('Estimated total certificates:', totalCertificates);
        }
      }

      // Get current block number for real-time tracking
      let currentBlock = 0;
      try {
        if (contract.provider) {
          currentBlock = await contract.provider.getBlockNumber();
          setBlockNumber(currentBlock);
        }
      } catch (error) {
        console.warn('Could not fetch current block number:', error);
      }

      // Now get the status breakdown using the correct approach
      let verifiedCount = 0;
      let pendingCount = 0;
      let revokedCount = 0;

      try {
        // Use countCertificatesByStatus for accurate counts
        const [verifiedResult, pendingResult, revokedResult] = await Promise.allSettled([
          contract.countCertificatesByStatus(true, false),  // verified, not revoked
          contract.countCertificatesByStatus(false, false), // not verified, not revoked
          contract.countCertificatesByStatus(false, true)   // revoked
        ]);

        verifiedCount = verifiedResult.status === 'fulfilled' ? safeBigIntToNumber(verifiedResult.value) : 0;
        pendingCount = pendingResult.status === 'fulfilled' ? safeBigIntToNumber(pendingResult.value) : 0;
        revokedCount = revokedResult.status === 'fulfilled' ? safeBigIntToNumber(revokedResult.value) : 0;

        console.log('Status counts from contract:', {
          verified: verifiedCount,
          pending: pendingCount,
          revoked: revokedCount,
          total: totalCertificates
        });
      } catch (error) {
        console.warn('Could not get status counts, using fallback method:', error);
        // Fallback: get IDs and count them
        const [verifiedResult, pendingResult, revokedResult] = await Promise.allSettled([
          contract.getVerifiedCertificateIds(0, 1000),
          contract.getPendingCertificateIds(0, 1000),
          contract.getRevokedCertificateIds(0, 1000)
        ]);

        verifiedCount = verifiedResult.status === 'fulfilled' ? verifiedResult.value.length : 0;
        pendingCount = pendingResult.status === 'fulfilled' ? pendingResult.value.length : 0;
        revokedCount = revokedResult.status === 'fulfilled' ? revokedResult.value.length : 0;
      }

      // Overview data - REAL from contract
      data.overview = {
        totalCertificates: totalCertificates,
        verifiedCertificates: verifiedCount,
        pendingCertificates: pendingCount,
        revokedCertificates: revokedCount,
        verificationRate: totalCertificates > 0 ? Math.round((verifiedCount / totalCertificates) * 100) : 0,
        totalInstitutions: 0,
        averageGrade: 0,
        lastBlockNumber: currentBlock,
        lastUpdate: new Date().toISOString()
      };

      // Certificate data - REAL from contract
      data.certificates = {
        totalSupply: totalCertificates,
        verifiedCount: verifiedCount,
        pendingCount: pendingCount,
        revokedCount: revokedCount,
        courseDistribution: {},
        gradeDistribution: {
          '90-100': 0,
          '80-89': 0,
          '70-79': 0,
          '60-69': 0,
          'Below 60': 0
        },
        recentActivity: [],
        lastUpdate: new Date().toISOString()
      };

      // Get course and grade distribution with improved error handling
      if (totalCertificates > 0) {
        const courseCounts = {};
        let totalGrade = 0;
        let gradeCount = 0;
        const processedCerts = [];

        try {
          // Instead of looping from 0 to totalCertificates, 
          // get the actual certificate IDs from the status arrays
          const [verifiedIds, pendingIds, revokedIds] = await Promise.allSettled([
            contract.getVerifiedCertificateIds(0, 10000),
            contract.getPendingCertificateIds(0, 10000),
            contract.getRevokedCertificateIds(0, 10000)
          ]);

          // Combine all existing certificate IDs
          const allIds = [
            ...(verifiedIds.status === 'fulfilled' ? verifiedIds.value : []),
            ...(pendingIds.status === 'fulfilled' ? pendingIds.value : []),
            ...(revokedIds.status === 'fulfilled' ? revokedIds.value : [])
          ];

          // Remove duplicates and filter out invalid IDs
          const uniqueIds = [...new Set(allIds)].filter(id => id !== null && id !== undefined);
          
          console.log('Processing existing certificates:', {
            totalIds: uniqueIds.length,
            verifiedIds: verifiedIds.status === 'fulfilled' ? verifiedIds.value.length : 0,
            pendingIds: pendingIds.status === 'fulfilled' ? pendingIds.value.length : 0,
            revokedIds: revokedIds.status === 'fulfilled' ? revokedIds.value.length : 0
          });

          // Process only existing certificates
          const batchSize = 10;
          for (let i = 0; i < uniqueIds.length; i += batchSize) {
            const batch = uniqueIds.slice(i, i + batchSize);
            const batchPromises = batch.map(async (id) => {
              try {
                const cert = await contract.getCertificate(id);
                if (cert && cert.student && cert.student !== '0x0000000000000000000000000000000000000000') {
                  processedCerts.push({ id, cert });
                  
                  // Course distribution
                  if (cert.courseId) {
                    try {
                      // Handle BigInt conversion safely for courseId
                      const courseIdValue = safeBigIntToNumber(cert.courseId);
                      let courseName = `Course ${courseIdValue}`;
                      try {
                        const courseNameResult = await contract.getCourseName(courseIdValue);
                        if (courseNameResult && courseNameResult.trim()) {
                          courseName = courseNameResult;
                        }
                      } catch (error) {
                        console.warn(`Error fetching course name for ID ${courseIdValue}:`, error);
                      }
                      courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
                    } catch (courseError) {
                      console.warn(`Error processing courseId for certificate ${id}:`, courseError);
                    }
                  }

                  // Grade distribution
                  if (cert.grade) {
                    try {
                      // Handle BigInt conversion safely
                      const gradeValue = safeBigIntToNumber(cert.grade);
                      if (!isNaN(gradeValue)) {
                        totalGrade += gradeValue;
                        gradeCount++;

                        if (gradeValue >= 90) data.certificates.gradeDistribution['90-100']++;
                        else if (gradeValue >= 80) data.certificates.gradeDistribution['80-89']++;
                        else if (gradeValue >= 70) data.certificates.gradeDistribution['70-79']++;
                        else if (gradeValue >= 60) data.certificates.gradeDistribution['60-69']++;
                        else data.certificates.gradeDistribution['Below 60']++;
                      }
                    } catch (gradeError) {
                      console.warn(`Error processing grade for certificate ${id}:`, gradeError);
                    }
                  }
                }
              } catch (error) {
                console.warn(`Error fetching certificate ${id} for report:`, error);
              }
            });

            // Wait for batch to complete before processing next batch
            await Promise.allSettled(batchPromises);
          }

          // Calculate course distribution percentages
          Object.keys(courseCounts).forEach(course => {
            data.certificates.courseDistribution[course] = Math.round((courseCounts[course] / totalCertificates) * 100);
          });

          // Calculate average grade
          if (gradeCount > 0) {
            data.overview.averageGrade = Math.round(totalGrade / gradeCount);
            data.certificates.averageGrade = Math.round(totalGrade / gradeCount);
          }

          // Recent activity (ALL certificates - no artificial limit for better data completeness)
          // Performance note: This is efficient because we already processed all certificates above
          // and we're just iterating over the existing array, not making new contract calls
          processedCerts.forEach(({ id, cert }) => {
            try {
              // Handle BigInt conversions safely
              const certId = safeBigIntToNumber(id);
              const courseId = cert.courseId ? safeBigIntToNumber(cert.courseId) : null;
              const grade = cert.grade ? safeBigIntToNumber(cert.grade) : 'N/A';
              const completionDate = cert.completionDate ? 
                new Date(safeBigIntToNumber(cert.completionDate) * 1000).toLocaleDateString() : 
                'Unknown Date';
              
              data.certificates.recentActivity.push({
                id: certId,
                course: courseId ? `Course ${courseId}` : 'Unknown Course',
                grade: grade,
                status: cert.isVerified ? 'verified' : 'pending',
                date: completionDate
              });
            } catch (activityError) {
              console.warn(`Error processing recent activity for certificate ${id}:`, activityError);
            }
          });

        } catch (error) {
          console.warn('Error processing certificate data:', error);
        }
      }

      // Institution data - REAL from contract
      data.institutions = {
        totalInstitutions: 0,
        institutionPerformance: [],
        averagePerformance: 0,
        lastUpdate: new Date().toISOString()
      };

      // Count unique institutions - use the same approach with existing IDs
      const institutionAddresses = new Set();
      if (totalCertificates > 0) {
        try {
          // Get the same certificate IDs we used above
          const [verifiedIds, pendingIds, revokedIds] = await Promise.allSettled([
            contract.getVerifiedCertificateIds(0, 10000),
            contract.getPendingCertificateIds(0, 10000),
            contract.getRevokedCertificateIds(0, 10000)
          ]);

          const allIds = [
            ...(verifiedIds.status === 'fulfilled' ? verifiedIds.value : []),
            ...(pendingIds.status === 'fulfilled' ? pendingIds.value : []),
            ...(revokedIds.status === 'fulfilled' ? revokedIds.value : [])
          ];
          const uniqueIds = [...new Set(allIds)].filter(id => id !== null && id !== undefined);

          // Process only existing certificates for institution analysis
          for (const id of uniqueIds) {
            try {
              const cert = await contract.getCertificate(id);
              if (cert && cert.institution) {
                institutionAddresses.add(cert.institution.toLowerCase());
              }
            } catch (error) {
              console.warn(`Error fetching certificate ${id} for institution analysis:`, error);
            }
          }

          data.overview.totalInstitutions = institutionAddresses.size;
          data.institutions.totalInstitutions = institutionAddresses.size;

          // Calculate institution performance
          const institutionStats = {};
          for (const id of uniqueIds) {
            try {
              const cert = await contract.getCertificate(id);
              if (cert && cert.institution) {
                const addr = cert.institution.toLowerCase();
                if (!institutionStats[addr]) {
                  institutionStats[addr] = { total: 0, verified: 0, pending: 0 };
                }
                institutionStats[addr].total++;
                if (cert.isVerified) {
                  institutionStats[addr].verified++;
                } else {
                  institutionStats[addr].pending++;
                }
              }
            } catch (error) {
              console.warn(`Error analyzing institution performance for certificate ${id}:`, error);
            }
          }

          // Convert to array and calculate performance
          const performanceData = Object.entries(institutionStats).map(([addr, stats]) => ({
            address: addr,
            name: `Institution ${addr.slice(0, 6)}...${addr.slice(-4)}`,
            total: stats.total,
            verified: stats.verified,
            pending: stats.pending,
            performance: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0
          }));

          data.institutions.institutionPerformance = performanceData.sort((a, b) => b.performance - a.performance);
          
          if (performanceData.length > 0) {
            const totalPerformance = performanceData.reduce((sum, inst) => sum + inst.performance, 0);
            data.institutions.averagePerformance = Math.round(totalPerformance / performanceData.length);
          }

        } catch (error) {
          console.warn('Error processing institution data:', error);
        }
      }

      // Validate data before setting it
      if (data.overview.totalCertificates >= 0 && 
          data.overview.verificationRate >= 0 && 
          data.overview.verificationRate <= 100) {
        
        setReportData(data);
        setLastUpdate(new Date());
        lastDataFetchRef.current = now;

        // Log successful data update
        console.log('Report data updated successfully from contract:', {
          timestamp: new Date().toISOString(),
          blockNumber: currentBlock,
          totalCertificates: data.overview.totalCertificates,
          verificationRate: data.overview.verificationRate,
          verified: verifiedCount,
          pending: pendingCount,
          revoked: revokedCount
        });

        // Debug: Show the complete breakdown
        console.log('🔍 CERTIFICATE COUNTING DEBUG:', {
          'Total from totalSupply()': totalCertificates,
          'Verified Count': verifiedCount,
          'Pending Count': pendingCount,
          'Revoked Count': revokedCount,
          'Sum of Statuses': verifiedCount + pendingCount + revokedCount,
          'Difference': totalCertificates - (verifiedCount + pendingCount + revokedCount),
          'Verification Rate': `${data.overview.verificationRate}%`,
          'Block Number': currentBlock
        });
      } else {
        console.warn('Data validation failed, skipping update');
        setError('Data validation failed. Please check your connection and try again.');
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to load report data. ';
      if (error.code === 'NETWORK_ERROR') {
        errorMessage += 'Network connection issue. Please check your internet connection.';
      } else if (error.code === 'CONTRACT_ERROR') {
        errorMessage += 'Smart contract error. Please check if you\'re connected to the correct network.';
      } else if (error.message.includes('user rejected')) {
        errorMessage += 'Transaction was rejected by user.';
      } else if (error.message.includes('BigInt')) {
        errorMessage += 'Data type conversion error. Please refresh and try again.';
      } else {
        errorMessage += `${error.message}. Please check your connection and try again.`;
      }
     
      setError(errorMessage);
      
      // Log detailed error for debugging
      console.error('Detailed error info:', {
        error: error,
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        contractAvailable: !!contract,
        providerAvailable: !!contract?.provider
      });
    } finally {
      setIsLoadingData(false);
      setIsUpdating(false);
    }
  }, [contract]);

  return {
    reportData,
    isLoadingData,
    error,
    lastUpdate,
    blockNumber,
    isUpdating,
    fetchReportData,
    setError
  };
};
