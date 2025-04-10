"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import MonitorsPanel from "./MonitorsPanel";

export default function ApiTester() {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [responseData, setResponseData] = useState(null); // Initialize as null
  const [error, setError] = useState(null); // General request error state
  const [sidebarError, setSidebarError] = useState(null); // Specific error for sidebar loading
  const [currentRequestData, setCurrentRequestData] = useState(null); // State to hold current request builder data
  const [darkMode, setDarkMode] = useState(false); // Manage dark mode state here
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || ''); // Auth token state

  const recordHistory = useMutation(api.history.recordHistory);

  // Add token persistence
  const updateAuthToken = useCallback((token) => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
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
    try {
      setResponseData(null); // Reset response before sending
      setError(null); // Clear previous errors
      console.log("Sending request:", requestData);

      const startTime = Date.now();

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

      const MAX_RESPONSE_SIZE = 1048576; // 1MB limit
      let truncatedData = axiosResponse.data;
      let truncatedResponseText = responseText;
      let isTruncated = false;
        if (responseSize > MAX_RESPONSE_SIZE) {
        // Mark as truncated but keep the full structure for display
        isTruncated = true;

        // Keep the original data structure but indicate truncation in a safer way
        // We'll preserve the JSON structure by creating a safe truncated version
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
      // Record this request in history - ONLY for successful requests
      if (axiosResponse.status >= 200 && axiosResponse.status < 300) {
        await recordHistory({
          requestId: selectedRequestId || undefined,
          method: requestData.method,
          url: requestData.url,
          status: axiosResponse.status,
          duration: duration,
          responseSize: responseSize,
          responseData: isTruncated ? truncatedResponseText : responseText, // Store potentially truncated text
          responseHeaders: JSON.stringify(axiosResponse.headers),
          isTruncated: isTruncated
        });
        toast.success("Request Sent", {
          description: isTruncated
            ? "The request was successful but the response was truncated due to size limits (1MB)."
            : "The request was sent successfully and recorded in history.",
        });
      }
    } catch (error) {
      console.error("Error sending request:", error);

      // Check if this is a network error (like invalid URL, no internet, etc.)
      let errorResponse;
      let status;
      let errorData;
      let errorHeaders;

      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
        const errorMessage = `Network error: ${error.message}`;

        // Sonner toast bildirimi göster
        toast.error("Ağ Hatası", {
          description: "İstek sunucuya ulaşamadı. URL'yi veya internet bağlantınızı kontrol edin.",
        });

        status = 0; // Ağ hatasını belirtmek için 0 kullan
        errorData = {
          error: errorMessage,
          details: "The request could not reach the server. Check the URL and your internet connection."
        };
        errorHeaders = { "content-type": "application/json" };

        errorResponse = {
          status: status,
          data: errorData,
          headers: errorHeaders,
          size: "0.2 KB", // Placeholder size
          timeTaken: "0 ms", // Placeholder time
          isNetworkError: true
        };

        // For network errors, set the error state
        setError(errorMessage);      } else {
        // Handle HTTP errors (400, 500, etc.) - Do NOT set the error state for these
        status = error.response?.status || 500;
        const errorMessage = error.message || "An error occurred while sending the request";
        errorData = error.response?.data || { error: errorMessage };
        errorHeaders = error.response?.headers || { "content-type": "application/json" };

        // Create a more helpful message for common HTTP status codes
        let errorDescription = errorMessage;
        if (status === 404) {
          errorDescription = "The requested resource could not be found. Please check if the URL is correct and the endpoint exists.";
          errorData = {
            ...errorData,
            troubleshooting: [
              "Verify the URL is spelled correctly",
              "Check if the API endpoint path is correct",
              "Confirm the resource or endpoint exists on the server",
              "Ensure you're using the correct API version if applicable"
            ]
          };
        } else if (status === 401) {
          errorDescription = "Authentication is required. Please check your credentials or token.";
        } else if (status === 403) {
          errorDescription = "You don't have permission to access this resource.";
        } else if (status === 500) {
          errorDescription = "The server encountered an error. Please try again later or contact the API provider.";
        }

        errorResponse = {
          status: status,
          data: errorData,
          headers: errorHeaders,
          size: "0.2 KB", // Placeholder size
          timeTaken: "0 ms", // Placeholder time
          url: error.config?.url || requestData.url // Include the attempted URL
        };

        // Display an appropriate toast message for HTTP errors
        toast.error(`HTTP Error ${status}`, {
          description: errorDescription,
        });
      }

      setResponseData(errorResponse);

      // Do NOT record failed requests in history per requirements
      // Removed the recordHistory call for failed requests
    }
  }, [selectedRequestId, recordHistory]); // Removed authToken from dependency array as it's now part of requestData.auth

  // Memoize the request selection handler
  const handleRequestSelect = useCallback((requestId) => {
    // Force a state change even if the ID is the same
    // Set to null first, then back to the actual ID in the next render cycle
    setSelectedRequestId(null);
    setResponseData(null); // Reset response immediately

    // Use setTimeout to ensure the state update to null is processed before setting the actual ID
    setTimeout(() => {
        setSelectedRequestId(requestId);
        console.log("Selected Request ID set to:", requestId); // Debug log
    }, 0);

  }, []); // Keep dependencies empty or add if necessary, but the core logic relies on the null -> ID sequence

  return (
    <>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentRequestData={currentRequestData} // Pass current request data to Header
        // Pass openSignupModal and openLoginModal if needed by Header when logged out
        // openSignupModal={openSignupModal}
        // openLoginModal={openLoginModal}
      />
      <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <CollectionsSidebar
              setSelectedRequestId={handleRequestSelect}
              hasError={!!sidebarError}
              onError={setSidebarError} // Pass error handler if needed
            />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={30}>
            <RequestBuilder
              selectedRequestId={selectedRequestId}
              onSendRequest={handleSendRequest}
              onRequestDataChange={handleRequestDataChange} // Pass handler to RequestBuilder
              authToken={authToken}
              onUpdateAuthToken={updateAuthToken}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={25}>
            <ResponseDisplay responseData={responseData} />
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="h-64 border-t">
          <MonitorsPanel />
        </div>
      </div>
    </>
  );
}
