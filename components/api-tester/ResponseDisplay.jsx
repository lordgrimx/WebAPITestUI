"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ResponseDisplay({ responseData }) {
  if (!responseData || responseData.length === 0) {
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

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar - Show total requests status */}
      <div className="flex-none p-4 pb-0">
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {responseData.length} Responses
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pretty" className="flex-1 flex flex-col overflow-hidden p-4 pt-2">
        <TabsList className="flex-none border-b rounded-none justify-start px-0 bg-transparent">
          <TabsTrigger value="pretty">Pretty</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="pretty" className="flex-1 overflow-auto mt-2">
          <div className="space-y-4">
            {responseData.map((response, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 flex justify-between items-center border-b">
                  <Badge variant="default"
                    className={`${response.status >= 200 && response.status < 300 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"}`}
                  >
                    Status {response.status} - Request {response.requestNumber}/{response.totalRequests}
                  </Badge>
                  <span className="text-xs text-gray-500">{response.timeTaken}</span>
                </div>
                <pre className="bg-white dark:bg-gray-900 p-4 text-sm overflow-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="raw" className="flex-1 overflow-auto mt-2">
          <pre className="font-mono text-sm">
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 overflow-auto mt-2">
          <div className="space-y-4">
            {responseData.map((response, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b">
                  <h3 className="font-medium">Request {response.data.requestNumber}</h3>
                </div>
                <div className="p-4">
                  <div className="divide-y">
                    {Object.entries(response.data).map(([key, value]) => (
                      <div key={key} className="py-2">
                        <div className="font-semibold">{key}</div>
                        <div className="text-gray-700 dark:text-gray-300">
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto mt-2">
          <div className="space-y-4">
            {responseData.map((response, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b">
                  <h3 className="font-medium">Request {response.data.requestNumber} Headers</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {Object.entries(response.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b">
                        <span className="text-gray-500">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
