"use client";

import React, { useState } from 'react';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';

export default function MonitorPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`h-screen ${darkMode ? 'dark' : ''}`}>
      <MonitoringDashboard />
    </div>
  );
}
