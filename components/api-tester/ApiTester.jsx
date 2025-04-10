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
  const [responseData, setResponseData] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarError, setSidebarError] = useState(null);
  const [currentRequestData, setCurrentRequestData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');

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

  // Memoize the request data handler
  const handleRequestDataChange = useCallback((data) => {
    requestAnimationFrame(() => {
      setCurrentRequestData(data);
    });
  }, []);

  // Memoize the response handler
  const handleSendRequest = useCallback(async (response) => {
    try {
      if (response.requestNumber === 1) {
        setResponseData([]);
      }

      setError(null);
      console.log("Sending request:", requestData);
      
      const startTime = Date.now();
      
      // Extract request data
      const { method, url, headers: requestHeaders, body: requestBody, params } = requestData;
      
      // Prepare axios config
      const axiosConfig = {
        method: method,
        url: url,
        headers: requestHeaders || {},
        params: params || {}
      };
      
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
      const axiosResponse = await axios(axiosConfig);
      
      // Handle successful response
      console.log("Response received:", axiosResponse);
      
      const endTime = Date.now();
      const duration = endTime - startTime;      // Calculate response size - convert to string and measure
      const responseText = JSON.stringify(axiosResponse.data);
      const responseSize = new Blob([responseText]).size;
      
      const MAX_RESPONSE_SIZE = 304857;
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
          responseData: isTruncated ? truncatedResponseText : responseText,
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
          size: "0.2 KB",
          timeTaken: "0 ms",
          isNetworkError: true
        };
        
        // For network errors, set the error state
        setError(errorMessage);
      } else {
        // Handle HTTP errors (400, 500, etc.) - Do NOT set the error state for these
        status = error.response?.status || 500;
        const errorMessage = error.message || "An error occurred while sending the request";
        errorData = error.response?.data || { error: errorMessage };
        errorHeaders = error.response?.headers || { "content-type": "application/json" };
        
        // For HTTP errors, do NOT set the error state
        // setError(errorMessage); - Remove this line
        
        errorResponse = {
          status: status,
          data: errorData,
          headers: errorHeaders,
          size: "0.2 KB",
          timeTaken: "0 ms"
        };
        
        // Display an appropriate toast message for HTTP errors
        toast.error(`HTTP Error ${status}`, {
          description: errorMessage,
        });
      }
      
      setResponseData(errorResponse);
      
      // Do NOT record failed requests in history per requirements
      // Removed the recordHistory call for failed requests
    }
  }, [selectedRequestId, recordHistory]);

  // Memoize the request selection handler
  const handleRequestSelect = useCallback((requestId) => {
    requestAnimationFrame(() => {
      setSelectedRequestId(requestId);
      setResponseData([]);
    });
  }, []);

  return (
    <>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentRequestData={currentRequestData}
      />
      <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <CollectionsSidebar
              setSelectedRequestId={handleRequestSelect}
              hasError={!!sidebarError}
              onError={setSidebarError}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={30}>
            <RequestBuilder
              selectedRequestId={selectedRequestId}
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
        <div className="h-64 border-t">
          <MonitorsPanel />
        </div>
      </div>
    </>
  );
}
