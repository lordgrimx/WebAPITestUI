"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
import { format } from "date-fns";
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { authAxios, useAuth } from '@/lib/auth-context'; // Import useAuth
import Link from 'next/link';
import { ArrowLeft, Badge, ChevronsUpDown, Check } from 'lucide-react';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

// HTTP Method renkleri ve Badge variantları (CollectionsSidebar.jsx'ten kopyalandı)
const methodStyles = {
  GET:    {
    variant: "default",
    className: "text-blue-800 hover:bg-blue-200 border-blue-300 object-fit",
    darkClassName: "text-blue-100 hover:bg-blue-800 border-blue-700"
  },
  POST:   {
    variant: "default",
    className: "text-green-800 hover:bg-green-200 border-green-300",
    darkClassName: "text-green-100 hover:bg-green-800 border-green-700"
  },
  PUT:    {
    variant: "default",
    className: "text-yellow-800 hover:bg-yellow-200 border-yellow-300",
    darkClassName: "text-yellow-100 hover:bg-yellow-800 border-yellow-700"
  },
  DELETE: {
    variant: "destructive",
    className: "text-red-800 hover:bg-red-200 border-red-300",
    darkClassName: "text-red-100 hover:bg-red-800 border-red-700"
  },
  PATCH:  {
    variant: "default",
    className: "text-purple-800 hover:bg-purple-200 border-purple-300",
    darkClassName: "text-purple-100 hover:bg-purple-800 border-purple-700"
  },
  OPTIONS:{
    variant: "secondary",
    className: "text-gray-800 hover:bg-gray-200 border-gray-300",
    darkClassName: "text-gray-100 hover:bg-gray-600 border-gray-500"
  },
  HEAD:   {
    variant: "secondary",
    className: "text-pink-800 hover:bg-pink-200 border-pink-300",
    darkClassName: "text-pink-100 hover:bg-pink-800 border-pink-700"
  },
  DEFAULT:{
    variant: "secondary",
    className: "text-gray-800 hover:bg-gray-200 border-gray-300",
    darkClassName: "text-gray-100 hover:bg-gray-600 border-gray-500"
  },
};

const getMethodStyle = (method, currentTheme) => {
  const style = methodStyles[method.toUpperCase()] || methodStyles.DEFAULT;
  // Return the appropriate class based on the current theme
  return currentTheme === 'dark' ? style.darkClassName : style.className;
};


// Add this helper function at the top of the file
const getPathFromUrl = (urlString) => {
  try {
    if (!urlString) return '';
    
    // Try to parse as full URL first
    try {
      const url = new URL(urlString);
      return url.pathname;
    } catch (e) {
      // If URL parsing fails, try to extract path portion manually
      // Remove protocol and domain if they exist
      const pathStart = urlString.indexOf('/', urlString.indexOf('//') > -1 ? urlString.indexOf('//') + 2 : 0);
      if (pathStart > -1) {
        return urlString.slice(pathStart);
      }
      // If all else fails, return the original string
      return urlString;
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    return urlString;
  }
};

// Update the helper functions with theme awareness
const getStatusColor = (status, currentTheme) => {
  // Default to dark theme colors
  const colors = {
    info: currentTheme === 'light' ? '#909399' : '#a0aec0',          // Gray for unknown/informational (gray-500 / slate-400)
    success: currentTheme === 'light' ? '#22C55E' : '#67C23A',       // Green for success
    redirect: currentTheme === 'light' ? '#F59E0B' : '#E6A23C',      // Yellow for redirection
    clientError: currentTheme === 'light' ? '#EF4444' : '#F56C6C',   // Red for client errors
    serverError: currentTheme === 'light' ? '#B91C1C' : '#B71C1C'    // Dark red for server errors
  };
  
  if (!status) return colors.info;
  if (status < 200) return colors.info;
  if (status < 300) return colors.success;
  if (status < 400) return colors.redirect;
  if (status < 500) return colors.clientError;
  return colors.serverError;
};

// Add these helper functions at the top
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  try {
    // Handle different timestamp formats
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp)
      : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return null;
    }
    
    return format(date, 'HH:mm');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return null;
  }
};

