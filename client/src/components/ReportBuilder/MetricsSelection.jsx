import React from 'react';

export const MetricsSelection = ({ 
  selectedMetrics, 
  handleMetricToggle, 
  getFilteredMetrics 
}) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-800/50">
      <h3 className="text-xl font-semibold text-white mb-4">Select Metrics</h3>
      <p className="text-sm text-gray-400 mb-6">Choose which metrics to include in your report</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredMetrics().map((metric) => (
          <label key={metric.value} className="flex items-center space-x-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-indigo-500/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric.value)}
              onChange={() => handleMetricToggle(metric.value)}
              className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <div>
              <div className="text-sm font-medium text-white">{metric.label}</div>
              <div className="text-xs text-gray-400">{metric.category}</div>
              <div className="text-xs text-indigo-400">Priority: {metric.priority}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
