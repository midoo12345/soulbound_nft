import React from 'react';

export const ReportConfiguration = ({ 
  reportType, 
  setReportType, 
  timeRange, 
  setTimeRange,
  reportTypes,
  timeRanges 
}) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-semibold text-white mb-6">Report Configuration</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Type Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-300 mb-4">Report Type</h4>
          <div className="space-y-3">
            {reportTypes.map((type) => (
              <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value={type.value}
                  checked={reportType === type.value}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-2"
                />
                <div>
                  <div className="text-sm font-medium text-white">{type.label}</div>
                  <div className="text-xs text-gray-400">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Time Range Selection */}
        <div>
          <h4 className="text-lg font-medium text-gray-300 mb-4">Time Range</h4>
          <div className="space-y-3">
            {timeRanges.map((range) => (
              <label key={range.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="timeRange"
                  value={range.value}
                  checked={timeRange === range.value}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
