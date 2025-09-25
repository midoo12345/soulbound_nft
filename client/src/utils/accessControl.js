import CryptoJS from 'crypto-js';

// Secret key for encryption - browser-compatible approach
// In production, this should be configured through your build process
const getSecretKey = () => {
  // Try different environment variable approaches
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ACCESS_SECRET) {
    return import.meta.env.VITE_ACCESS_SECRET;
  }
  
  // Fallback for Create React App style env vars
  if (typeof window !== 'undefined' && window.env?.REACT_APP_ACCESS_SECRET) {
    return window.env.REACT_APP_ACCESS_SECRET;
  }
  
  // Default fallback - in production, configure this through your build process
  return 'blockchain-cert-access-2024-secure-key-' + window.location.origin.replace(/[^a-zA-Z0-9]/g, '');
};

const SECRET_KEY = getSecretKey();

// Access levels
export const ACCESS_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  INSTITUTION_ONLY: 'institution_only',
  QR_ONLY: 'qr_only'
};

// Access methods
export const ACCESS_METHODS = {
  QR_CODE: 'qr_code',
  WALLET_OWNER: 'wallet_owner',
  INSTITUTION_OWNER: 'institution_owner',
  PUBLIC_ACCESS: 'public_access'
};

/**
 * Generate an encrypted access token for a certificate
 * @param {string} certificateId - The certificate ID
 * @param {string} studentAddress - The student's wallet address
 * @param {number} expiryHours - Hours until expiry (default 24)
 * @returns {string} Encrypted access token
 */
export const generateCertificateAccessToken = (certificateId, studentAddress, expiryHours = 24) => {
  try {
    const now = Date.now();
    const expiry = now + (expiryHours * 60 * 60 * 1000); // Convert hours to milliseconds
    
    const tokenData = {
      certificateId: certificateId.toString(),
      studentAddress: studentAddress.toLowerCase(),
      issuedAt: now,
      expiresAt: expiry,
      accessMethod: ACCESS_METHODS.QR_CODE
    };
    
    const encryptedToken = CryptoJS.AES.encrypt(
      JSON.stringify(tokenData), 
      SECRET_KEY
    ).toString();
    
    // URL-safe encoding
    return encodeURIComponent(encryptedToken);
  } catch (error) {
    console.error('Error generating access token:', error);
    return null;
  }
};

/**
 * Validate and decrypt an access token
 * @param {string} encryptedToken - The encrypted token
 * @returns {object|null} Decrypted token data or null if invalid
 */
export const validateAccessToken = (encryptedToken) => {
  try {
    if (!encryptedToken) return null;
    
    // URL-safe decoding
    const decodedToken = decodeURIComponent(encryptedToken);
    
    const decryptedBytes = CryptoJS.AES.decrypt(decodedToken, SECRET_KEY);
    const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
    
    // Check if token has expired
    if (Date.now() > decryptedData.expiresAt) {
      console.warn('Access token has expired');
      return null;
    }
    
    return decryptedData;
  } catch (error) {
    console.error('Error validating access token:', error);
    return null;
  }
};

/**
 * Check if a user has access to view a certificate
 * @param {string} certificateId - The certificate ID
 * @param {object} certificate - The certificate data
 * @param {string} userWallet - The connected user's wallet address
 * @param {string} accessToken - Optional access token from QR code
 * @returns {object} Access validation result
 */
