import React, { useState } from 'react';
import FuturisticSpinner from '../../../components/ui/FuturisticSpinner';
import { formatGrade } from '../../../components/sperates/cert_utilits.js';

// Copy icon component
const CopyIcon = ({ isCopied }) => (
  isCopied ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-400 hover:text-violet-300" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
  )
);

// External link icon component
const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </svg>
);

const MetadataModal = ({
  showMetadata,
  metadataCertificate,
  metadataImageLoading,
  closeMetadataModal
}) => {
  const [copiedText, setCopiedText] = useState('');
  
  if (!showMetadata || !metadataCertificate) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeMetadataModal();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-0 w-[900px] h-[600px] border border-gray-700/50 shadow-2xl relative flex flex-col">
        {metadataImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-2xl backdrop-blur-sm z-10">
            <FuturisticSpinner size="lg" color="violet" />
          </div>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-gray-700/50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
              <h3 className="text-xl font-bold text-white">Certificate Metadata</h3>
            </div>
            <button
              onClick={closeMetadataModal}
              className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 group"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-sm p-5 rounded-xl border border-gray-600/30 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-400 to-purple-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-white text-lg">Certificate Details</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Token ID</span>
                  <span className="text-white font-mono text-sm">{metadataCertificate.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Course Name</span>
                  <span className="text-white text-sm">{metadataCertificate.courseName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Course ID</span>
                  <span className="text-white font-mono text-sm">{metadataCertificate.courseId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Completion Date</span>
                  <span className="text-white text-sm">{metadataCertificate.completionDate}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Grade</span>
                  <span className="text-white text-sm">{formatGrade(metadataCertificate.grade)} ({metadataCertificate.grade}%)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-300 text-sm">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    metadataCertificate.isRevoked 
                      ? 'bg-red-500/20 text-red-400' 
                      : metadataCertificate.isVerified 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {metadataCertificate.isRevoked ? 'Revoked' : metadataCertificate.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-sm p-5 rounded-xl border border-gray-600/30 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-white text-lg">Blockchain Data</h4>
              </div>
              <div className="space-y-3">
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm block mb-1">Student</span>
                  <div className="flex items-center">
                    <span className="break-all text-xs text-white font-mono flex-1 mr-2">{metadataCertificate.student}</span>
                    <button 
                      onClick={() => copyToClipboard(metadataCertificate.student, 'Student Address')}
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Copy student address"
                    >
                      <CopyIcon isCopied={copiedText === 'Student Address'} />
                    </button>
                  </div>
                </div>
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm block mb-1">Institution</span>
                  <div className="flex items-center">
                    <span className="break-all text-xs text-white font-mono flex-1 mr-2">{metadataCertificate.institution}</span>
                    <button 
                      onClick={() => copyToClipboard(metadataCertificate.institution, 'Institution Address')}
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Copy institution address"
                    >
                      <CopyIcon isCopied={copiedText === 'Institution Address'} />
                    </button>
                  </div>
                </div>
                {metadataCertificate.revocationReason && (
                  <div className="py-2 border-b border-gray-600/20">
                    <span className="text-gray-300 text-sm">Revocation</span>
                    <span className="text-red-400 text-sm block mt-1">{metadataCertificate.revocationReason}</span>
                  </div>
                )}
                {metadataCertificate.version && parseInt(metadataCertificate.version) > 1 && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                      <span className="text-gray-300 text-sm">Version</span>
                      <span className="text-white text-sm">{metadataCertificate.version}</span>
                    </div>
                    {metadataCertificate.lastUpdateDateFormatted && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-600/20">
                        <span className="text-gray-300 text-sm">Last Update</span>
                        <span className="text-white text-sm">{metadataCertificate.lastUpdateDateFormatted}</span>
                      </div>
                    )}
                    {metadataCertificate.updateReason && metadataCertificate.updateReason !== "Initial issuance" && (
                      <div className="py-2">
                        <span className="text-gray-300 text-sm">Update Reason</span>
                        <span className="text-white text-sm block mt-1">{metadataCertificate.updateReason}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {metadataCertificate.imageCID && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-sm p-5 rounded-xl border border-gray-600/30 hover:border-violet-500/30 transition-all duration-300 mb-4">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-white text-lg">IPFS Data</h4>
              </div>
              <div className="space-y-4">
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm block mb-1">Image CID</span>
                  <div className="flex items-center">
                    <span className="break-all text-xs text-white font-mono flex-1 mr-2">{metadataCertificate.imageCID}</span>
                    <button 
                      onClick={() => copyToClipboard(metadataCertificate.imageCID, 'Image CID')}
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Copy Image CID"
                    >
                      <CopyIcon isCopied={copiedText === 'Image CID'} />
                    </button>
                  </div>
                </div>
                
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm block mb-1">Metadata CID</span>
                  <div className="flex items-center">
                    <span className="break-all text-xs text-white font-mono flex-1 mr-2">{metadataCertificate.metadataCID}</span>
                    <button 
                      onClick={() => copyToClipboard(metadataCertificate.metadataCID, 'Metadata CID')}
                      className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Copy Metadata CID"
                    >
                      <CopyIcon isCopied={copiedText === 'Metadata CID'} />
                    </button>
                  </div>
                </div>
                
                {metadataCertificate.metadata?.transactionHash && (
                  <div className="py-2">
                    <span className="text-gray-300 text-sm block mb-1">Transaction Hash</span>
                    <div className="flex items-center">
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${metadataCertificate.metadata.transactionHash}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 break-all text-xs font-mono flex-1 mr-2 flex items-center hover:underline"
                        title="View on Etherscan"
                      >
                        {metadataCertificate.metadata.transactionHash}
                        <ExternalLinkIcon />
                      </a>
                      <button 
                        onClick={() => copyToClipboard(metadataCertificate.metadata.transactionHash, 'Transaction Hash')}
                        className="p-1.5 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Copy Transaction Hash"
                      >
                        <CopyIcon isCopied={copiedText === 'Transaction Hash'} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {metadataCertificate.metadata && (
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 backdrop-blur-sm p-5 rounded-xl border border-gray-600/30 hover:border-violet-500/30 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-white text-lg">Metadata Content</h4>
              </div>
              <div className="space-y-4">
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Name</span>
                  <span className="text-white text-sm block mt-1">{metadataCertificate.metadata.name}</span>
                </div>
                <div className="py-2 border-b border-gray-600/20">
                  <span className="text-gray-300 text-sm">Description</span>
                  <span className="text-white text-sm block mt-1">{metadataCertificate.metadata.description}</span>
                </div>
                {metadataCertificate.metadata.attributes && (
                  <div>
                    <span className="text-gray-300 text-sm block mb-3">Attributes</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {metadataCertificate.metadata.attributes.map((attr, index) => (
                        <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-600/30 hover:border-violet-500/30 transition-all duration-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-violet-300 text-sm font-medium">{attr.trait_type}</span>
                            {(attr.trait_type === 'Student Address' || attr.trait_type === 'Transaction Hash') && (
                              <button 
                                onClick={() => copyToClipboard(attr.value, attr.trait_type)}
                                className="p-1 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-110"
                                title={`Copy ${attr.trait_type}`}
                              >
                                <CopyIcon isCopied={copiedText === attr.trait_type} />
                              </button>
                            )}
                          </div>
                          <span className="text-xs break-all block text-gray-200 font-mono">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {copiedText && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-pulse border border-violet-400/30">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{copiedText} copied to clipboard!</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MetadataModal; 