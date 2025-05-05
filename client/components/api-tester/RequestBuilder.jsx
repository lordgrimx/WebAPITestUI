"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from 'react-i18next'; // useTranslation hook'unu ekle
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
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import LoadTestDialog from "@/components/api-tester/LoadTestDialog"; // Assuming LoadTestDialog is a component
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/lib/settings-context"; // Import the useSettings hook
import { authAxios } from "@/lib/auth-context";

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
function ParamsTab({ params, setParams, darkMode, isMobile }) { // Add isMobile prop
  const { t } = useTranslation('common');
  
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
    <div className={`${isMobile ? 'p-2 text-xs' : 'p-4 text-sm'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></div> {/* Checkbox space */}
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.key')}</div>
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.value')}</div>
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></div> {/* Delete button space */}
      </div>
      {params.map((param, index) => (
        <div key={param.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-1">
          <Checkbox
            checked={param.enabled}
            onCheckedChange={(checked) => handleCheckboxChange(param.id, checked)}
            aria-label={t('requests.enableParameter')}
            className={darkMode ? 'dark' : ''} // Add dark mode class if needed for Checkbox styling
          />
          <Input
            placeholder={t('requests.keyPlaceholder')}
            value={param.key}
            onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
            className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          />
          <Input
            placeholder={t('requests.valuePlaceholder')}
            value={param.value}
            onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
            className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
            onClick={() => removeParamRow(param.id)}
            // Disable delete for the last row
            disabled={params.length <= 1}
            aria-label={t('requests.removeParameter')}
          >
            <Trash2 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      ))}
       <Button variant="outline" size="sm" onClick={addParamRow} className={`mt-2 ${isMobile ? 'text-xs py-0 h-7' : ''} ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>
         <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} /> {t('requests.addParam')}
       </Button>
    </div>
  );
}

