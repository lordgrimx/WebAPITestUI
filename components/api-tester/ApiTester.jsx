"use client";

import React, { useState, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import CollectionsSidebar from "./CollectionsSidebar";
import RequestBuilder from "./RequestBuilder";
import ResponseDisplay from "./ResponseDisplay";

export default function ApiTester() {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  // Use useCallback to prevent function recreation on each render
  const handleSendRequest = useCallback(async (requestData) => {
    try {
      setError(null);
      // In a real implementation, this would make an actual API request
      // For now, we'll simulate a response
      console.log("Sending request:", requestData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create a mock response based on the request
      const mockResponse = {
        status: 200,
        data: {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          created_at: new Date().toISOString()
        },
        headers: {
          "content-type": "application/json",
          "x-response-time": `${Math.floor(Math.random() * 200)}ms`
        },
        size: "1.2 KB",
        timeTaken: `${Math.floor(Math.random() * 200)} ms`
      };
      
      setResponseData(mockResponse);
    } catch (error) {
      console.error("Error sending request:", error);
      setError(error.message || "An error occurred while sending the request");
      setResponseData({
        status: 500,
        data: { error: "Failed to send request" },
        headers: { "content-type": "application/json" },
        size: "0.2 KB",
        timeTaken: "0 ms"
      });
    }
  }, []);

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
