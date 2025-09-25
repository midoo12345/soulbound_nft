// components/Certificate/CertificateImageUpload.jsx
import React from 'react';

function CertificateImageUpload({
    imagePreview,
    onImageUpload,
    loading,
    validationError,
    touched
}) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
                Certificate Image
            </label>
            <div className="relative">
                <input
                    type="file"
                    id="certificate-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden"
                />
                <label
                    htmlFor="certificate-image"
                    className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-md ${
                        validationError && touched
                            ? 'border-red-500/70 bg-red-900/20 hover:bg-red-900/30' 
                            : 'border-violet-500/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-violet-400/70'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                        background: imagePreview 
                            ? 'transparent' 
                            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <img
                                src={imagePreview}
                                alt="Certificate preview"
                                className="w-full h-full object-contain rounded-xl"
                            />
                            {/* Holographic overlay for preview */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-violet-500/10 to-transparent opacity-30 rounded-xl"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {/* Enhanced upload icon with glow effect */}
                            <div className="relative mb-4">
                                <svg
                                    className="w-16 h-16 text-violet-400"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 20 16"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                    />
                                </svg>
                                {/* Animated particles around icon */}
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse animation-delay-300"></div>
                            </div>
                            
                            <p className="mb-3 text-base text-gray-200 font-medium">
                                <span className="text-violet-400 font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-gray-400">
                                PNG, JPG or GIF • Maximum size: 5MB
                            </p>
                            
                            {/* Animated progress dots */}
                            <div className="flex space-x-1 mt-4">
                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse animation-delay-200"></div>
                                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse animation-delay-400"></div>
                            </div>
                        </div>
                    )}
                </label>
            </div>
            {validationError && touched && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-300 font-medium">{validationError}</p>
                </div>
            )}
        </div>
    );
}

export default CertificateImageUpload;