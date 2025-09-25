import { HowItWork as HowItWorks, HeroEnhanced, Features, Team, Certificates, NavigationSidebar, CertificateChecker } from '../../components/Landing'
import React, { useState, useEffect, useRef } from 'react'
import Footer from '../../components/Shared/Footer'

const LandingPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [userAccount, setUserAccount] = useState(null);
  const [isInstitution, setIsInstitution] = useState(false);
  
  // Optimized scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Skip fade-in animation for team section
          if (entry.target.id === 'team') {
            entry.target.classList.add('fade-in');
            return;
          }
          
          // Use requestAnimationFrame for smoother animations for other sections
          requestAnimationFrame(() => {
            entry.target.classList.add('fade-in');
          });
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger animation slightly before element is fully visible
    });

    // Observe all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setUserAccount(accounts[0]);
            // TODO: Add logic to check if the account is an institution
            setIsInstitution(true);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setUserAccount(accounts[0]);
          setIsInstitution(true);
        } else {
          setUserAccount(null);
          setIsInstitution(false);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setUserAccount(accounts[0]);
          setIsInstitution(true);
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  return (
    <div className="pt-20 text-white">
      {/* Navigation Sidebar */}
      <NavigationSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {/* Hero Section */}
      <div id="hero" className="section">
        <HeroEnhanced />
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="section">
        <HowItWorks />
      </div>

      {/* Features Section */}
      <div id="features" className="section">
        <Features />
      </div>

      {/* Certificates Section */}
      <div id="certificates" className="section">
        <Certificates/>
      </div>

      {/* Certificate Checker Section */}
      <div id="certificate-checker" className="section">
        <CertificateChecker />
      </div>

      {/* Team Section */}
      <div id="team" className="section">
        <Team />
      </div>

      {/* Footer */}
      <div id="footer">
        <Footer 
          userAccount={userAccount}
          isInstitution={isInstitution}
          onConnectWallet={handleConnectWallet}
        />
      </div>
    </div>
  )
}

export default LandingPage