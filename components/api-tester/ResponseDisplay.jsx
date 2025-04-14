"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSettings } from "@/lib/settings-context";

export default function ResponseDisplay({ responseData, darkMode }) { // Remove default value, rely on parent
  if (!responseData || responseData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-4 text-center ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
        <div className={`${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
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
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>No Response</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Click the Send button to make a request
        </p>
      </div>
    );
  }

  const isSuccessStatus = responseData.status >= 200 && responseData.status < 300;
  const [expanded, setExpanded] = useState(false);
  const { settings } = useSettings();
  const maxResponseSize = settings.responseSize ; // Convert KB to bytes

  return (
    <div className={`flex flex-col h-full p-4 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-700'}`}>      {/* Status Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Badge variant="default" className={`${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
            {responseData.length} Responses
          </Badge>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{responseData.timeTaken}, {responseData.size}</span>
          {responseData.isTruncated && (
            <Badge variant="outline" className={`${darkMode ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
              Truncated ({maxResponseSize}KB limit)
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs: Pretty, Raw, Preview, Headers */}
      <Tabs defaultValue="pretty" className="flex-1 flex flex-col h-full">
        <TabsList className={`border-b rounded-none justify-start px-0 pt-0 bg-transparent ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <TabsTrigger value="pretty" className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''}`}>Pretty</TabsTrigger>
          <TabsTrigger value="raw" className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''}`}>Raw</TabsTrigger>
          <TabsTrigger value="preview" className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''}`}>Preview</TabsTrigger>
          <TabsTrigger value="headers" className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''}`}>Headers</TabsTrigger>
        </TabsList>
        
        {/* Tab Content with improved ScrollArea for scrollable content */}          <TabsContent value="pretty" className="flex-1 p-0 mt-0 h-full">
          <ScrollArea className="h-full w-full">
            {responseData.isTruncated && (
              <div className={`${darkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200'} mb-2 p-2 rounded border mx-4 mt-4`}>
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
            <div className={`p-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} w-full`}>
              {responseData.isTruncated && (
                <div className={`${darkMode ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200'} mb-4 p-2 rounded border`}>
                  ⚠️ Response was truncated due to large size ({responseData.size}). Some data may not be shown.
                </div>
              )}
              
              {typeof responseData.data === 'object' && Array.isArray(responseData.data) ? (
                <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {responseData.data.map((item, index) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <details className="cursor-pointer">
                        <summary className="font-semibold mb-2 flex justify-between items-center">
                          <span>
                            {item.name || item.id || item._truncated ? "Truncation Info" : `Item ${index + 1}`}
                            {item._truncated && (
                              <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} ml-2`}>⚠️</span>
                            )}
                          </span>
                          <Badge variant="outline" className={`ml-2 ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}>
                            {typeof item === 'object' ? Object.keys(item).length : 1} fields
                          </Badge>
                        </summary>
                        <div className="pl-4 pt-2 space-y-2">
                          {typeof item === 'object' && Object.entries(item).map(([key, value]) => (
                            <div key={key} className={`grid grid-cols-[120px_1fr] gap-2 ${key === '_truncated' ? (darkMode ? 'text-yellow-400 font-medium' : 'text-yellow-600 font-medium') : ''}`}>
                              <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{key}:</div>
                              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                                {typeof value === 'object' && value !== null ? (
                                  <details>
                                    <summary className={`cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Object</summary>
                                    <pre className={`mt-2 p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded text-xs overflow-auto`}>
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
                <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {Object.entries(responseData.data).map(([key, value]) => (
                    <div key={key} className={`py-2 ${key === '_truncated' ? (darkMode ? 'text-yellow-400 bg-yellow-900/20 p-2 rounded' : 'text-yellow-600 bg-yellow-50 p-2 rounded') : ''}`}>
                      <div className="font-semibold">{key}</div>
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} break-all`}>
                        {typeof value === 'object' && value !== null ? (
                          <details>
                            <summary className={`cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Object</summary>
                            <pre className={`mt-2 p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded text-xs overflow-auto`}>
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