// Headers Tab Content
function HeadersTab({ headers, setHeaders, darkMode, isMobile }) { // Add isMobile prop
  const { t } = useTranslation('common');
  
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
    <div className={`${isMobile ? 'p-2 text-xs' : 'p-4 text-sm'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-2">
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></div>
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.key')}</div>
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.value')}</div>
        <div className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}></div>
      </div>
      {headers.map((header, index) => (
        <div key={header.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center mb-1">
          <Checkbox
            checked={header.enabled}
            onCheckedChange={(checked) => handleCheckboxChange(header.id, checked)}
            aria-label={t('requests.enableHeader')}
            className={darkMode ? 'dark' : ''} // Add dark mode class if needed for Checkbox styling
          />
          <Input
            placeholder={t('requests.keyPlaceholder')}
            value={header.key}
            onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)}
            className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          />
          <Input
            placeholder={t('requests.valuePlaceholder')}
            value={header.value}
            onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)}
            className={`${isMobile ? 'h-7 text-xs' : 'h-8'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
            onClick={() => removeHeaderRow(header.id)}
            // Disable delete for the last row
            disabled={headers.length <= 1}
            aria-label={t('requests.removeHeader')}
          >
            <Trash2 className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addHeaderRow} className={`mt-2 ${isMobile ? 'text-xs py-0 h-7' : ''} ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>
        <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} /> {t('requests.addHeader')}
      </Button>
    </div>
  );
}


// Auth Tab Content
function AuthTab({ auth, setAuth, authToken, onUpdateAuthToken, darkMode, apiKeys = [], isMobile }) { // Add isMobile prop
  const { t } = useTranslation('common');
  
  const authTypes = [
    { value: "none", label: t('requests.noAuth') },
    { value: "managedApiKey", label: t('requests.managedApiKey') }, 
    { value: "apiKey", label: t('requests.manualApiKey') }, 
    { value: "basic", label: t('requests.basicAuth') },
    { value: "bearer", label: t('requests.bearerToken') },
    { value: "oauth2", label: t('requests.oauth2') }
  ];

  // Use local state for token input to avoid direct mutation of prop if needed elsewhere
  const [tokenInput, setTokenInput] = useState(auth?.token || authToken || '');
  const [selectedManagedKeyId, setSelectedManagedKeyId] = useState(auth?.managedKeyId || ''); // State for selected managed key

  // Update local state if the prop changes (e.g., loaded from request)
  useEffect(() => {
    setTokenInput(auth?.token || authToken || '');
    setSelectedManagedKeyId(auth?.managedKeyId || ''); // Sync managed key selection
  }, [auth?.token, authToken, auth?.managedKeyId]);


  const handleAuthTypeChange = (type) => {
    // Reset specific fields when changing type
    const newAuth = { type };
    
    // Preserve bearer token if switching to bearer type and token exists
    if (type === 'bearer' && authToken) {
      newAuth.token = authToken;
    }
    
    // Clear fields based on type
    if (type !== 'basic') {
      newAuth.username = undefined;
      newAuth.password = undefined;
    }
    if (type !== 'bearer') {
      newAuth.token = undefined;
      setTokenInput('');
    }
    if (type !== 'apiKey') {
      newAuth.apiKeyName = undefined;
      newAuth.apiKeyValue = undefined;
      newAuth.apiKeyLocation = undefined;
    }
    if (type !== 'managedApiKey') {
      newAuth.managedKeyId = undefined;
      setSelectedManagedKeyId('');
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
    // Update parent component's token if needed
    if (onUpdateAuthToken) {
      onUpdateAuthToken(newToken);
    }
  };

  // Handle changes for other auth fields
  const handleAuthFieldChange = (field, value) => {
    setAuth(prevAuth => ({ ...prevAuth, [field]: value }));
  };

  // Handler for selecting a managed API key
  const handleManagedKeySelect = (keyId) => {
    setSelectedManagedKeyId(keyId); // Update local state for the dropdown
    setAuth(prevAuth => ({
      ...prevAuth,
      managedKeyId: keyId, // Store the selected key ID in the auth state
      // Clear manual API key fields when a managed key is selected
      apiKeyName: undefined,
      apiKeyValue: undefined,
      apiKeyLocation: undefined,
    }));
  };


  return (
    <div className={`${isMobile ? 'p-2 text-xs' : 'p-4 space-y-4'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <div>
        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
          {t('requests.authType')}
        </label>
        <Select value={auth?.type || 'none'} onValueChange={handleAuthTypeChange}>
          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[200px]'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
            <SelectValue placeholder={t('requests.selectAuthType')} />
          </SelectTrigger>
          <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
            {authTypes.map((type) => (
              <SelectItem key={type.value} value={type.value} disabled={type.value === 'managedApiKey' && apiKeys.length === 0}>
                {type.label} {type.value === 'managedApiKey' && apiKeys.length === 0 ? `(${t('requests.noKeysInSettings')})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Managed API Key Selection */}
      {auth?.type === "managedApiKey" && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
            {t('requests.selectManagedKey')}
          </label>
          <Select
            value={selectedManagedKeyId}
            onValueChange={handleManagedKeySelect}
            disabled={apiKeys.length === 0}
          >
            <SelectTrigger className={`w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
              <SelectValue placeholder={apiKeys.length > 0 ? t('requests.selectKeyFromSettings') : t('requests.noKeysInSettings')} />
            </SelectTrigger>
            <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
              {apiKeys.map((key) => (
                <SelectItem key={key.id} value={key.id.toString()}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedManagedKeyId && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
              {t('requests.keyDetailsFromSettings')}
            </p>
          )}
        </div>
      )}

      {auth?.type === "basic" && (
        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              {t('requests.username')}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('requests.usernamePlaceholder')}
                value={auth.username || ""}
                onChange={(e) => handleAuthFieldChange('username', e.target.value)}
                className={`pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
              />
              <User className={`h-4 w-4 absolute left-2 top-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              {t('requests.password')}
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder={t('requests.passwordPlaceholder')}
                value={auth.password || ""}
                onChange={(e) => handleAuthFieldChange('password', e.target.value)}
                className={`pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
              />
              <Lock className={`h-4 w-4 absolute left-2 top-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      )}

      {auth?.type === "bearer" && (
        <div className="space-y-2">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
            {t('requests.bearerToken')}
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder={t('requests.bearerTokenPlaceholder')}
              value={tokenInput}
              onChange={handleTokenChange}
              className={`pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
            />
            <Key className={`h-4 w-4 absolute left-2 top-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {t('requests.bearerTokenNote')}
          </p>
        </div>
      )}

      {/* Manual API Key Input */}
      {auth?.type === "apiKey" && (
        <div className="space-y-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.enterApiKeyManually')}</p>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              {t('requests.apiKeyName')}
            </label>
            <Input
              type="text"
              placeholder={t('requests.apiKeyNamePlaceholder')}
              value={auth.apiKeyName || ""}
              onChange={(e) => handleAuthFieldChange('apiKeyName', e.target.value)}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              {t('requests.apiKeyValue')}
            </label>
            <Input
              type="text"
              placeholder={t('requests.apiKeyValuePlaceholder')}
              value={auth.apiKeyValue || ""}
              onChange={(e) => handleAuthFieldChange('apiKeyValue', e.target.value)}
              className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
            />
          </div>
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
              {t('requests.apiKeyAddTo')}
            </label>
            <Select
              value={auth.apiKeyLocation || "header"}
              onValueChange={(value) => handleAuthFieldChange('apiKeyLocation', value)}
            >
              <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[200px]'} ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder={t('requests.selectLocation')} />
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <SelectItem value="header">{t('requests.header')}</SelectItem>
                <SelectItem value="query">{t('requests.queryParameter')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {auth?.type === "oauth2" && (
         <div className="space-y-4">
           <div>
             <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
               {t('requests.accessTokenUrl')}
             </label>
             <div className="relative">
               <Input
                 type="url"
                 placeholder={t('requests.accessTokenUrlPlaceholder')}
                 value={auth.accessTokenUrl || ""}
                 onChange={(e) => handleAuthFieldChange('accessTokenUrl', e.target.value)}
                 className={`pl-8 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
               />
               <Globe className={`h-4 w-4 absolute left-2 top-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
             </div>
           </div>
           <div>
             <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
               {t('requests.clientId')}
             </label>
             <Input
               type="text"
               placeholder={t('requests.clientIdPlaceholder')}
               value={auth.clientId || ""}
               onChange={(e) => handleAuthFieldChange('clientId', e.target.value)}
               className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
             />
           </div>
           <div>
             <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
               {t('requests.clientSecret')}
             </label>
             <Input
               type="password"
               placeholder={t('requests.clientSecretPlaceholder')}
               value={auth.clientSecret || ""}
               onChange={(e) => handleAuthFieldChange('clientSecret', e.target.value)}
               className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
             />
           </div>
           <div>
             <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
               {t('requests.scope')}
             </label>
             <Input
               type="text"
               placeholder={t('requests.scopePlaceholder')}
               value={auth.scope || ""}
               onChange={(e) => handleAuthFieldChange('scope', e.target.value)}
               className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
             />
             <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
               {t('requests.scopeNote')}
             </p>
           </div>
           <Button variant="outline" size="sm" className={`mt-2 ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}>
             {t('requests.requestToken')}
           </Button>
         </div>
      )}

      {(!auth || auth?.type === "none") && (
        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          {t('requests.noAuthDesc')}
        </div>
      )}
    </div>
  );
}


// Tests Tab Content
function TestsTab({ tests, setTests, darkMode, receivedTestResults = [], isMobile }) { // Add isMobile prop
  const { t } = useTranslation('common');

  // Function to handle opening documentation
  const openDocumentation = () => {
    // Open Postman's test script documentation in a new tab
    window.open('https://learning.postman.com/docs/writing-scripts/test-scripts/', '_blank', 'noopener,noreferrer');
    // You could also open MDN JavaScript docs or other relevant resources
    // window.open('https://developer.mozilla.org/en-US/docs/Web/JavaScript', '_blank', 'noopener,noreferrer');
  };

  // Function to insert example test script
  const insertExampleScript = () => {
    const exampleScript = `// Example: Check for status code 200
pm.test("Status code is 200", function () {
    pm.expect(pm.response.code).to.equal(200);
});

// Example: Check if response body contains a specific property
pm.test("Response body contains 'userId'", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('userId');
});

// Example: Check response time is below a threshold (e.g., 500ms)
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Example: Check for a specific header
pm.test("Content-Type header is present", function () {
    pm.response.to.have.header("Content-Type");
});

// Example: Check if header value matches
pm.test("Content-Type header is application/json", function () {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});
`;
    // Update the tests state with the example script
    setTests({ ...tests, script: exampleScript });
  };

  // Use received test results if available, otherwise use the ones in state
  const testResultsToDisplay = receivedTestResults && receivedTestResults.length > 0 
    ? receivedTestResults 
    : tests?.results || [];

  return (
    <div className={`${isMobile ? 'p-2 text-xs' : 'p-4 space-y-4'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <div>
        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
          {t('requests.testScript')} <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('requests.testScriptInfo')}</span>
        </label>
        <div className={`border rounded overflow-hidden ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} p-2 border-b flex justify-between items-center`}>
            <div className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}>
              <Code className="h-4 w-4 mr-1" />
              {t('requests.testsTitle')}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs h-7 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={insertExampleScript} // Add onClick handler
              >
                {t('requests.examples')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs h-7 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={openDocumentation} // Add onClick handler
              >
                {t('requests.documentation')}
              </Button>
            </div>
          </div>
          <textarea
            value={tests?.script || ""} // Use optional chaining
            onChange={(e) => setTests({ ...tests, script: e.target.value })}
            className={`w-full h-64 p-3 font-mono ${isMobile ? 'text-xs' : 'text-sm'} focus:outline-none ${darkMode ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-white text-black placeholder-gray-400'}`}
            placeholder={`// ${t('requests.tests')}...\npm.test("Status code is 200", function() {\n  pm.expect(pm.response.code).to.equal(200);\n});`}
          />
        </div>
      </div>      <div>
        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          {t('requests.testResults')}
        </h3>
        {testResultsToDisplay.length > 0 ? (
          <div className="space-y-2">
            {testResultsToDisplay.map((result, index) => (
              <div
                key={index}
                className={`p-2 border rounded flex items-center ${
                  result.passed
                    ? darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
                    : darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`h-4 w-4 rounded-full mr-2 ${
                  result.passed ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className={
                  result.passed
                    ? darkMode ? 'text-green-400' : 'text-green-700'
                    : darkMode ? 'text-red-400' : 'text-red-700'
                }>
                  {result.name}
                </span>
                {result.error && (
                  <div className={`text-xs mt-1 ml-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`${darkMode ? 'text-gray-400 bg-gray-800 border-gray-700' : 'text-gray-500 bg-gray-50 border-gray-200'} text-sm border rounded p-3`}>
            {t('requests.testResultsInfo')}
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
  onSendRequest,
  onRequestDataChange,
  authToken,
  onUpdateAuthToken,
  darkMode, // Receive darkMode prop
  apiKeys = [], // Receive apiKeys prop
  testResults = [] // Receive test results from ApiTester
}) {
  const { t } = useTranslation('common'); // Initialize useTranslation
  const { settings } = useSettings();

  // Add state for tracking mobile view
  const [isMobile, setIsMobile] = useState(false);

  // Effect to detect screen size and set mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial size on mount
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize state based on initialData if provided, otherwise default
  const [method, setMethod] = useState(initialData?.method || "GET");
  const [url, setUrl] = useState(initialData?.url || ""); // Initialize URL
  const [debouncedUrl, setDebouncedUrl] = useState(url);
  // Initialize with a single default row
  const [params, setParams] = useState([createDefaultRow()]);  // Initialize headers from settings.defaultHeaders if available
  const [headers, setHeaders] = useState(() => {
    // Check if settings and defaultHeaders exist
    console.log("Settings in headers initialization:", settings);
    if (settings?.defaultHeaders && Array.isArray(settings.defaultHeaders) && settings.defaultHeaders.length > 0) {
      // Map default headers to the format expected by our component
      console.log("Using default headers from settings:", settings.defaultHeaders);
      const mappedHeaders = settings.defaultHeaders.map(header => ({
        id: header.id || Date.now() + Math.random(),
        key: header.name || "", // Map name to key
        value: header.value || "",
        enabled: true
      }));
      console.log("Mapped headers:", mappedHeaders);
      return mappedHeaders;
    }
    // Fallback to a single empty row if no default headers
    console.log("No default headers found in settings, using empty row");
    return [createDefaultRow()];
  });
  const [body, setBody] = useState(initialData?.body || "");
  const [auth, setAuth] = useState(initialData?.auth || { type: "none" }); // Initialize auth from initialData
  const [tests, setTests] = useState(initialData?.tests || { script: "", results: [] }); // Initialize tests from initialData
  const [error, setError] = useState(null);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [currentUserID, setCurrentUserID] = useState(null); // For user ID from JWT token
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [parallelRequestCount, setParallelRequestCount] = useState(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showLoadTestDialog, setShowLoadTestDialog] = useState(false);
  // State for request data when selectedRequestId is provided
  const [requestDataFromBackend, setRequestDataFromBackend] = useState(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);

  // Fetch request data when selectedRequestId changes
  useEffect(() => {
    const fetchRequestData = async () => {
      if (!selectedRequestId) return;
      
      setIsLoadingRequest(true);
      try {
        const response = await authAxios.get(`/requests/${selectedRequestId}`);
        if (response.data) {
          console.log("Loaded request data:", response.data);
          setRequestDataFromBackend(response.data);
        }
      } catch (error) {
        console.error("Error fetching request data:", error);
        setError("Failed to load request data");
      } finally {
        setIsLoadingRequest(false);
      }
    };
    
    fetchRequestData();
  }, [selectedRequestId]);

  // URL validation
  const validateUrl = useCallback(async (urlToValidate) => {
    if (!urlToValidate) {
        setUrlError(null); // Clear error if URL is empty
        return;
    }

    setIsValidatingUrl(true);
    setUrlError(null);    try {
      // Basic check for protocol
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
         throw new Error(t('requests.invalidUrl'));
      }
      const urlObj = new URL(urlToValidate);
      // Optional: Add more specific validation if needed (e.g., check hostname)
    } catch (error) {
      setUrlError(error.message || t('requests.urlErrorInvalid'));
    } finally {
      setIsValidatingUrl(false);
    }
  }, [t]);

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
    auth: auth, // Pass the potentially modified auth object
    tests: tests // Pass the tests object
  }), [method, debouncedUrl, headers, params, body, auth, tests]); // Include auth in dependency array
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
      setBody(initialData.body || "");
      setAuth(initialData.auth || { type: "none" }); // Use auth from history if available
      setTests(initialData.tests || { script: "", results: [] }); // Use tests from history if available
      setError(null);
    }
    // Priority 2: Populate from selectedRequestId (collection item)
    else if (selectedRequestId && requestDataFromBackend) {
      console.log("Populating form for selected request:", selectedRequestId, requestDataFromBackend);
      setMethod(requestDataFromBackend.method || "GET");
      setUrl(requestDataFromBackend.url || "");

      // Safely parse and set Params
      let parsedParams = [createDefaultRow()];
      if (requestDataFromBackend.params && typeof requestDataFromBackend.params === 'string') {
        try {
          const tempParsed = JSON.parse(requestDataFromBackend.params);
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
      if (requestDataFromBackend.headers && typeof requestDataFromBackend.headers === 'string') {
        try {
          const tempParsed = JSON.parse(requestDataFromBackend.headers);
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
      setBody(requestDataFromBackend.body || "");

      // Handle auth data (Safely parse if string)
      let parsedAuth = { type: "none" };
      if (requestDataFromBackend.auth) {
        if (typeof requestDataFromBackend.auth === 'object') {
          parsedAuth = requestDataFromBackend.auth;
        } else if (typeof requestDataFromBackend.auth === 'string') {
          try {
            parsedAuth = JSON.parse(requestDataFromBackend.auth);
            if (typeof parsedAuth !== 'object' || parsedAuth === null) {
              console.warn("Parsed auth is not a valid object, using default.");
              parsedAuth = { type: "none" };
            }
          } catch (e) {
            console.error("Error parsing auth data:", e);
            parsedAuth = { type: "none" };
          }
        }
      }
      setAuth(parsedAuth);


      // Handle tests data (Safely parse if string)
      let parsedTests = { script: "", results: [] };
      if (requestDataFromBackend.tests) {
        if (typeof requestDataFromBackend.tests === 'object') {
          parsedTests = requestDataFromBackend.tests;
        } else if (typeof requestDataFromBackend.tests === 'string') {
          try {
            parsedTests = JSON.parse(requestDataFromBackend.tests);
            if (typeof parsedTests !== 'object' || parsedTests === null) {
              console.warn("Parsed tests is not a valid object, using default.");
              parsedTests = { script: "", results: [] };
            }
          } catch (e) {
            console.error("Error parsing tests data:", e);
            parsedTests = { script: "", results: [] };
          }
        }
      }
      setTests(parsedTests);

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
  }, [initialData, selectedRequestId, requestDataFromBackend]);// Depend on all three


  // Update parent component (ApiTester) with current request data from RequestBuilder
  useEffect(() => {
    if (onRequestDataChange) {
      onRequestDataChange(currentData);
    }
  }, [currentData, onRequestDataChange]);
  // Update headers when settings change
  useEffect(() => {
    if (settings?.defaultHeaders && Array.isArray(settings.defaultHeaders) && settings.defaultHeaders.length > 0) {
      console.log("Settings changed, updating headers with default headers");
      const mappedHeaders = settings.defaultHeaders.map(header => ({
        id: header.id || Date.now() + Math.random(),
        key: header.name || "", // Map name to key
        value: header.value || "",
        enabled: true
      }));
      
      // Update headers regardless of current state to ensure they are always populated
      console.log("Updating headers with default values:", mappedHeaders);
      setHeaders(mappedHeaders);
    }
  }, [settings]); // Only depend on settings, not headers

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

    // Prepare the request configuration object using the latest state    // 1. Prepare Default Headers from settings
    // Ensure defaultHeaders is always an array before calling filter
    const defaultHeadersArray = Array.isArray(settings?.defaultHeaders) ? settings.defaultHeaders : [];
    const defaultHeadersFromSettings = defaultHeadersArray
      .filter(h => h.name?.trim()) // Ensure header name is not empty
      .reduce((acc, header) => {
        acc[header.name] = header.value || ""; // Use name as key
        return acc;
      }, {});

    // 2. Prepare Manual Headers (already memoized as enabledHeaders)

    // 3. Merge Headers: Manual headers override default headers
    let finalHeaders = {
      ...defaultHeadersFromSettings,
      ...enabledHeaders, // enabledHeaders is already a key-value object
    };

    // Add Bearer token to headers if auth type is bearer and token exists
    if (auth?.type === 'bearer' && auth?.token) {
      console.log('Adding bearer token:', auth.token); // Debug log
      finalHeaders = {
        ...finalHeaders,
        'Authorization': `Bearer ${auth.token.trim()}` // Trim ekleyerek boşlukları temizle
      };
    }

    // API Key auth type kontrolü ekle
    if (auth?.type === 'apiKey' && auth?.apiKeyName && auth?.apiKeyValue) {
      if (auth.apiKeyLocation === 'header') {
        finalHeaders[auth.apiKeyName] = auth.apiKeyValue;
      }
      // Query params için ayrı kontrol yapılabilir
    }

    // Debug logları ekle
    console.log('Auth configuration:', auth);
    console.log('Final headers before request:', finalHeaders);

    // If using a managed API key, derive the actual key details here
    let finalAuth = { ...auth }; // Start with current auth state

    if (auth.type === 'managedApiKey' && auth.managedKeyId) {
      const selectedKey = apiKeys.find(key => key.id.toString() === auth.managedKeyId);
      if (selectedKey) {
        // Override relevant auth fields for the request, but keep type as 'apiKey' for ApiTester logic
        finalAuth = {
          ...finalAuth, // Keep managedKeyId for state persistence
          type: 'apiKey', // Tell ApiTester to treat it as a standard API key
          apiKeyName: selectedKey.name,
          apiKeyValue: selectedKey.value,
          apiKeyLocation: 'header' // Assuming managed keys are always headers for now, adjust if needed
        };
        console.log("Using managed API key:", selectedKey.name);
      } else {
        console.warn("Selected managed API key not found in settings. Sending without API key auth.");
        // Optionally revert to 'none' or show an error
        finalAuth.type = 'none';
      }
    }


    const requestConfig = {
      method,
      url, // Use the current, validated URL state
      params: enabledParams, // Use memoized enabled params
      headers: finalHeaders, // Use the merged finalHeaders
      body: method !== "GET" && method !== "HEAD" ? body : undefined,
      auth: finalAuth, // Pass the potentially modified auth state (with resolved managed key)
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

  }, [method, url, urlError, enabledParams, enabledHeaders, body, auth, tests, onSendRequest, settings, apiKeys]);


  return (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>      {/* Display error if any */}
      {error && (
        <div className={`${darkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-2 text-sm mb-2 mx-2 rounded relative`} role="alert">
           <strong className="font-bold">{t('requests.error')}:</strong>
           <span className="block sm:inline"> {error}</span>
           <span className="absolute top-0 bottom-0 right-0 px-4 py-2" onClick={() => setError(null)}>
             <svg className={`fill-current h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>{t('requests.close')}</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
           </span>
        </div>
      )}

      {/* Top Bar: Method, URL, Send Button */}
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center'} p-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} ${isMobile ? 'space-x-0' : 'space-x-2'}`}>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[120px]'} flex-shrink-0 font-medium ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
            {httpMethods.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className={`${isMobile ? 'w-full' : 'flex-grow'} relative`}>
          <Input
            type="url"
            placeholder="https://api.example.com/v1/users"
            value={url} // Bind directly to url state
            onChange={(e) => setUrl(e.target.value)} // Update url state directly
            className={`w-full ${urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500' : 'bg-white border-gray-300 text-black focus:border-blue-500 focus:ring-blue-500'}`} // Dynamic border and dark mode styles
            aria-invalid={!!urlError}
            aria-describedby={urlError ? "url-error-message" : undefined}
          />
          {isValidatingUrl && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className={`animate-spin h-4 w-4 border-2 ${darkMode ? 'border-blue-400' : 'border-blue-500'} rounded-full border-t-transparent`}></div>
            </div>
          )}
          {urlError && (
            <div id="url-error-message" className={`absolute -bottom-5 left-0 text-xs ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
              {urlError}
            </div>
          )}
        </div>
        <div className={`flex ${isMobile ? 'w-full justify-between' : 'items-center space-x-2'}`}>
          <Button
            onClick={handleSendClick} // Opens the dialog after validation
            className={`${methodColors[method]} text-white flex items-center ${isMobile ? 'flex-1 mr-2' : ''}`}
            disabled={isValidatingUrl} // Disable while validating
          >
            <SendHorizontal className="h-4 w-4 mr-1" /> {t('requests.send')}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowLoadTestDialog(true)}
                  variant="outline"
                  className={`flex items-center ${isMobile ? 'flex-1' : ''} ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
                  disabled={!url || !!urlError}
                >
                  <Activity className="h-4 w-4 mr-1" /> {isMobile ? '' : t('requests.loadTest')}
                </Button>
              </TooltipTrigger>
              <TooltipContent className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                <p>Create k6 load test</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Results will be shown in the Load Tests page</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Tabs: Params, Headers, Body, Auth, Tests */}
      <Tabs defaultValue="params" className="flex-1 flex flex-col min-h-0"> {/* Added min-h-0 */}
        <TabsList className={`border-b rounded-none ${isMobile ? 'overflow-x-auto' : 'justify-start'} px-2 pt-2 bg-transparent flex-shrink-0 ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}> {/* Added flex-shrink-0 */}
          <TabsTrigger 
            value="params" 
            className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''} ${isMobile ? 'text-xs py-1 px-2' : ''}`}
          >
            {t('requests.params')}
          </TabsTrigger>
          <TabsTrigger 
            value="headers" 
            className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''} ${isMobile ? 'text-xs py-1 px-2' : ''}`}
          >
            {t('requests.header')}
          </TabsTrigger>
          <TabsTrigger 
            value="body" 
            className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''} ${isMobile ? 'text-xs py-1 px-2' : ''}`}
          >
            {t('requests.body')}
          </TabsTrigger>
          <TabsTrigger 
            value="auth" 
            className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''} ${isMobile ? 'text-xs py-1 px-2' : ''}`}
          >
            {t('requests.auth')}
          </TabsTrigger>
          <TabsTrigger 
            value="tests" 
            className={`${darkMode ? 'data-[state=active]:text-white data-[state=active]:border-white' : ''} ${isMobile ? 'text-xs py-1 px-2' : ''}`}
          >
            {t('requests.tests')}
          </TabsTrigger>
        </TabsList>
        {/* Ensure TabsContent takes remaining space and scrolls */}
        <TabsContent value="params" className="flex-1 overflow-auto">
          <ParamsTab params={params} setParams={setParams} darkMode={darkMode} isMobile={isMobile} />
        </TabsContent>
        <TabsContent value="headers" className="flex-1 overflow-auto">
          <HeadersTab headers={headers} setHeaders={setHeaders} darkMode={darkMode} isMobile={isMobile} />
        </TabsContent>
        <TabsContent value="body" className={`${isMobile ? 'p-2' : 'p-4'} text-sm flex-1 overflow-auto flex flex-col`}>
          <div className="flex flex-col h-full flex-1">
            <textarea
              className={`w-full h-full flex-1 ${isMobile ? 'p-1 text-xs' : 'p-2 text-sm'} border rounded font-mono resize-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black placeholder-gray-400'}`}
              placeholder={t('requests.bodyPlaceholder')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={method === "GET" || method === "HEAD"}
            />
            {(method === "GET" || method === "HEAD") && (
              <p className={`${darkMode ? 'text-amber-400' : 'text-amber-600'} ${isMobile ? 'text-xs' : ''} mt-2`}>{t('requests.noBodyForGetHead')}</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="auth" className="flex-1 overflow-auto">
          <AuthTab
            auth={auth}
            setAuth={setAuth}
            authToken={authToken}
            onUpdateAuthToken={onUpdateAuthToken}
            darkMode={darkMode}
            apiKeys={apiKeys}
            isMobile={isMobile}
          />
        </TabsContent>        
        <TabsContent value="tests" className="flex-1 overflow-auto">
          <TestsTab tests={tests} setTests={setTests} darkMode={darkMode} receivedTestResults={testResults} isMobile={isMobile} />
        </TabsContent>
      </Tabs>      {/* Dialog for advanced options */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="request-dialog-description" className={darkMode ? 'dark bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>{t('requests.advancedOptions')}</DialogTitle>
            <DialogDescription id="request-dialog-description" className={darkMode ? 'text-gray-400' : ''}>
              {t('requests.advancedOptionsDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 block`}>
                {t('requests.parallelRequestCount')}
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={parallelRequestCount}
                onChange={(e) => setParallelRequestCount(Number(e.target.value))}
                aria-label="Number of parallel requests"
                disabled // Disable until implemented
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:opacity-50' : 'disabled:opacity-50'}`}
              />
               <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t('requests.parallelRequestsNotSupported')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}>
              {t('requests.cancel')}
            </Button>
            {/* This button triggers the actual request logic */}
            <Button onClick={executeRequest} disabled={!url || !!urlError || isValidatingUrl} className={darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              {t('requests.sendRequest')}
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
