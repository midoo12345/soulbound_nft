import React, { useState } from 'react';
import { FaEye, FaDna } from 'react-icons/fa';
import { useDNASoul } from './index';
import DNAHelixVisualization from './DNAHelixVisualization';
import SoulStatusIndicator from './SoulStatusIndicator';
import DNAModal from './DNAModal';
import './dna-soul-animations.css';

const SoulCertificateCard = ({ 
  certificate, 
  handleViewImage, 
  openQRModal,
  metadataLoader
}) => {
  const { startSoulReading, getSoulStatus } = useDNASoul();
  const [isHovered, setIsHovered] = useState(false);
  const [isUnwinding, setIsUnwinding] = useState(false);
  const [buttonClickEffect, setButtonClickEffect] = useState(null);
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [dnaLoading, setDnaLoading] = useState(false);

  const soulStatus = getSoulStatus(certificate);

  const handleSoulReading = () => {
    setIsUnwinding(true);
    setTimeout(() => {
      startSoulReading(certificate);
      setIsUnwinding(false);
    }, 1000);
  };

  const handleButtonClick = (action, buttonType) => {
    // Add mystical click effect
    setButtonClickEffect(buttonType);
    setTimeout(() => setButtonClickEffect(null), 600);
    
    // Execute the action
    action(certificate);
  };

  const handleDNAModal = () => {
    setShowDNAModal(true);
    setDnaLoading(true);
  };

  const closeDNAModal = () => {
    setShowDNAModal(false);
    setDnaLoading(false);
  };

  const handleDNALoad = () => {
    setDnaLoading(false);
  };

  const handleDNAError = () => {
    setDnaLoading(false);
  };

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

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 ${
        isHovered ? 'transform scale-105' : 'transform scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSoulReading}
    >
      {/* DNA Helix Container */}
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-gray-700/50">
        {/* DNA Visualization */}
        <DNAHelixVisualization 
          certificate={certificate} 
          isActive={isHovered || isUnwinding}
        />
        
        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-2">🧬</div>
              <div className="text-white font-bold text-sm">Click to Read Soul</div>
            </div>
          </div>
        )}

        {/* Unwinding animation */}
        {isUnwinding && (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2 animate-spin">🌀</div>
              <div className="text-white font-bold text-sm">Unwinding DNA...</div>
            </div>
          </div>
        )}

        {/* Certificate ID overlay */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono">
          #{certificate.id}
        </div>
      </div>

      {/* Certificate Info */}
      <div className="space-y-4">
        {/* DNA Title */}
        <div className="dna-data-field">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-purple-300 text-xs font-mono font-bold">DNA_SEQUENCE_NAME</span>
          </div>
          <h3 className="text-lg font-bold text-white truncate bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-2 rounded-lg border border-purple-500/30">
            {certificate.certificateName || certificate.metadata?.name || `Soul Fragment #${certificate.id}`}
          </h3>
        </div>

        {/* DNA Course Info */}
        <div className="dna-data-field">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-blue-300 text-xs font-mono font-bold">DNA_DOMAIN</span>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-blue-400 mb-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-2 rounded-lg border border-blue-500/30">
              {certificate.courseName || `Course ${certificate.courseId}`}
            </div>
            <div className="text-gray-400 text-xs font-mono">
              ◊ Completed: {formatDate(certificate.completionDate)} ◊
            </div>
          </div>
        </div>

        {/* DNA Status */}
        <SoulStatusIndicator certificate={certificate} />

        {/* DNA Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="dna-data-field">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-yellow-300 text-xs font-mono font-bold">DNA_DENSITY</span>
            </div>
            <div className="text-yellow-400 font-bold text-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-2 rounded-lg border border-yellow-500/30">
              {certificate.grade ? `${certificate.grade}%` : 'N/A'}
            </div>
          </div>
          
          <div className="dna-data-field">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-300 text-xs font-mono font-bold">DNA_OWNER</span>
            </div>
            <div className="text-blue-400 font-mono text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-2 rounded-lg border border-blue-500/30">
              {formatAddress(certificate.student)}
            </div>
          </div>
        </div>

        {/* DNA Analysis Button - Full Width */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick(handleDNAModal, 'view');
          }}
          className={`w-full dna-cell-button dna-view-cell flex items-center justify-center transition-all duration-700 text-sm text-white font-mono py-4 px-6 mt-4 ${
            buttonClickEffect === 'view' ? 'dna-cell-active' : ''
          }`}
          title="Analyze Certificate Details"
        >
          <div className="dna-cell-container mr-3">
            <div className="dna-cell-membrane">
              <div className="dna-nucleus">
                <div className="dna-chromatin"></div>
                <div className="dna-chromatin"></div>
                <div className="dna-chromatin"></div>
              </div>
              <div className="dna-ribosome"></div>
              <div className="dna-ribosome"></div>
              <div className="dna-mitochondria"></div>
              <div className="dna-protein-particle"></div>
              <div className="dna-protein-particle"></div>
            </div>
            <div className="dna-real-icon">
              <FaDna className="dna-icon" />
            </div>
          </div>
           <span className="dna-cell-text">VIEW CERTIFICATE</span>
          <div className="dna-cell-glow"></div>
          <div className="dna-cell-particles"></div>
        </button>

        {/* DNA Action hint */}
        <div className="text-center pt-2">
          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-mono">
            {isHovered ? '◊ Click to analyze DNA sequence ◊' : '◈ Hover to scan DNA ◈'}
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-500 ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`absolute inset-0 rounded-lg ${
          soulStatus === 'verified' ? 'shadow-yellow-400/20' :
          soulStatus === 'pending' ? 'shadow-blue-400/20' :
          soulStatus === 'revoked' ? 'shadow-red-400/20' :
          'shadow-purple-400/20'
        } shadow-2xl blur-xl`}></div>
      </div>

      {/* DNA Modal */}
      <DNAModal
        showDNA={showDNAModal}
        dnaCertificate={certificate}
        dnaLoading={dnaLoading}
        closeDNAModal={closeDNAModal}
        handleDNALoad={handleDNALoad}
        handleDNAError={handleDNAError}
        placeholderImage="/cert.jpg"
        openQRModal={openQRModal}
        handleViewImage={handleViewImage}
        metadataLoader={metadataLoader}
      />
    </div>
  );
};

export default SoulCertificateCard;
