import { useState, useCallback } from 'react';
import { PAGE_SIZE, normalizeAddress } from '../components/sperates/f1';
import { 
  fetchCertificatesByDateRange,
  fetchCertificatesByStudent,
  fetchCertificatesByInstitution,
  searchCertificatesByCourseName,
  fetchVerifiedCertificates,
  fetchPendingCertificates,
  fetchRevokedCertificates,
  fetchCertificateByTokenId
} from '../components/sperates/filters';
import { updateVisibleCertificates } from '../components/sperates/cert_utilits';
import { fetchAllCertificates } from '../components/sperates/cert_fetch';

export const useCertificateSearch = (
  contract,
  account,
  certificates,
  setCertificates,
  setVisibleCertificates,
  setError,
  setSearchLoading,
  setLoading,
  setCurrentPage,
  setHasMore,
  setLastUpdated,
  searchTerm,
  statusFilter,
  setNoResultsAddress,
  maxResults = 50,
  setLoadingMore = () => {},
  setTotalCertificates = () => {},
  isAdmin = false,
  isInstitute = false
) => {
  // Local state for search inputs
  const [courseNameFilter, setCourseNameFilter] = useState('');
  const [searchInProgress, setSearchInProgress] = useState(false);

  // Function to handle course name search
  const handleCourseNameSearch = useCallback(async () => {
    if (!courseNameFilter.trim()) {
      setError('Please enter a course name');
      return;
    }
    
    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);
    
    try {
      console.log(`Searching for certificates by course name: ${courseNameFilter}`);
      let results = await searchCertificatesByCourseName(contract, courseNameFilter.trim(), maxResults);
      // Enforce institution scope for institute users
      if (!isAdmin && isInstitute && account) {
        const acct = account.toLowerCase();
        results = (results || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
      }
      
      if (!results || results.length === 0) {
        console.log(`No certificates found for course name: ${courseNameFilter}`);
        setCertificates([]);
        setVisibleCertificates([]);
        setError('');
      } else {
        console.log(`Found ${results.length} certificates for course name: ${courseNameFilter}`);
        setCertificates(results);
        updateVisibleCertificates(results, '', statusFilter, setVisibleCertificates);
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error searching by course name:', error);
      setError(`Failed to search by course name: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    courseNameFilter, 
    maxResults, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    statusFilter, 
    setHasMore, 
    setLastUpdated
  ]);

  // Function to search by student address
  const handleStudentSearch = useCallback(async (studentAddress) => {
    if (!studentAddress) {
      setError('Please enter a student address');
      return;
    }

    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);
    setNoResultsAddress({ type: null, address: null });

    try {
      console.log(`Searching for certificates by student: ${studentAddress}`);
      
      // Basic format validation for student address
      const normalizedStudent = normalizeAddress(studentAddress);
      if (!normalizedStudent) {
        setError('Invalid student address format. Please enter a valid Ethereum address.');
        setSearchLoading(false);
        return;
      }
      
      let results = await fetchCertificatesByStudent(contract, studentAddress, 0, maxResults);
      if (!isAdmin && isInstitute && account) {
        const acct = account.toLowerCase();
        results = (results || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
      }
      
      console.log(`Student search results:`, results);
      if (!results || results.length === 0) {
        console.log(`No certificates found for student: ${studentAddress}`);
        setCertificates([]);
        setVisibleCertificates([]);
        setNoResultsAddress({ 
          type: 'student', 
          address: normalizedStudent 
        });
      } else {
        console.log(`Found ${results.length} certificates for student`);
        setCertificates(results);
        setVisibleCertificates(results); // Direct update to ensure visibility
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error during student search:', error);
      setError(`Failed to search by student address: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    maxResults, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    setHasMore, 
    setLastUpdated,
    setNoResultsAddress
  ]);

  // Function to search by institution address
  const handleInstitutionSearch = useCallback(async (institutionAddress) => {
    if (!institutionAddress) {
      setError('Please enter an institution address');
      return;
    }

    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);
    setNoResultsAddress({ type: null, address: null });

    try {
      console.log(`Searching for certificates by institution: ${institutionAddress}`);
      
      // Basic format validation for institution address
      const normalizedInstitution = normalizeAddress(institutionAddress);
      if (!normalizedInstitution) {
        setError('Invalid institution address format. Please enter a valid Ethereum address.');
        setSearchLoading(false);
        return;
      }
      
      // If user is an institute (but NOT admin), only allow searching their own address
      if (!isAdmin && isInstitute && account && normalizeAddress(institutionAddress) !== normalizeAddress(account)) {
        setCertificates([]);
        setVisibleCertificates([]);
        setError('Institutions can only search their own address.');
        setSearchLoading(false);
        return;
      }

      const results = await fetchCertificatesByInstitution(contract, institutionAddress, 0, maxResults);
      
      console.log(`Institution search results:`, results);
      if (!results || results.length === 0) {
        console.log(`No certificates found for institution: ${institutionAddress}`);
        setCertificates([]);
        setVisibleCertificates([]);
        setNoResultsAddress({ 
          type: 'institution', 
          address: normalizedInstitution 
        });
      } else {
        console.log(`Found ${results.length} certificates for institution`);
        setCertificates(results);
        setVisibleCertificates(results); // Direct update to ensure visibility
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error during institution search:', error);
      setError(`Failed to search by institution address: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    maxResults, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    setHasMore, 
    setLastUpdated,
    setNoResultsAddress
  ]);

  // Function to search by date range
  const handleDateRangeSearch = useCallback(async (startDate, endDate) => {
    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);
    setNoResultsAddress({ type: null, address: null });

    try {
      console.log(`Searching for certificates from ${startDate} to ${endDate}`);
      
      let results = await fetchCertificatesByDateRange(contract, startDate, endDate, 0, maxResults);
      if (!isAdmin && isInstitute && account) {
        const acct = account.toLowerCase();
        results = (results || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
      }
      
      if (!results || results.length === 0) {
        console.log(`No certificates found in date range`);
        setCertificates([]);
        setVisibleCertificates([]);
        setError('');
      } else {
        console.log(`Found ${results.length} certificates in date range`);
        setCertificates(results);
        updateVisibleCertificates(results, '', statusFilter, setVisibleCertificates);
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error during date range search:', error);
      setError(`Failed to search by date range: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    maxResults, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    statusFilter, 
    setHasMore, 
    setLastUpdated,
    setNoResultsAddress
  ]);

  // Function to search by certificate status
  const handleStatusSearch = useCallback(async (status) => {
    if (!status || status === 'all') {
      return;
    }

    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);

    try {
      console.log(`Searching for certificates with status: ${status}`);
      
      let results = [];
      
      if (status === 'verified') {
        results = await fetchVerifiedCertificates(contract, 0, maxResults);
      } else if (status === 'pending') {
        results = await fetchPendingCertificates(contract, 0, maxResults);
      } else if (status === 'revoked') {
        results = await fetchRevokedCertificates(contract, 0, maxResults);
      }
      
      if (!isAdmin && isInstitute && account) {
        const acct = account.toLowerCase();
        results = (results || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
      }

      if (!results || results.length === 0) {
        console.log(`No certificates found with status: ${status}`);
        setCertificates([]);
        setVisibleCertificates([]);
        setError('');
      } else {
        console.log(`Found ${results.length} certificates with status: ${status}`);
        setCertificates(results);
        updateVisibleCertificates(results, '', statusFilter, setVisibleCertificates);
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error during status search:', error);
      setError(`Failed to search by status: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    maxResults, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    statusFilter, 
    setHasMore, 
    setLastUpdated
  ]);

  // Function to directly fetch a certificate by token ID
  const handleTokenIdSearch = useCallback(async (tokenId) => {
    if (!tokenId) {
      return;
    }

    // Clear previous results and errors
    setError('');
    setSearchLoading(true);
    setCurrentPage(1);

    try {
      console.log(`Searching for certificate with token ID: ${tokenId}`);
      
      let result = await fetchCertificateByTokenId(contract, tokenId);
      if (!isAdmin && isInstitute && account) {
        const acct = account.toLowerCase();
        result = (result || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
      }
      
      if (!result || result.length === 0) {
        console.log(`Certificate with token ID ${tokenId} not found`);
        setCertificates([]);
        setVisibleCertificates([]);
        setError(`Certificate with ID ${tokenId} not found`);
      } else {
        console.log(`Found certificate with token ID: ${tokenId}`);
        setCertificates(result);
        setVisibleCertificates(result);
        setHasMore(false);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Error fetching certificate by token ID:', error);
      setError(`Failed to fetch certificate: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  }, [
    contract, 
    setCertificates, 
    setVisibleCertificates, 
    setError, 
    setSearchLoading, 
    setCurrentPage, 
    setHasMore, 
    setLastUpdated
  ]);

  // Function to clear search and show all certificates (SECURED)
  const handleClearSearchAndShowAll = useCallback(async () => {
    // Clear all search filters
    setError('');
    setCourseNameFilter('');
    setNoResultsAddress({ type: null, address: null });
    
    // Show loading state
    setLoading(true);
    
    try {
      if (!contract) {
        console.error("Contract not initialized");
        setError("Contract not initialized. Please connect your wallet.");
        setLoading(false);
        return;
      }

      // Use the imported fetchAllCertificates function
      
      console.log("Clearing search and loading certificates with proper permissions...");
      
      // Use the existing fetchAllCertificates function which respects user roles
      await fetchAllCertificates(contract, {
        reset: true,
        isAdmin: isAdmin || false,
        isInstitute: isInstitute || false,
        maxResults,
        currentPage: 1,
        certificates: [],
        loadingMore: false,
        isSearching: false,
        searchTerm: '',
        statusFilter: 'all',
        studentAddressFilter: '',
        // If user is an institution, constrain to their address even on clear
        institutionFilter: (!isAdmin && isInstitute && account) ? account : '',
        startDate: null,
        endDate: null,
        setCurrentPage,
        setHasMore,
        setLoading,
        setSearchLoading,
        setCertificates,
        setVisibleCertificates,
        setLoadingMore: () => {}, // Not needed for this call
        setIsSearching: () => {}, // Not needed for this call
        setError,
        setTotalCertificates: () => {}, // Not needed for this call
        setLastUpdated,
        setNoResultsAddress,
        updateVisibleCertificates
      });
      
      console.log("Successfully cleared search and loaded appropriate certificates");
      
    } catch (error) {
      console.error("Error reloading certificates:", error);
      setError("Failed to load certificates: " + error.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [
    contract,
    account,
    maxResults,
    setCurrentPage,
    setHasMore,
    setLoading,
    setSearchLoading,
    setCertificates,
    setVisibleCertificates,
    setError,
    setLastUpdated,
    setNoResultsAddress,
    updateVisibleCertificates,
    setCourseNameFilter,
    isAdmin,
    isInstitute
  ]);

  // Main search function that orchestrates the different search types
  const handleSearch = useCallback(async ({
    studentAddress,
    institutionAddress,
    courseName,
    searchTerm,
    statusFilter,
    startDate,
    endDate
  }) => {
    setSearchInProgress(true);
    
    try {
      // Clear previous results
      setError('');
      
      // Reset the current page for new search
      setCurrentPage(1);
      
      // Check for specific certificate ID search
      if (searchTerm && /^\d+$/.test(searchTerm.trim())) {
        await handleTokenIdSearch(Number(searchTerm.trim()));
        return;
      }
      
      // Status filter
      if (statusFilter && statusFilter !== 'all') {
        await handleStatusSearch(statusFilter);
        return;
      }
      
      // Student address filter
      if (studentAddress) {
        await handleStudentSearch(studentAddress);
        return;
      }
      
      // Institution address filter
      if (institutionAddress) {
        await handleInstitutionSearch(institutionAddress);
        return;
      }
      
      // Course name search
      if (searchTerm && !(/^\d+$/.test(searchTerm.trim()))) {
        // Set the courseNameFilter to the searchTerm before calling the search
        setCourseNameFilter(searchTerm);
        
        // Search directly with the searchTerm instead of using the local state
        setError('');
        setSearchLoading(true);
        setCurrentPage(1);
        
        try {
          console.log(`Searching for certificates by course name: ${searchTerm}`);
          let results = await searchCertificatesByCourseName(contract, searchTerm.trim(), maxResults);
          if (!isAdmin && isInstitute && account) {
            const acct = account.toLowerCase();
            results = (results || []).filter(c => c && c.institution && c.institution.toLowerCase() === acct);
          }
          
          if (!results || results.length === 0) {
            console.log(`No certificates found for course name: ${searchTerm}`);
            setCertificates([]);
            setVisibleCertificates([]);
            setError('');
          } else {
            console.log(`Found ${results.length} certificates for course name: ${searchTerm}`);
            setCertificates(results);
            updateVisibleCertificates(results, '', statusFilter, setVisibleCertificates);
            setHasMore(false);
            setLastUpdated(Date.now());
          }
        } catch (error) {
          console.error('Error searching by course name:', error);
          setError(`Failed to search by course name: ${error.message}`);
        } finally {
          setSearchLoading(false);
        }
        return;
      }
      
      // Date range search
      if (startDate || endDate) {
        await handleDateRangeSearch(startDate, endDate);
        return;
      }
      
      // If no specific search criteria, fetch recent certificates
      // This handles retrieving certificates appropriately for both admin and regular users
      console.log('No specific search criteria, fetching recent certificates');
      await fetchAllCertificates(contract, {
        reset: true,
        isAdmin: isAdmin || false,
        isInstitute: isInstitute || false,
        maxResults,
        currentPage: 1,
        certificates: [],
        loadingMore: false,
        isSearching: false,
        searchTerm: '',
        statusFilter: 'all',
        studentAddressFilter: '',
        institutionFilter: (!isAdmin && isInstitute && account) ? account : '',
        startDate: null,
        endDate: null,
        setCurrentPage,
        setHasMore,
        setLoading,
        setSearchLoading,
        setCertificates,
        setVisibleCertificates,
        setLoadingMore,
        setIsSearching,
        setError,
        setTotalCertificates,
        setLastUpdated,
        setNoResultsAddress,
        updateVisibleCertificates
      });
    } catch (error) {
      console.error('Error during search:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setSearchInProgress(false);
    }
  }, [
    contract,
    account,
    handleDateRangeSearch,
    handleStudentSearch,
    handleInstitutionSearch,
    handleStatusSearch,
    handleTokenIdSearch,
    setError,
    setSearchLoading,
    setCurrentPage,
    setNoResultsAddress,
    setSearchInProgress,
    isAdmin,
    maxResults,
    setHasMore,
    setLoading,
    setCertificates,
    setVisibleCertificates,
    setLoadingMore,
    setLastUpdated,
    setTotalCertificates,
    updateVisibleCertificates,
    setCourseNameFilter,
    statusFilter,
    searchCertificatesByCourseName
  ]);

  // Reset function to clear all search states and load all certificates
  const handleResetSearch = useCallback(async () => {
    try {
      // Clear all search filters
      setError('');
      setCourseNameFilter('');
      setNoResultsAddress({ type: null, address: null });
      setCurrentPage(1);
      
      // Show loading state
      setLoading(true);
      
      console.log('Resetting search and loading all certificates...');
      
      // Load all certificates
      await fetchAllCertificates(contract, {
        reset: true,
        isAdmin: isAdmin || false,
        isInstitute: isInstitute || false,
        maxResults,
        currentPage: 1,
        certificates: [],
        loadingMore: false,
        isSearching: false,
        searchTerm: '',
        statusFilter: 'all',
        studentAddressFilter: '',
        institutionFilter: (!isAdmin && isInstitute && account) ? account : '',
        startDate: null,
        endDate: null,
        setCurrentPage,
        setHasMore,
        setLoading,
        setSearchLoading,
        setCertificates,
        setVisibleCertificates,
        setLoadingMore,
        setIsSearching: setSearchInProgress,
        setError,
        setTotalCertificates,
        setLastUpdated,
        setNoResultsAddress,
        updateVisibleCertificates
      });
      
      console.log('Successfully reset search and loaded all certificates');
      
    } catch (error) {
      console.error('Error resetting search:', error);
      setError(`Failed to reset search: ${error.message}`);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [
    contract,
    isAdmin,
    isInstitute,
    account,
    maxResults,
    setCurrentPage,
    setHasMore,
    setLoading,
    setSearchLoading,
    setCertificates,
    setVisibleCertificates,
    setLoadingMore,
    setSearchInProgress,
    setError,
    setTotalCertificates,
    setLastUpdated,
    setNoResultsAddress,
    updateVisibleCertificates,
    setCourseNameFilter
  ]);

  return {
    // State
    courseNameFilter,
    setCourseNameFilter,
    isSearching: searchInProgress,
    setIsSearching: setSearchInProgress,
    
    // Search functions
    handleCourseNameSearch,
    handleStudentSearch,
    handleInstitutionSearch,
    handleDateRangeSearch,
    handleStatusSearch,
    handleTokenIdSearch,
    handleClearSearchAndShowAll,
    handleSearch,
    handleResetSearch
  };
};

export default useCertificateSearch; 