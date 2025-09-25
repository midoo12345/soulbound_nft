import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { generateQRCodeURL } from '../../../utils/accessControl';

// Duration options for different use cases
const DURATION_OPTIONS = [
  { value: 1, label: '1 Hour', description: 'Quick sharing' },
  { value: 24, label: '24 Hours', description: 'Standard sharing' },
  { value: 168, label: '1 Week', description: 'Job applications' },
  { value: 720, label: '1 Month', description: 'CVs & portfolios' },
  { value: 2160, label: '3 Months', description: 'Academic submissions' },
  { value: 8760, label: '1 Year', description: 'Long-term verification' },
  { value: 87600, label: '10 Years', description: 'Permanent records' }
];

const QRCodeModal = ({ showQRModal, certificate, closeQRModal, userWallet }) => {
  const canvasRef = useRef(null);
  const [qrDataURL, setQrDataURL] = useState(null);
  const [secureUrl, setSecureUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(24); // Default 24 hours
  const [generatedAt, setGeneratedAt] = useState(null);
  
  // Generate secure QR code when modal opens or duration changes
  useEffect(() => {
    if (showQRModal && certificate && userWallet) {
      generateSecureQR();
    }
  }, [showQRModal, certificate, userWallet, selectedDuration]);
  
  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showQRModal) {
        closeQRModal();
      }
    };
    
    if (showQRModal) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showQRModal, closeQRModal]);
  
  const generateSecureQR = async () => {
    try {
      setLoading(true);
      
      // Validate inputs before generating URL
      if (!certificate || !certificate.id || !certificate.student) {
        throw new Error('Certificate data is incomplete');
      }
      
      if (!userWallet) {
        throw new Error('User wallet is required to generate QR code');
      }
      
      // Generate secure URL with access token using selected duration
      const url = generateQRCodeURL(certificate.id, certificate.student, window.location.origin, selectedDuration);
      if (!url) {
        throw new Error('Failed to generate secure access URL');
      }
      
      setSecureUrl(url);
      setGeneratedAt(new Date());
      
      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      
      setQrDataURL(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert(`Failed to generate QR code: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Download QR code as image
  const downloadQRCode = () => {
    if (!qrDataURL) return;
    
    const downloadLink = document.createElement("a");
    downloadLink.download = `certificate-${certificate.id}-qr.png`;
    downloadLink.href = qrDataURL;
    downloadLink.click();
  };
  
  // Copy secure URL to clipboard
  const copySecureUrl = async () => {
    if (!secureUrl) return;
    
    try {
      await navigator.clipboard.writeText(secureUrl);
      alert("Secure certificate URL copied to clipboard!");
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert("Failed to copy URL. Please try again.");
    }
  };
  
  if (!showQRModal || !certificate) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={closeQRModal}
    >
      <div 
        className="bg-gray-800 rounded-lg w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-4 sm:p-6 border border-gray-700 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-violet-400">Secure Certificate QR Code</h3>
          <button
            onClick={closeQRModal}
            className="text-gray-400 hover:text-white text-xl sm:text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="text-center mb-6">
          {/* Duration Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select QR Code Duration
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Choose duration based on your use case
            </p>
          </div>

          {loading ? (
            <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-4 flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : qrDataURL ? (
            <div className="bg-white p-3 sm:p-4 rounded-lg inline-block mb-4">
              <img 
                src={qrDataURL} 
                alt="Certificate QR Code" 
                className="mx-auto w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52"
              />
            </div>
          ) : (
            <div className="bg-gray-600 p-3 sm:p-4 rounded-lg inline-block mb-4 flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 lg:w-52 lg:h-52">
              <span className="text-white text-sm">Failed to generate QR</span>
            </div>
          )}
          
          {/* Expiry Information */}
          {generatedAt && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded mb-4">
              <p className="text-sm font-medium">⏰ Expiry Information</p>
              <p className="text-xs">
                Generated: {generatedAt.toLocaleString()}
              </p>
              <p className="text-xs">
                Expires: {new Date(generatedAt.getTime() + selectedDuration * 60 * 60 * 1000).toLocaleString()}
              </p>
              <p className="text-xs font-medium">
                Valid for: {DURATION_OPTIONS.find(opt => opt.value === selectedDuration)?.label}
              </p>
            </div>
          )}
          
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-4">
            <p className="text-sm font-medium">🔒 Secure Access</p>
            <p className="text-xs">This QR code contains an encrypted access token with selected duration</p>
          </div>
          
          <p className="text-gray-300 mb-3">Scan this QR code to securely view and verify this certificate</p>
          
          {secureUrl && (
            <div className="text-xs text-gray-400 mb-4 break-all p-2 bg-gray-900 rounded max-h-20 overflow-y-auto">
              <span className="font-medium">Secure URL:</span> {secureUrl}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <button
              onClick={downloadQRCode}
              disabled={!qrDataURL}
              className="px-3 sm:px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              Download QR
            </button>
            <button
              onClick={copySecureUrl}
              disabled={!secureUrl}
              className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              Copy Link
            </button>
            <button
              onClick={generateSecureQR}
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
            >
              {loading ? 'Generating...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4 mt-4">
          <p className="text-sm text-gray-400 mb-2">
            <span className="font-semibold">Certificate ID:</span> {certificate.id}
          </p>
          <p className="text-sm text-gray-400 mb-2">
            <span className="font-semibold">Course:</span> {certificate.courseName}
          </p>
          <p className="text-sm text-gray-400 mb-3">
            <span className="font-semibold">Recipient:</span> 
            <span className="ml-1 break-all text-xs sm:text-sm">
              {certificate.studentName || certificate.student.substring(0, 6) + '...' + certificate.student.substring(certificate.student.length - 4)}
            </span>
          </p>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 rounded text-xs sm:text-sm">
            <p className="font-medium">🛡️ Security Notice</p>
            <p>• QR codes expire after the selected duration for security</p>
            <p>• Only certificate owners and issuing institutions can generate QR codes</p>
            <p>• Longer durations recommended for CVs and permanent verification</p>
            <p>• Tokens can be regenerated anytime if needed</p>
          </div>
          
          {/* Duration Guide */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
              📋 Duration Selection Guide
            </summary>
            <div className="mt-2 text-xs text-gray-400 space-y-1 pl-4">
              <p><strong>1 Hour:</strong> Quick verification, immediate sharing</p>
              <p><strong>24 Hours:</strong> Interview presentations, short-term sharing</p>
              <p><strong>1 Week:</strong> Job applications, recruitment processes</p>
              <p><strong>1 Month:</strong> CV attachments, portfolio websites</p>
              <p><strong>3 Months:</strong> Academic applications, semester submissions</p>
              <p><strong>1 Year:</strong> Professional profiles, long-term verification</p>
              <p><strong>10 Years:</strong> Permanent records, institutional archives</p>
            </div>
          </details>
        </div>
        
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            onClick={closeQRModal}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal; 