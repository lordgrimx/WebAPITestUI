"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { 
  Plus, 
  Trash2, 
  SendHorizontal, 
  Code,
  Key,
  Lock,
  Globe,
  User
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce"; // Add this import

// HTTP Methods
const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];

// Params Tab Content
function ParamsTab({ params, setParams }) {
  const handleParamChange = (id, field, value) => {
    const updatedParams = params.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setParams(updatedParams);
  };

  const handleCheckboxChange = (id, checked) => {
    const updatedParams = params.map(p => 
      p.id === id ? { ...p, enabled: checked } : p
    );
    setParams(updatedParams);
  };

  const addParamRow = () => {
    const newParam = {
      id: Date.now(),
      key: "",
      value: "",
      enabled: true
    };
    setParams(prevParams => [...prevParams, newParam]);
  };

  const removeParamRow = (id) => {
    const updatedParams = params.filter(p => p.id !== id);
    setParams(updatedParams);
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
    const updatedHeaders = headers.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    );
    setHeaders(updatedHeaders);
  };

  const handleCheckboxChange = (id, checked) => {
    const updatedHeaders = headers.map(h => 
      h.id === id ? { ...h, enabled: checked } : h
    );
    setHeaders(updatedHeaders);
  };

  const addHeaderRow = () => {
    const newHeader = {
      id: Date.now(),
      key: "",
      value: "",
      enabled: true
    };
    setHeaders(prevHeaders => [...prevHeaders, newHeader]);
  };

  const removeHeaderRow = (id) => {
    const updatedHeaders = headers.filter(h => h.id !== id);
    setHeaders(updatedHeaders);
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

// Auth Tab Content
function AuthTab({ auth, setAuth }) {
  const authTypes = [
    { value: "none", label: "No Auth" },
    { value: "basic", label: "Basic Auth" },
    { value: "bearer", label: "Bearer Token" },
    { value: "apiKey", label: "API Key" },
    { value: "oauth2", label: "OAuth 2.0" }
  ];

  const handleAuthTypeChange = (type) => {
    setAuth({
      ...auth,
      type
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Auth Type
        </label>
        <Select value={auth.type} onValueChange={handleAuthTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select auth type" />
          </SelectTrigger>
          <SelectContent>
            {authTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {auth.type === "basic" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Username
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Username"
                value={auth.username || ""}
                onChange={(e) => setAuth({ ...auth, username: e.target.value })}
                className="pl-8"
              />
              <User className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="Password"
                value={auth.password || ""}
                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                className="pl-8"
              />
              <Lock className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {auth.type === "bearer" && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Token
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Bearer token"
              value={auth.token || ""}
              onChange={(e) => setAuth({ ...auth, token: e.target.value })}
                className="pl-8"
            />
            <Key className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            The token will be prefixed with 'Bearer' in the Authorization header
          </p>
        </div>
      )}

      {auth.type === "apiKey" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Key Name
            </label>
            <Input
              type="text"
              placeholder="API Key Name"
              value={auth.apiKeyName || ""}
              onChange={(e) => setAuth({ ...auth, apiKeyName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Key Value
            </label>
            <Input
              type="text"
              placeholder="API Key Value"
              value={auth.apiKeyValue || ""}
              onChange={(e) => setAuth({ ...auth, apiKeyValue: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Add to
            </label>
            <Select 
              value={auth.apiKeyLocation || "header"} 
              onValueChange={(value) => setAuth({ ...auth, apiKeyLocation: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="query">Query Parameter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {auth.type === "oauth2" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Access Token URL
            </label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://example.com/oauth/token"
                value={auth.accessTokenUrl || ""}
                onChange={(e) => setAuth({ ...auth, accessTokenUrl: e.target.value })}
                className="pl-8"
              />
              <Globe className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Client ID
            </label>
            <Input
              type="text"
              placeholder="Client ID"
              value={auth.clientId || ""}
              onChange={(e) => setAuth({ ...auth, clientId: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Client Secret
            </label>
            <Input
              type="password"
              placeholder="Client Secret"
              value={auth.clientSecret || ""}
              onChange={(e) => setAuth({ ...auth, clientSecret: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Scope
            </label>
            <Input
              type="text"
              placeholder="read:user write:user"
              value={auth.scope || ""}
              onChange={(e) => setAuth({ ...auth, scope: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate scopes with spaces
            </p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            Request Token
          </Button>
        </div>
      )}
      
      {auth.type === "none" && (
        <div className="text-gray-500 text-sm">
          No authentication will be applied to the request.
        </div>
      )}
    </div>
  );
}

// Tests Tab Content
function TestsTab({ tests, setTests }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Test Script <span className="text-xs text-gray-500">(JavaScript)</span>
        </label>
        <div className="border rounded overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b flex justify-between items-center">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Tests
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Examples
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Documentation
              </Button>
            </div>
          </div>
          <textarea
            value={tests.script || ""}
            onChange={(e) => setTests({ ...tests, script: e.target.value })}
            className="w-full h-64 p-3 font-mono text-sm focus:outline-none"
            placeholder={`// Example test script
pm.test("Status code is 200", function() {
  pm.expect(pm.response.code).to.equal(200);
});

pm.test("Response contains user data", function() {
  const responseJson = pm.response.json();
  pm.expect(responseJson).to.have.property("id");
  pm.expect(responseJson).to.have.property("name");
});`}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Results
        </h3>
        {tests.results && tests.results.length > 0 ? (
          <div className="space-y-2">
            {tests.results.map((result, index) => (
              <div 
                key={index}
                className={`p-2 border rounded flex items-center ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`h-4 w-4 rounded-full mr-2 ${
                  result.passed ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={result.passed ? 'text-green-700' : 'text-red-700'}>
                  {result.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm border rounded p-3 bg-gray-50 dark:bg-gray-800">
            Tests will run when you send a request
          </div>
        )}
      </div>
    </div>
  );
}

// Fetch API kullanarak gerçek HTTP isteği yapacak fonksiyon
const makeHttpRequest = async (requestConfig) => {
  const {
    method,
    url,
    params,
    headers,
    body,
    auth,
    requestNumber,
    totalRequests
  } = requestConfig;

  try {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value);
    });

    const startTime = Date.now();

    const requestHeaders = {
      ...headers,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(urlObj.toString(), {
      method: method,
      headers: requestHeaders,
      body: method !== 'GET' ? body : undefined,
      mode: 'cors',
      credentials: 'same-origin',
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    let responseData;
    const contentType = response.headers.get('content-type');
    
    try {
      // Her zaman önce JSON olarak parse etmeyi dene
      responseData = await response.json();
    } catch (e) {
      // JSON parse başarısız olursa text olarak al
      responseData = await response.text();
    }

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    console.log("MakeHttp :",responseData);
    

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData, // Direkt responseData'yı kullan
      size: typeof responseData === 'string' ? responseData.length : JSON.stringify(responseData).length,
      timeTaken: `${duration} ms`,
      requestNumber,
      totalRequests
    };

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new Error(`CORS Error: The server must allow requests from ${window.location.origin}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
};

export default function RequestBuilder({ selectedRequestId, onSendRequest, onRequestDataChange }) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/v1/users");
  const [debouncedUrl, setDebouncedUrl] = useState(url);
  const [params, setParams] = useState([
    { id: 1, key: "limit", value: "10", enabled: true },
    { id: 2, key: "", value: "", enabled: false },
  ]);
  const [headers, setHeaders] = useState([
    { id: 1, key: "Content-Type", value: "application/json", enabled: true },
    { id: 2, key: "", value: "", enabled: false },
  ]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none" });
  const [tests, setTests] = useState({ script: "", results: [] });
  const [error, setError] = useState(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parallelRequestCount, setParallelRequestCount] = useState(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Memoize request data query
  const requestData = useQuery(
    api?.requests?.getRequestById, 
    selectedRequestId ? { id: selectedRequestId } : "skip"
  );

  // URL validation
  const validateUrl = useCallback(async (url) => {
    if (!url) return;
    
    setIsValidatingUrl(true);
    setUrlError(null);
    
    try {
      const urlObj = new URL(url);
      // Optional: Add more validation logic here
    } catch (error) {
      setUrlError('Invalid URL format');
    } finally {
      setIsValidatingUrl(false);
    }
  }, []);

  // Debounce URL updates
  const debouncedSetUrl = useCallback((value) => {
    requestAnimationFrame(() => {
      setUrl(value);
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateUrl(url);
      setDebouncedUrl(url);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [url, validateUrl]);

  // Memoize enabled params and headers for executeRequest
  const enabledParams = useMemo(() => 
    params
      .filter(p => p.enabled && p.key.trim())
      .reduce((obj, param) => {
        obj[param.key] = param.value;
        return obj;
      }, {}),
    [params]
  );

  const enabledHeaders = useMemo(() => 
    headers
      .filter(h => h.enabled && h.key.trim())
      .reduce((obj, header) => {
        obj[header.key] = header.value;
        return obj;
      }, {}),
    [headers]
  );

  // Memoize the current request data
  const currentData = useMemo(() => ({
    method,
    url: debouncedUrl, // Use debounced URL here
    headers: headers.filter(h => h.enabled && h.key).length > 0 
      ? JSON.stringify(headers.filter(h => h.enabled && h.key))
      : undefined,
    params: params.filter(p => p.enabled && p.key).length > 0
      ? JSON.stringify(params.filter(p => p.enabled && p.key))
      : undefined,
    body: method !== "GET" ? body : undefined
  }), [method, debouncedUrl, headers, params, body]); // Use debounced URL in dependencies

  // Add this new useEffect for cleaning up state when selectedRequestId changes
  useEffect(() => {
    if (!selectedRequestId) {
      // Reset state when no request is selected
      setMethod("GET");
      setUrl("");
      setParams([
        { id: 1, key: "", value: "", enabled: false }
      ]);
      setHeaders([
        { id: 1, key: "", value: "", enabled: false }
      ]);
      setBody("");
      setAuth({ type: "none" });
      setTests({ script: "", results: [] });
    }
  }, [selectedRequestId]);

  // Update executeRequest to always use the current state values
  const executeRequest = useCallback(async () => {
    if (!onSendRequest) return;

    // Validate URL before sending request
    try {
      new URL(url); // This will throw if URL is invalid
    } catch (error) {
      setError('Invalid URL. Please enter a valid URL including http:// or https://');
      setDialogOpen(false);
      return;
    }

    const requests = Array.from({ length: parallelRequestCount }, (_, i) => {
      const requestObject = {
        method,
        url, // Use current url state instead of debouncedUrl
        params: enabledParams,
        headers: enabledHeaders,
        body: method !== "GET" ? body : undefined,
        auth,
        tests,
        requestNumber: i + 1,
        totalRequests: parallelRequestCount
      };
      
      return makeHttpRequest(requestObject)
        .then(response => {
          // Clear any previous errors
          setError(null);
          onSendRequest(response);
          return response;
        })
        .catch(error => {
          setError(error.message);
          console.error(`Request ${i + 1} failed:`, error);
          onSendRequest({
            status: 0,
            statusText: error.message,
            headers: {},
            data: { error: error.message },
            size: 0,
            timeTaken: '0 ms',
            requestNumber: i + 1,
            totalRequests: parallelRequestCount
          });
        });
    });

    try {
      await Promise.all(requests);
    } catch (error) {
      console.error('Error executing requests:', error);
      setError(error.message);
    }
    
    setDialogOpen(false);
  }, [method, url, enabledParams, enabledHeaders, body, auth, tests, parallelRequestCount, onSendRequest]);

  // Update form when selectedRequestId changes and data is loaded
  useEffect(() => {
    if (requestData) {
      // Set method and URL first to ensure they're available
      setMethod(requestData.method || "GET");
      setUrl(requestData.url || "");
      setDebouncedUrl(requestData.url || ""); // Also update debounced URL
      
      if (requestData.params) {
        try {
          const parsedParams = JSON.parse(requestData.params);
          setParams(Array.isArray(parsedParams) ? parsedParams : [
            { id: 1, key: "", value: "", enabled: false }
          ]);
        } catch (e) {
          console.error("Error parsing params:", e);
          setParams([{ id: 1, key: "", value: "", enabled: false }]);
        }
      }
      
      if (requestData.headers) {
        try {
          const parsedHeaders = JSON.parse(requestData.headers);
          setHeaders(Array.isArray(parsedHeaders) ? parsedHeaders : [
            { id: 1, key: "", value: "", enabled: false }
          ]);
        } catch (e) {
          console.error("Error parsing headers:", e);
          setHeaders([{ id: 1, key: "", value: "", enabled: false }]);
        }
      }
      
      setBody(requestData.body || "");
      setAuth(requestData.auth || { type: "none" });
      setTests(requestData.tests || { script: "", results: [] });
      setError(null); // Clear any previous errors
    }
  }, [requestData]);

  // Update parent component with current request data
  useEffect(() => {
    if (onRequestDataChange) {
      onRequestDataChange(currentData);
    }
  }, [currentData, onRequestDataChange]);

  const handleSendRequest = useCallback(() => {
    setDialogOpen(true);
  }, []);
  
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
        <div className="flex-grow relative">
          <Input
            type="url"
            placeholder="https://api.example.com/v1/users"
            value={url}
            onChange={(e) => debouncedSetUrl(e.target.value)}
            className={`w-full ${urlError ? 'border-red-500' : ''}`}
          />
          {isValidatingUrl && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
          {urlError && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-500">
              {urlError}
            </div>
          )}
        </div>
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
        <TabsContent value="auth" className="flex-1 overflow-auto">
          <AuthTab auth={auth} setAuth={setAuth} />
        </TabsContent>
        <TabsContent value="tests" className="flex-1 overflow-auto">
          <TestsTab tests={tests} setTests={setTests} />
        </TabsContent>
      </Tabs>

      {/* Dialog for advanced options */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="request-dialog-description">
          <DialogHeader>
            <DialogTitle>Advanced Options</DialogTitle>
            <DialogDescription id="request-dialog-description">
              Configure advanced settings for your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Parallel Request Count
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={parallelRequestCount}
                onChange={(e) => setParallelRequestCount(Number(e.target.value))}
                aria-label="Number of parallel requests"
              />
            </div>
            <div>
              <Checkbox
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
                id="show-advanced"
                aria-label="Show advanced options"
              />
              <label htmlFor="show-advanced" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Show advanced options
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeRequest}>Send Request{parallelRequestCount > 1 ? `s (${parallelRequestCount})` : ''}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