export const validateCertificateAccess = async (certificateId, certificate, userWallet, accessToken = null) => {
  try {
    // Method 1: QR Code Access Token
    if (accessToken) {
      const tokenData = validateAccessToken(accessToken);
      if (tokenData && 
          tokenData.certificateId === certificateId.toString() && 
          tokenData.studentAddress.toLowerCase() === certificate.student.toLowerCase()) {
        return {
          allowed: true,
          method: ACCESS_METHODS.QR_CODE,
          reason: 'Valid QR code access token',
          data: tokenData
        };
      }
    }
    
    // Method 2: Wallet Owner Access
    if (userWallet && certificate.student) {
      const userAddress = userWallet.toLowerCase();
      const studentAddress = certificate.student.toLowerCase();
      
      if (userAddress === studentAddress) {
        return {
          allowed: true,
          method: ACCESS_METHODS.WALLET_OWNER,
          reason: 'Certificate owner accessing via connected wallet',
          data: { userWallet, studentAddress }
        };
      }
    }
    
    // Method 3: Institution Owner Access
    if (userWallet && certificate.institution) {
      const userAddress = userWallet.toLowerCase();
      const institutionAddress = certificate.institution.toLowerCase();
      
      if (userAddress === institutionAddress) {
        return {
          allowed: true,
          method: ACCESS_METHODS.INSTITUTION_OWNER,
          reason: 'Issuing institution accessing certificate',
          data: { userWallet, institutionAddress }
        };
      }
    }
    
    // Method 4: Public Access (for certificates marked as public - future feature)
    if (certificate.accessLevel === ACCESS_LEVELS.PUBLIC) {
      return {
        allowed: true,
        method: ACCESS_METHODS.PUBLIC_ACCESS,
        reason: 'Certificate is marked as public',
        data: null
      };
    }
    
    // Default: Access denied
    return {
      allowed: false,
      method: null,
      reason: 'Access denied. This certificate is private and requires either a valid QR code, owner wallet connection, or institution access.',
      data: null
    };
    
  } catch (error) {
    console.error('Error validating certificate access:', error);
    return {
      allowed: false,
      method: null,
      reason: 'Failed to validate access permissions',
      data: null
    };
  }
};

/**
 * Generate a secure QR code URL with access token
 * @param {string} certificateId - The certificate ID
 * @param {string} studentAddress - The student's wallet address
 * @param {string} baseUrl - Base URL (default: current origin)
 * @param {number} expiryHours - Token expiry in hours (default: 24)
 * @returns {string} Secure URL with access token
 */
export const generateQRCodeURL = (certificateId, studentAddress, baseUrl = window.location.origin, expiryHours = 24) => {
  try {
    const accessToken = generateCertificateAccessToken(certificateId, studentAddress, expiryHours);
    if (!accessToken) {
      throw new Error('Failed to generate access token');
    }
    
    return `${baseUrl}/certificate/${certificateId}?access_token=${accessToken}`;
  } catch (error) {
    console.error('Error generating QR code URL:', error);
    return null;
  }
};

/**
 * Check if a user can generate a QR code for a certificate
 * @param {object} certificate - The certificate data
 * @param {string} userWallet - The connected user's wallet address
 * @returns {boolean} Whether user can generate QR code
 */
export const canGenerateQRCode = (certificate, userWallet) => {
  if (!certificate || !userWallet) return false;
  
  const userAddress = userWallet.toLowerCase();
  
  // Certificate owner can generate QR code
  if (certificate.student && userAddress === certificate.student.toLowerCase()) {
    return true;
  }
  
  // Issuing institution can generate QR code
  if (certificate.institution && userAddress === certificate.institution.toLowerCase()) {
    return true;
  }
  
  return false;
};

/**
 * Extract access token from URL parameters
 * @param {string} urlOrSearch - The URL or search string to parse
 * @returns {string|null} Access token or null
 */
export const getAccessTokenFromURL = (urlOrSearch) => {
  try {
    if (!urlOrSearch) return null;
    
    let searchParams;
    
    // If it starts with '?', it's a search string
    if (urlOrSearch.startsWith('?')) {
      searchParams = new URLSearchParams(urlOrSearch);
    } else {
      // Otherwise, try to parse as a full URL
      const urlObj = new URL(urlOrSearch);
      searchParams = urlObj.searchParams;
    }
    
    return searchParams.get('access_token');
  } catch (error) {
    console.error('Error parsing URL for access token:', error);
    return null;
  }
};

/**
 * Remove access token from current URL without page reload
 */
export const cleanURLFromAccessToken = () => {
  try {
    const url = new URL(window.location);
    if (url.searchParams.has('access_token')) {
      url.searchParams.delete('access_token');
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch (error) {
    console.error('Error cleaning URL:', error);
  }
};

export default {
  ACCESS_LEVELS,
  ACCESS_METHODS,
  generateCertificateAccessToken,
  validateAccessToken,
  validateCertificateAccess,
  generateQRCodeURL,
  canGenerateQRCode,
  getAccessTokenFromURL,
  cleanURLFromAccessToken
}; 