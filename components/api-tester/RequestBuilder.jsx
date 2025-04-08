"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, SendHorizontal } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// HTTP Methods
const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];

// Params Tab Content
function ParamsTab({ params, setParams }) {
  const handleParamChange = (id, field, value) => {
    setParams(params.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleCheckboxChange = (id, checked) => {
     setParams(params.map(p => p.id === id ? { ...p, enabled: checked } : p));
  };

  const addParamRow = () => {
    setParams([...params, { id: Date.now(), key: "", value: "", enabled: false }]);
  };

  const removeParamRow = (id) => {
    setParams(params.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 text-sm">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className="font-medium text-gray-500"></div> {/* Checkbox space */}
        <div className="font-medium text-gray-500">KEY</div>
        <div className="font-medium text-gray-500">VALUE</div>
        <div className="font-medium text-gray-500"></div> {/* Delete button space */}
      </div>
      {params.map((param) => (
        <div key={param.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-1">
          <Checkbox
            checked={param.enabled}
            onCheckedChange={(checked) => handleCheckboxChange(param.id, checked)}
            aria-label="Enable parameter"
          />
          <Input
            placeholder="Key"
            value={param.key}
            onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
            className="h-8"
          />
          <Input
            placeholder="Value"
            value={param.value}
            onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-500"
            onClick={() => removeParamRow(param.id)}
            disabled={params.length <= 1} // Last row can't be deleted
            aria-label="Remove parameter"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
       <Button variant="outline" size="sm" onClick={addParamRow} className="mt-2">
         <Plus className="h-4 w-4 mr-1" /> Add Param
       </Button>
    </div>
  );
}

// Headers Tab Content
function HeadersTab({ headers, setHeaders }) {
  const handleHeaderChange = (id, field, value) => {
    setHeaders(headers.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleCheckboxChange = (id, checked) => {
     setHeaders(headers.map(h => h.id === id ? { ...h, enabled: checked } : h));
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { id: Date.now(), key: "", value: "", enabled: false }]);
  };

  const removeHeaderRow = (id) => {
    setHeaders(headers.filter(h => h.id !== id));
  };

  return (
    <div className="p-4 text-sm">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className="font-medium text-gray-500"></div>
        <div className="font-medium text-gray-500">KEY</div>
        <div className="font-medium text-gray-500">VALUE</div>
        <div className="font-medium text-gray-500"></div>
      </div>
      {headers.map((header) => (
        <div key={header.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-1">
          <Checkbox
            checked={header.enabled}
            onCheckedChange={(checked) => handleCheckboxChange(header.id, checked)}
            aria-label="Enable header"
          />
          <Input
            placeholder="Key"
            value={header.key}
            onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
            className="h-8"
          />
          <Input
            placeholder="Value"
            value={header.value}
            onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
            className="h-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-red-500"
            onClick={() => removeHeaderRow(header.id)}
            disabled={headers.length <= 1}
            aria-label="Remove header"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addHeaderRow} className="mt-2">
        <Plus className="h-4 w-4 mr-1" /> Add Header
      </Button>
    </div>
  );
}

export default function RequestBuilder({ selectedRequestId, onSendRequest }) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/v1/users");
  const [params, setParams] = useState([
    { id: 1, key: "limit", value: "10", enabled: true },
    { id: 2, key: "", value: "", enabled: false },
  ]);
  const [headers, setHeaders] = useState([
    { id: 1, key: "Content-Type", value: "application/json", enabled: true },
    { id: 2, key: "", value: "", enabled: false },
  ]);
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  
  // Fix for "Cannot convert undefined or null to object" error
  const requestData = useQuery(
    api?.requests?.getRequestById, 
    selectedRequestId ? { id: selectedRequestId } : "skip"
  );
  
  // Update form when selectedRequestId changes and data is loaded
  useEffect(() => {
    if (requestData) {
      setMethod(requestData.method || "GET");
      setUrl(requestData.url || "");
      
      // Initialize params, headers, body if they exist in the loaded request
      if (requestData.params) {
        try {
          const parsedParams = JSON.parse(requestData.params);
          if (Array.isArray(parsedParams)) {
            setParams(parsedParams);
          }
        } catch (e) {
          console.error("Error parsing params:", e);
        }
      }
      
      if (requestData.headers) {
        try {
          const parsedHeaders = JSON.parse(requestData.headers);
          if (Array.isArray(parsedHeaders)) {
            setHeaders(parsedHeaders);
          }
        } catch (e) {
          console.error("Error parsing headers:", e);
        }
      }
      
      setBody(requestData.body || "");
    }
  }, [requestData]);

  const handleSendRequest = () => {
    // Get enabled params
    const enabledParams = params
      .filter(p => p.enabled && p.key.trim())
      .reduce((obj, param) => {
        obj[param.key] = param.value;
        return obj;
      }, {});
    
    // Get enabled headers
    const enabledHeaders = headers
      .filter(h => h.enabled && h.key.trim())
      .reduce((obj, header) => {
        obj[header.key] = header.value;
        return obj;
      }, {});
    
    // Create request object
    const requestObject = {
      method,
      url,
      params: enabledParams,
      headers: enabledHeaders,
      body: method !== "GET" && body ? body : undefined
    };
    
    if (onSendRequest) {
      onSendRequest(requestObject);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Display error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}
      
      {/* Top Bar: Method, URL, Send Button */}
      <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-800 space-x-2">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[120px] flex-shrink-0 font-medium">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {httpMethods.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="url"
          placeholder="https://api.example.com/v1/users"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow"
        />
        <Button 
          onClick={handleSendRequest} 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
        >
          <SendHorizontal className="h-4 w-4 mr-1" /> Send
        </Button>
      </div>

      {/* Tabs: Params, Headers, Body, Auth, Tests */}
      <Tabs defaultValue="params" className="flex-1 flex flex-col">
        <TabsList className="border-b rounded-none justify-start px-2 pt-2 bg-transparent">
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="flex-1 overflow-auto">
          <ParamsTab params={params} setParams={setParams} />
        </TabsContent>
        <TabsContent value="headers" className="flex-1 overflow-auto">
          <HeadersTab headers={headers} setHeaders={setHeaders} />
        </TabsContent>
        <TabsContent value="body" className="p-4 text-sm flex-1 overflow-auto">
          <div className="flex flex-col h-full">
            <textarea 
              className="w-full h-full min-h-[200px] p-2 border rounded font-mono text-sm"
              placeholder="Request body (JSON, XML, etc.)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={method === "GET"}
            />
            {method === "GET" && (
              <p className="text-amber-600 text-xs mt-2">GET requests cannot have a body.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="auth" className="p-4 text-sm text-gray-500">
          <p>Authentication options will be implemented soon.</p>
        </TabsContent>
        <TabsContent value="tests" className="p-4 text-sm text-gray-500">
          <p>Test scripts will be implemented soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
