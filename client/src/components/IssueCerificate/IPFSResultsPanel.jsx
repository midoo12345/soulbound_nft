// components/Certificate/IPFSResultsPanel.jsx
import React from 'react';
import PINATA_CONFIG from '../../config/pinata';

function IPFSResultsPanel({ metadataCID, imageCID }) {
    return (
        <div className="mt-8 p-6 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex items-center gap-2 text-green-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Successfully saved to IPFS!</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <a
                    href={`https://${PINATA_CONFIG.gateway}/ipfs/${metadataCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-center"
                >
                    View Metadata
                </a>
                <a
                    href={`https://${PINATA_CONFIG.gateway}/ipfs/${imageCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-center"
                >
                    View Image
                </a>
            </div>
        </div>
    );
}

export default IPFSResultsPanel;