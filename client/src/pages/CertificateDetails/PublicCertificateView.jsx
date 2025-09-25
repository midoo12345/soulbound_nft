import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import { FaExternalLinkAlt, FaCheckCircle, FaTimesCircle, FaClock, FaImage, FaEye, FaDownload, FaPrint, FaCheck, FaBan, FaExclamationTriangle, FaWallet, FaBuilding, FaGlobe, FaShieldAlt } from 'react-icons/fa';
import FuturisticSpinner from '../../components/ui/FuturisticSpinner';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import { formatGrade } from '../../components/sperates/cert_utilits';
import { 
  CERTIFICATES_CACHE_KEY, 
  fetchMetadataFromIPFS,
  getCachedData, 
  setCachedData,
  placeholderImage,
  getImageUrlFromMetadata,
  METADATA_CACHE_KEY,
  IPFS_GATEWAYS
} from '../../components/sperates/f1.js';
import PINATA_CONFIG from '../../config/pinata';
import { validateCertificateAccess, getAccessTokenFromURL, cleanURLFromAccessToken, ACCESS_METHODS } from '../../utils/accessControl';
import { useCertificateMetadata } from '../../hooks/useCertificateMetadata';

// Define fallback RPC URLs for Sepolia network
const RPC_URLS = [
  'https://ethereum-sepolia.publicnode.com',
  'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  'https://eth-sepolia.g.alchemy.com/v2/demo'
];

// Get the correct ABI array from the imported object
const ABI_ARRAY = contractABI.SoulboundCertificateNFT || contractABI;

