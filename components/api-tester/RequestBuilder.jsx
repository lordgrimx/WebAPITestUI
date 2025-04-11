"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// GenerateCodeModal import removed as it's handled in Header now
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
  User,
  Save, // Added Save icon for consistency if needed later
  Activity
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
import { toast } from "react-toastify";
import LoadTestDialog from "@/components/api-tester/LoadTestDialog"; // Assuming LoadTestDialog is a component
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// HTTP Methods
const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];

// Method color mapping
const methodColors = {
  GET: "bg-blue-600 hover:bg-blue-700",
  POST: "bg-green-600 hover:bg-green-700",
  PUT: "bg-yellow-600 hover:bg-yellow-700",
  DELETE: "bg-red-600 hover:bg-red-700",
  PATCH: "bg-purple-600 hover:bg-purple-700",
  OPTIONS: "bg-gray-600 hover:bg-gray-700",
  HEAD: "bg-pink-600 hover:bg-pink-700"
};

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
    // Keep at least one row, even if empty
    if (params.length > 1) {
        const updatedParams = params.filter(p => p.id !== id);
        setParams(updatedParams);
    } else {
        // If it's the last row, just clear it instead of removing
        setParams([{ id: params[0].id, key: "", value: "", enabled: true }]);
    }
  };


  return (
    <div className="p-4 text-sm">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className="font-medium text-gray-500"></div> {/* Checkbox space */}
        <div className="font-medium text-gray-500">KEY</div>
        <div className="font-medium text-gray-500">VALUE</div>
        <div className="font-medium text-gray-500"></div> {/* Delete button space */}
      </div>
      {params.map((param, index) => (
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
            // Disable delete for the last row
            disabled={params.length <= 1}
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
    // Keep at least one row, even if empty
    if (headers.length > 1) {
        const updatedHeaders = headers.filter(h => h.id !== id);
        setHeaders(updatedHeaders);
    } else {
        // If it's the last row, just clear it
        setHeaders([{ id: headers[0].id, key: "", value: "", enabled: true }]);
    }
 };


  return (
    <div className="p-4 text-sm">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className="font-medium text-gray-500"></div>
        <div className="font-medium text-gray-500">KEY</div>
        <div className="font-medium text-gray-500">VALUE</div>
        <div className="font-medium text-gray-500"></div>
      </div>
      {headers.map((header, index) => (
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
            // Disable delete for the last row
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
function AuthTab({ auth, setAuth, authToken, onUpdateAuthToken }) {
  const authTypes = [
    { value: "none", label: "No Auth" },
    { value: "basic", label: "Basic Auth" },
    { value: "bearer", label: "Bearer Token" },
    { value: "apiKey", label: "API Key" },
    { value: "oauth2", label: "OAuth 2.0" }
  ];

  // Use local state for token input to avoid direct mutation of prop if needed elsewhere
  const [tokenInput, setTokenInput] = useState(auth?.token || authToken || '');

  // Update local state if the prop changes (e.g., loaded from request)
  useEffect(() => {
    setTokenInput(auth?.token || authToken || '');
  }, [auth?.token, authToken]);


  const handleAuthTypeChange = (type) => {
    // Reset specific fields when changing type
    const newAuth = { type };
    if (type !== 'basic') {
      newAuth.username = undefined;
      newAuth.password = undefined;
    }
    if (type !== 'bearer') {
      newAuth.token = undefined;
      setTokenInput(''); // Clear local token input too
    }
    if (type !== 'apiKey') {
      newAuth.apiKeyName = undefined;
      newAuth.apiKeyValue = undefined;
      newAuth.apiKeyLocation = undefined;
    }
     if (type !== 'oauth2') {
       newAuth.accessTokenUrl = undefined;
       newAuth.clientId = undefined;
       newAuth.clientSecret = undefined;
       newAuth.scope = undefined;
     }
    setAuth(newAuth);
  };

  const handleTokenChange = (e) => {
    const newToken = e.target.value;
    setTokenInput(newToken);
    setAuth({ ...auth, token: newToken });
    // Optionally call parent update if needed immediately
    // onUpdateAuthToken?.(newToken);
  };

   // Handle changes for other auth fields
   const handleAuthFieldChange = (field, value) => {
     setAuth(prevAuth => ({ ...prevAuth, [field]: value }));
   };


  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
          Auth Type
        </label>
        <Select value={auth?.type || 'none'} onValueChange={handleAuthTypeChange}>
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

      {auth?.type === "basic" && (
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
                onChange={(e) => handleAuthFieldChange('username', e.target.value)}
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
                onChange={(e) => handleAuthFieldChange('password', e.target.value)}
                className="pl-8"
              />
              <Lock className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {auth?.type === "bearer" && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Bearer Token
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your bearer token"
              value={tokenInput}
              onChange={handleTokenChange}
              className="pl-8"
            />
            <Key className="h-4 w-4 absolute left-2 top-2 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Token will be included in Authorization header
          </p>
        </div>
      )}

      {auth?.type === "apiKey" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Key Name
            </label>
            <Input
              type="text"
              placeholder="API Key Name"
              value={auth.apiKeyName || ""}
              onChange={(e) => handleAuthFieldChange('apiKeyName', e.target.value)}
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
              onChange={(e) => handleAuthFieldChange('apiKeyValue', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Add to
            </label>
            <Select
              value={auth.apiKeyLocation || "header"}
              onValueChange={(value) => handleAuthFieldChange('apiKeyLocation', value)}
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

      {auth?.type === "oauth2" && (
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
                 onChange={(e) => handleAuthFieldChange('accessTokenUrl', e.target.value)}
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
               onChange={(e) => handleAuthFieldChange('clientId', e.target.value)}
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
               onChange={(e) => handleAuthFieldChange('clientSecret', e.target.value)}
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
               onChange={(e) => handleAuthFieldChange('scope', e.target.value)}
             />
             <p className="text-xs text-gray-500 mt-1">
               Separate scopes with spaces
             </p>
           </div>
           <Button variant="outline" size="sm" className="mt-2">
             Request Token (Not Implemented)
           </Button>
         </div>
      )}

      {(!auth || auth?.type === "none") && (
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
            value={tests?.script || ""} // Use optional chaining
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
        {tests?.results && tests.results.length > 0 ? ( // Use optional chaining
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

// Default empty row factory
const createDefaultRow = () => ({ id: Date.now(), key: "", value: "", enabled: true });

// Add initialData prop
export default function RequestBuilder({
  selectedRequestId,
  initialData, // Data from history item
  onSendRequest, // This is ApiTester's handleSendRequest
  onRequestDataChange,
  authToken,
  onUpdateAuthToken
}) {
  // Initialize state based on initialData if provided, otherwise default
  const [method, setMethod] = useState(initialData?.method || "GET");
  const [url, setUrl] = useState(initialData?.url || ""); // Initialize URL
  const [debouncedUrl, setDebouncedUrl] = useState(url);
  // Initialize with a single default row
  const [params, setParams] = useState([createDefaultRow()]);
  const [headers, setHeaders] = useState([createDefaultRow()]);
  const [body, setBody] = useState("");
  const [auth, setAuth] = useState({ type: "none" });
  const [tests, setTests] = useState({ script: "", results: [] });
  const [error, setError] = useState(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null); // For user ID from JWT token
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parallelRequestCount, setParallelRequestCount] = useState(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showLoadTestDialog, setShowLoadTestDialog] = useState(false);

  // Memoize request data query
  const requestData = useQuery(
    api?.requests?.getRequestById,
    selectedRequestId ? { id: selectedRequestId } : "skip"
  );
  
  // Log when request data is loaded
  useEffect(() => {
    if (selectedRequestId && requestData) {
      console.log("Loaded request data:", requestData);
    }
  }, [selectedRequestId, requestData]);

  // URL validation
  const validateUrl = useCallback(async (urlToValidate) => {
    if (!urlToValidate) {
        setUrlError(null); // Clear error if URL is empty
        return;
    };

    setIsValidatingUrl(true);
    setUrlError(null);    try {
      // Basic check for protocol
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
         throw new Error("URL must start with http:// or https://");
      }
      const urlObj = new URL(urlToValidate);
      // Optional: Add more specific validation if needed (e.g., check hostname)
    } catch (error) {
      setUrlError(error.message || 'Invalid URL format');
    } finally {
      setIsValidatingUrl(false);
    }
  }, []);

  // Fetch user session info from the server-side API endpoint
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session'); // Use the session API route
        const data = await response.json();

        if (response.ok && data.success && data.userId) {
          console.log("Session verified, setting user ID:", data.userId);
          setCurrentUserID(data.userId);
        } else {
          console.error("Session verification failed:", data.error || 'No user ID returned');
          setCurrentUserID(null); // Ensure user ID is null if session is invalid
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setCurrentUserID(null); // Ensure user ID is null on fetch error
      }
    };

    fetchSession();
  }, []); // Runs once on component mount


  // Debounce URL updates and validation
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUrl(url);
      validateUrl(url); // Validate the debounced URL
    }, 500); // Increased debounce time for validation

    // Cleanup function to cancel the timeout if url changes again quickly
    return () => {
      clearTimeout(handler);
    };
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
        // Ensure header keys are treated case-insensitively if needed by backend,
        // but typically Axios handles this. Storing as entered is usually fine.
        obj[header.key] = header.value;
        return obj;
      }, {}),
    [headers]
  );

  // Memoize the current request data to pass up to ApiTester
  const currentData = useMemo(() => ({
    method,
    url: debouncedUrl, // Use debounced URL for consistency
    // Stringify only if there are enabled headers/params
    headers: headers.some(h => h.enabled && h.key.trim())
      ? JSON.stringify(headers.filter(h => h.enabled)) // Store all enabled, even if key/value is empty initially
      : undefined,
    params: params.some(p => p.enabled && p.key.trim())
      ? JSON.stringify(params.filter(p => p.enabled)) // Store all enabled
      : undefined,
    body: method !== "GET" && method !== "HEAD" ? body : undefined, // Body only for relevant methods
    auth: auth, // Pass the auth object
    tests: tests // Pass the tests object
  }), [method, debouncedUrl, headers, params, body, auth, tests]);

  // Update form based on initialData (from history) or selectedRequestId (from collection)
  useEffect(() => {
    // Priority 1: Populate from initialData (history item)
    if (initialData) {
      console.log("Populating form from initial history data:", initialData);
      setMethod(initialData.method || "GET");
      setUrl(initialData.url || "");

      // Reset other fields as they are not directly from history item in this setup
      setParams([createDefaultRow()]);
      setHeaders([createDefaultRow()]);
      setBody("");
      setAuth({ type: "none" });
      setTests({ script: "", results: [] });
      setError(null);
    }
    // Priority 2: Populate from selectedRequestId (collection item)
    else if (selectedRequestId && requestData) {
      console.log("Populating form for selected request:", selectedRequestId, requestData);
      setMethod(requestData.method || "GET");
      setUrl(requestData.url || "");

      // Safely parse and set Params
      let parsedParams = [createDefaultRow()];
      if (requestData.params && typeof requestData.params === 'string') {
        try {
          const tempParsed = JSON.parse(requestData.params);
          if (Array.isArray(tempParsed) && tempParsed.length > 0) {
            parsedParams = tempParsed.map(p => ({
              id: p.id || Date.now() + Math.random(),
              key: p.key || "",
              value: p.value || "",
              enabled: p.enabled !== undefined ? p.enabled : true
            }));
          } else { console.warn("Parsed params is not a valid array, using default."); }
        } catch (e) { console.error("Error parsing params:", e); }
      } else { console.log("No valid params string found, using default."); }
      setParams(parsedParams);

      // Safely parse and set Headers
      let parsedHeaders = [createDefaultRow()];
      if (requestData.headers && typeof requestData.headers === 'string') {
        try {
          const tempParsed = JSON.parse(requestData.headers);
          if (Array.isArray(tempParsed) && tempParsed.length > 0) {
            parsedHeaders = tempParsed.map(h => ({
              id: h.id || Date.now() + Math.random(),
              key: h.key || "",
              value: h.value || "",
              enabled: h.enabled !== undefined ? h.enabled : true
            }));
          } else { console.warn("Parsed headers is not a valid array, using default."); }
        } catch (e) { console.error("Error parsing headers:", e); }
      } else { console.log("No valid headers string found, using default."); }
      setHeaders(parsedHeaders);

      // Set body
      setBody(requestData.body || "");

      // Handle auth data
      if (requestData.auth && typeof requestData.auth === 'object') {
        setAuth(requestData.auth);
      } else if (requestData.auth && typeof requestData.auth === 'string') {
        try { setAuth(JSON.parse(requestData.auth)); }
        catch (e) { console.error("Error parsing auth data:", e); setAuth({ type: "none" }); }
      } else { setAuth({ type: "none" }); }

      // Handle tests data
      if (requestData.tests && typeof requestData.tests === 'object') {
        setTests(requestData.tests);
      } else if (requestData.tests && typeof requestData.tests === 'string') {
        try { setTests(JSON.parse(requestData.tests)); }
        catch (e) { console.error("Error parsing tests data:", e); setTests({ script: "", results: [] }); }
      } else { setTests({ script: "", results: [] }); }

      setError(null); // Clear previous errors
    }
    // Priority 3: Reset form if neither initialData nor selectedRequestId is active
    else if (!initialData && !selectedRequestId) {
      console.log("Resetting form (no initialData or selectedRequestId).");
      setMethod("GET");
      setUrl("");
      setParams([createDefaultRow()]);
      setHeaders([createDefaultRow()]);
      setBody("");
      setAuth({ type: "none" });
      setTests({ script: "", results: [] });
      setError(null);
    }
    // If selectedRequestId is set but requestData is still loading, wait.
  }, [initialData, selectedRequestId, requestData]); // Depend on all three


  // Update parent component (ApiTester) with current request data from RequestBuilder
  useEffect(() => {
    if (onRequestDataChange) {
      onRequestDataChange(currentData);
    }
  }, [currentData, onRequestDataChange]);

  const handleSendClick = useCallback(() => {
     // Validate URL one last time before opening dialog or sending
     validateUrl(url);
     if (url && !urlError) {
       setDialogOpen(true);
     } else if (!url) {
        setError('URL cannot be empty.');
     } else {
        setError(urlError || 'Invalid URL format.'); // Show existing urlError or a generic one
     }
  }, [url, urlError, validateUrl]);


  // Update executeRequest to pass the request config to onSendRequest
  const executeRequest = useCallback(async () => {
    if (!onSendRequest || !url || urlError) {
        console.error("Cannot send request. Missing handler, URL, or URL is invalid.");
        if (!url) setError('URL cannot be empty.');
        else if (urlError) setError(urlError);
        setDialogOpen(false); // Close dialog if validation fails here
        return;
    };


    // Clear previous errors before sending
    setError(null);

    // Prepare the request configuration object using the latest state
    const requestConfig = {
      method,
      url, // Use the current, validated URL state
      params: enabledParams, // Use memoized enabled params
      headers: enabledHeaders, // Use memoized enabled headers
      body: method !== "GET" && method !== "HEAD" ? body : undefined,
      auth, // Pass the current auth state
      tests, // Pass the current tests state
      // Parallel request logic needs to be handled in ApiTester if required
      requestNumber: 1, // Assuming single request for now
      totalRequests: 1 // Assuming single request for now
    };

    console.log("Executing request with config:", requestConfig);


    try {
      // Pass the configuration object to ApiTester's handler
      await onSendRequest(requestConfig);
    } catch (err) {
      // Handle potential errors from the onSendRequest handler itself
      setError(err.message || "An error occurred while sending the request.");
      console.error('Error during onSendRequest call:', err);
    } finally {
      setDialogOpen(false); // Close dialog regardless of success/failure
    }

  }, [method, url, urlError, enabledParams, enabledHeaders, body, auth, tests, onSendRequest]);


  return (
    <div className="flex flex-col h-full">
      {/* Display error if any */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm mb-2 mx-2 rounded relative" role="alert">
           <strong className="font-bold">Error:</strong>
           <span className="block sm:inline"> {error}</span>
           <span className="absolute top-0 bottom-0 right-0 px-4 py-2" onClick={() => setError(null)}>
             <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
           </span>
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
            value={url} // Bind directly to url state
            onChange={(e) => setUrl(e.target.value)} // Update url state directly
            className={`w-full ${urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-blue-500 focus:ring-blue-500'}`} // Dynamic border
            aria-invalid={!!urlError}
            aria-describedby={urlError ? "url-error-message" : undefined}
          />
          {isValidatingUrl && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}
          {urlError && (
            <div id="url-error-message" className="absolute -bottom-5 left-0 text-xs text-red-500">
              {urlError}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSendClick} // Opens the dialog after validation
            className={`${methodColors[method]} text-white flex items-center`}
            disabled={isValidatingUrl} // Disable while validating
          >
            <SendHorizontal className="h-4 w-4 mr-1" /> Send
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowLoadTestDialog(true)}
                  variant="outline"
                  className="flex items-center"
                  disabled={!url || !!urlError}
                >
                  <Activity className="h-4 w-4 mr-1" /> Load Test
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create k6 load test</p>
                <p className="text-xs text-gray-500">Results will be shown in the Load Tests page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tabs: Params, Headers, Body, Auth, Tests */}
      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 */}
        <TabsList className="border-b rounded-none justify-start px-2 pt-2 bg-transparent flex-shrink-0"> {/* Added flex-shrink-0 */}
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>
        {/* Ensure TabsContent takes remaining space and scrolls */}
        <TabsContent value="params" className="flex-1 overflow-auto">
          <ParamsTab params={params} setParams={setParams} />
        </TabsContent>
        <TabsContent value="headers" className="flex-1 overflow-auto">
          <HeadersTab headers={headers} setHeaders={setHeaders} />
        </TabsContent>
        <TabsContent value="body" className="p-4 text-sm flex-1 overflow-auto flex flex-col"> {/* Added flex flex-col */}
          <div className="flex flex-col h-full flex-1"> {/* Added flex-1 */}
            <textarea
              className="w-full h-full flex-1 p-2 border rounded font-mono text-sm resize-none" // Added resize-none
              placeholder="Request body (JSON, XML, etc.)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={method === "GET" || method === "HEAD"} // Also disable for HEAD
            />
            {(method === "GET" || method === "HEAD") && (
              <p className="text-amber-600 text-xs mt-2">GET/HEAD requests cannot have a body.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="auth" className="flex-1 overflow-auto">
          <AuthTab auth={auth} setAuth={setAuth} authToken={authToken} onUpdateAuthToken={onUpdateAuthToken} />
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
              Configure advanced settings for your request. (Not fully implemented)
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
                disabled // Disable until implemented
              />
               <p className="text-xs text-gray-500 mt-1">Parallel requests not yet supported.</p>
            </div>
            {/* <div>
              <Checkbox
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
                id="show-advanced"
                aria-label="Show advanced options"
              />
              <label htmlFor="show-advanced" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Show advanced options
              </label>
            </div> */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {/* This button triggers the actual request logic */}
            <Button onClick={executeRequest} disabled={!url || !!urlError || isValidatingUrl}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Test Dialog */}
      <LoadTestDialog
        open={showLoadTestDialog}
        onOpenChange={setShowLoadTestDialog}
        requestData={{
          id: selectedRequestId,
          method,
          url,
          headers: JSON.stringify(enabledHeaders),
          params: JSON.stringify(enabledParams),
          body
        }}
        onTestCreated={(testId) => {
          toast.success("Load test created successfully");
        }}
      />
    </div>
  );
}
