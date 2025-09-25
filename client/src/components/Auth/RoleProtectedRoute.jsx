import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import LoadingSpinner from '../Shared/LoadingSpinner';

const RoleProtectedRoute = ({ children, requiredRoles = [], fallbackPath = "/" }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userAccount, setUserAccount] = useState('');

  // Check if user has required roles
  const checkUserRoles = async (address) => {
    if (!window.ethereum || !address) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.SoulboundCertificateNFT,
        contractABI.SoulboundCertificateNFT,
        provider
      );

      const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
      const INSTITUTION_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INSTITUTION_ROLE'));

      const [hasAdminRole, hasInstitutionRole] = await Promise.all([
        contract.hasRole(DEFAULT_ADMIN_ROLE, address),
        contract.hasRole(INSTITUTION_ROLE, address)
      ]);

      // Check if user has any of the required roles
      let userHasAccess = false;
      
      if (requiredRoles.includes('admin') && hasAdminRole) {
        userHasAccess = true;
      }
      
      if (requiredRoles.includes('institution') && hasInstitutionRole) {
        userHasAccess = true;
      }

      // Admin has access to everything
      if (hasAdminRole) {
        userHasAccess = true;
      }

      setHasAccess(userHasAccess);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user roles:', error);
      setHasAccess(false);
      setIsLoading(false);
    }
  };

  // Check wallet connection and roles
  useEffect(() => {
    const checkWalletAndRoles = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUserAccount(accounts[0]);
            await checkUserRoles(accounts[0]);
          } else {
            setHasAccess(false);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setHasAccess(false);
          setIsLoading(false);
        }
      } else {
        setHasAccess(false);
        setIsLoading(false);
      }
    };

    checkWalletAndRoles();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountChange = async (accounts) => {
        if (accounts.length > 0) {
          setUserAccount(accounts[0]);
          setIsLoading(true);
          await checkUserRoles(accounts[0]);
        } else {
          setUserAccount('');
          setHasAccess(false);
          setIsLoading(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountChange);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountChange);
      };
    }
  }, [requiredRoles]);

  // Show loading spinner while checking roles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect if no access
  if (!userAccount || !hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render protected content
  return children;
};

export default RoleProtectedRoute;
