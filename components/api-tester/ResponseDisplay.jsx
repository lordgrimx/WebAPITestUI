"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ResponseDisplay({ responseData }) {
  // If no response data yet, show placeholder
  if (!responseData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No Response</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Click the Send button to make a request
        </p>
      </div>
    );
  }

  const isSuccessStatus = responseData.status >= 200 && responseData.status < 300;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="default"
            className={`${isSuccessStatus 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
          >
            Response {responseData.status}
          </Badge>
          <span className="text-xs text-gray-500">{responseData.timeTaken}, {responseData.size}</span>
        </div>
      </div>

      {/* Tabs: Pretty, Raw, Preview, Headers */}
      <Tabs defaultValue="pretty" className="flex-1 flex flex-col">
        <TabsList className="border-b rounded-none justify-start px-0 pt-0 bg-transparent">
          <TabsTrigger value="pretty">Pretty</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        <TabsContent value="pretty" className="flex-1 overflow-auto p-0">
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded border text-sm overflow-auto h-full">
            {JSON.stringify(responseData.data, null, 2)}
          </pre>
        </TabsContent>
        <TabsContent value="raw" className="flex-1 overflow-auto p-4">
          <pre className="font-mono text-sm">
            {JSON.stringify(responseData.data)}
          </pre>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-auto p-4 text-sm text-gray-500">
          {/* Preview content - could be formatted HTML/XML view or other visualization */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded border h-full">
            {typeof responseData.data === 'object' ? (
              <div className="divide-y">
                {Object.entries(responseData.data).map(([key, value]) => (
                  <div key={key} className="py-2">
                    <div className="font-semibold">{key}</div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Preview not available for this content type.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="headers" className="flex-1 overflow-auto p-4 text-sm">
          <div className="space-y-2">
            {Object.entries(responseData.headers || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
