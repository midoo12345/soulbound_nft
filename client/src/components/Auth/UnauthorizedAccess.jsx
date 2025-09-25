import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedAccess = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-orange-900/10 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto text-center px-6">
        {/* Lock Icon */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-white mb-4">Access Restricted</h1>
        <p className="text-gray-300 text-lg mb-2">You don't have permission to access the dashboard.</p>
        <p className="text-gray-400 text-sm mb-8">
          Dashboard access is restricted to <span className="text-blue-400 font-semibold">Educational Institutions</span> and <span className="text-purple-400 font-semibold">System Administrators</span> only.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            to="/"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Return to Home
          </Link>
          
          <Link 
            to="/certificate/check"
            className="block w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-300 border border-gray-600 hover:border-gray-500"
          >
            Verify a Certificate
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <h3 className="text-white font-semibold mb-2">Need Access?</h3>
          <p className="text-gray-400 text-sm">
            If you're representing an educational institution, please contact the system administrator to request dashboard access.
          </p>
        </div>

        {/* Features for Regular Users */}
        <div className="mt-8">
          <h3 className="text-white font-semibold mb-4">What you can do:</h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">View and verify certificates</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">Generate QR codes for certificates</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300">Access public certificate information</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
