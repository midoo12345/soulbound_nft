import { useState, useCallback, useEffect } from 'react';

const useInteractiveDemo = () => {
    const [activeDemo, setActiveDemo] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userRole, setUserRole] = useState('visitor'); // visitor, student, institution, employer

    const demoSteps = [
        { title: 'Certificate Creation', description: 'Institution creates secure certificate' },
        { title: 'Blockchain Minting', description: 'Certificate minted as soulbound NFT' },
        { title: 'Student Receives', description: 'Certificate automatically delivered' },
        { title: 'Global Verification', description: 'Anyone can verify authenticity' }
    ];

    const mockCertificates = {
        student: {
            student: "0x742d...92c8",
            courseName: "Advanced Quantum Computing",
            university: "MIT Digital Academy",
            completionDate: new Date(),
            tokenId: "EDU-2024-001",
            grade: "A+",
            credits: "24 ECTS",
            isVerified: true
        },
        institution: {
            student: "Multiple Students",
            courseName: "Batch Certificate Example",
            university: "Your Institution",
            completionDate: new Date(),
            tokenId: "BATCH-2024-001",
            grade: "Varies",
            credits: "Customizable",
            isVerified: true
        },
        employer: {
            student: "John Doe",
            courseName: "Verified Skills Assessment",
            university: "Professional Certification",
            completionDate: new Date(),
            tokenId: "SKILL-2024-001",
            grade: "Verified",
            credits: "Industry Standard",
            isVerified: true
        }
    };

    const toggleDemo = useCallback(() => {
        setActiveDemo(prev => !prev);
        if (!activeDemo) {
            setDemoStep(0);
            setIsPlaying(false);
        }
    }, [activeDemo]);

    const startAutoDemo = useCallback(() => {
        setIsPlaying(true);
        setDemoStep(0);
    }, []);

    const stopDemo = useCallback(() => {
        setIsPlaying(false);
        setDemoStep(0);
    }, []);

    const nextStep = useCallback(() => {
        setDemoStep(prev => (prev + 1) % demoSteps.length);
    }, [demoSteps.length]);

    // Auto-advance demo steps
    useEffect(() => {
        if (isPlaying && activeDemo) {
            const timer = setTimeout(nextStep, 3000);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, activeDemo, demoStep, nextStep]);

    const getCurrentCertificate = useCallback(() => {
        return mockCertificates[userRole] || mockCertificates.student;
    }, [userRole]);

    return {
        activeDemo,
        demoStep,
        isPlaying,
        userRole,
        demoSteps,
        toggleDemo,
        startAutoDemo,
        stopDemo,
        nextStep,
        setUserRole,
        getCurrentCertificate,
        totalSteps: demoSteps.length
    };
};

export default useInteractiveDemo; 