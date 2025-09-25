import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import contractAddress from '../../../config/contractAddress.json';
import contractABI from '../../../config/abi.json';

/**
 * Activity Feed Component
 * Displays real-time activity feed from blockchain events using actual contract data
 */
const ActivityFeed = ({ 
  contract, 
  isLoading = false, 
  isUpdating = false,
  realTimeEnabled = false 
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [eventFilters, setEventFilters] = useState([]);
  const [error, setError] = useState(null);
  const [authorizedInstitutions, setAuthorizedInstitutions] = useState([]);
  const [verifiedSummary, setVerifiedSummary] = useState({ total: 0, recent: [] });
  const [issuanceSummary, setIssuanceSummary] = useState({ total: 0, recent: [], byCourse: {}, byInstitution: {} });
  const [pagination, setPagination] = useState({
    issuances: { page: 1, limit: 50, total: 0 },
    verifications: { page: 1, limit: 50, total: 0 },
    courses: { page: 1, limit: 20, total: 0 },
    institutions: { page: 1, limit: 20, total: 0 }
  });

  // Fetch real activity data from contract events
  const fetchActivityData = useCallback(async () => {
    // Create provider and contract instance directly (same approach as useHistoricalMetrics)
    if (!window.ethereum) {
      setError('No Ethereum provider found. Please connect a wallet.');
      return;
    }
    
    setIsLoadingData(true);
    try {
      const { BrowserProvider, Contract } = await import('ethers');
      const provider = new BrowserProvider(window.ethereum);
      const fullContract = new Contract(
        contractAddress.SoulboundCertificateNFT,
        contractABI.SoulboundCertificateNFT,
        provider
      );
      
      // Direct reads + events combined
      const newActivities = [];

      // Direct contract reads: fetch IDs and derive recent certificates summary
      let uniqueCertificateIds = [];
      try {
        const [verifiedIdsRaw, pendingIdsRaw, revokedIdsRaw] = await Promise.all([
          fullContract.getVerifiedCertificateIds(0, 1000),
          fullContract.getPendingCertificateIds(0, 1000),
          fullContract.getRevokedCertificateIds(0, 1000)
        ]);

        const verifiedIds = verifiedIdsRaw.map((v) => v.toString());
        const pendingIds = pendingIdsRaw.map((v) => v.toString());
        const revokedIds = revokedIdsRaw.map((v) => v.toString());

        const allCertificateIds = [...verifiedIds, ...pendingIds, ...revokedIds];
        uniqueCertificateIds = [...new Set(allCertificateIds)];

        if (uniqueCertificateIds.length > 0) {
          const recentCount = Math.min(10, uniqueCertificateIds.length);
          const recentIds = uniqueCertificateIds.slice(-recentCount);
          for (const id of recentIds) {
            try {
              const cert = await fullContract.getCertificate(id);
              if (cert) {
                const issueDate = Number(cert.completionDate) * 1000;
                let activityType = 'CertificateIssued';
                let message = `New certificate #${id} issued for Course ${cert.courseId || 'Unknown Course'}`;
                let status = 'success';
                if (cert.isVerified) {
                  activityType = 'CertificateVerified';
                  message = `Certificate #${id} verified by ${cert.institution ? cert.institution.slice(0, 6) + '...' + cert.institution.slice(-4) : 'Unknown Institution'}`;
                  status = 'info';
                }
                if (cert.isRevoked) {
                  activityType = 'CertificateRevoked';
                  message = `Certificate #${id} revoked`;
                  status = 'warning';
                }
                newActivities.push({
                  id: `direct-${id}`,
                  type: activityType,
                  message,
                  timestamp: issueDate,
                  status,
                  certificateId: id,
                  course: `Course ${cert.courseId}`,
                  student: cert.student,
                  institution: cert.institution,
                  grade: cert.grade
                });

                // Direct burn request check using mapping
                try {
                  const burnTs = await fullContract.burnRequestTimestamps(id);
                  const burnRequestedAt = Number(burnTs?.toString?.() || '0');
                  if (burnRequestedAt > 0) {
                    newActivities.push({
                      id: `direct-burn-${id}`,
                      type: 'CertificateBurnRequested',
                      message: `Burn requested for certificate #${id}`,
                      timestamp: burnRequestedAt * 1000,
                      status: 'warning',
                      certificateId: id,
                    });
                  }
                } catch (burnErr) {
                  console.warn(`Error checking burnRequestTimestamps for ${id}:`, burnErr);
                }
              }
            } catch (error) {
              console.warn(`Error fetching certificate ${id}:`, error);
            }
          }
        }

        // Comprehensive verification snapshots using batch reads
        try {
          if (verifiedIdsRaw && verifiedIdsRaw.length > 0) {
            // Ensure we pass a plain mutable array of BigInt/number IDs
            const verifiedIdsForBatch = Array.from(verifiedIdsRaw).map((v) => {
              try { return BigInt(v.toString()); } catch (_) { return Number(v); }
            });

            const [batchRes, detailsRes] = await Promise.all([
              fullContract.getCertificatesBatch(verifiedIdsForBatch),
              fullContract.getCertificatesBatchDetails(verifiedIdsForBatch)
            ]);

            const students = batchRes.students || batchRes[0] || [];
            const institutions = batchRes.institutions || batchRes[1] || [];
            const courseIds = batchRes.courseIds || batchRes[2] || [];
            const completionDates = batchRes.completionDates || batchRes[3] || [];
            const grades = batchRes.grades || batchRes[4] || [];
            const verificationStatuses = batchRes.verificationStatuses || batchRes[5] || [];

            const lastUpdateDates = detailsRes.lastUpdateDates || detailsRes[2] || [];
            const updateReasons = detailsRes.updateReasons || detailsRes[3] || [];

            verifiedIdsForBatch.forEach((bnId, i) => {
              const idStr = bnId?.toString?.() || String(bnId);
              const isVerified = Boolean(verificationStatuses[i]);
              if (isVerified) {
                const tsSec = Number((lastUpdateDates[i]?.toString?.()) || (completionDates[i]?.toString?.()) || '0');
                const timestamp = tsSec > 0 ? tsSec * 1000 : Date.now();
                newActivities.push({
                  id: `verified-snapshot-${idStr}`,
                  type: 'CertificateVerified',
                  message: `Certificate #${idStr} currently verified` + (updateReasons?.[i] ? ` (${updateReasons[i]})` : ''),
                  timestamp,
                  status: 'info',
                  certificateId: idStr,
                  course: courseIds?.[i] !== undefined ? `Course ${courseIds[i]}` : undefined,
                  student: students?.[i],
                  institution: institutions?.[i],
                  grade: grades?.[i]
                });
              }
            });

            // Mapping cross-check (sample up to 50 ids)
            const sampleIds = verifiedIdsForBatch.slice(0, 50);
            try {
              const mappingChecks = await Promise.all(
                sampleIds.map((id) => fullContract.verifiedCertificates(id).catch(() => false))
              );
              mappingChecks.forEach((isMapVerified, idx) => {
                if (isMapVerified) {
                  const idStr = sampleIds[idx]?.toString?.() || String(sampleIds[idx]);
                  newActivities.push({
                    id: `verified-map-snapshot-${idStr}`,
                    type: 'CertificateVerified',
                    message: `Certificate #${idStr} verified (mapping)`,
                    timestamp: Date.now(),
                    status: 'info',
                    certificateId: idStr,
                  });
                }
              });
            } catch (mapErr) {
              console.warn('Error checking verifiedCertificates mapping:', mapErr);
            }
          }
        } catch (verifyBatchErr) {
          console.warn('Error batch-fetching verification snapshots:', verifyBatchErr);
        }

        // Verification totals and recent via dedicated ABI functions
        try {
          const totalVerifiedBN = await fullContract.countCertificatesByStatus(true, false);
          const totalVerified = Number(totalVerifiedBN?.toString?.() || '0');
          let recentList = [];
          try {
            const recentIdsRaw = await fullContract.getRecentCertificates(50); // Increased from 10
            const recentIds = Array.from(recentIdsRaw).map((v) => v.toString());
            const recentDetails = await Promise.all(
              recentIds.map(async (id) => {
                try {
                  const c = await fullContract.getCertificate(id);
                  const ts = Number((c?.lastUpdateDate?.toString?.()) || (c?.completionDate?.toString?.()) || '0') * 1000;
                  const isV = Boolean(c?.isVerified);
                  return isV ? { id, timestamp: ts } : null;
                } catch (_) { return null; }
              })
            );
            recentList = recentDetails.filter(Boolean).slice(0, 50); // Increased from 10
          } catch (recentErr) {
            console.warn('Error fetching recent verified certificates:', recentErr);
          }
          setVerifiedSummary({ total: totalVerified, recent: recentList });
        } catch (totalsErr) {
          console.warn('Error fetching verification totals:', totalsErr);
        }

        // Comprehensive issuance coverage using all ABI functions
        try {
          // Total supply and counts
          const [totalSupplyBN, totalIssuedBN] = await Promise.all([
            fullContract.totalSupply(),
            fullContract.countCertificatesByStatus(false, false) // not verified, not revoked
          ]);
          const totalSupply = Number(totalSupplyBN?.toString?.() || '0');
          const totalIssued = Number(totalIssuedBN?.toString?.() || '0');

          // Recent issuances
          let recentIssuances = [];
          try {
            const recentIdsRaw = await fullContract.getRecentCertificates(100); // Increased from 20
            const recentIds = Array.from(recentIdsRaw).map((v) => v.toString());
            const recentDetails = await Promise.all(
              recentIds.map(async (id) => {
                try {
                  const c = await fullContract.getCertificate(id);
                  if (c && !c.isRevoked) {
                    const ts = Number((c?.completionDate?.toString?.()) || '0') * 1000;
                    return { id, timestamp: ts, courseId: c.courseId, institution: c.institution, student: c.student, grade: c.grade };
                  }
                  return null;
                } catch (_) { return null; }
              })
            );
            recentIssuances = recentDetails.filter(Boolean).slice(0, 50); // Increased from 15
          } catch (recentErr) {
            console.warn('Error fetching recent issuances:', recentErr);
          }

          // Course-based issuances
          let courseIssuances = {};
          try {
            const courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Increased from 5
            for (const courseId of courseIds) {
              try {
                const count = await fullContract.countCertificatesByCourse(courseId);
                if (Number(count?.toString?.() || '0') > 0) {
                  const certIds = await fullContract.getCertificatesByCourse(courseId, 0, 20); // Increased from 10
                  courseIssuances[courseId] = {
                    count: Number(count.toString()),
                    name: await fullContract.getCourseName(courseId).catch(() => `Course ${courseId}`),
                    recentIds: Array.from(certIds).map((v) => v.toString())
                  };
                }
              } catch (courseErr) {
                console.warn(`Error fetching course ${courseId} data:`, courseErr);
              }
            }
          } catch (courseBatchErr) {
            console.warn('Error fetching course-based issuances:', courseBatchErr);
          }

          // Institution-based issuances
          let institutionIssuances = {};
          try {
            const authInstitutions = authorizedInstitutions.length > 0 ? authorizedInstitutions : ['0x0000000000000000000000000000000000000000'];
            for (const institution of authInstitutions.slice(0, 10)) { // Increased from 5
              try {
                const count = await fullContract.countCertificatesByInstitution(institution);
                if (Number(count?.toString?.() || '0') > 0) {
                  const certIds = await fullContract.getCertificatesByInstitution(institution, 0, 20); // Increased from 10
                  institutionIssuances[institution] = {
                    count: Number(count.toString()),
                    recentIds: Array.from(certIds).map((v) => v.toString())
                  };
                }
              } catch (instErr) {
                console.warn(`Error fetching institution ${institution} data:`, instErr);
              }
            }
          } catch (instBatchErr) {
            console.warn('Error fetching institution-based issuances:', instBatchErr);
          }

          // Date range issuances (last 30 days)
          let dateRangeIssuances = [];
          try {
            const now = Math.floor(Date.now() / 1000);
            const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
            const recentIds = await fullContract.getCertificatesByDateRange(thirtyDaysAgo, now, 0, 50); // Increased from 20
            dateRangeIssuances = Array.from(recentIds).map((v) => v.toString());
          } catch (dateErr) {
            console.warn('Error fetching date range issuances:', dateErr);
          }

          // Academic certificates mapping cross-check
          let academicMappingIssuances = [];
          try {
            const sampleIds = Array.from({ length: Math.min(20, totalSupply) }, (_, i) => i);
            for (const id of sampleIds) {
              try {
                const academicCert = await fullContract.academicCertificates(id);
                if (academicCert && academicCert.studentAddress !== '0x0000000000000000000000000000000000000000') {
                  const ts = Number((academicCert?.completionDate?.toString?.()) || '0') * 1000;
                  academicMappingIssuances.push({
                    id: id.toString(),
                    timestamp: ts,
                    student: academicCert.studentAddress,
                    institution: academicCert.institutionAddress,
                    courseId: academicCert.courseId,
                    grade: academicCert.grade
                  });
                }
              } catch (academicErr) {
                // Skip if academicCertificates mapping doesn't exist for this ID
                break;
              }
            }
          } catch (academicBatchErr) {
            console.warn('Error fetching academic certificates mapping:', academicBatchErr);
          }

          // Add academic mapping issuances to activities
          academicMappingIssuances.forEach((cert) => {
            newActivities.push({
              id: `academic-mapping-${cert.id}`,
              type: 'CertificateIssued',
              message: `Certificate #${cert.id} issued via academic mapping (Course ${cert.courseId})`,
              timestamp: cert.timestamp,
              status: 'success',
              certificateId: cert.id,
              course: `Course ${cert.courseId}`,
              student: cert.student,
              institution: cert.institution,
              grade: cert.grade
            });
          });

          setIssuanceSummary({
            total: totalSupply,
            totalIssued: totalIssued,
            recent: recentIssuances,
            byCourse: courseIssuances,
            byInstitution: institutionIssuances,
            dateRange: dateRangeIssuances
          });
        } catch (issuanceErr) {
          console.warn('Error fetching comprehensive issuance data:', issuanceErr);
        }
      } catch (idsError) {
        console.warn('Error fetching certificate ID lists:', idsError);
      }

      // Fetch ALL contract events from creation to latest and convert to activities
      try {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = 0;

        const eventFilters = [
          ['Approval', fullContract.filters.Approval()],
          ['ApprovalForAll', fullContract.filters.ApprovalForAll()],
          ['BatchMetadataUpdate', fullContract.filters.BatchMetadataUpdate()],
          ['BurnTimelockChanged', fullContract.filters.BurnTimelockChanged()],
          ['CertificateBurnApproved', fullContract.filters.CertificateBurnApproved()],
          ['CertificateBurnRequestCanceled', fullContract.filters.CertificateBurnRequestCanceled()],
          ['CertificateBurnRequested', fullContract.filters.CertificateBurnRequested()],
          ['CertificateBurned', fullContract.filters.CertificateBurned()],
          ['CertificateIssued', fullContract.filters.CertificateIssued()],
          ['CertificateRevoked', fullContract.filters.CertificateRevoked()],
          ['CertificateStatusChanged', fullContract.filters.CertificateStatusChanged()],
          ['CertificateUpdated', fullContract.filters.CertificateUpdated()],
          ['CertificateVerified', fullContract.filters.CertificateVerified()],
          ['CourseNameSet', fullContract.filters.CourseNameSet()],
          ['InstitutionAuthorized', fullContract.filters.InstitutionAuthorized()],
          ['InstitutionRevoked', fullContract.filters.InstitutionRevoked()],
          ['MetadataUpdate', fullContract.filters.MetadataUpdate()],
          ['OwnershipTransferred', fullContract.filters.OwnershipTransferred()],
          ['RoleAdminChanged', fullContract.filters.RoleAdminChanged()],
          ['RoleGranted', fullContract.filters.RoleGranted()],
          ['RoleRevoked', fullContract.filters.RoleRevoked()],
          ['Transfer', fullContract.filters.Transfer()]
        ];

        const allEventResults = await Promise.all(
          eventFilters.map(([_, filter]) => fullContract.queryFilter(filter, fromBlock, latestBlock))
        );

        // Build a block timestamp cache to minimize provider calls
        const blockNumbersSet = new Set();
        allEventResults.forEach(events => {
          events.forEach(ev => blockNumbersSet.add(ev.blockNumber));
        });
        const blockNumbers = Array.from(blockNumbersSet);
        const blocks = await Promise.all(blockNumbers.map(bn => provider.getBlock(bn)));
        const blockTsMap = new Map(blocks.map(b => [b.number, b.timestamp]));

        // Map events to activities
        eventFilters.forEach(([eventName], idx) => {
          const events = allEventResults[idx];
          events.forEach((ev) => {
            const tsSec = blockTsMap.get(ev.blockNumber) || Math.floor(Date.now() / 1000);
            const timestamp = tsSec * 1000;
            const a = ev.args || {};
            const makeId = `${eventName}-${ev.blockNumber}-${ev.logIndex}`;

            switch (eventName) {
              case 'CertificateIssued': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const courseId = a.courseId?.toString?.() || a[3]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateIssued',
                  message: `Certificate #${tokenId} issued (Course ${courseId})`,
                  timestamp,
                  status: 'success',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateVerified': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const verifier = a.verifier || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateVerified',
                  message: `Certificate #${tokenId} verified by ${verifier ? verifier.slice(0, 6) + '...' + verifier.slice(-4) : 'unknown'}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateRevoked': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const reason = a.reason || a[2] || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateRevoked',
                  message: `Certificate #${tokenId} revoked${reason ? `: ${reason}` : ''}`,
                  timestamp,
                  status: 'warning',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateUpdated': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const newGrade = a.newGrade?.toString?.() || a[1]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateUpdated',
                  message: `Certificate #${tokenId} updated (grade ${newGrade})`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateStatusChanged': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const isVerified = a.isVerified ?? a[1];
                const isRevoked = a.isRevoked ?? a[2];
                newActivities.push({
                  id: makeId,
                  type: 'CertificateStatusChanged',
                  message: `Certificate #${tokenId} status: verified=${isVerified}, revoked=${isRevoked}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateBurnRequested': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                const reason = a.reason || a[2] || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateBurnRequested',
                  message: `Burn requested for certificate #${tokenId}${reason ? `: ${reason}` : ''}`,
                  timestamp,
                  status: 'warning',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateBurnApproved': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateBurnApproved',
                  message: `Burn approved for certificate #${tokenId}`,
                  timestamp,
                  status: 'warning',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateBurnRequestCanceled': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateBurnRequestCanceled',
                  message: `Burn request canceled for certificate #${tokenId}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CertificateBurned': {
                const tokenId = a.tokenId?.toString?.() || a[0]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'CertificateBurned',
                  message: `Certificate #${tokenId} burned`,
                  timestamp,
                  status: 'warning',
                  certificateId: tokenId,
                });
                break;
              }
              case 'CourseNameSet': {
                const courseId = a.courseId?.toString?.() || a[0]?.toString?.() || '';
                const name = a.name || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'CourseNameSet',
                  message: `Course #${courseId} named "${name}"`,
                  timestamp,
                  status: 'info',
                });
                break;
              }
              case 'InstitutionAuthorized': {
                const institution = a.institution || a[0] || '';
                newActivities.push({
                  id: makeId,
                  type: 'InstitutionAuthorized',
                  message: `Institution ${institution ? institution.slice(0, 6) + '...' + institution.slice(-4) : ''} authorized`,
                  timestamp,
                  status: 'success',
                });
                break;
              }
              case 'InstitutionRevoked': {
                const institution = a.institution || a[0] || '';
                newActivities.push({
                  id: makeId,
                  type: 'InstitutionRevoked',
                  message: `Institution ${institution ? institution.slice(0, 6) + '...' + institution.slice(-4) : ''} revoked`,
                  timestamp,
                  status: 'warning',
                });
                break;
              }
              case 'RoleGranted': {
                const role = a.role || a[0] || '';
                const account = a.account || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'RoleGranted',
                  message: `Role granted: ${role} to ${account ? account.slice(0, 6) + '...' + account.slice(-4) : ''}`,
                  timestamp,
                  status: 'success',
                });
                break;
              }
              case 'RoleRevoked': {
                const role = a.role || a[0] || '';
                const account = a.account || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'RoleRevoked',
                  message: `Role revoked: ${role} from ${account ? account.slice(0, 6) + '...' + account.slice(-4) : ''}`,
                  timestamp,
                  status: 'warning',
                });
                break;
              }
              case 'RoleAdminChanged': {
                const role = a.role || a[0] || '';
                newActivities.push({
                  id: makeId,
                  type: 'RoleAdminChanged',
                  message: `Role admin changed for ${role}`,
                  timestamp,
                  status: 'info',
                });
                break;
              }
              case 'OwnershipTransferred': {
                const previousOwner = a.previousOwner || a[0] || '';
                const newOwner = a.newOwner || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'OwnershipTransferred',
                  message: `Ownership transferred ${previousOwner ? previousOwner.slice(0, 6) + '...' + previousOwner.slice(-4) : ''} → ${newOwner ? newOwner.slice(0, 6) + '...' + newOwner.slice(-4) : ''}`,
                  timestamp,
                  status: 'info',
                });
                break;
              }
              case 'Transfer': {
                const tokenId = a.tokenId?.toString?.() || a[2]?.toString?.() || '';
                const from = a.from || a[0] || '';
                const to = a.to || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'Transfer',
                  message: `Token #${tokenId} transferred ${from ? from.slice(0, 6) + '...' + from.slice(-4) : ''} → ${to ? to.slice(0, 6) + '...' + to.slice(-4) : ''}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'Approval': {
                const tokenId = a.tokenId?.toString?.() || a[2]?.toString?.() || '';
                const approved = a.approved || a[1] || '';
                newActivities.push({
                  id: makeId,
                  type: 'Approval',
                  message: `Approval set for token #${tokenId} to ${approved ? approved.slice(0, 6) + '...' + approved.slice(-4) : ''}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'ApprovalForAll': {
                const operator = a.operator || a[1] || '';
                const approved = a.approved ?? a[2];
                newActivities.push({
                  id: makeId,
                  type: 'ApprovalForAll',
                  message: `Operator ${operator ? operator.slice(0, 6) + '...' + operator.slice(-4) : ''} approvedForAll=${approved}`,
                  timestamp,
                  status: 'info',
                });
                break;
              }
              case 'BatchMetadataUpdate': {
                newActivities.push({
                  id: makeId,
                  type: 'BatchMetadataUpdate',
                  message: 'Batch metadata update occurred',
                  timestamp,
                  status: 'info',
                });
                break;
              }
              case 'MetadataUpdate': {
                const tokenId = a._tokenId?.toString?.() || a[0]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'MetadataUpdate',
                  message: `Metadata updated for token #${tokenId}`,
                  timestamp,
                  status: 'info',
                  certificateId: tokenId,
                });
                break;
              }
              case 'BurnTimelockChanged': {
                const newTimelock = a.newTimelock?.toString?.() || a[0]?.toString?.() || '';
                newActivities.push({
                  id: makeId,
                  type: 'BurnTimelockChanged',
                  message: `Burn timelock changed to ${newTimelock}s`,
                  timestamp,
                  status: 'info',
                });
                break;
              }
              default: {
                newActivities.push({ id: makeId, type: eventName, message: eventName, timestamp, status: 'info' });
              }
            }
          });
        });

        // Authorization enrichment: collect institutions from events and verify current status
        try {
          const latestBlockObj = await provider.getBlock(latestBlock);
          const latestTs = (latestBlockObj?.timestamp || Math.floor(Date.now() / 1000)) * 1000;

          const institutionAddresses = new Set();

          // From InstitutionAuthorized/Revoked events
          const instAuthIdx = eventFilters.findIndex(([n]) => n === 'InstitutionAuthorized');
          if (instAuthIdx !== -1) {
            allEventResults[instAuthIdx].forEach(ev => {
              const a = ev.args || {};
              const addr = a.institution || a[0];
              if (addr) institutionAddresses.add(addr);
            });
          }
          const instRevIdx = eventFilters.findIndex(([n]) => n === 'InstitutionRevoked');
          if (instRevIdx !== -1) {
            allEventResults[instRevIdx].forEach(ev => {
              const a = ev.args || {};
              const addr = a.institution || a[0];
              if (addr) institutionAddresses.add(addr);
            });
          }

          // From RoleGranted/RoleRevoked for INSTITUTION_ROLE
          const INSTITUTION_ROLE = await fullContract.INSTITUTION_ROLE();
          const roleGrantedIdx = eventFilters.findIndex(([n]) => n === 'RoleGranted');
          if (roleGrantedIdx !== -1) {
            allEventResults[roleGrantedIdx]
              .filter(ev => (ev.args?.role || ev.args?.[0]) === INSTITUTION_ROLE)
              .forEach(ev => {
                const a = ev.args || {};
                const account = a.account || a[1];
                if (account) institutionAddresses.add(account);
              });
          }
          const roleRevokedIdx = eventFilters.findIndex(([n]) => n === 'RoleRevoked');
          if (roleRevokedIdx !== -1) {
            allEventResults[roleRevokedIdx]
              .filter(ev => (ev.args?.role || ev.args?.[0]) === INSTITUTION_ROLE)
              .forEach(ev => {
                const a = ev.args || {};
                const account = a.account || a[1];
                if (account) institutionAddresses.add(account);
              });
          }

          const addrArray = Array.from(institutionAddresses);
          if (addrArray.length > 0) {
            const [hasRoles, mappingStatuses] = await Promise.all([
              Promise.all(addrArray.map(addr => fullContract.hasRole(INSTITUTION_ROLE, addr).catch(() => false))),
              Promise.all(addrArray.map(addr => fullContract.authorizedInstitutions(addr).catch(() => false)))
            ]);

            const currentAuthorized = [];
            addrArray.forEach((addr, i) => {
              const isAuthorized = Boolean(hasRoles[i] || mappingStatuses[i]);
              if (isAuthorized) currentAuthorized.push(addr);
              newActivities.push({
                id: `auth-snapshot-${addr}`,
                type: isAuthorized ? 'InstitutionAuthorized' : 'InstitutionRevoked',
                message: `Institution ${addr.slice(0, 6)}...${addr.slice(-4)} ${isAuthorized ? 'currently authorized' : 'currently revoked'}`,
                timestamp: latestTs,
                status: isAuthorized ? 'success' : 'warning',
                institution: addr
              });
            });
            setAuthorizedInstitutions(currentAuthorized);
          }
        } catch (authEnrichErr) {
          console.warn('Error enriching authorization state:', authEnrichErr);
        }
      } catch (eventsError) {
        console.warn('Error fetching full event history:', eventsError);
      }
      
      // Direct role check from ABI to enrich feed (optional, based on last cert if any)
      try {
        if (uniqueCertificateIds.length > 0) {
          const sortedIds = [...uniqueCertificateIds].sort((a, b) => Number(a) - Number(b));
          const lastCertId = sortedIds[sortedIds.length - 1];
          const lastCert = await fullContract.getCertificate(lastCertId);
          if (lastCert && lastCert.institution) {
            const institutionAddress = lastCert.institution;
            const INSTITUTION_ROLE = await fullContract.INSTITUTION_ROLE();
            try {
              const hasRole = await fullContract.hasRole(INSTITUTION_ROLE, institutionAddress);
              if (hasRole) {
                newActivities.push({
                  id: `direct-role-${institutionAddress}`,
                  type: 'InstitutionAuthorized',
                  message: `Institution ${institutionAddress.slice(0, 6)}...${institutionAddress.slice(-4)} currently authorized`,
                  timestamp: Date.now() - 300000,
                  status: 'success',
                  institution: institutionAddress
                });
              }
            } catch (roleErr) {
              console.warn('Error checking hasRole:', roleErr);
            }
          }
        }
      } catch (authErr) {
        console.warn('Error enriching with role data:', authErr);
      }
      
      // Sort activities by timestamp (newest first)
      newActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to last 20 activities
      setActivities(newActivities.slice(0, 20));

    } catch (error) {
      console.error('Error fetching activity data:', error);
      setError('Failed to load activity data. Please check your contract connection and try again.');
    } finally {
      setIsLoadingData(false);
    }
  }, [contract]);

  // Load activity data when provider is available
  useEffect(() => {
    if (window.ethereum) {
      fetchActivityData();
    }
  }, [fetchActivityData]);

  // Refresh data when updating
  useEffect(() => {
    if (isUpdating && window.ethereum) {
      fetchActivityData();
    }
  }, [isUpdating, fetchActivityData]);

  // Auto-refresh activity data every 30 seconds
  useEffect(() => {
    if (window.ethereum && realTimeEnabled) {
      const interval = setInterval(() => {
        fetchActivityData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled, fetchActivityData]);

  // Get status color and styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': 
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'info': 
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'warning': 
        return 'text-amber-400 bg-amber-900/20 border-amber-500/30';
      case 'error': 
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: 
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'CertificateIssued': return '📜';
      case 'CertificateVerified': return '✅';
      case 'InstitutionAuthorized': return '🏛️';
      case 'CertificateRevoked': return '🚫';
      case 'CertificateBurnRequested': return '🔥';
      default: return '📋';
    }
  };

  // Count by type for filter badges
  const getTypeCount = (type) => activities.filter(a => a.type === type).length;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const d = new Date(Number(timestamp));
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleString();
    } catch (_) {
      return '';
    }
  };

  // Filter activities by type
  const filteredActivities = activities.filter(activity => {
    if (eventFilters.length === 0) return true;
    return eventFilters.includes(activity.type);
  });

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
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
          Activity Feed
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real-time feed of blockchain activities, certificate events, and system updates.
        </p>
        
        {/* Data Status */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLoadingData ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm text-gray-400">
            {isLoadingData ? 'Loading activity data...' : `${activities.length} activities loaded`}
          </span>
        </div>
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
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Activity Filters */}
      <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-4 border border-gray-800/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400 mr-2">Filter by:</span>
          {[
            { type: 'CertificateIssued', label: 'Issuances', icon: '📜' },
            { type: 'CertificateVerified', label: 'Verifications', icon: '✅' },
            { type: 'InstitutionAuthorized', label: 'Authorizations', icon: '🏛️' },
            { type: 'CertificateRevoked', label: 'Revocations', icon: '🚫' },
            { type: 'CertificateBurnRequested', label: 'Burn Requests', icon: '🔥' }
          ].map((filter) => (
            <button
              key={filter.type}
              onClick={() => {
                setEventFilters(prev => 
                  prev.includes(filter.type) 
                    ? prev.filter(t => t !== filter.type)
                    : [...prev, filter.type]
                );
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                eventFilters.includes(filter.type)
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
              <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded bg-gray-700/60 text-gray-300 border border-gray-600/50">{getTypeCount(filter.type)}</span>
            </button>
          ))}
          
          {eventFilters.length > 0 && (
            <button
              onClick={() => setEventFilters([])}
              className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Live Activity Stream
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>
        
        {filteredActivities.length > 0 ? (
          <div className="divide-y divide-gray-800/50">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-800/30 transition-colors duration-200">
                <div className="flex items-start space-x-4">
                  {/* Activity Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-800/60 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{getTypeIcon(activity.type)}</span>
                    </div>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(activity.status)}`}>
                        {activity.type}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      {activity.certificateId && (
                        <span className="text-xs text-gray-500 font-mono">
                          #{activity.certificateId}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-300 leading-relaxed mb-2">
                      {activity.message}
                    </p>
                    
                    {/* Additional Details */}
                    {activity.course && (
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {activity.course && (
                          <span>Course: {activity.course}</span>
                        )}
                        {activity.grade && (
                          <span>Grade: {activity.grade}%</span>
                        )}
                        {activity.student && (
                          <span>Student: {activity.student.slice(0, 6)}...{activity.student.slice(-4)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-400' :
                      activity.status === 'info' ? 'bg-blue-400' :
                      activity.status === 'warning' ? 'bg-amber-400' :
                      'bg-red-400'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <div>No activities found</div>
            <div className="text-sm mt-2">
              {eventFilters.length > 0 
                ? 'Try adjusting your filters or check back later'
                : 'Activities will appear here once certificates are issued'
              }
            </div>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      {activities.length > 0 && (
        <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4">Activity Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { type: 'CertificateIssued', label: 'Issuances', icon: '📜' },
              { type: 'CertificateVerified', label: 'Verifications', icon: '✅' },
              { type: 'InstitutionAuthorized', label: 'Authorizations', icon: '🏛️' },
              { type: 'CertificateRevoked', label: 'Revocations', icon: '🚫' },
              { type: 'CertificateBurnRequested', label: 'Burn Requests', icon: '🔥' }
            ].map((summary) => {
              const count = activities.filter(a => a.type === summary.type).length;
              return (
                <div key={summary.type} className="text-center p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="text-2xl mb-2">{summary.icon}</div>
                  <div className="text-lg font-semibold text-white">{count}</div>
                  <div className="text-sm text-gray-400">{summary.label}</div>
                </div>
              );
            })}
          </div>

          {/* Authorized Institutions Snapshot */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3">Authorized Institutions Now</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {authorizedInstitutions.length > 0 ? (
                authorizedInstitutions.map(addr => (
                  <div key={addr} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <span>🏛️</span>
                      <span className="text-sm text-gray-300 font-mono">{addr.slice(0, 6)}...{addr.slice(-4)}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 border border-green-700/40 text-green-300">Authorized</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No authorized institutions detected.</div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-2">Total authorized: {authorizedInstitutions.length}</div>
          </div>

          {/* Verifications Now */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3">Verifications Now</h4>
            <div className="text-sm text-gray-300">Total verified: <span className="font-semibold text-white">{verifiedSummary.total}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 mb-3">
              {verifiedSummary.recent.length > 0 ? (
                verifiedSummary.recent.slice(0, 12).map(v => ( // Show first 12 per page
                  <div key={`vnow-${v.id}`} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <span>✅</span>
                      <span className="text-sm text-gray-300">#{v.id}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimestamp(v.timestamp)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No recent verifications detected.</div>
              )}
            </div>
            
            {/* Pagination for Verifications */}
            {verifiedSummary.recent.length > 12 && (
              <div className="flex items-center justify-center space-x-2">
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, verifications: { ...prev.verifications, page: Math.max(1, prev.verifications.page - 1) } }))}
                  className="px-3 py-1 text-xs bg-gray-700/60 text-gray-300 rounded hover:bg-gray-600/60 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {pagination.verifications.page} of {Math.ceil(verifiedSummary.recent.length / 12)}
                </span>
                <button 
                  onClick={() => setPagination(prev => ({ ...prev, verifications: { ...prev.verifications, page: Math.min(Math.ceil(verifiedSummary.recent.length / 12), prev.verifications.page + 1) } }))}
                  className="px-3 py-1 text-xs bg-gray-700/60 text-gray-300 rounded hover:bg-gray-600/60 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Issuances Now */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-white mb-3">Issuances Now</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="text-lg font-semibold text-white">{issuanceSummary.total}</div>
                <div className="text-xs text-gray-400">Total Supply</div>
              </div>
              <div className="text-center p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="text-lg font-semibold text-white">{issuanceSummary.totalIssued}</div>
                <div className="text-xs text-gray-400">Total Issued</div>
              </div>
              <div className="text-center p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="text-lg font-semibold text-white">{issuanceSummary.recent.length}</div>
                <div className="text-xs text-gray-400">Recent (50)</div>
              </div>
            </div>

            {/* Recent Issuances */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-300 mb-2">Recent Issuances</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {issuanceSummary.recent.length > 0 ? (
                  issuanceSummary.recent.slice(0, 12).map(issuance => ( // Show first 12 per page
                    <div key={`issuance-${issuance.id}`} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <span>📜</span>
                        <div className="text-xs">
                          <div className="text-gray-300">#{issuance.id}</div>
                          <div className="text-gray-500">Course {issuance.courseId}</div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{formatTimestamp(issuance.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No recent issuances detected.</div>
                )}
              </div>
              
              {/* Pagination for Recent Issuances */}
              {issuanceSummary.recent.length > 12 && (
                <div className="flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, issuances: { ...prev.issuances, page: Math.max(1, prev.issuances.page - 1) } }))}
                    className="px-3 py-1 text-xs bg-gray-700/60 text-gray-300 rounded hover:bg-gray-600/60 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {pagination.issuances.page} of {Math.ceil(issuanceSummary.recent.length / 12)}
                  </span>
                  <button 
                    onClick={() => setPagination(prev => ({ ...prev, issuances: { ...prev.issuances, page: Math.min(Math.ceil(issuanceSummary.recent.length / 12), prev.issuances.page + 1) } }))}
                    className="px-3 py-1 text-xs bg-gray-700/60 text-gray-300 rounded hover:bg-gray-600/60 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Course Breakdown */}
            {Object.keys(issuanceSummary.byCourse).length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">By Course</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(issuanceSummary.byCourse).map(([courseId, data]) => (
                    <div key={`course-${courseId}`} className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">{data.name}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 border border-blue-700/40 text-blue-300">{data.count}</span>
                      </div>
                      <div className="text-xs text-gray-500">Recent IDs: {data.recentIds.slice(0, 3).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Institution Breakdown */}
            {Object.keys(issuanceSummary.byInstitution).length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-300 mb-2">By Institution</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(issuanceSummary.byInstitution).map(([institution, data]) => (
                    <div key={`institution-${institution}`} className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300 font-mono">{institution.slice(0, 6)}...{institution.slice(-4)}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 border border-green-700/40 text-green-300">{data.count}</span>
                      </div>
                      <div className="text-xs text-gray-500">Recent IDs: {data.recentIds.slice(0, 3).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Summary */}
            {issuanceSummary.dateRange.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Last 30 Days</h5>
                <div className="text-xs text-gray-500">Recent IDs: {issuanceSummary.dateRange.slice(0, 10).join(', ')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Status */}
      {realTimeEnabled && (
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl p-4 border border-amber-500/30">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-amber-300 font-medium">
              Activity feed updating in real-time • New events every 30 seconds
            </span>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes validation
ActivityFeed.propTypes = {
  contract: PropTypes.object,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  realTimeEnabled: PropTypes.bool
};

// Default props
ActivityFeed.defaultProps = {
  contract: null,
  isLoading: false,
  isUpdating: false,
  realTimeEnabled: false
};

export default ActivityFeed;
