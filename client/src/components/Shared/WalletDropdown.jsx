import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { useNotification } from './NotificationSystem';

const WalletDropdown = ({ 
  account, 
  isAdmin, 
  isInstitution, 
  onSwitchAccount, 
  onDisconnect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [networkName, setNetworkName] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const dropdownRef = useRef(null);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Get wallet balance
  const getBalance = async () => {
    if (!window.ethereum || !account) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      const ethBalance = ethers.formatEther(balance);
      setBalance(parseFloat(ethBalance).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0.00');
    }
  };

  // Get network information
  const getNetworkInfo = async () => {
    if (!window.ethereum) return;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      const networkNames = {
        1: 'Ethereum Mainnet',
        11155111: 'Sepolia Testnet',
        5: 'Goerli Testnet',
        137: 'Polygon Mainnet',
        80001: 'Polygon Mumbai',
        1337: 'Local Network'
      };
      
      setNetworkName(networkNames[Number(network.chainId)] || `Network ${network.chainId}`);
    } catch (error) {
      console.error('Error fetching network:', error);
      setNetworkName('Unknown Network');
    }
  };

  // Load wallet data when component mounts
  useEffect(() => {
    if (account) {
      getBalance();
      getNetworkInfo();
    }
  }, [account]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle switch account with loading state
  const handleSwitchAccount = async () => {
    setIsLoading(true);
    try {
      await onSwitchAccount();
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    onDisconnect();
    setIsOpen(false);
  };

  // Copy address to clipboard with enhanced feedback and debouncing
  const copyAddress = async (e, source = 'inline') => {
    e.stopPropagation(); // Prevent dropdown from closing
    
    // Prevent multiple rapid clicks
    if (isCopying) return;
    setIsCopying(true);
    
    let copySuccess = false;
    
    try {
      await navigator.clipboard.writeText(account);
      copySuccess = true;
      
      // Only show notification once per action
      showSuccess(`Address copied to clipboard!`, {
        title: '📋 Copied Successfully',
        duration: 2000
      });
      
    } catch (error) {
      console.error('Modern clipboard API failed, trying fallback:', error);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = account;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          copySuccess = true;
          showSuccess('Address copied to clipboard!', {
            title: '📋 Copied Successfully',
            duration: 2000
          });
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        showError('Failed to copy address. Please copy manually.', {
          title: '❌ Copy Failed',
          duration: 4000
        });
      }
    }
    
    // Add visual feedback only if copy was successful
    if (copySuccess) {
      const button = e.currentTarget;
      
      if (source === 'inline') {
        // For inline copy button - show checkmark
        const iconElement = button.querySelector('i');
        if (iconElement) {
          const originalClasses = iconElement.className;
          iconElement.className = 'fas fa-check text-emerald-400';
          
          setTimeout(() => {
            iconElement.className = originalClasses;
            setIsCopying(false);
          }, 1000);
        } else {
          setTimeout(() => setIsCopying(false), 1000);
        }
      } else {
        // For action button - brief highlight
        button.classList.add('bg-emerald-500/20', 'border-emerald-400/50');
        setTimeout(() => {
          button.classList.remove('bg-emerald-500/20', 'border-emerald-400/50');
          setIsCopying(false);
        }, 1000);
      }
    } else {
      // Reset copying state immediately if copy failed
      setIsCopying(false);
    }
  };

  // Get role info
  const getRoleInfo = () => {
    if (isAdmin) {
      return {
        label: 'Admin',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-400/30',
        icon: '👑'
      };
    } else if (isInstitution) {
      return {
        label: 'Institution',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-400/30',
        icon: '🏛️'
      };
    } else {
      return {
        label: 'Student',
        color: 'from-emerald-500 to-cyan-600',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-400/30',
        icon: '🎓'
      };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Wallet Button - Responsive */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 sm:space-x-3 
                 px-3 py-2 sm:px-4 sm:py-2.5 
                 bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur-sm
                 border border-slate-600/30 hover:border-slate-500/50
                 rounded-lg sm:rounded-xl transition-all duration-300 ease-out
                 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-800/30
                 transform hover:scale-[1.02]"
      >
        {/* Wallet Icon with Glow - Responsive */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 
                        rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-blue-600 
                        rounded-full flex items-center justify-center
                        shadow-lg shadow-violet-500/30 group-hover:shadow-violet-400/50
                        transition-all duration-300">
            <i className="fas fa-wallet text-white text-xs sm:text-sm"></i>
          </div>
        </div>

        {/* Account Info - Responsive */}
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div className="flex items-center space-x-1 sm:space-x-2 w-full">
            <span className="text-white font-medium text-xs sm:text-sm truncate">
              {formatAddress(account)}
            </span>
            <div className={`hidden sm:flex px-2 py-0.5 rounded-full text-xs font-medium border ${roleInfo.borderColor} ${roleInfo.bgColor}`}>
              <span className="mr-1">{roleInfo.icon}</span>
              <span className={`bg-gradient-to-r ${roleInfo.color} bg-clip-text text-transparent font-bold`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs font-mono">
              {balance} ETH
            </span>
            {/* Mobile role badge */}
            <div className={`sm:hidden px-1.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.borderColor} ${roleInfo.bgColor}`}>
              <span className="text-xs">{roleInfo.icon}</span>
            </div>
          </div>
        </div>

        {/* Chevron Icon - Responsive */}
        <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 text-xs sm:text-sm
                      ${isOpen ? 'transform rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Panel - Fully Responsive */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 sm:w-80 md:w-96 z-50 
                       max-w-[calc(100vw-2rem)] mx-2 sm:mx-0">
          {/* Backdrop with blur */}
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-600/30 
                        rounded-xl sm:rounded-2xl shadow-2xl shadow-slate-900/50 overflow-hidden">
            
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-emerald-500/20 
                          rounded-2xl opacity-50 animate-pulse"></div>
            
            {/* Header Section - Responsive */}
            <div className="relative p-4 sm:p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-white font-bold text-base sm:text-lg flex items-center space-x-2">
                  <span className="text-xl sm:text-2xl">{roleInfo.icon}</span>
                  <span className="hidden sm:inline">Wallet Connected</span>
                  <span className="sm:hidden">Connected</span>
                </h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-400 text-xs font-medium">Online</span>
                </div>
              </div>

              {/* Account Address - Enhanced Copy */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1 block">Account Address</label>
                  <div className="flex items-center space-x-2 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 
                               hover:border-slate-600/50 transition-colors duration-200">
                    <span className="text-white font-mono text-xs sm:text-sm flex-1 truncate">{account}</span>
                    <button
                      onClick={(e) => copyAddress(e, 'inline')}
                      disabled={isCopying}
                      className={`group/copy flex-shrink-0 p-2 transition-all duration-200
                               transform hover:scale-110 active:scale-95 rounded-md
                               ${isCopying 
                                 ? 'text-emerald-400 bg-emerald-500/20 cursor-not-allowed' 
                                 : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                      title={isCopying ? "Copying..." : "Copy Address"}
                    >
                      <i className={`${isCopying ? 'fas fa-check' : 'fas fa-copy'} text-xs sm:text-sm 
                                   group-hover/copy:scale-110 transition-transform duration-200`}></i>
                    </button>
                  </div>
                  {/* Quick copy hint */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-slate-500 text-xs">Click to copy full address</span>
                    <span className="text-slate-500 text-xs font-mono">{formatAddress(account)}</span>
                  </div>
                </div>

                {/* Balance & Network - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs font-medium mb-1 block">Balance</label>
                    <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-emerald-400 font-bold text-sm sm:text-base">{balance} ETH</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-medium mb-1 block">Network</label>
                    <div className="p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                      <span className="text-blue-400 font-medium text-xs sm:text-sm truncate">{networkName}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge - Responsive */}
                <div>
                  <label className="text-slate-400 text-xs font-medium mb-1 block">Role</label>
                  <div className={`p-2 sm:p-3 rounded-lg border ${roleInfo.borderColor} ${roleInfo.bgColor}`}>
                    <span className="text-white font-bold flex items-center space-x-2">
                      <span className="text-base sm:text-lg">{roleInfo.icon}</span>
                      <span className={`bg-gradient-to-r ${roleInfo.color} bg-clip-text text-transparent text-sm sm:text-base`}>
                        {roleInfo.label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section - Responsive */}
            <div className="relative p-3 sm:p-4 space-y-2">
              {/* Switch Account Button - Responsive */}
              <button
                onClick={handleSwitchAccount}
                disabled={isLoading}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left
                         hover:bg-slate-700/50 rounded-lg transition-all duration-200
                         border border-transparent hover:border-slate-600/30
                         group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 
                              rounded-lg flex items-center justify-center
                              group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-200">
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin text-white text-xs sm:text-sm"></i>
                  ) : (
                    <i className="fas fa-exchange-alt text-white text-xs sm:text-sm"></i>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-medium block text-sm sm:text-base">Switch Account</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Connect different wallet</span>
                </div>
              </button>

              {/* Copy Address Button - Quick Access */}
              <button
                onClick={(e) => copyAddress(e, 'action')}
                disabled={isCopying}
                className={`w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left
                         rounded-lg transition-all duration-200 group
                         ${isCopying 
                           ? 'bg-emerald-500/20 border-emerald-400/50 cursor-not-allowed' 
                           : 'hover:bg-slate-700/50 border-transparent hover:border-slate-600/30'}`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                              transition-all duration-200
                              ${isCopying 
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30' 
                                : 'bg-gradient-to-br from-violet-500 to-purple-600 group-hover:shadow-lg group-hover:shadow-violet-500/30'}`}>
                  <i className={`${isCopying ? 'fas fa-check' : 'fas fa-copy'} text-white text-xs sm:text-sm`}></i>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-medium block text-sm sm:text-base">
                    {isCopying ? 'Copied!' : 'Copy Address'}
                  </span>
                  <span className="text-slate-400 text-xs sm:text-sm">
                    {isCopying ? 'Address copied to clipboard' : 'Copy wallet address to clipboard'}
                  </span>
                </div>
              </button>

              {/* Refresh Balance Button - Responsive */}
              <button
                onClick={getBalance}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left
                         hover:bg-slate-700/50 rounded-lg transition-all duration-200
                         border border-transparent hover:border-slate-600/30 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 
                              rounded-lg flex items-center justify-center
                              group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
                  <i className="fas fa-sync-alt text-white text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-white font-medium block text-sm sm:text-base">Refresh Balance</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Update wallet information</span>
                </div>
              </button>

              {/* Disconnect Button - Responsive */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left
                         hover:bg-red-500/10 rounded-lg transition-all duration-200
                         border border-transparent hover:border-red-500/30 group"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 
                              rounded-lg flex items-center justify-center
                              group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-200">
                  <i className="fas fa-sign-out-alt text-white text-xs sm:text-sm"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-red-400 font-medium block text-sm sm:text-base">Disconnect Wallet</span>
                  <span className="text-slate-400 text-xs sm:text-sm">Sign out of current session</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDropdown;
