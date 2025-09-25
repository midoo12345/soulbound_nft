import React, { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaSpinner } from 'react-icons/fa';
import { useCertificateMetadataLoader } from '../../../hooks/useCertificateMetadataLoader';
import { SOUL_STATUS } from './index';
import './dna-soul-animations.css';

const ImagePreviewModal = ({
  showModal,
  certificate,
  loading,
  closeModal,
  handleImageLoad,
  handleImageError,
  placeholderImage,
  // Optional: pass live certificates array if available to keep preview fresh
  certificates,
  // Optional: share existing metadata loader instance for caching across components
  metadataLoader
}) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [enhancedCertificate, setEnhancedCertificate] = useState(certificate);

  // Prefer the freshest snapshot if a certificates list is provided
  const liveCertificate = certificates?.find?.((c) => String(c.id) === String(certificate?.id)) || certificate;

  // Local status resolver (mirrors DNASoulProvider's getSoulStatus)
  const resolveSoulStatus = (cert) => {
    if (!cert) return SOUL_STATUS.PENDING;
    if (cert.isRevoked) return SOUL_STATUS.REVOKED;
    if (cert.isVerified) return SOUL_STATUS.VERIFIED;
    return SOUL_STATUS.PENDING;
  };
  const soulStatus = resolveSoulStatus(liveCertificate);

  // Use the metadata loader hook (full API for reactivity like DNAModal)
  const loader = metadataLoader || useCertificateMetadataLoader();
  const {
    loadCertificateMetadata,
    getEnhancedCertificate,
    isMetadataLoaded
  } = loader;

  useEffect(() => {
    if (showModal && liveCertificate) {
      setImageLoading(true);
      const enhanced = getEnhancedCertificate(liveCertificate);
      setEnhancedCertificate(enhanced);

      // Try to load metadata in background if not already loaded
      if (liveCertificate.metadataCID && !isMetadataLoaded(liveCertificate)) {
        loadCertificateMetadata(liveCertificate).then(() => {
          setEnhancedCertificate(getEnhancedCertificate(liveCertificate));
        });
      }

      // Debug logging
      console.log('ImagePreviewModal: Loading for certificate:', liveCertificate.id);
      console.log('ImagePreviewModal: Enhanced certificate imageUrl:', enhanced?.imageUrl);
      console.log('ImagePreviewModal: Original certificate imageUrl:', liveCertificate.imageUrl);
    }
  }, [showModal, liveCertificate, getEnhancedCertificate, isMetadataLoaded, loadCertificateMetadata]);

  // React to metadata becoming available
  useEffect(() => {
    if (showModal && liveCertificate) {
      const enhanced = getEnhancedCertificate(liveCertificate);
      if ((enhanced?.imageUrl || '') !== (enhancedCertificate?.imageUrl || '')) {
        setEnhancedCertificate(enhanced);
      }
    }
  }, [showModal, liveCertificate, getEnhancedCertificate, enhancedCertificate?.imageUrl]);

  // Force refresh enhanced certificate every 500ms to catch metadata loading
  useEffect(() => {
    if (showModal && liveCertificate) {
      const interval = setInterval(() => {
        const enhanced = getEnhancedCertificate(liveCertificate);
        if (enhanced?.imageUrl && enhanced.imageUrl !== (enhancedCertificate?.imageUrl || '')) {
          console.log('ImagePreviewModal: Force refresh enhanced certificate image URL found:', enhanced.imageUrl);
          setEnhancedCertificate(enhanced);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [showModal, liveCertificate, getEnhancedCertificate, enhancedCertificate?.imageUrl]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      closeModal();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = enhancedCertificate?.imageUrl || liveCertificate?.imageUrl || placeholderImage;
    link.download = `certificate-${liveCertificate?.id || 'preview'}.jpg`;
    link.click();
  };

  if (!showModal || !liveCertificate) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      {/* Mystical Background */}
      <div className="absolute inset-0 mystical-bg pointer-events-none"></div>
      
      {/* Modal Container */}
      <div 
        className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-purple-500/30 shadow-2xl backdrop-blur-xl"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📄</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Certificate Preview
            </h3>
          </div>
          
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
            aria-label="Close Preview"
          >
            <FaTimes className="text-red-400 group-hover:text-red-300 transition-colors duration-300 text-lg" />
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>
        </div>

        {/* Certificate Info */}
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-white">
                {enhancedCertificate?.certificateName || enhancedCertificate?.metadata?.name || liveCertificate.certificateName || liveCertificate.metadata?.name || `Certificate #${liveCertificate.id}`}
              </h4>
              <p className="text-purple-300 text-sm">
                {liveCertificate.courseName || `Course ${liveCertificate.courseId}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 font-mono text-sm">
                #{liveCertificate.id}
              </div>
              <div className={`text-xs font-bold ${
                soulStatus === SOUL_STATUS?.VERIFIED ? 'text-green-400' : 
                soulStatus === SOUL_STATUS?.REVOKED ? 'text-red-400' : 
                'text-yellow-400'
              }`}>
                {soulStatus === SOUL_STATUS?.VERIFIED ? 'VERIFIED' : soulStatus === SOUL_STATUS?.REVOKED ? 'REVOKED' : 'PENDING'}
              </div>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
          {/* Loading Overlay */}
          {(loading || imageLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm z-10">
              <div className="text-center">
                <FaSpinner className="text-purple-400 text-3xl animate-spin mx-auto mb-3" />
                <p className="text-purple-300 font-mono text-sm">Loading certificate image...</p>
              </div>
            </div>
          )}
          
          {/* Certificate Image */}
          <img
            src={enhancedCertificate?.imageUrl || liveCertificate.imageUrl || placeholderImage}
            alt={`Certificate ${liveCertificate.id}`}
            className="w-full h-auto max-h-[60vh] object-contain"
            onLoad={() => {
              setImageLoading(false);
              handleImageLoad?.();
            }}
            onError={() => {
              setImageLoading(false);
              handleImageError?.();
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleDownload}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-blue-500/25"
          >
            <FaDownload className="mr-2" />
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
