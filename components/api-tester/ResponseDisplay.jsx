"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSettings } from "@/lib/settings-context";

export default function ResponseDisplay({ responseData, darkMode = true }) {
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

  const isSuccessStatus = responseData.status >= 200 && responseData.status < 300;
  const [expanded, setExpanded] = useState(false);
  const { settings } = useSettings();
  const maxResponseSize = settings.responseSize ; // Convert MB to bytes

  return (
    <div className="flex flex-col h-full p-4">      {/* Status Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {responseData.length} Responses
          </Badge>
          <span className="text-xs text-gray-500">{responseData.timeTaken}, {responseData.size}</span>
          {responseData.isTruncated && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Truncated ({maxResponseSize}KB limit)
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs: Pretty, Raw, Preview, Headers */}
      <Tabs defaultValue="pretty" className="flex-1 flex flex-col h-full">
        <TabsList className="border-b rounded-none justify-start px-0 pt-0 bg-transparent">
          <TabsTrigger value="pretty">Pretty</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        
        {/* Tab Content with improved ScrollArea for scrollable content */}          <TabsContent value="pretty" className="flex-1 p-0 mt-0 h-full">
          <ScrollArea className="h-full w-full">
            {responseData.isTruncated && (
              <div className="text-yellow-600 dark:text-yellow-400 mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800 mx-4 mt-4">
                ⚠️ Response was truncated due to large size ({responseData.size}). Some data may not be shown.
              </div>
            )}
            <div className="p-4">
              <SyntaxHighlighter
                language="json"
                style={darkMode ? tomorrow : oneLight}
                customStyle={{
                  borderRadius: '4px',
                  padding: '16px',
                  margin: 0,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                showLineNumbers={true}
                wrapLines={true}
              >
                {JSON.stringify(responseData.data, null, 2)}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        </TabsContent>          <TabsContent value="raw" className="flex-1 mt-0 h-full"> 
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              <SyntaxHighlighter
                language="json"
                style={darkMode ? tomorrow : oneLight}
                customStyle={{
                  borderRadius: '4px',
                  padding: '16px',
                  margin: 0,
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.5'
                }}
              >
                {JSON.stringify(responseData.data)}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        </TabsContent>          <TabsContent value="preview" className="flex-1 mt-0 h-full">
          <ScrollArea className="h-full w-full">
            <div className="p-4 text-sm dark:text-gray-300 w-full">
              {responseData.isTruncated && (
                <div className="text-yellow-600 dark:text-yellow-400 mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800">
                  ⚠️ Response was truncated due to large size ({responseData.size}). Some data may not be shown.
                </div>
              )}
              
              {typeof responseData.data === 'object' && Array.isArray(responseData.data) ? (
                <div className="divide-y">
                  {responseData.data.map((item, index) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <details className="cursor-pointer">
                        <summary className="font-semibold mb-2 flex justify-between items-center">
                          <span>
                            {item.name || item.id || item._truncated ? "Truncation Info" : `Item ${index + 1}`}
                            {item._truncated && (
                              <span className="text-yellow-600 dark:text-yellow-400 ml-2">⚠️</span>
                            )}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {typeof item === 'object' ? Object.keys(item).length : 1} fields
                          </Badge>
                        </summary>
                        <div className="pl-4 pt-2 space-y-2">
                          {typeof item === 'object' && Object.entries(item).map(([key, value]) => (
                            <div key={key} className={`grid grid-cols-[120px_1fr] gap-2 ${key === '_truncated' ? 'text-yellow-600 dark:text-yellow-400 font-medium' : ''}`}>
                              <div className="font-medium text-gray-600 dark:text-gray-300">{key}:</div>
                              <div className="text-gray-700 dark:text-gray-300 break-all">
                                {typeof value === 'object' && value !== null ? (
                                  <details>
                                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400">Object</summary>
                                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                                      {JSON.stringify(value, null, 2)}
                                    </pre>
                                  </details>
                                ) : (
                                  String(value)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : typeof responseData.data === 'object' && responseData.data !== null ? (
                <div className="divide-y">
                  {Object.entries(responseData.data).map(([key, value]) => (
                    <div key={key} className={`py-2 ${key === '_truncated' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded' : ''}`}>
                      <div className="font-semibold">{key}</div>
                      <div className="text-gray-700 dark:text-gray-300 break-all">
                        {typeof value === 'object' && value !== null ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600 dark:text-blue-400">Object</summary>
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Preview not available for this content type.</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
          <TabsContent value="headers" className="flex-1 mt-0 h-full">
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              <SyntaxHighlighter
                language="json"
                style={darkMode ? tomorrow : oneLight}
                customStyle={{
                  borderRadius: '4px',
                  padding: '16px',
                  margin: 0,
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
              >
                {JSON.stringify(responseData.headers || {}, null, 2)}
              </SyntaxHighlighter>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
