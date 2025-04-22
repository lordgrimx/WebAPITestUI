"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react"; // Add useEffect
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { authAxios } from "@/lib/auth-context";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings-context"; // Import the settings hook
import { useTheme } from "next-themes"; // Import the theme hook
import { useEnvironment } from "@/lib/environment-context"; // Import our new environment context
import { useRouter, useSearchParams } from 'next/navigation'; // URL parametreleri için
// Proxy için https-proxy-agent gerekebilir, ancak bunu API rotasında kullanacağız.

import CollectionsSidebar from "./CollectionsSidebar";
import RequestBuilder from "./RequestBuilder";
import ResponseDisplay from "./ResponseDisplay";
import Header from "../Header";
import ImportDataModal from "../ImportDataModal";
export default function ApiTester() {
  const { settings } = useSettings(); // Get settings from context
  const { currentEnvironment, environments, isEnvironmentLoading, triggerEnvironmentChange, setCurrentEnvironmentById } = useEnvironment(); // Use our environment context with all needed variables
  const [selectedRequestId, setSelectedRequestId] = useState(null);  
  const [currentUserID, setCurrentUserID] = useState(null); // State to hold current user ID
  const [responseData, setResponseData] = useState(null); // Initialize as null
  const [error, setError] = useState(null); // General request error state
  const [sidebarError, setSidebarError] = useState(null); // Specific error for sidebar loading
  const [currentRequestData, setCurrentRequestData] = useState(null); // State to hold current request builder data
  const [initialDataFromHistory, setInitialDataFromHistory] = useState(null); // State to hold data from selected history item
  const { theme, setTheme } = useTheme(); // Use the theme hook instead of local state
  const isDarkMode = theme === 'dark'; // Derive dark mode from theme 
  const [authToken, setAuthToken] = useState('');
  const [historyUpdated, setHistoryUpdated] = useState(0); // Add this new state
  const [environmentChangedTimestamp, setEnvironmentChangedTimestamp] = useState(Date.now()); // Add state for environment changes
  
  // Import modalı için state'ler
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Listen for history updates to refresh environment if needed
  useEffect(() => {
    // When history is updated, trigger an environment refresh
    // This ensures environment is reloaded after any operations that might change it
    triggerEnvironmentChange();
  }, [historyUpdated, triggerEnvironmentChange]);
    // URL'den paylaşılan verileri alıp analiz eden useEffect
  useEffect(() => {
    const importDataParam = searchParams.get('importData');
    
    if (importDataParam) {
      try {
        // URL'den veriyi çözümle (decode)
        const jsonString = decodeURIComponent(atob(importDataParam));
        const parsedData = JSON.parse(jsonString);
        
        console.log("Found import data in URL:", parsedData);
        
        // Import verisini ve modalı göster
        setImportData(parsedData);
        setShowImportModal(true);
        
        // URL'den import parametresini temizle (sayfa yenilendiğinde tekrar gösterilmemesi için)
        // Bu URL'yi temizler ama modal açık kalır
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('importData');
          router.replace(url.pathname + url.search);
        }
      } catch (error) {
        console.error("Failed to parse import data:", error);
        toast.error("Invalid import data", { description: "The shared link contains invalid data." });
      }
    }
  }, [searchParams, router]);

  // Listen for environment changes to update headers and other environment-dependent data
  useEffect(() => {
    if (currentEnvironment && currentRequestData) {
      // When environment changes, update request data with environment-specific values
      // This ensures headers and other settings are updated when environment changes
      console.log("Environment changed, updating request data...");
      
      // We'll handle the specifics in the RequestBuilder component
      // Just force a re-render here by setting key in the component
    }
  }, [currentEnvironment, currentRequestData]);

  // Listen for environment changes to trigger sidebar refresh
  useEffect(() => {
    console.log("Environment context changed in ApiTester, updating timestamp.");
    setEnvironmentChangedTimestamp(Date.now()); // Update timestamp when environment changes
  }, [currentEnvironment]); // Depend only on currentEnvironment

  // Test execution helper function
  const runTests = (testScript, environment) => {
    const results = [];
    
    // Create Postman-like test environment
    const pm = {
      response: environment.response,
      test: (testName, testFunction) => {
        try {
          // Create an expectation object similar to Chai
          const expect = (actual) => ({
            to: {
              equal: (expected) => {
                if (actual === expected) return true;
                throw new Error(`Expected ${expected} but got ${actual}`);
              },
              include: (expected) => {
                if (String(actual).includes(expected)) return true;
                throw new Error(`Expected "${actual}" to include "${expected}"`);
              },
              have: {
                property: (prop) => {
                  if (actual && typeof actual === 'object' && prop in actual) return true;
                  throw new Error(`Expected object to have property "${prop}"`);
                }
              }
            },
            be: {
              above: (expected) => {
                if (actual > expected) return true;
                throw new Error(`Expected ${actual} to be above ${expected}`);
              },
              below: (expected) => {
                if (actual < expected) return true;
                throw new Error(`Expected ${actual} to be below ${expected}`);
              }
            }
          });

          // Execute the test
          testFunction();
          results.push({ name: testName, passed: true });
        } catch (error) {
          results.push({ name: testName, passed: false, error: error.message });
        }
      },
      expect: (actual) => ({
        to: {
          equal: (expected) => {
            if (actual === expected) return true;
            throw new Error(`Expected ${expected} but got ${actual}`);
          },
          include: (expected) => {
            if (String(actual).includes(expected)) return true;
            throw new Error(`Expected "${actual}" to include "${expected}"`);
          },
          have: {
            property: (prop) => {
              if (actual && typeof actual === 'object' && prop in actual) return true;
              throw new Error(`Expected object to have property "${prop}"`);
            },
            header: (header) => {
              if (environment.response.headers.get(header)) return true;
              throw new Error(`Expected response to have header "${header}"`);
            }
          }
        },
        be: {
          above: (expected) => {
            if (actual > expected) return true;
            throw new Error(`Expected ${actual} to be above ${expected}`);
          },
          below: (expected) => {
            if (actual < expected) return true;
            throw new Error(`Expected ${actual} to be below ${expected}`);
          }
        }
      })
    };

    // Execute the test script
    try {
      // Safely evaluate the test script
      const scriptWithContext = `
        (function(pm) {
          ${testScript}
        })(pm);
      `;
      eval(scriptWithContext);
    } catch (error) {
      results.push({
        name: "Script error",
        passed: false,
        error: error.message
      });
    }

    return results;
  };

  // Function to record history using the backend API with proper token handling
  const recordHistory = async (historyData) => {
    try {
      // Transform the data to match RecordHistoryDto structure exactly
      const payload = {
        method: historyData.method,
        url: historyData.url,
        statusCode: historyData.status,
        duration: historyData.duration,
        size: historyData.responseSize,
        requestHeaders: {},  // Initialize empty object
        responseHeaders: {}, // Initialize empty object
        requestBody: "",     // Initialize empty string
        responseBody: historyData.responseData,
        requestId: historyData.requestId || null,
        environmentId: currentEnvironment?.id || null // Add current environment ID
      };

      // Parse headers if they exist
      if (historyData.responseHeaders) {
        try {
          payload.responseHeaders = typeof historyData.responseHeaders === 'string' 
            ? JSON.parse(historyData.responseHeaders)
            : historyData.responseHeaders;
        } catch (e) {
          console.warn('Failed to parse response headers:', e);
        }
      }

      console.log("Sending history payload:", payload); // Debug log

      const response = await authAxios.post('/history', payload);
      
      if (response.data) {
        toast.success("Request recorded in history");
        setHistoryUpdated(prev => prev + 1); // Trigger history refresh
        return response.data;
      }
    } catch (error) {
      console.error("Error recording history:", error);
      console.error("Failed payload:", payload); // Debug log
      toast.error("Failed to record history: " + (error.response?.data?.message || error.message));
    }
  };

  // Update token persistence with safety check
  const updateAuthToken = useCallback((token) => {
    setAuthToken(token);
    if (typeof window !== 'undefined') { // Check if we're on client side
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // Memoize the request data handler - This function will be passed to RequestBuilder
  const handleRequestDataChange = useCallback((data) => {
    requestAnimationFrame(() => {
      setCurrentRequestData(data); // Update the state in ApiTester
    });
  }, []);

  // Memoize the response handler
  const handleSendRequest = useCallback(async (requestData) => {
    const startTime = Date.now();
    // Extract request data including auth details - Moved outside try block
    const { method, url, headers: requestHeaders, body: requestBody, params, auth } = requestData;

    try {
      setResponseData(null); // Reset response before sending
      setError(null); // Clear previous errors
      console.log("Sending request with settings:", requestData, settings);

      // URL kontrolü yap - Moved inside try block for early exit on error
      if (!url || typeof url !== 'string' || !url.trim()) {
        console.error("URL tanımlı değil veya geçersiz:", url);
        throw new Error("URL tanımlı değil veya geçersiz. Lütfen geçerli bir URL girin.");
      }

      // --- Proxy Logic ---
      let targetUrl = url;
      let requestPayload = { ...requestData }; // Copy original request data
      let axiosConfig = {}; // Initialize config

      if (settings.proxyEnabled && settings.proxyUrl) {
        console.log("Proxy enabled. Sending request via backend proxy route.");
        targetUrl = '/proxy'; // Target the backend proxy route
        // Prepare payload for the proxy route
        requestPayload = {
          originalRequest: {
            method,
            url, // Original target URL
            headers: requestHeaders || {},
            params: params || {},
            body: requestBody,
            auth // Include auth details for the proxy route to handle if needed (e.g., proxy auth)
          },
          proxySettings: {
            url: settings.proxyUrl,
            username: settings.proxyUsername,
            password: settings.proxyPassword,
          }
        };
        // The proxy route will handle the actual method, headers, params, body for the target API
        axiosConfig = {
          method: 'POST', // Always POST to the proxy route
          url: targetUrl,
          data: requestPayload, // Send the combined payload
          headers: { 'Content-Type': 'application/json' }, // Ensure correct content type for proxy route
          timeout: settings.requestTimeout, // Apply timeout to the proxy request itself
        };

      } else {
        console.log("Proxy disabled. Sending request directly.");
        // Prepare direct axios config, starting with headers from RequestBuilder
        let finalAxiosHeaders = { ...(requestHeaders || {}) }; // Start with headers from RequestBuilder (includes defaults + manual)
        let finalAxiosParams = { ...(params || {}) }; // Start with params from RequestBuilder

        console.log("Initial headers before ApiTester auth logic:", finalAxiosHeaders);

        // --- Authentication Logic (Only for Direct Requests) ---
        // Apply auth logic, potentially modifying finalAxiosHeaders or finalAxiosParams
        if (auth && auth.type && auth.type !== 'none') {
          switch (auth.type) {
            case 'bearer':
              if (auth.token) { // Only apply if token exists
                finalAxiosHeaders['Authorization'] = `Bearer ${auth.token}`; // Override existing Authorization if any
                console.log("Applied Bearer token to headers.");
              } else {
                console.warn("Bearer token selected but no token provided. Auth header not applied by ApiTester.");
                toast.warning("Auth Warning", { description: "Bearer Token selected, but no token was provided. Authentication header not applied." });
              }
              break;
            case 'basic':
              if (auth.username && auth.password) { // Only apply if both username and password exist
                const credentials = btoa(`${auth.username}:${auth.password}`);
                finalAxiosHeaders['Authorization'] = `Basic ${credentials}`; // Override existing Authorization if any
                console.log("Applied Basic auth to headers.");
              } else {
                console.warn("Basic Auth selected but username or password missing. Auth header not applied by ApiTester.");
                toast.warning("Auth Warning", { description: "Basic Auth selected, but username or password was not provided. Authentication header not applied." });
              }
              break;
            case 'apiKey':
               if (auth.apiKeyName && auth.apiKeyValue) { // Only apply if both name and value exist
                 if (auth.apiKeyLocation === 'header') {
                   finalAxiosHeaders[auth.apiKeyName] = auth.apiKeyValue; // Add/Override header
                   console.log(`Applied API Key '${auth.apiKeyName}' to headers.`);
                 } else if (auth.apiKeyLocation === 'query') {
                   finalAxiosParams[auth.apiKeyName] = auth.apiKeyValue; // Add/Override query param
                   console.log(`Applied API Key '${auth.apiKeyName}' to query params.`);
                 }
               } else {
                 console.warn("API Key selected but key name or value missing. API Key not applied by ApiTester.");
                 toast.warning("Auth Warning", { description: "API Key authentication selected, but Key Name or Value was not provided. API Key not applied." });
               }
               break;
            // Add cases for other auth types (e.g., OAuth 2.0) if implemented
            // case 'managedApiKey' is handled in RequestBuilder, resulting in 'apiKey' type here if valid.
            default:
              // Includes 'none' type - do nothing, headers/params remain as they were from RequestBuilder
              console.log("Auth type is 'none' or unhandled. No auth applied by ApiTester.");
              break;
          }
        } else {
            console.log("Auth type is 'none' or auth object missing. No auth applied by ApiTester.");
        }
        // --- End Authentication Logic ---

        // Final axios config for direct request
        axiosConfig = {
          method: method,
          url: targetUrl,
          headers: finalAxiosHeaders, // Use the potentially modified headers
          params: finalAxiosParams,   // Use the potentially modified params
          timeout: settings.requestTimeout,
        };

        // Add request body for non-GET/HEAD requests (Only for Direct Requests)
        if (method !== 'GET' && method !== 'HEAD' && requestBody) {
          try {
            // Try to parse as JSON first
            const parsedBody = JSON.parse(requestBody);
            axiosConfig.data = parsedBody;
          } catch (e) {
            // If not valid JSON, send as plain text
            axiosConfig.data = requestBody;
          }
        }
      }
      // --- End Proxy Logic ---


      // Make the actual API request (either direct or via proxy)
      console.log("Final Axios Config:", axiosConfig);
      const axiosResponse = await authAxios(axiosConfig);

      // Handle successful response (Proxy route should return the target API's response structure)
      console.log("Response received (potentially via proxy):", axiosResponse);

      const endTime = Date.now();
      const duration = endTime - startTime;      // Calculate response size - convert to string and measure
      const responseText = JSON.stringify(axiosResponse.data);
      const responseSize = new Blob([responseText]).size;

      // Run tests if there's a test script
      let testResults = [];
      if (requestData.tests && requestData.tests.script) {
        try {
          // Run the tests using the PM-like environment
          testResults = runTests(
            requestData.tests.script, 
            {
              response: {
                code: axiosResponse.status,
                status: axiosResponse.status,
                data: axiosResponse.data,
                json: () => axiosResponse.data,
                text: () => JSON.stringify(axiosResponse.data),
                headers: {
                  get: (name) => axiosResponse.headers[name.toLowerCase()] || null
                },
                to: {
                  have: {
                    header: (name) => !!axiosResponse.headers[name.toLowerCase()]
                  }
                },
                responseTime: duration
              }
            }
          );
          console.log("Test results:", testResults);
        } catch (testError) {
          console.error("Error running tests:", testError);
          testResults = [{
            name: "Test script error",
            passed: false,
            error: testError.message
          }];
        }
      }

      const MAX_RESPONSE_SIZE_byte = settings.responseSize * 1024
      let truncatedData = axiosResponse.data;
      let truncatedResponseText = responseText;
      let isTruncated = false;
      if (responseSize > MAX_RESPONSE_SIZE_byte) {
        // Mark as truncated but keep the full structure for display
        isTruncated = true;

        // Keep the original data structure by creating a safe truncated version
        try {
          // For arrays, truncate to fewer items
          if (Array.isArray(axiosResponse.data)) {
            const originalLength = axiosResponse.data.length;
            const maxItems = Math.max(20, Math.floor(MAX_RESPONSE_SIZE_byte / 5000)); // Estimate based on size
            truncatedData = axiosResponse.data.slice(0, maxItems);
            if (originalLength > maxItems) {
              truncatedData.push({
                _truncated: `[${originalLength - maxItems} more items truncated due to size limit]`
              });
            }
          }
          // For objects, keep a subset of keys
          else if (typeof axiosResponse.data === 'object' && axiosResponse.data !== null) {
            truncatedData = {};
            const keys = Object.keys(axiosResponse.data);
            const maxKeys = Math.max(50, Math.floor(MAX_RESPONSE_SIZE / 2000)); // Estimate based on size

            keys.slice(0, maxKeys).forEach(key => {
              truncatedData[key] = axiosResponse.data[key];
            });

            if (keys.length > maxKeys) {
              truncatedData._truncated = `[${keys.length - maxKeys} more fields truncated due to size limit]`;
            }
          }
          // For strings or other types, truncate directly
          else {
            truncatedData = axiosResponse.data.toString().substring(0, MAX_RESPONSE_SIZE) +
              "... [Response truncated due to size limit]";
          }
        } catch (e) {
          // If anything fails, fallback to simple truncation
          truncatedData = {
            truncated: true,
            message: "The response was truncated due to size limits (1MB)",
            error: e.message,
            preview: truncatedResponseText.substring(0, 1000) + "..."
          };
        }

        // Show a toast notification about truncation
        toast.warning("Large Response", {
          description: `Response size (${(responseSize / 1024 / 1024).toFixed(2)} MB) exceeds the 1MB limit and has been truncated.`,
        });
      }

      // Format for display
      const formattedResponse = {
        status: axiosResponse.status,
        data: truncatedData,
        headers: axiosResponse.headers,
        size: `${(responseSize / 1024).toFixed(2)} KB`,
        timeTaken: `${duration} ms`,
        isTruncated: isTruncated,
        originalSize: responseSize,
        // Add a flag indicating if the response came via proxy
        viaProxy: settings.proxyEnabled && settings.proxyUrl,
        // Add test results
        testResults: testResults 
      };

      setResponseData(formattedResponse);

      // Update the test results in the current request data
      if (currentRequestData && testResults.length > 0) {
        const updatedTests = {
          ...(currentRequestData.tests || {}),
          results: testResults
        };
        
        // Update the current request data with test results
        setCurrentRequestData({
          ...currentRequestData,
          tests: updatedTests
        });
      }

      // Record ALL requests in history - use truncated data when applicable
      const dataToStore = isTruncated
        ? JSON.stringify(truncatedData) // Use the truncated data object
        : responseText; // Use the original response text when not truncated

      // Store the size of what we're actually storing
      const storedResponseSize = isTruncated
        ? new Blob([dataToStore]).size
        : responseSize;      // Use the ORIGINAL method and URL for history recording
      await recordHistory({
        requestId: selectedRequestId || null,
        method: method, // Original method
        url: url, // Original URL
        status: axiosResponse.status,
        duration: duration,
        responseSize: storedResponseSize, // Store the actual size of the saved data
        responseData: dataToStore, // Store the truncated version when applicable
        responseHeaders: axiosResponse.headers,
        isTruncated: isTruncated,
        // Backend will get userId from session, so we don't need to send it explicitly
      });

      toast.success("Request Sent", {
        description: isTruncated
          ? "The request was successful but the response was truncated due to size limits (1MB)."
          : "The request was sent successfully and recorded in history.",
      });

    } catch (error) {
      console.error("Error sending request:", error);

      // Record failed requests in history too
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Determine status and response data based on error type
      let status = 0;
      let errorData = { error: "An unknown error occurred." };
      let errorHeaders = { "content-type": "application/json" };
      let errorMessage = "An error occurred while sending the request.";

      if (error.response) {
        // Error from the target server (or the proxy route itself)
        status = error.response.status;
        errorData = error.response.data || { error: error.message };
        errorHeaders = error.response.headers || { "content-type": "application/json" };
        errorMessage = `HTTP Error ${status}: ${error.message}`;
        toast.error(`HTTP Error ${status}`, { description: error.message });
      } else if (error.request) {
        // Request was made but no response received (network error, timeout)
        errorMessage = `Network error: ${error.message}. Could not reach the server or proxy.`;
        errorData = { error: errorMessage, details: "Check the URL, proxy settings, and your internet connection." };
        toast.error("Network Error", { description: "Could not reach the server. Check URL/connection." });
        setError(errorMessage); // Set general error for network issues
      } else {
        // Setup error or other issues
        errorMessage = `Request setup error: ${error.message}`;
        errorData = { error: errorMessage };
        toast.error("Request Error", { description: error.message });
        setError(errorMessage); // Set general error for setup issues
      }      // Record the failed request in history using ORIGINAL details
      await recordHistory({
        requestId: selectedRequestId || null,
        method: method, // Now accessible
        url: url,       // Now accessible
        status: status,
        duration: duration,
        responseSize: 0,
        responseData: JSON.stringify(errorData),
        responseHeaders: JSON.stringify(errorHeaders),
        isTruncated: false,
        // Backend will get userId from session
      });      // Update the response display with error details
      setResponseData({
        status: status,
        data: errorData,
        headers: errorHeaders,
        size: "0 KB",
        timeTaken: `${duration} ms`,        
        isError: true, // Add an error flag
        viaProxy: settings.proxyEnabled && settings.proxyUrl && status !== 0 // Indicate proxy if it wasn't a network error before proxy
      });
    }
  }, [selectedRequestId,authToken, settings, updateAuthToken]); // Removed currentUserID and authToken, kept only necessary dependencies

  // Handler for selecting a request from a collection
  const handleRequestSelect = useCallback((requestId) => {
    setInitialDataFromHistory(null); // Clear any history data
    setResponseData(null); // Reset response
    setSelectedRequestId(null); // Reset request ID first

    // Use setTimeout to ensure the state update to null is processed
    setTimeout(() => {
      setSelectedRequestId(requestId);
      console.log("Selected Request ID set to:", requestId);
    }, 0);
  }, []);

  // Handler for selecting an item from history
  const handleHistorySelect = useCallback((historyItem) => {
    console.log("Selected History Item:", historyItem);
    setSelectedRequestId(null); // Clear selected request ID
    setResponseData(null); // Reset response

    // Extract relevant data from history item to populate RequestBuilder
    // Assuming historyItem has 'method' and 'url' fields.
    // We might need to parse 'responseData' if we want to populate the body,
    // but let's start with method and url.
    // We also reset other fields like params, headers, auth, tests.
    setInitialDataFromHistory({
      method: historyItem.method,
      url: historyItem.url,
      // Reset other fields that might not be directly in history
      params: JSON.stringify([{ id: Date.now(), key: "", value: "", enabled: true }]), // Default empty row
      headers: JSON.stringify([{ id: Date.now(), key: "", value: "", enabled: true }]), // Default empty row
      body: "", // Reset body
      auth: { type: "none" }, // Reset auth
      tests: { script: "", results: [] } // Reset tests
    });
  }, []);  // Callback to update UI when a request is saved
  const handleRequestSaved = useCallback(() => {
    // Update historyUpdated state to trigger a refresh of the collections sidebar
    setHistoryUpdated(prev => prev + 1);
  }, []);
  
  // Paylaşılan verileri içe aktarma işlemini gerçekleştiren fonksiyon
  const handleImportConfirm = useCallback((data) => {
    try {
      // Request verilerini aktarma
      if (data.request) {
        const requestData = {
          method: data.request.method || 'GET',
          url: data.request.url || '',
          headers: data.request.headers || {},
          params: data.request.params || {},
          body: data.request.body || '',
          auth: data.request.auth || { type: 'none' },
          tests: data.request.tests || { script: '', results: [] },
        };
        
        console.log("Importing request data:", requestData);
        setCurrentRequestData(requestData);
        
        // Environment verilerini aktarma
        if (data.environment) {
          // Environment context üzerinden mevcut environment'ı kontrol et
          const existingEnv = environments.find(env => 
            env.name === data.environment.name || env.id === data.environment.id
          );
          
          if (existingEnv) {
            // Eğer environment zaten varsa, onu aktif et
            setCurrentEnvironmentById(existingEnv.id);
          } else {
            // Eğer environment yoksa ve API üzerinden yeni environment oluşturma yapılacaksa
            // burada o kodu ekleyebiliriz (şimdilik yalnızca bir uyarı gösteriyoruz)
            toast.info("Environment not found", { 
              description: "The shared environment could not be found in your workspace." 
            });
          }
        }
        
        toast.success("Data imported successfully", { 
          description: "The shared request data has been imported." 
        });
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      toast.error("Import failed", { description: error.message });
    }
  }, [environments, setCurrentEnvironmentById]);
  return (
    <>      <Header
        currentRequestData={currentRequestData}
        onRequestSaved={handleRequestSaved}
      />
      
      <ImportDataModal
        open={showImportModal}
        setOpen={setShowImportModal}
        importData={importData}
        onImportConfirm={handleImportConfirm}
        darkMode={isDarkMode}
      />
      <div className="flex flex-col h-screen overflow-hidden"> {/* Use flex-col for vertical layout */}
        
        {/* Environment Loading Overlay */}
        {isEnvironmentLoading && (
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md w-full">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-medium mb-2">Ortam Yükleniyor</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Seçili ortam ayarları yükleniyor, lütfen bekleyin...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Rest of the layout */}
        <div className="flex-1 min-h-0"> {/* Add min-h-0 to allow proper flex shrinking */}
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-13rem)]">{/* Adjust height to account for header and monitor panel */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <CollectionsSidebar
                setSelectedRequestId={handleRequestSelect} // For collection requests
                onHistorySelect={handleHistorySelect}     // For history items
                hasError={!!sidebarError}
                onError={setSidebarError}
                darkMode={isDarkMode} // Pass isDarkMode instead
                historyUpdated={historyUpdated} // Add this prop
                currentEnvironment={currentEnvironment} // Pass the current environment from context
                environmentChangedTimestamp={environmentChangedTimestamp} // Pass the timestamp
              />
            </ResizablePanel>
            <ResizableHandle withHandle />            <ResizablePanel defaultSize={40} minSize={30}>              <RequestBuilder
                key={selectedRequestId || initialDataFromHistory?.url} // Add key to force re-render/reset on selection change
                selectedRequestId={selectedRequestId}
                initialData={initialDataFromHistory} // Pass history data
                onSendRequest={handleSendRequest}
                onRequestDataChange={handleRequestDataChange}
                authToken={authToken}
                onUpdateAuthToken={updateAuthToken}
                darkMode={isDarkMode} // Pass isDarkMode instead
                apiKeys={settings.apiKeys || []} // Pass apiKeys from settings
                testResults={responseData?.testResults} // Pass test results
              />
            </ResizablePanel>
            <ResizableHandle withHandle />            <ResizablePanel defaultSize={40} minSize={25}>
              <ResponseDisplay responseData={responseData} darkMode={isDarkMode} /> 
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Fixed height for monitor panel */}
        
      </div>
    </>
  );
}
