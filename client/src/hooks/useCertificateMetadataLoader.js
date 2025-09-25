import { useState, useEffect, useCallback } from 'react';
import { fetchMetadataFromIPFS, getImageUrlFromMetadata } from '../components/sperates/f1.js';

/**
 * Hook to handle background loading of certificate metadata and images
 * Specifically designed for DNA Soul certificates to improve image loading performance
 */
export const useCertificateMetadataLoader = () => {
  const [loadingMetadata, setLoadingMetadata] = useState(new Set());
  const [loadedMetadata, setLoadedMetadata] = useState(new Map());

  /**
   * Load metadata for a certificate in the background
   */
  const loadCertificateMetadata = useCallback(async (certificate) => {
    if (!certificate || !certificate.metadataCID) {
      return null;
    }

    const cacheKey = certificate.metadataCID;
    
    // Check if already loaded or loading
    if (loadedMetadata.has(cacheKey) || loadingMetadata.has(cacheKey)) {
      return loadedMetadata.get(cacheKey) || null;
    }

    // Mark as loading
    setLoadingMetadata(prev => new Set(prev).add(cacheKey));

    try {
      console.log(`Loading metadata for certificate ${certificate.id} in background...`);
      
      // Fetch metadata from IPFS
      const metadata = await fetchMetadataFromIPFS(certificate.metadataCID);
      
      if (metadata) {
        // Generate image URL if image CID exists
        let imageUrl = null;
        if (metadata.image) {
          const imageCID = metadata.image.startsWith('ipfs://') ? metadata.image.slice(7) : metadata.image;
          imageUrl = getImageUrlFromMetadata(metadata, imageCID);
        }

        const enhancedMetadata = {
          ...metadata,
          imageUrl,
          loadedAt: Date.now()
        };

        // Store in loaded metadata
        setLoadedMetadata(prev => new Map(prev).set(cacheKey, enhancedMetadata));
        
        console.log(`Successfully loaded metadata for certificate ${certificate.id}`);
        return enhancedMetadata;
      }
    } catch (error) {
      console.error(`Failed to load metadata for certificate ${certificate.id}:`, error);
    } finally {
      // Remove from loading set
      setLoadingMetadata(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }

    return null;
  }, [loadedMetadata, loadingMetadata]);

  /**
   * Load metadata for multiple certificates in parallel
   */
  const loadMultipleCertificateMetadata = useCallback(async (certificates) => {
    const certificatesToLoad = certificates.filter(cert => 
      cert && 
      cert.metadataCID && 
      !loadedMetadata.has(cert.metadataCID) && 
      !loadingMetadata.has(cert.metadataCID)
    );

    if (certificatesToLoad.length === 0) {
      return;
    }

    console.log(`Loading metadata for ${certificatesToLoad.length} certificates in background...`);

    // Load in batches to avoid overwhelming the network
    const batchSize = 3;
    for (let i = 0; i < certificatesToLoad.length; i += batchSize) {
      const batch = certificatesToLoad.slice(i, i + batchSize);
      
      // Load batch in parallel
      await Promise.allSettled(
        batch.map(cert => loadCertificateMetadata(cert))
      );
      
      // Small delay between batches to be gentle on the network
      if (i + batchSize < certificatesToLoad.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [loadCertificateMetadata, loadedMetadata, loadingMetadata]);

  /**
   * Get enhanced certificate with loaded metadata
   */
  const getEnhancedCertificate = useCallback((certificate) => {
    if (!certificate || !certificate.metadataCID) {
      return certificate;
    }

    const loadedMeta = loadedMetadata.get(certificate.metadataCID);
    if (loadedMeta) {
      console.log(`Getting enhanced certificate for ${certificate.id}, imageUrl:`, loadedMeta.imageUrl);
      return {
        ...certificate,
        metadata: loadedMeta,
        imageUrl: loadedMeta.imageUrl || certificate.imageUrl,
        metadataLoaded: true
      };
    }

    console.log(`No enhanced metadata found for certificate ${certificate.id}, using original`);
    return certificate;
  }, [loadedMetadata]);

  /**
   * Check if metadata is currently loading for a certificate
   */
  const isMetadataLoading = useCallback((certificate) => {
    return certificate && certificate.metadataCID && loadingMetadata.has(certificate.metadataCID);
  }, [loadingMetadata]);

  /**
   * Check if metadata is loaded for a certificate
   */
  const isMetadataLoaded = useCallback((certificate) => {
    return certificate && certificate.metadataCID && loadedMetadata.has(certificate.metadataCID);
  }, [loadedMetadata]);

  return {
    loadCertificateMetadata,
    loadMultipleCertificateMetadata,
    getEnhancedCertificate,
    isMetadataLoading,
    isMetadataLoaded,
    loadedMetadataCount: loadedMetadata.size,
    loadingMetadataCount: loadingMetadata.size
  };
};