// Define getInitials function
const getInitials = (user) => {
  if (!user || !user.name) return "?";
  return user.name
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const MonitoringDashboard = () => {
  const { user } = useAuth(); // Get user from context
  const { theme } = useTheme(); // Get the current theme
  
  // Helper function to get theme-dependent colors
  const getThemeColors = () => {
    const isDark = theme === 'dark';
    return {
      textColor: isDark ? '#e2e8f0' : '#374151', // text-slate-200 / text-gray-800
      axisColor: isDark ? '#a0aec0' : '#6b7280', // slate-400 / gray-500
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'transparent' : 'transparent', // Use transparent for chart background
      // Chart series colors (Tailwind equivalents)
      responseTimeColor: isDark ? '#60a5fa' : '#3b82f6', // blue-400 / blue-500
      requestCountColor: isDark ? '#4ade80' : '#22c55e', // green-400 / green-500
      errorRateColor: isDark ? '#f87171' : '#ef4444',   // red-400 / red-500
      // Area fill colors (with transparency)
      responseTimeAreaColor: isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.5)',
      errorRateAreaColor: isDark ? 'rgba(248, 113, 113, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    };
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(null); // Add state for selected environment ID
  const timeList = ['30s', '1m', '5m', '10m'];
  const [refreshRate, setRefreshRate] = useState(timeList[0]); // Default to 30s
  const [searchQuery, setSearchQuery] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  

    const handleRefreshRateChangeToggle = () =>{
    const currentIndex = timeList.indexOf(refreshRate);
    const nextIndex = (currentIndex + 1) % timeList.length; // Calculate next index, wrap around if needed
    setRefreshRate(timeList[nextIndex]);
  }

  // Add chart refs
  const [charts, setCharts] = useState({
    responseTime: null,
    requestCount: null,
    errorRate: null,
    statusDistribution: null
  });

  // Add mount state
  const [mounted, setMounted] = useState(false);
  const [collections, setCollections] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fetch collections and history with authAxios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Read currentEnvironmentId from localStorage
        const currentEnvironmentId = typeof window !== 'undefined' ? localStorage.getItem('currentEnvironmentId') : null;

        // Fetch collections including environment name, filtered by currentEnvironmentId
        const collectionsResponse = await authAxios.get('/collections', {
          params: {
            currentEnvironmentId: currentEnvironmentId // Include current environment ID from localStorage
          }
        });
        if (collectionsResponse.data) {
          setCollections(collectionsResponse.data);
        }

        // Fetch history with limit and environment filter
        const historyResponse = await authAxios.get('/history', {
          params: {
            limit: 50,
            currentEnvironmentId: selectedEnvironmentId || currentEnvironmentId // Include selected environment ID or current environment ID from localStorage
          }
        });
        if (historyResponse.data) {
          setHistory(historyResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Veri alınamadı: ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up refresh interval based on refreshRate
    const getRefreshInterval = () => {
      switch (refreshRate) {
        case '30s': return 30000;
        case '1m': return 60000;
        case '5m': return 300000;
        case '10m': return 600000;;
        default: return 30000;
      }
    };

    const interval = setInterval(fetchData, getRefreshInterval());
    return () => clearInterval(interval);
  }, [refreshRate, selectedEnvironmentId]); // Add selectedEnvironmentId to dependency array

  // Transform history data for requests table
  const requests = useMemo(() => 
    history?.map(hist => ({
      id: hist.id || hist._id,
      timestamp: format(new Date(hist.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      method: hist.method,
      endpoint: getPathFromUrl(hist.url),
      statusCode: hist.statusCode || hist.status || 200,
      responseTime: hist.responseTime || hist.duration || 0,
      responseData: hist.responseData || hist.responseBody || '', // Add response data
      responseHeaders: hist.responseHeaders || {} // Add response headers
    })) || [],
    [history]
  );

  // Transform requests data for the sidebar
  const endpoints = useMemo(() => 
    requests?.map(request => ({
      id: request.id,
      name: request.endpoint,
      service: selectedProject?.name || "Default Service",
      status: 'active', // You might want to add status to your schema
      method: request.method,
      url: request.endpoint,
      errorRate: 0 // This could be calculated from history data
    })) || [],
    [requests, selectedProject]
  );

  // Update project selection to use real collections
  const handleProjectSelect = (collectionId) => {
    // Parse collectionId to number for proper comparison, when possible
    const numericId = parseInt(collectionId, 10);
    
    // Try to find by numeric ID or string ID
    const selected = collections?.find(c => 
      c.id === numericId || 
      c._id === numericId || 
      c.id === collectionId || 
      c._id === collectionId
    );
    
    console.log("Selected collection:", selected, "from ID:", collectionId);
    setSelectedProject(selected || null);
    setSelectedEnvironmentId(selected?.EnvironmentId || null); // Store selected environment ID
    setSelectedEndpoint(null); // Reset selected endpoint when changing collection
  };

  // Filter requests based on selected endpoint
  const filteredRequests = useMemo(() => {
    if (!selectedEndpoint || !requests) return requests;
    return requests.filter(req => req.endpoint === selectedEndpoint);
  }, [selectedEndpoint, requests]);

  // Update chart initialization to use filtered requests
  useEffect(() => {
    if (!mounted || !filteredRequests) return;

    // Initialize charts only after component is mounted
    const isDark = theme === 'dark';
    const textColor = isDark ? '#e2e8f0' : '#374151';
    const axisColor = isDark ? '#a0aec0' : '#6b7280';
    const backgroundColor = isDark ? 'transparent' : 'transparent';
    
    // Initialize charts with theme
    const responseTimeChart = echarts.init(document.getElementById('response-time-chart'), null, {
      renderer: 'canvas',
      useDirtyRect: false,
      locale: 'TR'
    });
    
    const requestCountChart = echarts.init(document.getElementById('request-count-chart'), null, {
      renderer: 'canvas',
      useDirtyRect: false,
      locale: 'TR'
    });
    
    const errorRateChart = echarts.init(document.getElementById('error-rate-chart'), null, {
      renderer: 'canvas',
      useDirtyRect: false,
      locale: 'TR'
    });
    
    const statusDistributionChart = echarts.init(document.getElementById('status-distribution-chart'), null, {
      renderer: 'canvas',
      useDirtyRect: false,
      locale: 'TR'
    });

    // Store chart instances
    setCharts({
      responseTime: responseTimeChart,
      requestCount: requestCountChart,
      errorRate: errorRateChart,
      statusDistribution: statusDistributionChart
    });

    // Group requests by time for time series charts
    const timeGroups = filteredRequests.reduce((acc, req) => {
      const time = formatTimestamp(req.timestamp);
      if (!acc[time]) acc[time] = { total: 0, errors: 0, responseTimes: [] };
      acc[time].total += 1;
      if (req.statusCode >= 400) acc[time].errors += 1;
      acc[time].responseTimes.push(req.responseTime);
      return acc;
    }, {});

    const timeData = Object.keys(timeGroups).sort();
    const responseTimesData = timeData.map(time => {
      const times = timeGroups[time].responseTimes;
      return times.reduce((sum, time) => sum + time, 0) / times.length;
    });
    const requestCountData = timeData.map(time => timeGroups[time].total);
    const errorRateData = timeData.map(time => {
      const { total, errors } = timeGroups[time];
      return total > 0 ? (errors / total) * 100 : 0;
    });    // Set options for response time chart
    const themeColors = getThemeColors(); // Get theme-dependent colors

    responseTimeChart.setOption({
      animation: false,
      title: {
        text: 'Yanıt Süresi (ms)',
        left: 'center',
        textStyle: { color: themeColors.textColor }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: timeData,
        axisLabel: { color: themeColors.axisColor }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: themeColors.axisColor }
      },
      series: [{
        data: responseTimesData,
        type: 'line',
        smooth: true,
        lineStyle: { color: themeColors.responseTimeColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: themeColors.responseTimeAreaColor },
            { offset: 1, color: themeColors.responseTimeAreaColor.replace('0.5', '0.1') } // Less opaque at the bottom
          ])
        }
      }]
    });
    // Set options for request count chart
    requestCountChart.setOption({
      animation: false,
      title: {
        text: 'İstek Sayısı',
        left: "center",
        textStyle: { color: themeColors.textColor }
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: timeData,
        axisLabel: { color: themeColors.axisColor }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: themeColors.axisColor }
      },
      series: [{
        data: requestCountData,
        type: "bar",
        itemStyle: { color: themeColors.requestCountColor }
      }]
    });
    // Set options for error rate chart
    errorRateChart.setOption({
      animation: false,
      title: {
        text: 'Hata Oranı',
        left: "center",
        textStyle: { color: themeColors.textColor }
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: timeData,
        axisLabel: { color: themeColors.axisColor }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: themeColors.axisColor }
      },
      series: [{
        data: errorRateData,
        type: "line",
        smooth: true,
        lineStyle: { color: themeColors.errorRateColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: themeColors.errorRateAreaColor },
            { offset: 1, color: themeColors.errorRateAreaColor.replace('0.5', '0.1') } // Less opaque at the bottom
          ])
        }
      }]
    });

    // Calculate status distribution for selected requests
    const statusDistribution = calculateStatusDistribution(filteredRequests);

    // Set options for status distribution chart
    statusDistributionChart.setOption({
      animation: false,
      title: {
        text: 'Durum Dağılımı',
        left: "center",
        textStyle: { color: themeColors.textColor }
      },
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        left: "left",
        textStyle: { color: themeColors.axisColor }
      },
      series: [{
        type: "pie",
        radius: "70%",
        data: statusDistribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: themeColors.gridColor // Use gridColor for shadow
          }
        },
        label: { color: themeColors.textColor }
      }]
    });

    const handleResize = () => {
      responseTimeChart?.resize();
      requestCountChart?.resize();
      errorRateChart?.resize();
      statusDistributionChart?.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      responseTimeChart?.dispose();
      requestCountChart?.dispose();
      errorRateChart?.dispose();
      statusDistributionChart?.dispose();
      setCharts({
        responseTime: null,
        requestCount: null,
        errorRate: null,
        statusDistribution: null
      });
    };
  }, [mounted, filteredRequests]); // Updated dependency array

  // Helper function to calculate error rates
  const calculateErrorRates = (history) => {
    if (!history?.length) return [];
    
    const errorCounts = history.reduce((acc, item) => {
      const timestamp = format(new Date(item.timestamp), 'HH:mm');
      if (!acc[timestamp]) {
        acc[timestamp] = { total: 0, errors: 0 };
      }
      acc[timestamp].total++;
      if (item.statusCode >= 400) {
        acc[timestamp].errors++;
      }
      return acc;
    }, {});

    return Object.values(errorCounts).map(({ total, errors }) => 
      total > 0 ? (errors / total) * 100 : 0
    );
  };
  // Status distribution calculation function
  const calculateStatusDistribution = (history) => {
    if (!history?.length) return [];

    const statusCounts = history.reduce((acc, item) => {
      const status = item.statusCode || 0;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, value]) => ({
      name: `Status ${status}`,
      value,
      itemStyle: { color: getStatusColor(Number(status), theme) }
    })).sort((a, b) => Number(a.name.split(' ')[1]) - Number(b.name.split(' ')[1]));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          endpoint.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = endpointFilter === 'All' || endpoint.status === endpointFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const themeColors = getThemeColors(); // Get theme-dependent colors

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/home" className="">
              <ArrowLeft className={`h-8 w-8 ml-4 text-muted-foreground hover:text-foreground`}/>
            </Link>
            <button
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-foreground cursor-pointer !rounded-button whitespace-nowrap"
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-times'} text-lg`}></i>
            </button>
              <div className="relative">
              <Select
                value={selectedProject?.id || selectedProject?._id || ''}
                onValueChange={handleProjectSelect}
              >
                <SelectTrigger className="w-[180px] bg-input text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-1">
                  <SelectValue placeholder="Koleksiyon Seçin" />
                  <ChevronsUpDown className="h-4 w-4 ml-auto opacity-70" />
                </SelectTrigger>
                <SelectContent 
                  className="bg-input border border-border shadow-md rounded-md overflow-hidden w-[180px]" 
                  sideOffset={5} 
                  align="end"
                  position="popper"
                >
                  <SelectGroup>
                    {collections && collections.length > 0 ? (
                      collections.map(collection => (
                        <SelectItem 
                          key={collection.id || collection._id} 
                          value={collection.id || collection._id}
                          className="border w-full border-border rounded-md hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{collection.name}{collection.EnvironmentName ? ` - ${collection.EnvironmentName}` : ''}</span> {/* Display collection name and environment name */}
                            {((selectedProject?.id || selectedProject?._id) === (collection.id || collection._id)) && (
                              <Check className="h-4 w-4 ml-2 text-primary" />
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-sm text-muted-foreground">Koleksiyon bulunamadı</div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center bg-green-500 px-2 py-1 rounded-full text-xs text-white"> {/* Bağlantı durumu için sabit renk */}
              <i className="fas fa-circle text-xs mr-1"></i>
              <span>Bağlı</span>
            </div>
          </div>
          
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Endpoint Ara..."
              className="bg-input w-full rounded-md py-2 pl-10 pr-4 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-muted-foreground"></i>
          </div>
          
          <div className="flex items-center space-x-4">            <div className="relative">
              <button 
                onClick={()=> handleRefreshRateChangeToggle()} 
                className="flex items-center justify-between w-[150px] bg-input hover:bg-accent/80 rounded-md px-3 py-2 text-sm cursor-pointer text-foreground border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <span>Yenileme: {refreshRate}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-70" />
              </button>
            </div>
            
            <button className="text-muted-foreground hover:text-foreground cursor-pointer !rounded-button whitespace-nowrap">
              <i className="fas fa-bell text-lg"></i>
            </button>
            
            <button className="text-muted-foreground hover:text-foreground cursor-pointer !rounded-button whitespace-nowrap">
              <i className="fas fa-cog text-lg"></i>
            </button>
            
            {/* Profile Picture/Initials */}
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
              {user?.profileImageBase64 ? (
                <img
                  src={user.profileImageBase64}
                  alt={user.name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-semibold">{getInitials(user)}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with real endpoints */}
        <aside className={`bg-card border-r border-border ${sidebarCollapsed ? 'hidden' : 'w-64'} flex-shrink-0 flex flex-col`}>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Endpoint Ara..."
                className="bg-input w-full rounded-md py-2 pl-10 pr-4 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-muted-foreground"></i>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setEndpointFilter('All')}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setEndpointFilter('Active')}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'Active' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Aktif
              </button>
              <button
                onClick={() => setEndpointFilter('Inactive')}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'Inactive' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Pasif
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedProject.name}
                </h3>
                <ul className="mt-2 space-y-1">
                  {filteredEndpoints.map(endpoint => (
                    <li key={endpoint.id}>
                      <button
                        onClick={() => setSelectedEndpoint(endpoint.name)}
                        className={`flex items-center justify-between w-full px-2 py-2 text-sm rounded-md ${
                          selectedEndpoint === endpoint.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: getStatusColor(200, theme) }}></div> {/* Use getStatusColor for active status */}
                          <span>{endpoint.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                            {endpoint.method}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="px-4 py-2 text-muted-foreground">
                Endpoint'leri görüntülemek için koleksiyon seçin
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {mounted && ( // Only render charts when mounted
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-lg p-4 shadow-lg">
                <div id="response-time-chart" className="h-80 w-full"></div>
              </div>
              
              <div className="bg-card rounded-lg p-4 shadow-lg">
                <div id="request-count-chart" className="h-80 w-full"></div>
              </div>
            </div>
          )}

          {mounted && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-card rounded-lg p-4 shadow-lg">
                <div id="error-rate-chart" className="h-80 w-full"></div>
              </div>
              
              <div className="bg-card rounded-lg p-4 shadow-lg">
                <div id="status-distribution-chart" className="h-80 w-full"></div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Zaman</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Metod</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Yanıt Süresi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map(request => (
                  <tr key={request.id} className="hover:bg-accent">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{request.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="relative inline-block">
                        <Badge
                          variant="secondary"
                          className={`w-14 h-14 flex-shrink-0 ${getMethodStyle(request.method, theme)}`}
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          {request.method.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{request.endpoint}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}
                        style={{
                          backgroundColor: `${getStatusColor(request.statusCode, theme)}20`, // Add transparency and pass theme
                          color: getStatusColor(request.statusCode, theme) // Pass theme
                        }}>
                        {request.statusCode || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{request.responseTime} ms</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 mr-3"
                        onClick={() => {
                          // Show response data in a dialog or modal
                          try {
                            const responseData = request.responseData
                              ? JSON.parse(request.responseData)
                              : null;
                            const headers = request.responseHeaders
                              ? JSON.parse(request.responseHeaders)
                              : {};
                            console.log('Response Data:', responseData);
                            console.log('Headers:', headers);
                            // You can add a modal/dialog here to show the data
                            toast.info("Yanıt Verisi", {
                              description: <pre className="max-h-60 overflow-auto">
                                {JSON.stringify(responseData, null, 2)}
                              </pre>
                            });
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            toast.error("Yanıt verisi ayrıştırılırken hata oluştu");
                          }
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          // Download response data
                          const blob = new Blob([request.responseData], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `response-${request.id}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <i className="fas fa-download"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
