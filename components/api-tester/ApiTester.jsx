"use client";

import React, { useState, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import CollectionsSidebar from "./CollectionsSidebar";
import RequestBuilder from "./RequestBuilder";
import ResponseDisplay from "./ResponseDisplay";

export default function ApiTester() {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [responseData, setResponseData] = useState([]); // Array olarak değiştirdik
  const [error, setError] = useState(null);
  
  // Add the recordHistory mutation
  const recordHistory = useMutation(api.history.recordHistory);

  // Use useCallback to prevent function recreation on each render
  const handleSendRequest = useCallback(async (requestData) => {
    try {
      if (requestData.requestNumber === 1) {
        setResponseData([]); // İlk istek geldiğinde array'i temizle
      }

      setError(null);
      const startTime = Date.now();
      
      // Simulate API call delay with random timing for each request
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Create a mock response based on the request
      const mockResponse = {
        status: 200,
        statusText: "OK",
        data: requestData.data || {
          token: "mock-token",
          user: {
            id: "mock-id",
            email: "mock@example.com",
            fullName: "Mock User"
          }
        },
        headers: {
          "content-type": "application/json",
          "x-response-time": `${duration}ms`,
          "x-request-number": `${requestData.requestNumber}/${requestData.totalRequests}`
        },
        timeTaken: `${duration} ms`,
        requestNumber: requestData.requestNumber,
        totalRequests: requestData.totalRequests
      };
      
      setResponseData(prev => [...prev, mockResponse]); // Array'e yeni yanıtı ekle
      
      // Record this request in history
      await recordHistory({
        requestId: selectedRequestId || undefined,
        method: requestData.method,
        url: requestData.url,
        status: mockResponse.status,
        duration: duration,
        responseSize: 1200,
      });
      
    } catch (error) {
      console.error("Error sending request:", error);
      setError(error.message || "An error occurred while sending the request");
      setResponseData(prev => [...prev, {
        status: 500,
        data: { error: "Failed to send request" },
        headers: { "content-type": "application/json" },
        size: "0.2 KB",
        timeTaken: "0 ms"
      }]);
      
      // Still record the failed request in history
      try {
        await recordHistory({
          requestId: selectedRequestId || undefined,
          method: requestData.method,
          url: requestData.url,
          status: 500,
          duration: 0,
          responseSize: 200, // 0.2 KB in bytes
        });
      } catch (historyError) {
        console.error("Failed to record request history:", historyError);
      }
    }
  }, [selectedRequestId, recordHistory]);

  // Use useCallback for setSelectedRequestId to prevent re-renders
  const handleRequestSelect = useCallback((id) => {
    setSelectedRequestId(id);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
      >
        {/* Left Panel: Collections and History */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <CollectionsSidebar 
            setSelectedRequestId={handleRequestSelect} 
            hasError={!!error}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/* Middle Panel: Request Builder */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <RequestBuilder 
            selectedRequestId={selectedRequestId} 
            onSendRequest={handleSendRequest} 
          />
        </ResizablePanel>
        <ResizableHandle withHandle />

        {/* Right Panel: Response */}
        <ResizablePanel defaultSize={40} minSize={25}>
          <ResponseDisplay responseData={responseData} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
