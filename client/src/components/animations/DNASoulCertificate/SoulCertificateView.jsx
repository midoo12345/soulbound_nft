import React, { useEffect } from 'react';
import { DNASoulProvider } from './index';
import DNASoulRepository from './DNASoulRepository';
import { useCertificateMetadataLoader } from '../../../hooks/useCertificateMetadataLoader';
import './dna-soul-animations.css';

const SoulCertificateView = ({ 
  certificates, 
  userWallet, 
  openMetadataModal, 
  handleViewImage, 
  openQRModal, 
  contract 
}) => {
  // Use the metadata loader to preload metadata for all certificates
  const { loadMultipleCertificateMetadata } = useCertificateMetadataLoader();

  // Preload metadata for all certificates when component mounts
  useEffect(() => {
    if (certificates && certificates.length > 0) {
      console.log(`Preloading metadata for ${certificates.length} certificates...`);
      loadMultipleCertificateMetadata(certificates);
    }
  }, [certificates, loadMultipleCertificateMetadata]);

  return (
    <DNASoulProvider certificates={certificates} userWallet={userWallet} contract={contract}>
      <DNASoulRepository 
        openMetadataModal={openMetadataModal}
        handleViewImage={handleViewImage}
        openQRModal={openQRModal}
      />
    </DNASoulProvider>
  );
};

export default SoulCertificateView;
