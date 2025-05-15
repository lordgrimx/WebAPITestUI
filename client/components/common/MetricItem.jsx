import React from 'react';

function MetricItem({ label, value, isDarkMode }) {
  return (
    <div className={`p-3 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg`}>
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : ''}`}>{value?.toFixed(2) || '0.00'}</p>
    </div>
  );
}

export default MetricItem; 