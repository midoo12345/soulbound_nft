import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import WalletDropdown from './WalletDropdown';
import { useNotification } from './NotificationSystem';

function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInstitution, setIsInstitution] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();


  // Check roles for the account
  const checkRoles = async (address) => {
    if (!window.ethereum || !address) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.SoulboundCertificateNFT,
        contractABI.SoulboundCertificateNFT,
        provider
      );

      // Read roles from the contract to ensure exact values
      const [DEFAULT_ADMIN_ROLE, INSTITUTION_ROLE] = await Promise.all([
        contract.DEFAULT_ADMIN_ROLE(),
        contract.INSTITUTION_ROLE()
      ]);

      const [hasAdminRole, hasInstitutionRole] = await Promise.all([
        contract.hasRole(DEFAULT_ADMIN_ROLE, address),
        contract.hasRole(INSTITUTION_ROLE, address)
      ]);

      setIsAdmin(hasAdminRole);
      setIsInstitution(hasInstitutionRole);
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  // Check if wallet is connected and listen for account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkRoles(accounts[0]);
      } else {
        setAccount('');
        setIsAdmin(false);
        setIsInstitution(false);
      }
    };

    const handleChainChanged = async () => {
      // Re-fetch accounts and roles when the user switches networks
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            await checkRoles(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error handling chain change:', error);
      }
    };

    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await checkRoles(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Listen for role changes on-chain and update privileges without manual refresh
  useEffect(() => {
    if (!window.ethereum || !account) return;

    let contract;
    let filterGranted;
    let filterRevoked;

    (async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        contract = new ethers.Contract(
          contractAddress.SoulboundCertificateNFT,
          contractABI.SoulboundCertificateNFT,
          provider
        );

        // Fetch the exact INSTITUTION_ROLE bytes32 from the contract
        const INSTITUTION_ROLE = await contract.INSTITUTION_ROLE();

        // Create filtered listeners for this account
        filterGranted = contract.filters.RoleGranted(INSTITUTION_ROLE, account, null);
        filterRevoked = contract.filters.RoleRevoked(INSTITUTION_ROLE, account, null);

        const refreshRoles = async () => {
          try {
            await checkRoles(account);
          } catch (err) {
            console.error('Error refreshing roles from event:', err);
          }
        };

        contract.on(filterGranted, refreshRoles);
        contract.on(filterRevoked, refreshRoles);
      } catch (error) {
        console.error('Error setting up role listeners:', error);
      }
    })();

    return () => {
      try {
        if (contract) {
          if (filterGranted) contract.removeAllListeners(filterGranted);
          if (filterRevoked) contract.removeAllListeners(filterRevoked);
        }
      } catch (cleanupErr) {
        console.error('Error cleaning up role listeners:', cleanupErr);
      }
    };
  }, [account]);

  // Connect wallet - Vite-friendly implementation
  const connectWallet = async () => {
    if (!window.ethereum) {
      showError('MetaMask is not installed. Please install MetaMask to connect your wallet.', {
        title: 'MetaMask Required',
        duration: 6000
      });
      return;
    }

    try {
      // Detect Edge and use alternative approach
      if (navigator.userAgent.includes('Edg')) {
        console.log('Edge browser detected, using alternative method');

        // First check existing accounts
        const existingAccounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (existingAccounts && existingAccounts.length > 0) {
          console.log('Using existing connection:', existingAccounts[0]);
          setAccount(existingAccounts[0]);
          await checkRoles(existingAccounts[0]);
          return;
        }

        // For Edge, only use eth_requestAccounts with no extra parameters
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [] // Empty params to avoid permission issues
        });

        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          await checkRoles(accounts[0]);
          showSuccess('Wallet connected successfully!', {
            title: 'Connection Successful',
            duration: 3000
          });
        }
        return;
      }

      // Standard approach for other browsers
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkRoles(accounts[0]);
        showSuccess('Wallet connected successfully!', {
          title: 'Connection Successful',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      // Show specific messages for common errors
      if (error.code === 4001) {
        showWarning('Wallet connection was cancelled. Please try again to continue.', {
          title: 'Connection Cancelled',
          duration: 4000
        });
      } else if (error.code === -32002) {
        showInfo('Connection request is already pending. Please check your MetaMask extension.', {
          title: 'Request Pending',
          duration: 5000
        });
      } else {
        showError('Failed to connect wallet. Please try again.', {
          title: 'Connection Error',
          duration: 4000
        });
      }
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    setAccount('');
    setIsAdmin(false);
    setIsInstitution(false);
    showSuccess('Wallet disconnected successfully', {
      title: 'Disconnected',
      duration: 2000
    });
  };

  // Switch account - Vite-friendly implementation
  const handleSwitchAccount = async () => {
    if (!window.ethereum) {
      showError('MetaMask is not installed. Please install MetaMask to switch accounts.', {
        title: 'MetaMask Required',
        duration: 6000
      });
      return;
    }

    try {
      // For Edge browser, avoid wallet_requestPermissions
      if (navigator.userAgent.includes('Edg')) {
        console.log('Edge browser detected, using alternative switch method');
        setAccount('');
        setIsAdmin(false);
        setIsInstitution(false);

        // Just use eth_requestAccounts directly for Edge
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [] // Empty params to avoid permission issues
        });

        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          await checkRoles(accounts[0]);
          showSuccess('Account switched successfully!', {
            title: 'Account Changed',
            duration: 3000
          });
        }

        return;
      }

      // Standard approach for other browsers
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await checkRoles(accounts[0]);
        showSuccess('Account switched successfully!', {
          title: 'Account Changed',
          duration: 3000
        });
      }

    } catch (error) {
      console.error('Error switching account:', error);
      if (error.code === 4001) {
        showWarning('Account selection was cancelled. Please try again if you want to switch accounts.', {
          title: 'Selection Cancelled',
          duration: 4000
        });
      } else {
        showError('Failed to switch account. Please try again.', {
          title: 'Switch Failed',
          duration: 4000
        });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/20 backdrop-blur-md shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 text-violet-100 font-bold group logo-container">
            {/* Enhanced Blockchain Logo Icon with Subtle Animations */}
            <div className="relative blockchain-logo-container overflow-visible">
              {/* Subtle Ambient Glow Background - Only on Hover */}
              <div className="absolute inset-0 -m-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-full h-full bg-gradient-to-r from-emerald-400/10 via-violet-500/10 to-blue-500/10 rounded-full blur-md"></div>
              </div>

              {/* Main Blockchain Structure */}
              <div className="relative flex items-center space-x-1.5 sm:space-x-2 blockchain-blocks">
                {/* Block 1 - Genesis Block */}
                <div className="relative blockchain-block genesis-block group/block">
                  {/* Subtle Glow Ring - Only on Hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  {/* Main Block */}
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-sm transform rotate-45 shadow-lg blockchain-block-inner 
                               transition-all duration-300 ease-out
                               group-hover:rotate-[405deg] group-hover:scale-105 group-hover:shadow-emerald-400/30">
                    {/* Inner Core */}
                    <div className="absolute inset-0.5 bg-gradient-to-br from-emerald-300 to-cyan-400 rounded-sm opacity-50 
                                  group-hover:opacity-80 transition-opacity duration-200"></div>
                    {/* Static Center - No Auto Animation */}
                    <div className="absolute inset-1 bg-white/20 rounded-sm group-hover:bg-white/40 transition-colors duration-200"></div>
                  </div>
                  
                  {/* Simple Connection Line */}
                  <div className="absolute -right-2.5 sm:-right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 sm:w-4 h-0.5 bg-gradient-to-r from-cyan-400/60 to-violet-500/60 blockchain-connection 
                                 group-hover:from-cyan-400 group-hover:to-violet-500 transition-colors duration-200"></div>
                  </div>
                </div>

                {/* Block 2 - Academic Block */}
                <div className="relative blockchain-block academic-block group/block">
                  {/* Subtle Glow Ring - Only on Hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  {/* Main Block */}
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-sm transform rotate-45 shadow-lg blockchain-block-inner
                               transition-all duration-300 ease-out
                               group-hover:rotate-[405deg] group-hover:scale-105 group-hover:shadow-violet-500/30">
                    {/* Inner Core */}
                    <div className="absolute inset-0.5 bg-gradient-to-br from-violet-400 to-purple-500 rounded-sm opacity-50
                                  group-hover:opacity-80 transition-opacity duration-200"></div>
                    {/* Static Center - No Auto Animation */}
                    <div className="absolute inset-1 bg-white/20 rounded-sm group-hover:bg-white/40 transition-colors duration-200"></div>
                  </div>
                  
                  {/* Simple Connection Line */}
                  <div className="absolute -right-2.5 sm:-right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 sm:w-4 h-0.5 bg-gradient-to-r from-violet-400/60 to-blue-500/60 blockchain-connection
                                 group-hover:from-violet-400 group-hover:to-blue-500 transition-colors duration-200"></div>
                  </div>
                </div>

                {/* Block 3 - Certificate Block */}
                <div className="relative blockchain-block certificate-block group/block">
                  {/* Subtle Glow Ring - Only on Hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  {/* Main Block */}
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-sm transform rotate-45 shadow-lg blockchain-block-inner
                               transition-all duration-300 ease-out
                               group-hover:rotate-[405deg] group-hover:scale-105 group-hover:shadow-blue-500/30">
                    {/* Inner Core */}
                    <div className="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-sm opacity-50
                                  group-hover:opacity-80 transition-opacity duration-200"></div>
                    {/* Static Center - No Auto Animation */}
                    <div className="absolute inset-1 bg-white/20 rounded-sm group-hover:bg-white/40 transition-colors duration-200"></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Clean Text Design with Subtle Animations */}
            <div className="flex flex-col blockchain-text-container relative">
              {/* ACADEMIC Text - Clean and Professional */}
              <div className="relative">
                {/* Subtle Background Glow for Text - Only on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-violet-500/10 to-blue-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Main Text - Responsive Sizing */}
                <span className="relative text-lg sm:text-xl lg:text-2xl font-bold tracking-wide text-white transition-all duration-300 ease-out
                               group-hover:tracking-wider group-hover:text-transparent group-hover:bg-clip-text 
                               group-hover:bg-gradient-to-r group-hover:from-emerald-300 group-hover:via-violet-300 group-hover:to-blue-300
                               blockchain-title">
                  ACADEMIC
                </span>
                
                {/* Simple Underline Effect */}
                <div className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
              
              {/* NFT CERTIFICATE Text - Responsive Sizing */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 -mt-0.5 relative">
                {/* NFT Text */}
                <span className="text-xs sm:text-sm lg:text-base font-medium tracking-wide text-emerald-400 transition-colors duration-300 
                               group-hover:text-emerald-300">
                  NFT
                </span>

                {/* Simple Separator */}
                <div className="w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-60 transition-all duration-300 
                             group-hover:opacity-100 group-hover:scale-125"></div>

                {/* CERTIFICATE Text */}
                <span className="text-xs sm:text-sm lg:text-base font-medium tracking-wide text-cyan-400 transition-colors duration-300 
                               group-hover:text-cyan-300">
                  CERTIFICATE
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Wallet Connection */}
        <div className="hidden lg:flex items-center">
          {account ? (
            <WalletDropdown
              account={account}
              isAdmin={isAdmin}
              isInstitution={isInstitution}
              onSwitchAccount={handleSwitchAccount}
              onDisconnect={handleDisconnect}
            />
          ) : (
              <button
                onClick={connectWallet}
                className="Nav-btn"
              >
                <span>Connect Wallet</span>
              </button>
          )}
        </div>

        {/* Mobile Wallet Connection - Hidden since NavigationSidebar handles mobile */}
        <div className="hidden">
          {/* Mobile wallet connection is handled by NavigationSidebar */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;