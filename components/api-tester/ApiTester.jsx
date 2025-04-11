"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react"; // Add useEffect
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import axios from "axios"; // axios kütüphanesini import ediyorum
import { toast } from "sonner"; // sonner'dan toast fonksiyonunu import et

import CollectionsSidebar from "./CollectionsSidebar";
import RequestBuilder from "./RequestBuilder";
import ResponseDisplay from "./ResponseDisplay";
import Header from "../Header";
// verifyToken import removed as verification is now done server-side
import Cookies from "js-cookie"; // Keep Cookies import if needed elsewhere, or remove if not

export default function ApiTester() {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null); // State to hold current user ID
  const [responseData, setResponseData] = useState(null); // Initialize as null
  const [error, setError] = useState(null); // General request error state
  const [sidebarError, setSidebarError] = useState(null); // Specific error for sidebar loading
  const [currentRequestData, setCurrentRequestData] = useState(null); // State to hold current request builder data
  const [initialDataFromHistory, setInitialDataFromHistory] = useState(null); // State to hold data from selected history item
  const [darkMode, setDarkMode] = useState(false); // Manage dark mode state here
  const [authToken, setAuthToken] = useState(''); // Initialize empty

  // Move localStorage access to useEffect
  useEffect(() => {
    // Only access localStorage after component mounts (client-side)
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
    }
  }, []);

  // Fetch user session info from the server-side API endpoint
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session'); // Use the session API route
        const data = await response.json();

        if (response.ok && data.success && data.userId) {
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

    fetchSession();
  }, []); // Runs once on component mount

  const recordHistory = useMutation(api.history.recordHistory);

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
    try {
      setResponseData(null); // Reset response before sending
      setError(null); // Clear previous errors
      console.log("Sending request:", requestData);

      // Extract request data including auth details
      const { method, url, headers: requestHeaders, body: requestBody, params, auth } = requestData; // Add auth here

      // URL kontrolü yap - undefined veya boş değer kontrolü
      if (!url || url === 'undefined') {
        console.error("URL tanımlı değil veya geçersiz:", url);
        throw new Error("URL tanımlı değil veya geçersiz. Lütfen geçerli bir URL girin.");
      }

      // Prepare axios config
      const axiosConfig = {
        method: method,
        url: url,
        headers: { ...(requestHeaders || {}) }, // Start with existing headers, create a copy
        params: { ...(params || {}) } // Start with existing params, create a copy
      };

      // --- Authentication Logic ---
      if (auth && auth.type) {
        switch (auth.type) {
          case 'bearer':
            if (auth.token) {
              axiosConfig.headers['Authorization'] = `Bearer ${auth.token}`;
            } else {
              console.warn("Bearer token selected but no token provided.");
              toast.warning("Auth Warning", { description: "Bearer Token authentication selected, but no token was provided." });
            }
            break;
          case 'basic':
            if (auth.username && auth.password) {
              const credentials = btoa(`${auth.username}:${auth.password}`); // Base64 encode username:password
              axiosConfig.headers['Authorization'] = `Basic ${credentials}`;
            } else {
              console.warn("Basic Auth selected but username or password missing.");
              toast.warning("Auth Warning", { description: "Basic Auth selected, but username or password was not provided." });
            }
            break;
          case 'apiKey':
             // Corrected logic for API Key
             if (auth.apiKeyName && auth.apiKeyValue) { // Check for apiKeyName and apiKeyValue
               if (auth.apiKeyLocation === 'header') { // Check for apiKeyLocation
                 axiosConfig.headers[auth.apiKeyName] = auth.apiKeyValue;
               } else if (auth.apiKeyLocation === 'query') {
                 axiosConfig.params[auth.apiKeyName] = auth.apiKeyValue;
               }
             } else {
               console.warn("API Key selected but key name or value missing.");
               toast.warning("Auth Warning", { description: "API Key authentication selected, but Key Name or Value was not provided." });
             }
             break;
          // Add cases for other auth types (e.g., OAuth 2.0) if implemented
          case 'none':
          default:
            // No specific auth headers/params needed for 'none'
            break;
        }
      }
      // --- End Authentication Logic ---

      // Add request body for non-GET requests
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

      // Make the actual API request
      const axiosResponse = await axios(axiosConfig); // Use the modified config

      // Handle successful response
      console.log("Response received:", axiosResponse);

      const endTime = Date.now();
      const duration = endTime - startTime;      // Calculate response size - convert to string and measure
      const responseText = JSON.stringify(axiosResponse.data);
      const responseSize = new Blob([responseText]).size;

      const MAX_RESPONSE_SIZE = 304857; // 1MB limit
      let truncatedData = axiosResponse.data;
      let truncatedResponseText = responseText;
      let isTruncated = false;
        if (responseSize > MAX_RESPONSE_SIZE) {
        // Mark as truncated but keep the full structure for display
        isTruncated = true;

        // Keep the original data structure by creating a safe truncated version
        try {
          // For arrays, truncate to fewer items
          if (Array.isArray(axiosResponse.data)) {
            const originalLength = axiosResponse.data.length;
            const maxItems = Math.max(20, Math.floor(MAX_RESPONSE_SIZE / 5000)); // Estimate based on size
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
        originalSize: responseSize
      };

      setResponseData(formattedResponse);
      
      // Record ALL requests in history
      await recordHistory({
        requestId: selectedRequestId || undefined,
        userId: currentUserID || undefined, // Include user ID if available
        method: requestData.method,
        url: requestData.url,
        status: axiosResponse.status,
        duration: duration,
        responseSize: responseSize,
        responseData: isTruncated ? truncatedResponseText : responseText,
        responseHeaders: JSON.stringify(axiosResponse.headers),
        isTruncated: isTruncated
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
      
      const errorResponse = error.response || {
        status: 0,
        data: { error: error.message },
        headers: {}
      };

      await recordHistory({
        requestId: selectedRequestId || undefined,
        method: requestData.method,
        url: requestData.url,
        status: errorResponse.status,
        duration: duration,
        responseSize: 0,
        responseData: JSON.stringify(errorResponse.data),
        responseHeaders: JSON.stringify(errorResponse.headers),
        isTruncated: false
      });

      // Check if this is a network error (like invalid URL, no internet, etc.)
      let errorData;
      let errorHeaders;

      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
        const errorMessage = `Network error: ${error.message}`;

        // Sonner toast bildirimi göster
        toast.error("Ağ Hatası", {
          description: "İstek sunucuya ulaşamadı. URL'yi veya internet bağlantınızı kontrol edin.",
        });

        errorData = {
          error: errorMessage,
          details: "The request could not reach the server. Check the URL and your internet connection."
        };
        errorHeaders = { "content-type": "application/json" };

        setError(errorMessage);
      } else {
        // Handle HTTP errors (400, 500, etc.) - Do NOT set the error state for these
        const status = error.response?.status || 500;
        const errorMessage = error.message || "An error occurred while sending the request";
        errorData = error.response?.data || { error: errorMessage };
        errorHeaders = error.response?.headers || { "content-type": "application/json" };

        // Display an appropriate toast message for HTTP errors
        toast.error(`HTTP Error ${status}`, {
          description: errorMessage,
        });
      }

      setResponseData({
        status: error.response?.status || 0,
        data: errorData,
        headers: errorHeaders,
        size: "0.2 KB", // Placeholder size
        timeTaken: "0 ms", // Placeholder time
      });
    }
  }, [selectedRequestId, recordHistory, currentUserID]); // Added currentUserID dependency

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
              />
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={30}>
              <RequestBuilder
                key={selectedRequestId || initialDataFromHistory?.url} // Add key to force re-render/reset on selection change
                selectedRequestId={selectedRequestId}
                initialData={initialDataFromHistory} // Pass history data
                onSendRequest={handleSendRequest}
                onRequestDataChange={handleRequestDataChange}
                authToken={authToken}
                onUpdateAuthToken={updateAuthToken}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={25}>
              <ResponseDisplay responseData={responseData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Fixed height for monitor panel */}
        
      </div>
    </>
  );
}
