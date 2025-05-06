"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import { format } from "date-fns";
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { authAxios, useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ArrowLeft, Badge, ChevronsUpDown, Check, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  return currentTheme === 'dark' ? style.darkClassName : style.className;
};

const getPathFromUrl = (urlString) => {
  try {
    if (!urlString) return '';
    try {
      const url = new URL(urlString);
      return url.pathname;
    } catch (e) {
      const pathStart = urlString.indexOf('/', urlString.indexOf('//') > -1 ? urlString.indexOf('//') + 2 : 0);
      if (pathStart > -1) {
        return urlString.slice(pathStart);
      }
      return urlString;
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    return urlString;
  }
};

const getStatusColor = (status, currentTheme) => {
  const colors = {
    info: currentTheme === 'light' ? '#909399' : '#a0aec0',
    success: currentTheme === 'light' ? '#22C55E' : '#67C23A',
    redirect: currentTheme === 'light' ? '#F59E0B' : '#E6A23C',
    clientError: currentTheme === 'light' ? '#EF4444' : '#F56C6C',
    serverError: currentTheme === 'light' ? '#B91C1C' : '#B71C1C'
  };
  
  if (!status) return colors.info;
  if (status < 200) return colors.info;
  if (status < 300) return colors.success;
  if (status < 400) return colors.redirect;
  if (status < 500) return colors.clientError;
  return colors.serverError;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  try {
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp)
      : new Date(timestamp);
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
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const getThemeColors = () => {
    const isDark = theme === 'dark';
    return {
      textColor: isDark ? '#e2e8f0' : '#374151',
      axisColor: isDark ? '#a0aec0' : '#6b7280',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: isDark ? 'transparent' : 'transparent',
      responseTimeColor: isDark ? '#60a5fa' : '#3b82f6',
      requestCountColor: isDark ? '#4ade80' : '#22c55e',
      errorRateColor: isDark ? '#f87171' : '#ef4444',
      responseTimeAreaColor: isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.5)',
      errorRateAreaColor: isDark ? 'rgba(248, 113, 113, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    };
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(null);
  const timeList = ['30s', '1m', '5m', '10m'];
  const [refreshRate, setRefreshRate] = useState(timeList[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('monitoring-sidebar');
      const sidebarToggle = document.getElementById('sidebar-toggle');
      
      if (isMobile && sidebarOpen && 
          sidebar && !sidebar.contains(event.target) &&
          sidebarToggle && !sidebarToggle.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  const handleRefreshRateChangeToggle = () => {
    const currentIndex = timeList.indexOf(refreshRate);
    const nextIndex = (currentIndex + 1) % timeList.length;
    setRefreshRate(timeList[nextIndex]);
  };

  const [charts, setCharts] = useState({
    responseTime: null,
    requestCount: null,
    errorRate: null,
    statusDistribution: null
  });

  const [mounted, setMounted] = useState(false);
  const [collections, setCollections] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentEnvironmentId = typeof window !== 'undefined' ? localStorage.getItem('currentEnvironmentId') : null;

        const collectionsResponse = await authAxios.get('/collections', {
          params: {
            currentEnvironmentId: currentEnvironmentId
          }
        });
        if (collectionsResponse.data) {
          setCollections(collectionsResponse.data);
        }

        const historyResponse = await authAxios.get('/history', {
          params: {
            limit: 50,
            currentEnvironmentId: selectedEnvironmentId || currentEnvironmentId
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
  }, [refreshRate, selectedEnvironmentId]);

  const requests = useMemo(() => 
    history?.map(hist => ({
      id: hist.id || hist._id,
      timestamp: format(new Date(hist.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      method: hist.method,
      endpoint: getPathFromUrl(hist.url),
      statusCode: hist.statusCode || hist.status || 200,
      responseTime: hist.responseTime || hist.duration || 0,
      responseData: hist.responseData || hist.responseBody || '',
      responseHeaders: hist.responseHeaders || {}
    })) || [],
    [history]
  );

  const endpoints = useMemo(() => 
    requests?.map(request => ({
      id: request.id,
      name: request.endpoint,
      service: selectedProject?.name || "Default Service",
      status: 'active',
      method: request.method,
      url: request.endpoint,
      errorRate: 0
    })) || [],
    [requests, selectedProject]
  );

  const handleProjectSelect = (collectionId) => {
    const numericId = parseInt(collectionId, 10);
    const selected = collections?.find(c => 
      c.id === numericId || 
      c._id === numericId || 
      c.id === collectionId || 
      c._id === collectionId
    );
    setSelectedProject(selected || null);
    setSelectedEnvironmentId(selected?.EnvironmentId || null);
    setSelectedEndpoint(null);
  };

  const filteredRequests = useMemo(() => {
    if (!selectedEndpoint || !requests) return requests;
    return requests.filter(req => req.endpoint === selectedEndpoint);
  }, [selectedEndpoint, requests]);

  useEffect(() => {
    if (!mounted || !filteredRequests) return;

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

    setCharts({
      responseTime: responseTimeChart,
      requestCount: requestCountChart,
      errorRate: errorRateChart,
      statusDistribution: statusDistributionChart
    });

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
    });

    const themeColors = getThemeColors();

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
            { offset: 1, color: themeColors.responseTimeAreaColor.replace('0.5', '0.1') }
          ])
        }
      }]
    });

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
            { offset: 1, color: themeColors.errorRateAreaColor.replace('0.5', '0.1') }
          ])
        }
      }]
    });

    const statusDistribution = calculateStatusDistribution(filteredRequests);

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
            shadowColor: themeColors.gridColor
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
  }, [mounted, filteredRequests]);

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

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          endpoint.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = endpointFilter === 'All' || endpoint.status === endpointFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const themeColors = getThemeColors();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border py-2 sm:py-3 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/home" className="text-blue-400 hover:text-blue-700">
              <ArrowLeft className="h-5 sm:h-8 w-5 sm:w-8 ml-2 sm:ml-4"/>
            </Link>
            <button
              id="sidebar-toggle"
              onClick={toggleSidebar}
              className="p-1 sm:p-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? 
                <X className="h-5 w-5 sm:h-6 sm:w-6" /> : 
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              }
            </button>
            <div className="relative">
              <Select
                value={selectedProject?.id || selectedProject?._id || ''}
                onValueChange={handleProjectSelect}
              >
                <SelectTrigger className="w-[140px] sm:w-[180px] text-xs sm:text-sm bg-input text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-1">
                  <SelectValue placeholder="Koleksiyon" className="truncate" />
                  <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 ml-auto opacity-70" />
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
                            <span className="truncate text-xs sm:text-sm">
                              {collection.name}
                              {collection.EnvironmentName ? ` - ${collection.EnvironmentName}` : ''}
                            </span>
                            {((selectedProject?.id || selectedProject?._id) === (collection.id || collection._id)) && (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-xs sm:text-sm text-muted-foreground">Koleksiyon bulunamadı</div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center bg-green-500 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs text-white">
              <i className="fas fa-circle text-[8px] sm:text-xs mr-1"></i>
              <span className="whitespace-nowrap">Bağlı</span>
            </div>
          </div>
          <div className="relative hidden md:block w-1/3">
            <input
              type="text"
              placeholder="Endpoint Ara..."
              className="bg-input w-full rounded-md py-1.5 sm:py-2 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute left-2 sm:left-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm"></i>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden sm:block">
              <button 
                onClick={handleRefreshRateChangeToggle} 
                className="flex items-center justify-between w-[100px] sm:w-[150px] bg-input hover:bg-accent/80 rounded-md px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm cursor-pointer text-foreground border border-border focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <span>Yenileme: {refreshRate}</span>
                <ChevronsUpDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
              </button>
            </div>
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground overflow-hidden">
              {user?.profileImageBase64 ? (
                <img
                  src={user.profileImageBase64}
                  alt={user.name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs sm:text-sm font-semibold">{getInitials(user)}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside 
          id="monitoring-sidebar"
          className={`${
            sidebarOpen 
              ? 'translate-x-0 opacity-100' 
              : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'
          } transform transition-all duration-300 bg-card border-r border-border md:w-64 w-[80%] max-w-xs absolute md:static inset-y-0 left-0 z-30 md:z-auto flex-shrink-0 flex flex-col h-full`}
        >
          <div className="p-3 sm:p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Endpoint Ara..."
                className="bg-input w-full rounded-md py-1.5 sm:py-2 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-2 sm:left-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm"></i>
            </div>
            <div className="mt-3 sm:mt-4 flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setEndpointFilter('All')}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full cursor-pointer whitespace-nowrap ${endpointFilter === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setEndpointFilter('Active')}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full cursor-pointer whitespace-nowrap ${endpointFilter === 'Active' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Aktif
              </button>
              <button
                onClick={() => setEndpointFilter('Inactive')}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-full cursor-pointer whitespace-nowrap ${endpointFilter === 'Inactive' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}
              >
                Pasif
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="px-3 sm:px-4 py-2">
                <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {selectedProject.name}
                </h3>
                <ul className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                  {filteredEndpoints.map(endpoint => (
                    <li key={endpoint.id}>
                      <button
                        onClick={() => {
                          setSelectedEndpoint(endpoint.name);
                          if (isMobile) setSidebarOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md ${
                          selectedEndpoint === endpoint.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full mr-1.5 sm:mr-2" style={{ backgroundColor: getStatusColor(200, theme) }}></div>
                          <span className="truncate max-w-[150px]">{endpoint.name}</span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-secondary text-secondary-foreground">
                            {endpoint.method}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-muted-foreground">
                Endpoint'leri görüntülemek için koleksiyon seçin
              </div>
            )}
          </div>
        </aside>
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
        <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-6">
          {mounted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
              <div className="bg-card rounded-lg p-2 sm:p-4 shadow-md sm:shadow-lg">
                <div id="response-time-chart" className="h-60 sm:h-80 w-full"></div>
              </div>
              <div className="bg-card rounded-lg p-2 sm:p-4 shadow-md sm:shadow-lg">
                <div id="request-count-chart" className="h-60 sm:h-80 w-full"></div>
              </div>
            </div>
          )}
          {mounted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-3 sm:mb-6">
              <div className="bg-card rounded-lg p-2 sm:p-4 shadow-md sm:shadow-lg">
                <div id="error-rate-chart" className="h-60 sm:h-80 w-full"></div>
              </div>
              <div className="bg-card rounded-lg p-2 sm:p-4 shadow-md sm:shadow-lg">
                <div id="status-distribution-chart" className="h-60 sm:h-80 w-full"></div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Zaman</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Metod</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Endpoint</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Durum</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">Yanıt Süresi</th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map(request => (
                  <tr key={request.id} className="hover:bg-accent">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-foreground">{request.timestamp}</td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-foreground">
                      <div className="relative inline-block">
                        <Badge
                          variant="secondary"
                          className={`w-10 h-5 sm:w-14 sm:h-7 flex-shrink-0 ${getMethodStyle(request.method, theme)}`}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs">
                          {request.method.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-foreground">
                      <div className="max-w-[100px] sm:max-w-[200px] truncate">
                        {request.endpoint}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-foreground">
                      <span className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-5 font-semibold rounded-full`}
                        style={{
                          backgroundColor: `${getStatusColor(request.statusCode, theme)}20`,
                          color: getStatusColor(request.statusCode, theme)
                        }}>
                        {request.statusCode || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm text-foreground">{request.responseTime} ms</td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-[11px] sm:text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-primary hover:text-primary/80 mr-1 sm:mr-3"
                        onClick={() => {
                          try {
                            const responseData = request.responseData
                              ? JSON.parse(request.responseData)
                              : null;
                            const headers = request.responseHeaders
                              ? JSON.parse(request.responseHeaders)
                              : {};
                            console.log('Response Data:', responseData);
                            console.log('Headers:', headers);
                            toast.info("Yanıt Verisi", {
                              description: <pre className="max-h-60 overflow-auto text-[10px] sm:text-xs">
                                {JSON.stringify(responseData, null, 2)}
                              </pre>
                            });
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            toast.error("Yanıt verisi ayrıştırılırken hata oluştu");
                          }
                        }}
                      >
                        <i className="fas fa-eye text-[11px] sm:text-sm"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          const blob = new Blob([request.responseData], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `response-${request.id}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <i className="fas fa-download text-[11px] sm:text-sm"></i>
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
