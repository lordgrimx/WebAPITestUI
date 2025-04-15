"use client";

import React, { useState, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
// import { useQuery } from "convex/react"; // Kaldırıldı
// import { api } from "@/convex/_generated/api"; // Kaldırıldı
import { format } from "date-fns";
import { Button } from '../ui/button'; // Replace with actual UI library
import { toast } from 'sonner'; // sonner kullanılıyor, react-toastify değil
import { authAxios } from "@/lib/auth-context"; // Auth context'ten axios instance'ı import et

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

// Update the helper functions
const getStatusColor = (status) => {
  if (!status) return '#909399'; // Gray for unknown
  if (status < 200) return '#909399'; // Gray for informational
  if (status < 300) return '#67C23A'; // Green for success
  if (status < 400) return '#E6A23C'; // Yellow for redirection
  if (status < 500) return '#F56C6C'; // Red for client errors
  return '#B71C1C'; // Dark red for server errors
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

const MonitoringDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshRate, setRefreshRate] = useState('30s');
  const [searchQuery, setSearchQuery] = useState('');
  const [endpointFilter, setEndpointFilter] = useState('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  // Add chart refs
  const [charts, setCharts] = useState({
    responseTime: null,
    requestCount: null,
    errorRate: null,
    statusDistribution: null
  });

  // Add mount state
  const [mounted, setMounted] = useState(false);

  // Add mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // State for collections and history
  const [collections, setCollections] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // TODO: Backend'den koleksiyonları ve geçmişi çek
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // const collectionsResponse = await authAxios.get('/Collections'); // Örnek endpoint
        // setCollections(collectionsResponse.data || []);
        console.log("TODO: Fetch collections from backend");
        setCollections([{ _id: 'dummy_coll_1', name: 'Dummy Collection 1' }]); // Geçici data

        // const historyResponse = await authAxios.get('/History?limit=50'); // Örnek endpoint
        // setHistory(historyResponse.data || []);
        console.log("TODO: Fetch history from backend");
        // Geçici dummy history data
        setHistory([
          { _id: 'hist1', timestamp: Date.now() - 10000, method: 'GET', url: '/api/users', status: 200, duration: 150, responseData: '{"users":[]}', responseHeaders: '{}' },
          { _id: 'hist2', timestamp: Date.now() - 5000, method: 'POST', url: '/api/login', status: 401, duration: 80, responseData: '{"error":"Unauthorized"}', responseHeaders: '{}' }
        ]);

      } catch (error) {
        console.error("Error fetching monitoring data:", error);
        toast.error("Failed to load monitoring data");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
    // TODO: Refresh interval ekle (refreshRate state'ine göre)
  }, [refreshRate]); // refreshRate değiştiğinde tekrar çek

  // Transform history data for requests table
  const requests = useMemo(() =>
    history?.map(hist => ({
      id: hist._id, // Backend'den gelen ID'yi kullan
      timestamp: hist.timestamp, // Backend'den gelen timestamp'i kullan (formatlama sonra yapılacak)
      method: hist.method,
      endpoint: getPathFromUrl(hist.url), // URL'den path'i al
      statusCode: hist.status || 0, // Backend'den gelen status kodunu kullan
      responseTime: hist.duration || 0, // Backend'den gelen süreyi kullan
      responseData: hist.responseData,
      responseHeaders: hist.responseHeaders
    })) || [],
    [history] // history state'ine bağımlı
  );

  // Transform requests data for the sidebar
  const endpoints = useMemo(() => 
    // requests state'ini kullan
    requests.map(request => ({
      id: request.id,
      name: request.endpoint,
      service: selectedProject?.name || "Default Service", // selectedProject state'ini kullan
      status: 'active', // TODO: Backend'den endpoint durumu alınabilir
      method: request.method,
      url: request.endpoint,
      errorRate: 0 // This could be calculated from history data
    })) || [],
    [requests, selectedProject] // requests ve selectedProject state'lerine bağımlı
  );

  // Update project selection to use real collections
  const handleProjectSelect = (collectionId) => {
    const selected = collections.find(c => c._id === collectionId); // collections state'ini kullan
    setSelectedProject(selected || null); // selectedProject state'ini güncelle
    setSelectedEndpoint(null); // selectedEndpoint state'ini sıfırla
  };

  // Filter requests based on selected endpoint
  const filteredRequests = useMemo(() => {
    if (!selectedEndpoint) return requests; // Tüm requestleri döndür
    return requests.filter(req => req.endpoint === selectedEndpoint); // requests state'ini filtrele
  }, [selectedEndpoint, requests]); // selectedEndpoint ve requests state'lerine bağımlı

  // Update chart initialization to use filtered requests
  useEffect(() => {
    if (!mounted || !filteredRequests) return;

    // Initialize charts only after component is mounted
    const responseTimeChart = echarts.init(document.getElementById('response-time-chart'));
    const requestCountChart = echarts.init(document.getElementById('request-count-chart'));
    const errorRateChart = echarts.init(document.getElementById('error-rate-chart'));
    const statusDistributionChart = echarts.init(document.getElementById('status-distribution-chart'));

    // Store chart instances
    setCharts({
      responseTime: responseTimeChart,
      requestCount: requestCountChart,
      errorRate: errorRateChart,
      statusDistribution: statusDistributionChart
    });

    // Group requests by time for time series charts
    const timeGroups = filteredRequests.reduce((acc, req) => {
      const time = formatTimestamp(req.timestamp); // timestamp'i formatla
      if (time) { // Geçerli zaman damgası varsa işle
          if (!acc[time]) acc[time] = { total: 0, errors: 0, responseTimes: [] };
          acc[time].total += 1;
          if (req.statusCode >= 400) acc[time].errors += 1;
          acc[time].responseTimes.push(req.responseTime);
      } else {
          console.warn("Skipping request with invalid timestamp:", req);
      }
      return acc;
    }, {});
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

    // Set options for response time chart
    responseTimeChart.setOption({
      animation: false,
      title: {
        text: 'Response Time (ms)',
        left: 'center',
        textStyle: { color: '#e2e8f0' }
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: timeData,
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#a0aec0' }
      },
      series: [{
        data: responseTimesData,
        type: 'line',
        smooth: true,
        lineStyle: { color: '#4299e1' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(66, 153, 225, 0.5)' },
            { offset: 1, color: 'rgba(66, 153, 225, 0.1)' }
          ])
        }
      }]
    });

    // Set options for request count chart
    requestCountChart.setOption({
      animation: false,
      title: {
        text: "Request Count",
        left: "center",
        textStyle: { color: "#e2e8f0" }
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: timeData,
        axisLabel: { color: "#a0aec0" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#a0aec0" }
      },
      series: [{
        data: requestCountData,
        type: "bar",
        itemStyle: { color: "#48bb78" }
      }]
    });

    // Set options for error rate chart
    errorRateChart.setOption({
      animation: false,
      title: {
        text: "Error Rate (%)",
        left: "center",
        textStyle: { color: "#e2e8f0" }
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: timeData,
        axisLabel: { color: "#a0aec0" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#a0aec0" }
      },
      series: [{
        data: errorRateData,
        type: "line",
        smooth: true,
        lineStyle: { color: "#f56565" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(245, 101, 101, 0.5)" },
            { offset: 1, color: "rgba(245, 101, 101, 0.1)" }
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
        text: "Status Code Distribution",
        left: "center",
        textStyle: { color: "#e2e8f0" }
      },
      tooltip: { trigger: "item" },
      legend: {
        orient: "vertical",
        left: "left",
        textStyle: { color: "#a0aec0" }
      },
      series: [{
        type: "pie",
        radius: "70%",
        data: statusDistribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: { color: "#e2e8f0" }
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

  // Inside the calculateStatusDistribution function, replace with:
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
      itemStyle: { color: getStatusColor(Number(status)) }
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

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar} 
              className="text-gray-400 hover:text-white cursor-pointer !rounded-button whitespace-nowrap"
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-times'} text-lg`}></i>
            </button>
            
            <div className="relative">
              <select
                className="bg-gray-700 rounded-md px-3 py-2"
                value={selectedProject?._id || ''}
                onChange={(e) => handleProjectSelect(e.target.value)}
              >
                <option value="">Select Collection</option>
                {isLoadingData ? (
                  <option disabled>Loading...</option>
                ) : (
                  collections.map(collection => ( // collections state'ini kullan
                    <option key={collection._id} value={collection._id}>
                      {collection.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center bg-green-500 px-2 py-1 rounded-full text-xs">
              {isLoadingData ? (
                 <>
                   <i className="fas fa-spinner fa-spin text-xs mr-1"></i>
                   <span>Loading...</span>
                 </>
              ) : (
                 <>
                   <i className="fas fa-circle text-xs mr-1"></i>
                   <span>Connected</span>
                 </>
              )}
                ))}
              </select>
            </div>
            
            <div className="flex items-center bg-green-500 px-2 py-1 rounded-full text-xs">
              <i className="fas fa-circle text-xs mr-1"></i>
              <span>Connected</span>
            </div>
          </div>
          
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search endpoints, services..."
              className="bg-gray-700 w-full rounded-md py-2 pl-10 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center bg-gray-700 hover:bg-gray-600 rounded-md px-3 py-2 text-sm cursor-pointer !rounded-button whitespace-nowrap">
                <span>Refresh: {refreshRate}</span>
                <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
            </div>
            
            <button className="text-gray-400 hover:text-white cursor-pointer !rounded-button whitespace-nowrap">
              <i className="fas fa-bell text-lg"></i>
            </button>
            
            <button className="text-gray-400 hover:text-white cursor-pointer !rounded-button whitespace-nowrap">
              <i className="fas fa-cog text-lg"></i>
            </button>
            
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-semibold">JD</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with real endpoints */}
        <aside className={`bg-gray-800 border-r border-gray-700 ${sidebarCollapsed ? 'hidden' : 'w-64'} flex-shrink-0 flex flex-col`}>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search endpoints..."
                className="bg-gray-700 w-full rounded-md py-2 pl-10 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => setEndpointFilter('All')} 
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'All' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setEndpointFilter('Active')} 
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'Active' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setEndpointFilter('Inactive')} 
                className={`px-3 py-1 text-xs rounded-full cursor-pointer !rounded-button whitespace-nowrap ${endpointFilter === 'Inactive' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Inactive
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {selectedProject ? (
              <div className="px-4 py-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {selectedProject.name}
                </h3>
                <ul className="mt-2 space-y-1">
                  {filteredEndpoints.map(endpoint => (
                    <li key={endpoint.id}>
                      <button 
                        onClick={() => setSelectedEndpoint(endpoint.name)}
                        className={`flex items-center justify-between w-full px-2 py-2 text-sm rounded-md ${
                          selectedEndpoint === endpoint.name ? 'bg-gray-700' : 'hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full mr-2 bg-green-500"></div>
                          <span>{endpoint.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700">
                            {endpoint.method}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="px-4 py-2 text-gray-400">
                Select a collection to view endpoints
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6">
          {mounted && ( // Only render charts when mounted
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <div id="response-time-chart" className="h-80 w-full"></div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <div id="request-count-chart" className="h-80 w-full"></div>
              </div>
            </div>
          )}

          {mounted && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <div id="error-rate-chart" className="h-80 w-full"></div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
                <div id="status-distribution-chart" className="h-80 w-full"></div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoadingData ? (
                  <tr><td colSpan="6" className="text-center py-4">Loading request history...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4">No requests found for this selection.</td></tr>
                ) : (
                  filteredRequests.map(request => ( // filteredRequests kullan
                    <tr key={request.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(request.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td> {/* Formatlama burada */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.method === 'GET' ? 'bg-green-100 text-green-800' :
                          request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800' // Diğer metodlar için
                      }`}>
                        {request.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{request.endpoint}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} 
                        style={{ 
                          backgroundColor: `${getStatusColor(request.statusCode)}20`, // Add transparency
                          color: getStatusColor(request.statusCode) 
                        }}>
                        {request.statusCode || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{request.responseTime} ms</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 mr-3"
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
                            toast.info("Response Data", {
                              description: <pre className="max-h-60 overflow-auto">
                                {JSON.stringify(responseData, null, 2)}
                              </pre>
                            });
                          } catch (error) {
                            console.error('Error parsing response:', error);
                            toast.error("Error parsing response data");
                          }
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-300"
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
