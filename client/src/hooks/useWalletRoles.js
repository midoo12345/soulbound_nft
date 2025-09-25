import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../config/contractAddress.json';
import contractABI from '../config/abi.json';

const useWalletRoles = () => {
    const [account, setAccount] = useState('');
    const [roles, setRoles] = useState({
        isAdmin: false,
        isInstitution: false,
        isConnected: false,
        isLoading: false
    });
    const [contract, setContract] = useState(null);
    const [roleConstants, setRoleConstants] = useState({
        INSTITUTION_ROLE: null,
        DEFAULT_ADMIN_ROLE: null
    });

    // Check user roles against smart contract
    const checkRoles = useCallback(async (address) => {
        if (!window.ethereum || !address) {
            setRoles(prev => ({ ...prev, isAdmin: false, isInstitution: false }));
            setRoleConstants({
                INSTITUTION_ROLE: null,
                DEFAULT_ADMIN_ROLE: null
            });
            return;
        }

        try {
            setRoles(prev => ({ ...prev, isLoading: true }));
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contractInstance = new ethers.Contract(
                contractAddress.SoulboundCertificateNFT,
                contractABI.SoulboundCertificateNFT,
                provider
            );

            setContract(contractInstance);

            // Get role hashes from contract
            const DEFAULT_ADMIN_ROLE = await contractInstance.DEFAULT_ADMIN_ROLE();
            const INSTITUTION_ROLE = await contractInstance.INSTITUTION_ROLE();

            // Store role constants for reuse
            setRoleConstants({
                DEFAULT_ADMIN_ROLE,
                INSTITUTION_ROLE
            });

            // Check roles in parallel
            const [hasAdminRole, hasInstitutionRole] = await Promise.all([
                contractInstance.hasRole(DEFAULT_ADMIN_ROLE, address),
                contractInstance.hasRole(INSTITUTION_ROLE, address)
            ]);

            setRoles({
                isAdmin: hasAdminRole,
                isInstitution: hasInstitutionRole,
                isConnected: true,
                isLoading: false
            });

        } catch (error) {
            console.error('Error checking roles:', error);
            setRoles(prev => ({ 
                ...prev, 
                isAdmin: false, 
                isInstitution: false, 
                isLoading: false 
            }));
            // Reset role constants on error
            setRoleConstants({
                INSTITUTION_ROLE: null,
                DEFAULT_ADMIN_ROLE: null
            });
        }
    }, []);

    // Initialize contract for public access (even without wallet connection)
    const initializePublicContract = useCallback(async () => {
        if (!window.ethereum) return;
        
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contractInstance = new ethers.Contract(
                contractAddress.SoulboundCertificateNFT,
                contractABI.SoulboundCertificateNFT,
                provider
            );
            
            // Set contract for public access
            setContract(contractInstance);
            
            // Get role constants for public use
            const DEFAULT_ADMIN_ROLE = await contractInstance.DEFAULT_ADMIN_ROLE();
            const INSTITUTION_ROLE = await contractInstance.INSTITUTION_ROLE();
            
            setRoleConstants({
                DEFAULT_ADMIN_ROLE,
                INSTITUTION_ROLE
            });
            
            console.log('Public contract initialized for landing page access');
        } catch (error) {
            console.error('Error initializing public contract:', error);
        }
    }, []);

    // Handle wallet connection
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to continue!');
            return false;
        }

        try {
            setRoles(prev => ({ ...prev, isLoading: true }));

            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await checkRoles(accounts[0]);
                return true;
            }
            return false;

        } catch (error) {
            console.error('Error connecting wallet:', error);
            setRoles(prev => ({ ...prev, isLoading: false }));
            
            if (error.code === 4001) {
                alert('Please connect your wallet to access the platform.');
            } else if (error.code === -32002) {
                alert('Connection request pending. Please open MetaMask.');
            }
            return false;
        }
    }, [checkRoles]);

    // Disconnect wallet
    const disconnectWallet = useCallback(() => {
        setAccount('');
        setRoles({
            isAdmin: false,
            isInstitution: false,
            isConnected: false,
            isLoading: false
        });
        setContract(null);
        setRoleConstants({
            INSTITUTION_ROLE: null,
            DEFAULT_ADMIN_ROLE: null
        });
    }, []);

    // Get user role display info
    const getRoleInfo = useCallback(() => {
        if (roles.isAdmin) {
            return {
                role: 'admin',
                label: 'Platform Administrator',
                color: 'from-purple-500 to-indigo-600',
                icon: '👑',
                level: 'SUPREME',
                description: 'Full platform control & management'
            };
        }
        
        if (roles.isInstitution) {
            return {
                role: 'institution',
                label: 'Educational Institution',
                color: 'from-blue-500 to-cyan-600',
                icon: '🏛️',
                level: 'AUTHORIZED',
                description: 'Certificate issuance & management'
            };
        }

        return {
            role: 'student',
            label: 'Student/Viewer',
            color: 'from-emerald-500 to-teal-600',
            icon: '🎓',
            level: 'VERIFIED',
            description: 'Certificate viewing & verification'
        };
    }, [roles]);

    // Listen for account changes
    useEffect(() => {
        const handleAccountsChanged = async (accounts) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await checkRoles(accounts[0]);
            } else {
                disconnectWallet();
            }
        };

        const checkConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ 
                        method: 'eth_accounts' 
                    });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        await checkRoles(accounts[0]);
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };

        // Initialize public contract for landing page access (even without wallet connection)
        initializePublicContract();
        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [checkRoles, disconnectWallet, initializePublicContract]);

    return {
        account,
        roles,
        contract,
        roleConstants,
        connectWallet,
        disconnectWallet,
        getRoleInfo,
        isLoading: roles.isLoading,
        isConnected: roles.isConnected && !!account
    };
};

export default useWalletRoles; 