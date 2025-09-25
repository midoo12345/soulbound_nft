import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractAddress from '../../config/contractAddress.json';
import contractABI from '../../config/abi.json';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorDisplay from '../../components/Certificates/ErrorDisplay';
import CustomDropdown from '../ui/CustomDropdown';

function StudentInfoForm({
    formData,
    onInputChange,
    validationErrors,
    touchedFields,
    loading,
    courses,
    loadingCourses,
    userAddress
}) {
    const [isCheckingInstitution, setIsCheckingInstitution] = useState(false);
    const [isTargetInstitution, setIsTargetInstitution] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onInputChange(name, value);
    };

    // Check if user is trying to enter their own address
    const isSelfAddress = formData.studentAddress && userAddress && 
                          formData.studentAddress.toLowerCase() === userAddress.toLowerCase();

    // Check if target address is an institution
    useEffect(() => {
        const checkIfInstitution = async () => {
            if (!formData.studentAddress || !formData.studentAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                setIsTargetInstitution(false);
                return;
            }

            if (formData.studentAddress.toLowerCase() === userAddress?.toLowerCase()) {
                setIsTargetInstitution(false);
                return;
            }

            try {
                setIsCheckingInstitution(true);
                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(
                    contractAddress.SoulboundCertificateNFT,
                    contractABI.SoulboundCertificateNFT,
                    provider
                );

                const INSTITUTION_ROLE = await contract.INSTITUTION_ROLE();
                const hasInstitutionRole = await contract.hasRole(INSTITUTION_ROLE, formData.studentAddress);
                setIsTargetInstitution(hasInstitutionRole);
            } catch (error) {
                console.error('Error checking institution role:', error);
                setIsTargetInstitution(false);
            } finally {
                setIsCheckingInstitution(false);
            }
        };

        // Debounce the check
        const timeoutId = setTimeout(checkIfInstitution, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.studentAddress, userAddress]);

    return (
        <div className="space-y-6">
            {/* Self-address real-time warning */}
            {isSelfAddress && (
                <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-sm text-red-300 font-medium">Cannot issue certificate to yourself</span>
                    </div>
                </div>
            )}

            {/* Institution address warning */}
            {isTargetInstitution && !isSelfAddress && (
                <div className="p-3 bg-orange-900/50 border border-orange-500/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm text-orange-300 font-medium">Cannot issue certificate to institution address</span>
                    </div>
                </div>
            )}

            {/* Checking institution status */}
            {isCheckingInstitution && formData.studentAddress && !isSelfAddress && (
                <div className="p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <LoadingSpinner size="small" />
                        <span className="text-sm text-blue-300">Checking address type...</span>
                    </div>
                </div>
            )}

            {/* Futuristic toast for invalid address */}
            {validationErrors.studentAddress && touchedFields.studentAddress && (
                <ErrorDisplay error={validationErrors.studentAddress} />
            )}
            
            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Student Address
                </label>
                <input
                    type="text"
                    name="studentAddress"
                    value={formData.studentAddress}
                    onChange={handleChange}
                    placeholder="0x... (Student's Ethereum address)"
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-cyan-900/40 text-cyan-100 outline-none rounded-xl border-2 transition-all duration-200 futuristic-input font-mono tracking-widest ${
                        isSelfAddress 
                            ? 'border-red-500 ring-2 ring-red-400 bg-red-900/20' 
                            : isTargetInstitution 
                                ? 'border-orange-500 ring-2 ring-orange-400 bg-orange-900/20'
                                : validationErrors.studentAddress && touchedFields.studentAddress 
                                    ? 'border-red-500 ring-2 ring-red-400' 
                                    : 'border-cyan-400/80 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 shadow-cyan-400/30'
                    }`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Course
                </label>
                <CustomDropdown
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    options={courses.map(course => ({
                        value: course.id,
                        label: course.name
                    }))}
                    placeholder="Select a course"
                    disabled={loading}
                    loading={loadingCourses}
                    error={validationErrors.courseId && touchedFields.courseId}
                />
                {validationErrors.courseId && touchedFields.courseId && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.courseId}</p>
                )}
                {loadingCourses && (
                    <div className="mt-2 flex items-center gap-2 text-gray-400">
                        <LoadingSpinner size="small" />
                        <span className="text-sm">Loading courses...</span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Grade
                </label>
                <input
                    type="number"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    onInput={e => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val) {
                            let num = Math.max(1, Math.min(100, parseInt(val)));
                            e.target.value = num;
                        }
                        else {
                            e.target.value = '';
                        }
                        onInputChange('grade', e.target.value);
                    }}
                    placeholder="Grade (1-100)"
                    min={1}
                    max={100}
                    step={1}
                    pattern="[0-9]*"
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-cyan-900/40 text-cyan-100 outline-none rounded-xl border-2 border-cyan-400/80 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 shadow-cyan-400/30 font-mono tracking-widest transition-all duration-200 futuristic-input ${validationErrors.grade && touchedFields.grade ? 'border-red-500 ring-2 ring-red-400' : ''}`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                />
                {validationErrors.grade && touchedFields.grade && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.grade}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                    Certificate Title
                </label>
                <input
                    type="text"
                    name="certificateData"
                    value={formData.certificateData}
                    onChange={handleChange}
                    placeholder="Certificate Title (letters only, max 40)"
                    maxLength={40}
                    disabled={loading}
                    className={`w-full px-4 py-3 bg-cyan-900/40 text-cyan-100 outline-none rounded-xl border-2 border-cyan-400/80 focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 shadow-cyan-400/30 font-mono tracking-widest transition-all duration-200 futuristic-input ${validationErrors.certificateData && touchedFields.certificateData ? 'border-red-500 ring-2 ring-red-400' : ''}`}
                />
                {validationErrors.certificateData && touchedFields.certificateData && (
                    <p className="mt-2 text-sm text-red-400">{validationErrors.certificateData}</p>
                )}
            </div>
        </div>
    );
}

export default StudentInfoForm;

/*
// Add this CSS globally or in your main CSS file for all number inputs:
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
// Optionally, add a .futuristic-input class for extra effects:
.futuristic-input {
  box-shadow: 0 0 12px 0 #06b6d4cc, 0 0 0 2px #0ff3  inset;
  background: linear-gradient(120deg, #0a1022cc 60%, #0e1a2fcc 100%);
  transition: box-shadow 0.3s, border-color 0.3s;
}
.futuristic-input:focus {
  box-shadow: 0 0 24px 2px #06b6d4cc, 0 0 0 2px #0ff9  inset;
  border-color: #67e8f9;
}
*/


 