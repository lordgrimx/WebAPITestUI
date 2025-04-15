"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react"; // Add useEffect
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import axios from "axios";
import { toast } from "sonner";
import { useSettings } from "@/lib/settings-context"; // Import the settings hook
// Proxy için https-proxy-agent gerekebilir, ancak bunu API rotasında kullanacağız.

import CollectionsSidebar from "./CollectionsSidebar";
import RequestBuilder from "./RequestBuilder";
import ResponseDisplay from "./ResponseDisplay";
import Header from "../Header";
export default function ApiTester() {
  const { settings } = useSettings(); // Get settings from context (updateSetting kaldırıldı, kullanılmıyor)
  
  const [selectedRequestId, setSelectedRequestId] = useState(null);  const [currentUserID, setCurrentUserID] = useState(null); // State to hold current user ID
  const [responseData, setResponseData] = useState(null); // Initialize as null
  const [error, setError] = useState(null); // General request error state
  const [sidebarError, setSidebarError] = useState(null); // Specific error for sidebar loading
  const [currentRequestData, setCurrentRequestData] = useState(null); // State to hold current request builder data
  const [initialDataFromHistory, setInitialDataFromHistory] = useState(null); // State to hold data from selected history item
  const [darkMode, setDarkMode] = useState(false); // Manage dark mode state here
  const [authToken, setAuthToken] = useState(''); // Initialize empty

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
  // Move localStorage access to useEffect
  useEffect(() => {
    // Instead of accessing localStorage, we'll use our secure endpoint
    const fetchAuthInfo = async () => {
      try {
        const response = await fetch('/api/auth/getCookies');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.isAuthenticated) {
            console.log("User is authenticated, userId:", data.userId);
            setCurrentUserID(data.userId);
            // We don't set authToken here anymore since we're not exposing it to the client
          }
        }
      } catch (error) {
        console.error("Error fetching auth info:", error);
      }
    };
    
    fetchAuthInfo();
  }, []);
  // Fetch user session info from the server-side API endpoint
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Oturum API'sine istek yap
        const response = await fetch('/api/auth/session');
        
        // Status 401 ise sessizce ele al ve kullanıcı bilgilerini sıfırla
        if (response.status === 401) {
          console.log("ApiTester: User not logged in or session expired");
          setCurrentUserID(null);
          return; // Sessizce devam et
        }
        
        // Diğer hata durumlarını kontrol et
        if (!response.ok) {
          console.error("ApiTester: Session API error:", response.status);
          setCurrentUserID(null);
          return;
        }
        
        // Başarılı yanıtı işle
        const data = await response.json();
        if (data.success && data.userId) {
          console.log("ApiTester: Session verified, setting user ID:", data.userId);
          setCurrentUserID(data.userId);
        } else {
          console.error("ApiTester: Session verification failed:", data.error || 'No user ID returned');
          setCurrentUserID(null); // Ensure user ID is null if session is invalid
        }
      } catch (error) {
        console.error("ApiTester: Error fetching session:", error);
        setCurrentUserID(null); // Ensure user ID is null on fetch error
      }
    };

    fetchSession();  }, []); // Runs once on component mount

  // Function to record history using the backend API instead of Convex
  const recordHistory = async (historyData) => {
    try {
      const response = await axios.post('/api/history/recordHistory', historyData);
      return response.data;
    } catch (error) {
      console.error("Error recording history:", error);
      // Don't throw error to prevent blocking the main request flow
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
        targetUrl = '/api/proxy'; // Target the backend proxy route
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
      const axiosResponse = await axios(axiosConfig);

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
        requestId: selectedRequestId || undefined,
        method: method, // Original method
        url: url, // Original URL
        status: axiosResponse.status,
        duration: duration,
        responseSize: storedResponseSize, // Store the actual size of the saved data
        responseData: dataToStore, // Store the truncated version when applicable
        responseHeaders: JSON.stringify(axiosResponse.headers),
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
        requestId: selectedRequestId || undefined,
        method: method, // Now accessible
        url: url,       // Now accessible
        status: status,
        duration: duration,
        responseSize: 0,
        responseData: JSON.stringify(errorData),
        responseHeaders: JSON.stringify(errorHeaders),
        isTruncated: false,
        // Backend will get userId from session
      });

      // Update the response display with error details
      setResponseData({
        status: status,
        data: errorData,
        headers: errorHeaders,
        size: "0 KB",
        timeTaken: `${duration} ms`,        isError: true, // Add an error flag
        viaProxy: settings.proxyEnabled && settings.proxyUrl && status !== 0 // Indicate proxy if it wasn't a network error before proxy
      });
    }
  }, [selectedRequestId, currentUserID, settings]); // Updated dependencies, removed recordHistory

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
  }, []);

  return (
    <>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentRequestData={currentRequestData}
      />
      <div className="flex flex-col h-screen overflow-hidden"> {/* Use flex-col for vertical layout */}
        
        {/* Rest of the layout */}
        <div className="flex-1 min-h-0"> {/* Add min-h-0 to allow proper flex shrinking */}
          <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-13rem)]"> {/* Adjust height to account for header and monitor panel */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <CollectionsSidebar
                setSelectedRequestId={handleRequestSelect} // For collection requests
                onHistorySelect={handleHistorySelect}     // For history items
                hasError={!!sidebarError}
                onError={setSidebarError}
                darkMode={darkMode} // Pass dark mode state
              />
            </ResizablePanel>
            <ResizableHandle withHandle />            <ResizablePanel defaultSize={40} minSize={30}>
              <RequestBuilder
                key={selectedRequestId || initialDataFromHistory?.url} // Add key to force re-render/reset on selection change
                selectedRequestId={selectedRequestId}
                initialData={initialDataFromHistory} // Pass history data
                onSendRequest={handleSendRequest}
                onRequestDataChange={handleRequestDataChange}
                authToken={authToken}
                onUpdateAuthToken={updateAuthToken}
                darkMode={darkMode} // Pass dark mode state
                apiKeys={settings.apiKeys || []} // Pass apiKeys from settings
                testResults={responseData?.testResults} // Pass test results
              />
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={25}>
              <ResponseDisplay responseData={responseData} darkMode={darkMode} /> 
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Fixed height for monitor panel */}
        
      </div>
    </>
  );
}
