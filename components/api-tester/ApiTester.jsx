"use client";

import React, { useState, useCallback, useMemo } from "react";
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
import Header from "../Header";

export default function ApiTester() {
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarError, setSidebarError] = useState(null);
  const [currentRequestData, setCurrentRequestData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const recordHistory = useMutation(api.history.recordHistory);

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

      // Use functional update to prevent race conditions
      setResponseData((prev) => [...prev, response]);
      requestAnimationFrame(() => {
        setCurrentRequestData(response);
      });

      await recordHistory({
        requestId: selectedRequestId || undefined,
        method: response.method || "GET",
        url: response.url || "",
        status: response.status,
        duration: parseInt(response.timeTaken),
        responseSize: 1200,
      });
    } catch (error) {
      console.error("Error handling request:", error);
      setError(error.message || "An error occurred while handling the request");
      setResponseData((prev) => [
        ...prev,
        {
          status: 500,
          data: { error: "Failed to handle request" },
          headers: { "content-type": "application/json" },
          size: "0.2 KB",
          timeTaken: "0 ms",
          method: response.method || "GET",
          url: response.url || "",
        },
      ]);

      try {
        await recordHistory({
          requestId: selectedRequestId || undefined,
          method: response.method || "GET",
          url: response.url || "",
          status: 500,
          duration: 0,
          responseSize: 200,
        });
      } catch (historyError) {
        console.error("Failed to record request history:", historyError);
      }
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
            />
          </ResizablePanel>
          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} minSize={25}>
            <ResponseDisplay responseData={responseData} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
