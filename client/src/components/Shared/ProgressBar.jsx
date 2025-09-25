// components/Shared/ProgressBar.jsx
import React from 'react';

function ProgressBar({ progress, stage }) {
    return (
        <div className="space-y-3">
            <div className="w-full bg-gray-700/50 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-sm text-gray-400 text-center">
                {stage}
            </p>
        </div>
    );
}

export default ProgressBar;