// Debug function to fetch raw metadata for a certificate
async function debugFetchCertificateMetadata(certificateId) {
  // Only run in development environment 
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return;
  
  try {
    console.log(`DEBUG: Fetching raw metadata for certificate #${certificateId}...`);
    
    // Try each RPC URL
    let provider = null;
    for (const rpcUrl of RPC_URLS) {
      try {
        const tempProvider = new JsonRpcProvider(rpcUrl);
        await tempProvider.getNetwork();
        provider = tempProvider;
        console.log(`DEBUG: Connected to ${rpcUrl}`);
        break;
      } catch (err) {
        console.warn(`DEBUG: Failed to connect to ${rpcUrl}`);
      }
    }
    
    if (!provider) {
      console.error("DEBUG: Failed to connect to any RPC endpoint");
      return;
    }
    
    // Create contract instance
    const contract = new Contract(
      contractAddress.SoulboundCertificateNFT,
      ABI_ARRAY,
      provider
    );
    
    // Try to get tokenURI
    try {
      const tokenURI = await contract.tokenURI(certificateId);
      console.log(`DEBUG: Token URI for #${certificateId}:`, tokenURI);
      
      if (tokenURI) {
        // Extract CID if it's an IPFS URI
        const metadataCID = tokenURI.startsWith('ipfs://') ? 
          tokenURI.replace('ipfs://ipfs/', '').replace('ipfs://', '') : tokenURI;
        
        console.log(`DEBUG: Metadata CID:`, metadataCID);
        
        // Try to fetch the metadata from IPFS gateways
        for (const gateway of IPFS_GATEWAYS) {
          try {
            const ipfsUrl = `${gateway}${metadataCID}`;
            console.log(`DEBUG: Trying to fetch metadata from ${ipfsUrl}`);
            const response = await fetch(ipfsUrl);
            if (response.ok) {
              const metadata = await response.json();
              console.log(`DEBUG: Successfully fetched metadata:`, metadata);
              
              // If there's an image field, try to resolve it
              if (metadata.image) {
                const imageCID = metadata.image.startsWith('ipfs://') ? 
                  metadata.image.replace('ipfs://ipfs/', '').replace('ipfs://', '') : 
                  metadata.image;
                
                console.log(`DEBUG: Image CID found:`, imageCID);
                console.log(`DEBUG: Full image URL would be:`, `${IPFS_GATEWAYS[0]}${imageCID}`);
              } else {
                console.warn(`DEBUG: No image field in metadata`);
              }
              
              return;
            }
          } catch (err) {
            console.warn(`DEBUG: Failed to fetch metadata from ${gateway}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error(`DEBUG: Error getting tokenURI:`, err.message);
    }
    
    // Fallback - try to get certificate data directly
    try {
      const certData = await contract.getCertificate(certificateId);
      console.log(`DEBUG: Raw certificate data:`, certData);
    } catch (err) {
      console.error(`DEBUG: Error getting certificate data:`, err.message);
    }
  } catch (err) {
    console.error("DEBUG ERROR:", err);
  }
}

const PublicCertificateView = () => {
  const { id } = useParams();
  const location = useLocation();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [verified, setVerified] = useState(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const canvasRef = useRef(null);
  const [useDebug, setUseDebug] = useState(false); // Control debug mode
  
  // New access control states
  const [accessValidation, setAccessValidation] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userWallet, setUserWallet] = useState(null);
  const [contract, setContract] = useState(null);

  // Use the metadata loading hook
  const { loadMetadataForCertificate } = useCertificateMetadata(contract);

  // Initialize read-only contract connection (no wallet required)
  useEffect(() => {
    const initializeContract = async () => {
      try {
        // Try to create a read-only provider connection
        let provider = null;
        
        // First try to use MetaMask if available (but don't require it)
        if (window.ethereum) {
          try {
            const browserProvider = new BrowserProvider(window.ethereum);
            await browserProvider.getNetwork();
            provider = browserProvider;
            
            // Check if already connected (optional)
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              setUserWallet(accounts[0]);
            }
          } catch (metamaskError) {
            console.warn('MetaMask not available or not connected, using fallback RPC');
          }
        }
        
        // Fallback to public RPC if MetaMask is not available
        if (!provider) {
          for (const rpcUrl of RPC_URLS) {
            try {
              const rpcProvider = new JsonRpcProvider(rpcUrl);
              await rpcProvider.getNetwork();
              provider = rpcProvider;
              console.log(`Connected to fallback RPC: ${rpcUrl}`);
              break;
            } catch (rpcError) {
              console.warn(`Failed to connect to RPC ${rpcUrl}:`, rpcError.message);
            }
          }
        }
        
        if (!provider) {
          throw new Error('Unable to connect to any blockchain provider');
        }
        
        // Create read-only contract instance
        const contractInstance = new Contract(
          contractAddress.SoulboundCertificateNFT,
          ABI_ARRAY,
          provider
        );
        
        setContract(contractInstance);
        
      } catch (error) {
        console.error('Error initializing contract:', error);
        setError('Unable to connect to blockchain. Please check your connection.');
      }
    };

    initializeContract();
  }, []);

  // Extract access token from URL
  useEffect(() => {
    const token = getAccessTokenFromURL(location.search);
    if (token) {
      setAccessToken(token);
      // Store token in session storage for page refreshes
      sessionStorage.setItem(`cert_access_token_${id}`, token);
      // Clean URL after extracting token
      // cleanURLFromAccessToken(); // Keep token in URL for easy sharing and page refresh
    } else {
      // Check session storage for existing token
      const storedToken = sessionStorage.getItem(`cert_access_token_${id}`);
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, [location.search, id]);

  // Connect wallet function (optional for enhanced access)
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to connect your wallet');
        return;
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setUserWallet(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  // Enhanced certificate fetching function using the same pattern as other components
  const fetchCertificateWithMetadata = async (certificateId, contractInstance) => {
    try {
      // Check if token exists
      const exists = await contractInstance.tokenExists(certificateId).catch(() => false);
      if (!exists) {
        throw new Error(`Certificate ${certificateId} does not exist`);
      }

      // Get certificate data
      const cert = await contractInstance.getCertificate(certificateId);
      if (!cert || cert.length === 0) {
        throw new Error(`No data found for certificate ${certificateId}`);
      }

      // Get tokenURI
      const tokenURI = await contractInstance.tokenURI(certificateId).catch(() => '');
      
      // Get additional certificate data
      const certData = await contractInstance.academicCertificates(certificateId).catch(() => null);
      
      const completionTimestamp = Number(cert[3]);
      const completionDate = new Date(completionTimestamp * 1000);
      const localDateString = completionDate.toLocaleDateString();

      // Build the certificate object with metadataCID and imageCID fields like other components
      const finalTokenURI = tokenURI || (certData?.certificateHash || '');
      let metadataCID = null;
      let imageCID = null;
      let imageUrl = null;
      let courseName = `Certificate ${certificateId}`; // Default course name, will be updated from metadata
      let cachedMetadata = null; // Declare at function level

      if (finalTokenURI) {
        metadataCID = finalTokenURI.startsWith('ipfs://') ? finalTokenURI.slice(7) : finalTokenURI;
        
        // Try to get cached metadata first
        cachedMetadata = getCachedData(`${METADATA_CACHE_KEY}_${metadataCID}`);
        if (cachedMetadata) {
          console.log('Found cached metadata for certificate:', certificateId);
          courseName = cachedMetadata.name || courseName;
          
          if (cachedMetadata.image) {
            imageCID = cachedMetadata.image.startsWith('ipfs://') ? cachedMetadata.image.slice(7) : cachedMetadata.image;
            imageUrl = getImageUrlFromMetadata(cachedMetadata, imageCID);
          }
        }
      }

      const certificateData = {
        id: certificateId.toString(),
        tokenId: certificateId.toString(),
        tokenURI: finalTokenURI,
        metadataCID,
        imageCID,
        imageUrl,
        student: cert[0],
        institution: cert[1],
        courseId: cert[2].toString(),
        courseName: courseName,
        completionDate: localDateString,
        completionTimestamp,
        grade: Number(cert[4]),
        isVerified: cert[5],
        isRevoked: cert[6],
        revocationReason: cert[7] || null,
        version: cert[8]?.toString() || '1',
        lastUpdateDate: cert[9] || null,
        updateReason: cert[10] || null,
        metadataLoaded: !!cachedMetadata
      };

      console.log('Built certificate data:', certificateData);
      return certificateData;

    } catch (error) {
      console.error('Error fetching certificate with metadata:', error);
      throw error;
    }
  };

  // Validate access and fetch certificate
  useEffect(() => {
    const fetchAndValidateCertificate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const certificateId = parseInt(id);
        if (isNaN(certificateId)) {
          throw new Error('Invalid certificate ID');
        }

        // Wait for contract to be initialized
        if (!contract) {
          return; // Contract not ready yet
        }

        // Fetch certificate data with metadata structure
        let certData = null;
        
        // Try cache first
        const cachedCert = getCachedData(`certificates_${certificateId}`);
        if (cachedCert && cachedCert.metadataCID) {
          certData = cachedCert;
          console.log('Using cached certificate data');
        } else {
          // Fetch from blockchain using enhanced method
          console.log(`Fetching certificate #${certificateId} with metadata structure...`);
          certData = await fetchCertificateWithMetadata(certificateId, contract);
          
          // Cache the certificate data
          setCachedData(`certificates_${certificateId}`, certData, 300000); // 5 minutes
        }

        if (!certData) {
          throw new Error('Certificate data not available');
        }

        // Validate access to this certificate
        const validation = await validateCertificateAccess(
          certificateId,
          certData,
          userWallet,
          accessToken
        );

        setAccessValidation(validation);
        console.log('Access validation result:', validation);

        if (!validation.allowed) {
          // Access denied - still show basic certificate info for access denied screen
          setError(validation.reason);
          setCertificate(certData);
          return;
        }

        // Access granted - proceed with full certificate display
        setCertificate(certData);
        setVerified(certData.isVerified && !certData.isRevoked);

        // Load metadata and image using the metadata hook
        if (!certData.metadataLoaded && certData.metadataCID) {
          console.log('Loading metadata using metadata hook...');
          setImageLoading(true);
          
          try {
            const certWithMetadata = await loadMetadataForCertificate(certData);
            console.log('Loaded certificate with metadata:', certWithMetadata);
            
            setCertificate(certWithMetadata);
            
            // Set image URL if available
            if (certWithMetadata.imageUrl) {
              setImageUrl(certWithMetadata.imageUrl);
              setImageLoading(false);
            } else {
              // Try to load image from IPFS if we have imageCID
              if (certWithMetadata.imageCID) {
                await tryLoadImageFromGateways(certWithMetadata.imageCID);
              } else {
                // Generate template if no image available
                setImageLoading(false);
                generateCertificateTemplate();
              }
            }
          } catch (metadataError) {
            console.error('Failed to load metadata:', metadataError);
            setImageLoading(false);
            generateCertificateTemplate();
          }
        } else if (certData.imageUrl) {
          // Image URL already available
          setImageUrl(certData.imageUrl);
        } else if (certData.imageCID) {
          // Try to load image from IPFS
          setImageLoading(true);
          await tryLoadImageFromGateways(certData.imageCID);
        } else {
          // Generate template as fallback
          generateCertificateTemplate();
        }

      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only run when we have both ID and contract
    if (id && contract) {
      fetchAndValidateCertificate();
    }
  }, [id, contract, userWallet, accessToken, loadMetadataForCertificate]);

  // Generate certificate template image for certificates with no image
  const generateCertificateTemplate = () => {
    if (!certificate || !canvasRef.current) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 1200;
      canvas.height = 800;
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1f2e');
      gradient.addColorStop(1, '#0f1319');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Border
      ctx.strokeStyle = '#4c1d95';
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      
      // Add border decoration
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
      
      // Title
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE', canvas.width / 2, 150);
      
      // Tagline
      ctx.font = 'italic 40px Arial';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText('Blockchain Verified', canvas.width / 2, 210);
      
      // Course name
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(certificate.courseName || `Course ${certificate.courseId}`, canvas.width / 2, 320);
      
      // Certificate ID
      ctx.font = '30px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Certificate #${certificate.id}`, canvas.width / 2, 380);
      
      // Recipient
      ctx.font = '36px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Awarded to`, canvas.width / 2, 460);
      
      // Recipient address (truncated)
      const address = certificate.student;
      const truncatedAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Unknown';
      ctx.font = 'bold 44px Arial';
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(truncatedAddress, canvas.width / 2, 520);
      
      // Grade
      if (certificate.grade) {
        ctx.font = '36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Grade: ${formatGrade(certificate.grade)} (${certificate.grade}%)`, canvas.width / 2, 590);
      }
      
      // Completion date
      if (certificate.completionDate) {
        ctx.font = '30px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Completion Date: ${certificate.completionDate}`, canvas.width / 2, 650);
      }
      
      // Verification status
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = certificate.isVerified ? '#22c55e' : certificate.isRevoked ? '#ef4444' : '#f59e0b';
      ctx.fillText(
        certificate.isRevoked ? 'REVOKED' : certificate.isVerified ? 'VERIFIED' : 'PENDING', 
        canvas.width / 2, 
        720
      );
      
      // Blockchain icon
      ctx.font = '20px Arial';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`On Sepolia • Token ID: ${certificate.id}`, canvas.width / 2, 760);
      
      // Use the canvas as an image source
      const dataUrl = canvas.toDataURL('image/png');
      setImageUrl(dataUrl);
      setImageLoading(false);
      
    } catch (err) {
      console.error('Failed to generate certificate template:', err);
      setImageLoading(false);
    }
  };

  useEffect(() => {
    // Generate a certificate template if we have certificate data but no image
    if (certificate && !imageUrl && !imageLoading && canvasRef.current && accessValidation?.allowed) {
      setImageLoading(true);
      generateCertificateTemplate();
    }
  }, [certificate, imageUrl, imageLoading, accessValidation]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.error('Failed to load certificate image from IPFS, generating template');
    setImageLoading(false);
    // Generate template as fallback
    if (canvasRef.current && certificate) {
      generateCertificateTemplate();
    }
  };

  // Try to load image from multiple IPFS gateways
  const tryLoadImageFromGateways = async (imageCID) => {
    setImageLoading(true);
    
    for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
      const gateway = IPFS_GATEWAYS[i];
      const imageUrl = `${gateway}${imageCID}`;
      
      try {
        // Test if image loads
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(imageUrl);
          img.onerror = () => reject(new Error(`Failed to load from ${gateway}`));
          setTimeout(() => reject(new Error('Timeout')), 5000); // 5 second timeout
        });
        
        img.src = imageUrl;
        const workingUrl = await loadPromise;
        
        console.log(`Successfully loaded image from: ${gateway}`);
        setImageUrl(workingUrl);
        setImageLoading(false);
        return;
        
      } catch (error) {
        console.warn(`Failed to load image from ${gateway}:`, error.message);
        continue;
      }
    }
    
    // If all gateways fail, generate template
    console.warn('All IPFS gateways failed, generating certificate template');
    generateCertificateTemplate();
  };

  const downloadCertificate = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `certificate-${certificate.id}.png`;
      link.click();
    }
  };

  const printCertificate = () => {
    if (imageUrl) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>Certificate ${certificate.id}</title></head>
          <body style="margin: 0; padding: 20px; text-align: center;">
            <img src="${imageUrl}" style="max-width: 100%; height: auto;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Render access method indicator
  const renderAccessMethodIndicator = () => {
    if (!accessValidation || !accessValidation.allowed) return null;

    const getMethodInfo = () => {
      switch (accessValidation.method) {
        case ACCESS_METHODS.QR_CODE:
          return {
            icon: <FaShieldAlt className="w-4 h-4" />,
            text: 'QR Code Access',
            color: 'bg-green-100 text-green-800 border-green-200'
          };
        case ACCESS_METHODS.WALLET_OWNER:
          return {
            icon: <FaWallet className="w-4 h-4" />,
            text: 'Wallet Owner',
            color: 'bg-blue-100 text-blue-800 border-blue-200'
          };
        case ACCESS_METHODS.INSTITUTION_OWNER:
          return {
            icon: <FaBuilding className="w-4 h-4" />,
            text: 'Institution Access',
            color: 'bg-purple-100 text-purple-800 border-purple-200'
          };
        case ACCESS_METHODS.PUBLIC_ACCESS:
          return {
            icon: <FaGlobe className="w-4 h-4" />,
            text: 'Public Certificate',
            color: 'bg-gray-100 text-gray-800 border-gray-200'
          };
        default:
          return {
            icon: <FaShieldAlt className="w-4 h-4" />,
            text: 'Authorized Access',
            color: 'bg-gray-100 text-gray-800 border-gray-200'
          };
      }
    };

    const { icon, text, color } = getMethodInfo();

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${color}`}>
        {icon}
        <span>{text}</span>
      </div>
    );
  };

  // Render access denied screen
  const renderAccessDenied = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-red-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 rounded-lg p-8 text-center border border-red-500/30">
        <FaBan className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">{error}</p>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-400">
            <p className="font-medium mb-2">To view this certificate, you need:</p>
            <ul className="text-left space-y-1">
              <li>• A valid QR code from the certificate owner</li>
              <li>• Connect the wallet that owns this certificate</li>
              <li>• Connect as the issuing institution</li>
            </ul>
          </div>
          
          {!userWallet && (
            <button
              onClick={connectWallet}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaWallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
          
          {certificate && (
            <div className="text-xs text-gray-500 p-3 bg-gray-900/50 rounded">
              <p>Certificate ID: {certificate.id}</p>
              <p>Course: {certificate.courseName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 text-white flex items-center justify-center">
        <div className="text-center">
          <FuturisticSpinner />
          <p className="mt-4 text-gray-300">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error && (!accessValidation || !accessValidation.allowed)) {
    return renderAccessDenied();
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-gray-300">The requested certificate could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with access method indicator */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">Certificate #{certificate.id}</h1>
            <div className="flex items-center gap-4">
              {renderAccessMethodIndicator()}
              {/* Debug button for development */}
              {window.location.hostname === 'localhost' && (
                <button
                  onClick={() => {
                    console.log('=== DEBUG INFO ===');
                    console.log('Certificate:', certificate);
                    console.log('Token URI:', certificate.tokenURI);
                    console.log('Metadata:', certificate.metadata);
                    console.log('Current image URL:', imageUrl);
                    console.log('Image loading:', imageLoading);
                    console.log('==================');
                    
                    // Try to reload metadata manually
                    if (certificate.tokenURI) {
                      const metadataCID = certificate.tokenURI.startsWith('ipfs://') ? 
                        certificate.tokenURI.replace('ipfs://ipfs/', '').replace('ipfs://', '') : 
                        certificate.tokenURI;
                      console.log('Manual reload with CID:', metadataCID);
                      fetchMetadataFromIPFS(metadataCID).then(metadata => {
                        console.log('Manual metadata fetch result:', metadata);
                      });
                    }
                  }}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs"
                >
                  Debug
                </button>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Only show essential action here - removed duplicate download/print */}
            {certificate && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Certificate #{certificate.id}</span> • 
                <span className="ml-1">{certificate.courseName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Certificate display */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Certificate Image */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaImage className="w-5 h-5" />
                Certificate Image
              </h2>
              
              <div className="relative">
                {imageLoading ? (
                  <div className="aspect-[4/3] bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                    <FuturisticSpinner />
                    <p className="text-gray-400 mt-4">Loading certificate image...</p>
                  </div>
                ) : imageUrl ? (
                  <div className="group">
                    <img
                      src={imageUrl}
                      alt={`Certificate ${certificate.id}`}
                      className="w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow group-hover:scale-105 transform transition-transform duration-200"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      onClick={() => window.open(imageUrl, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <FaEye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                    <FaImage className="w-16 h-16 text-gray-500 mb-4" />
                    <p className="text-gray-400">Certificate image not available</p>
                    <button 
                      onClick={generateCertificateTemplate}
                      className="mt-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm transition-colors"
                    >
                      Generate Preview
                    </button>
                  </div>
                )}
                
                {/* Hidden canvas for generating template */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              
              {/* Image actions */}
              {imageUrl && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Certificate Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={downloadCertificate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
                    >
                      <FaDownload className="w-4 h-4" />
                      Download PNG
                    </button>
                    <button
                      onClick={printCertificate}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
                    >
                      <FaPrint className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={() => window.open(imageUrl, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
                    >
                      <FaEye className="w-4 h-4" />
                      View Full Size
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certificate Details */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <div className="flex items-center gap-2">
                {certificate.isRevoked ? (
                  <>
                    <FaBan className="w-5 h-5 text-red-500" />
                    <span className="text-red-400 font-medium">Revoked</span>
                  </>
                ) : certificate.isVerified ? (
                  <>
                    <FaCheck className="w-5 h-5 text-green-500" />
                    <span className="text-green-400 font-medium">Verified</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-400 font-medium">Pending Verification</span>
                  </>
                )}
              </div>
            </div>

            {/* Certificate Information */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Course Name:</span>
                  <span className="ml-2 text-white font-medium">{certificate.courseName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Course ID:</span>
                  <span className="ml-2 text-white">{certificate.courseId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Grade:</span>
                  <span className="ml-2 text-white">{certificate.grade}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Completion Date:</span>
                  <span className="ml-2 text-white">{certificate.completionDate}</span>
                </div>
                <div>
                  <span className="text-gray-400">Student:</span>
                  <span className="ml-2 text-white font-mono text-sm break-all">{certificate.student}</span>
                </div>
                <div>
                  <span className="text-gray-400">Institution:</span>
                  <span className="ml-2 text-white font-mono text-sm break-all">{certificate.institution}</span>
                </div>
              </div>
            </div>

            {/* Blockchain Information */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Blockchain Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Token ID:</span>
                  <span className="ml-2 text-white">{certificate.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Network:</span>
                  <span className="ml-2 text-white">Sepolia Testnet</span>
                </div>
                <div>
                  <span className="text-gray-400">Contract:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${contractAddress.SoulboundCertificateNFT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300 font-mono text-sm break-all underline"
                  >
                    {contractAddress.SoulboundCertificateNFT}
                    <FaExternalLinkAlt className="inline w-3 h-3 ml-1" />
                  </a>
                </div>
                <div>
                  <span className="text-gray-400">View on Explorer:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/token/${contractAddress.SoulboundCertificateNFT}?a=${certificate.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    Sepolia Etherscan
                    <FaExternalLinkAlt className="inline w-3 h-3 ml-1" />
                  </a>
                </div>
                <div>
                  <span className="text-gray-400">Student Address:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${certificate.student}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300 font-mono text-sm break-all underline"
                  >
                    {certificate.student}
                    <FaExternalLinkAlt className="inline w-3 h-3 ml-1" />
                  </a>
                </div>
                <div>
                  <span className="text-gray-400">Institution Address:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${certificate.institution}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-400 hover:text-blue-300 font-mono text-sm break-all underline"
                  >
                    {certificate.institution}
                    <FaExternalLinkAlt className="inline w-3 h-3 ml-1" />
                  </a>
                </div>
                {certificate.tokenURI && (
                  <div>
                    <span className="text-gray-400">Metadata URI:</span>
                    <div className="ml-2 text-blue-400 font-mono text-sm break-all">
                      {certificate.tokenURI.startsWith('ipfs://') ? (
                        <a 
                          href={`https://ipfs.io/ipfs/${certificate.tokenURI.replace('ipfs://', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-300 underline"
                        >
                          {certificate.tokenURI}
                          <FaExternalLinkAlt className="inline w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span>{certificate.tokenURI}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status Details */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {certificate.isRevoked ? (
                    <>
                      <FaBan className="w-5 h-5 text-red-500" />
                      <span className="text-red-400 font-medium">Certificate Revoked</span>
                    </>
                  ) : certificate.isVerified ? (
                    <>
                      <FaCheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-400 font-medium">Verified by Institution</span>
                    </>
                  ) : (
                    <>
                      <FaClock className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-400 font-medium">Pending Verification</span>
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-400">
                  {certificate.isRevoked ? (
                    <p>This certificate has been revoked by the issuing institution and is no longer valid.</p>
                  ) : certificate.isVerified ? (
                    <p>This certificate has been verified and approved by the issuing institution. It is a valid blockchain-verified credential.</p>
                  ) : (
                    <p>This certificate has been issued but is still pending verification by the institution. The verification status may change.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCertificateView; 