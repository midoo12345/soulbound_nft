import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import Navbar from './components/Shared/Navbar';
import LandingPage from './pages/LandingPage/LandingPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import CertificatesList from './pages/Dashboard/CertificatesList';
import IssueCertificate from './pages/Dashboard/IssueCertificate';
import CertificateUpdate from './pages/Dashboard/UpdateCertificate';
import ManageCourses from './pages/Dashboard/ManageCourses';
import ManageInstitutions from './pages/Dashboard/ManageInstitutions';
import BurnApprovals from './pages/Dashboard/BurnApprovals';
import Dashboard from './pages/Dashboard/Dashboard'; 
import Analytics from './pages/Analytics/Analytics';
import Documentation from './pages/Docs/Documentation';
import { Toaster } from 'react-hot-toast';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Loading from './components/Shared/LoadingSpinner';
import AcademicCertificateLoader from './components/Loading/AcademicCertificateLoader';
import PublicCertificateView from './pages/CertificateDetails/PublicCertificateView';
import BrowserRecommendation from './components/Shared/BrowserRecommendation';
import { PageSwipeProvider } from './components/animations/PageSwipe/PageSwipeProvider';
import { NotificationProvider } from './components/Shared/NotificationSystem';
import RoleProtectedRoute from './components/Auth/RoleProtectedRoute';
import UnauthorizedAccess from './components/Auth/UnauthorizedAccess';



function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userAccount, setUserAccount] = useState(null);
    const [isInstitution, setIsInstitution] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check if MetaMask is installed
                if (window.ethereum) {
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

                    if (accounts && accounts.length > 0) {
                        setUserAccount(accounts[0]);
                        // TODO: Add logic to check if the account is an institution
                        // For now, we'll set it to true for testing
                        setIsInstitution(true);
                    }

                    // Listen for account changes
                    window.ethereum.on('accountsChanged', (accounts) => {
                        if (accounts.length > 0) {
                            setUserAccount(accounts[0]);
                            // TODO: Add logic to check if the new account is an institution
                            setIsInstitution(true);
                        } else {
                            setUserAccount(null);
                            setIsInstitution(false);
                        }
                    });
                }
            } catch (error) {
                console.error('Error initializing app:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();

        // Cleanup function
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
            }
        };
    }, []);

    // Simple auth check function
    const isAuthenticated = !!userAccount;

    // Auth guard component
    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) {
            return <Navigate to="/" />;
        }
        return children;
    };

    if (isLoading) {
        return (
            <AcademicCertificateLoader />
        );
    }

    return (
        <NotificationProvider>
            <Router>
                <PageSwipeProvider>
                    <div className="App flex flex-col min-h-screen bg-slate-950">
                        {/* Browser Recommendation Banner - shown on all pages */}
                        <BrowserRecommendation />
                        
                        {/* Navbar shown on all pages */}
                        <Navbar 
                            userAccount={userAccount} 
                            isMobileMenuOpen={isMobileMenuOpen}
                            setIsMobileMenuOpen={setIsMobileMenuOpen}
                        />

                    {/* Main content area */}
                    <div className="flex-grow">
                        <Routes>
                            {/* Public route */}
                            <Route path="/" element={<LandingPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />

                            {/* Public certificate route */}
                            <Route path="/certificate/:id" element={<PublicCertificateView />} />

                            {/* Documentation route */}
                            <Route path="/docs" element={<Documentation />} />

                            {/* Unauthorized access page */}
                            <Route path="/unauthorized" element={<UnauthorizedAccess />} />

                            {/* Dashboard routes - WALLET PROTECTED (Basic Access for All Users) */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardLayout />
                                    </ProtectedRoute>
                                }
                            >
                                {/* Default redirect based on user role */}
                                <Route index element={<Navigate to="certificates" replace />} />

                                {/* Certificates List - Available to ALL connected users */}
                                <Route path="certificates" element={<CertificatesList />} />

                                {/* Main Dashboard - Admin & Institution only */}
                                <Route path="in" element={
                                    <RoleProtectedRoute requiredRoles={['admin', 'institution']} fallbackPath="/unauthorized">
                                        <Dashboard />
                                    </RoleProtectedRoute>
                                } />
                                
                                {/* Analytics - Admin & Institution only */}
                                <Route path="analytics" element={
                                    <RoleProtectedRoute requiredRoles={['admin', 'institution']} fallbackPath="/unauthorized">
                                        <Analytics />
                                    </RoleProtectedRoute>
                                } />

                                {/* Institution-specific routes */}
                                <Route path="issue" element={
                                    <RoleProtectedRoute requiredRoles={['admin', 'institution']} fallbackPath="/unauthorized">
                                        <IssueCertificate />
                                    </RoleProtectedRoute>
                                } />
                                <Route path="update" element={
                                    <RoleProtectedRoute requiredRoles={['admin', 'institution']} fallbackPath="/unauthorized">
                                        <CertificateUpdate />
                                    </RoleProtectedRoute>
                                } />
                                <Route path="courses" element={
                                    <RoleProtectedRoute requiredRoles={['admin', 'institution']} fallbackPath="/unauthorized">
                                        <ManageCourses isInstitution={isInstitution} />
                                    </RoleProtectedRoute>
                                } />
                                <Route path="burn-approvals" element={
                                    <RoleProtectedRoute requiredRoles={['admin']} fallbackPath="/unauthorized">
                                        <BurnApprovals />
                                    </RoleProtectedRoute>
                                } />

                                {/* Admin-only routes */}
                                <Route path="institutions" element={
                                    <RoleProtectedRoute requiredRoles={['admin']} fallbackPath="/unauthorized">
                                        <ManageInstitutions />
                                    </RoleProtectedRoute>
                                } />

                                {/* Catch-all for dashboard - redirect normal users to certificates */}
                                <Route path="*" element={<Navigate to="/dashboard/certificates" replace />} />
                            </Route>

                            {/* Global catch-all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>

                    {/* Footer shown on all pages */}
           
                    <Toaster position="top-center" />
                </div>
            </PageSwipeProvider>
        </Router>
        </NotificationProvider>
    );
}

export default App;