import React, { useState, useEffect } from 'react';
import { FaTimes, FaDna, FaQrcode, FaEye, FaDownload } from 'react-icons/fa';
import FuturisticSpinner from '../../ui/FuturisticSpinner';
import { useCertificateMetadataLoader } from '../../../hooks/useCertificateMetadataLoader';
import { useDNASoul, SOUL_STATUS } from './index';
import './dna-soul-animations.css';

const DNAModal = ({
  showDNA,
  dnaCertificate,
  dnaLoading,
  closeDNAModal,
  handleDNALoad,
  handleDNAError,
  placeholderImage,
  openQRModal,
  handleViewImage,
  metadataLoader
}) => {
  const [enhancedCertificate, setEnhancedCertificate] = useState(dnaCertificate);
  const { certificates, getSoulStatus, getBurnState } = useDNASoul();
  // Prefer freshest cert from context updated by realtime hooks
  const liveCertificate = certificates?.find?.((c) => String(c.id) === String(dnaCertificate?.id)) || dnaCertificate;
  const soulStatus = getSoulStatus(liveCertificate);
  const burnState = getBurnState?.(liveCertificate?.id);
  
  // Use shared loader if provided; otherwise create a local instance
  const loader = metadataLoader || useCertificateMetadataLoader();
  const {
    loadCertificateMetadata,
    getEnhancedCertificate,
    isMetadataLoaded
  } = loader;

  useEffect(() => {
    if (showDNA && liveCertificate) {
      // Update enhanced certificate from the freshest snapshot
      setEnhancedCertificate(getEnhancedCertificate(liveCertificate));
      
      // Try to load metadata in background if not already loaded
      if (liveCertificate.metadataCID && !isMetadataLoaded(liveCertificate)) {
        loadCertificateMetadata(liveCertificate).then((loadedMetadata) => {
          if (loadedMetadata) {
            console.log('Metadata loaded for certificate', liveCertificate.id, 'updating enhanced certificate');
            setEnhancedCertificate(getEnhancedCertificate(liveCertificate));
          }
        });
      }
    }
  }, [showDNA, liveCertificate, getEnhancedCertificate, isMetadataLoaded, loadCertificateMetadata]);

  // Add another useEffect to react to metadata loading changes
  useEffect(() => {
    if (showDNA && liveCertificate) {
      const enhanced = getEnhancedCertificate(liveCertificate);
      if (enhanced.imageUrl !== enhancedCertificate.imageUrl) {
        console.log('Enhanced certificate image URL changed:', enhanced.imageUrl);
        setEnhancedCertificate(enhanced);
      }
    }
  }, [showDNA, liveCertificate, getEnhancedCertificate, enhancedCertificate.imageUrl]);

  // Force refresh enhanced certificate every 500ms to catch metadata loading
  useEffect(() => {
    if (showDNA && liveCertificate) {
      const interval = setInterval(() => {
        const enhanced = getEnhancedCertificate(liveCertificate);
        if (enhanced.imageUrl && enhanced.imageUrl !== enhancedCertificate.imageUrl) {
          console.log('Force refresh: Enhanced certificate image URL found:', enhanced.imageUrl);
          setEnhancedCertificate(enhanced);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [showDNA, liveCertificate, getEnhancedCertificate, enhancedCertificate.imageUrl]);

  if (!showDNA || !liveCertificate) return null;

  // Debug logging
  console.log('DNA Modal rendering for certificate:', liveCertificate.id);
  console.log('Enhanced certificate imageUrl:', enhancedCertificate.imageUrl);
  console.log('Original certificate imageUrl:', liveCertificate.imageUrl);
  console.log('Final image src:', enhancedCertificate.imageUrl || liveCertificate.imageUrl || placeholderImage);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatAddress = (address) => {
    if (!address) return "0x0000...0000";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      closeDNAModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      {/* Mystical Background */}
      <div className="absolute inset-0 mystical-bg pointer-events-none"></div>
      
      {/* DNA Modal Container */}
      <div 
        className="relative dna-modal-container bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl p-6 max-w-5xl w-full max-h-[85vh] border-2 border-purple-500/30 shadow-2xl backdrop-blur-xl flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="dna-modal-icon">
              <FaDna className="text-purple-400 text-xl animate-dna-spiral" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DNA Certificate Analysis
            </h3>
          </div>
          
          {/* Futuristic Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeDNAModal();
            }}
            className="group relative dna-close-button flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
            aria-label="Close DNA Analysis"
          >
            <FaTimes className="text-red-400 group-hover:text-red-300 transition-colors duration-300 text-lg" />
            
            {/* Futuristic Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            
            {/* Scanning Lines Effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6">
        {/* Certificate Image Section */}
        <div className="relative flex justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4 rounded-xl mb-4 border border-gray-700/50 group">
          {dnaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl backdrop-blur-sm">
              <FuturisticSpinner size="lg" color="purple" />
            </div>
          )}
          
          {/* DNA Cell Overlay */}
          <div className="absolute top-3 left-3 dna-cell-overlay">
            <div className="dna-cell-membrane-small">
              <div className="dna-nucleus-small">
                <div className="dna-chromatin-small"></div>
                <div className="dna-chromatin-small"></div>
              </div>
            </div>
          </div>

          {/* Preview Icon Overlay - Only shows on hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewImage(liveCertificate);
              }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/25 backdrop-blur-sm"
              title="Preview Certificate Image"
            >
              <FaEye className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 text-lg" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </button>
          </div>

          {/* Clickable Image */}
          <img
            src={enhancedCertificate.imageUrl || liveCertificate.imageUrl || placeholderImage}
            alt={`DNA Certificate ${liveCertificate.id}`}
            className="max-w-full h-auto rounded-lg shadow-xl border border-purple-500/20 cursor-pointer hover:border-cyan-500/40 transition-all duration-300"
            onLoad={() => {
              console.log('DNA Modal image loaded successfully');
              handleDNALoad();
            }}
            onError={(e) => {
              console.log('DNA Modal image failed to load:', e.target.src);
              handleDNAError();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewImage(enhancedCertificate);
            }}
            style={{ maxHeight: '300px' }}
            title="Click to preview image"
          />

        </div>

        {/* DNA Certificate Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Left Column - Basic Info */}
          <div className="space-y-3">
            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-purple-300 text-xs font-mono font-bold">DNA_SEQUENCE_NAME</span>
              </div>
              <div className="text-base font-bold text-white bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 rounded-lg border border-purple-500/30 min-h-[50px] flex items-center">
                {enhancedCertificate.certificateName || enhancedCertificate.metadata?.name || liveCertificate.certificateName || liveCertificate.metadata?.name || `DNA Fragment #${liveCertificate.id}`}
              </div>
            </div>

            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-blue-300 text-xs font-mono font-bold">DNA_DOMAIN</span>
              </div>
              <div className="text-blue-400 font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3 rounded-lg border border-blue-500/30 min-h-[50px] flex items-center">
                {liveCertificate.courseName || `Course ${liveCertificate.courseId}`}
              </div>
            </div>

            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-yellow-300 text-xs font-mono font-bold">DNA_DENSITY</span>
              </div>
              <div className="text-yellow-400 font-bold bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-lg border border-yellow-500/30 min-h-[50px] flex items-center">
                {liveCertificate.grade ? `${liveCertificate.grade}%` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Right Column - Technical Info */}
          <div className="space-y-3">
            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-300 text-xs font-mono font-bold">DNA_OWNER</span>
              </div>
              <div className="text-green-400 font-mono text-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30 min-h-[50px] flex items-center">
                {formatAddress(liveCertificate.student)}
              </div>
            </div>

            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-pink-300 text-xs font-mono font-bold">DNA_TIMESTAMP</span>
              </div>
              <div className="text-pink-400 font-mono text-sm bg-gradient-to-r from-pink-500/20 to-rose-500/20 p-3 rounded-lg border border-pink-500/30 min-h-[50px] flex items-center">
                {formatDate(liveCertificate.completionDate)}
              </div>
            </div>

            <div className="dna-data-section">
              <div className="dna-field-header mb-1">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-cyan-300 text-xs font-mono font-bold">DNA_STATUS</span>
              </div>
              <div className={`font-bold text-sm p-3 rounded-lg border min-h-[50px] flex items-center ${
                soulStatus === SOUL_STATUS.VERIFIED ? 'text-green-400 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30' :
                soulStatus === SOUL_STATUS.REVOKED ? 'text-red-400 bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30' :
                soulStatus === SOUL_STATUS.BURNED ? 'text-gray-300 bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-500/30' :
                'text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
              }`}>
                {soulStatus === SOUL_STATUS.VERIFIED ? 'VERIFIED' : soulStatus === SOUL_STATUS.REVOKED ? 'REVOKED' : soulStatus === SOUL_STATUS.BURNED ? 'BURNED' : 'PENDING'}
                {burnState && (
                  <span className="ml-3 flex items-center gap-2">
                    {burnState.requested && !burnState.approved && !burnState.burned && (
                      <span className="px-2 py-1 text-[10px] font-mono rounded bg-orange-500/20 text-orange-300 border border-orange-400/40">REQUESTED</span>
                    )}
                    {burnState.approved && !burnState.burned && (
                      <span className="px-2 py-1 text-[10px] font-mono rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">APPROVED</span>
                    )}
                    {burnState.burned && (
                      <span className="px-2 py-1 text-[10px] font-mono rounded bg-red-500/20 text-red-300 border border-red-400/40">EXECUTED</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between gap-4 pt-4">
          <div className="space-y-2">
            <div className="dna-field-header mb-1">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-purple-300 text-xs font-mono font-bold">DNA_CERTIFICATE_ID</span>
            </div>
            <div className="text-purple-400 font-mono text-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 rounded-lg border border-purple-500/30">
              #{liveCertificate.id}
            </div>
            {burnState?.executionTime && !burnState.burned && (
              <div className="text-xs text-gray-400 font-mono">Burn executes ~ {new Date(burnState.executionTime).toLocaleString()}</div>
            )}
            {burnState?.reason && (
              <div className="text-xs text-gray-400 font-mono">Reason: {burnState.reason}</div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full md:max-w-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openQRModal(liveCertificate);
              }}
              className="dna-action-button dna-qr-button flex items-center justify-center w-full px-5 py-3 rounded-xl transition-all duration-300"
            >
              <FaQrcode className="mr-2" />
              Share DNA QR
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = enhancedCertificate.imageUrl || liveCertificate.imageUrl || placeholderImage;
                link.download = `dna-certificate-${liveCertificate.id}.jpg`;
                link.click();
              }}
              className="dna-action-button dna-download-button flex items-center justify-center w-full px-5 py-3 rounded-xl transition-all duration-300"
            >
              <FaDownload className="mr-2" />
              Download DNA
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DNAModal;
