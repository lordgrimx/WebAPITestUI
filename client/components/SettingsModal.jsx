"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/settings-context";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

export default function SettingsModal({ open, setOpen }) {
  // Get global settings from context
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  // Local state for form values
  const [defaultHeaders, setDefaultHeaders] = useState([...settings.defaultHeaders, { id: Date.now(), name: "", value: "" }]);
  const [apiKeys, setApiKeys] = useState([...settings.apiKeys, { id: Date.now(), name: "", value: "" }]);
  const [proxyEnabled, setProxyEnabled] = useState(settings.proxyEnabled);
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl || "");
  const [proxyUsername, setProxyUsername] = useState(settings.proxyUsername || "");
  const [proxyPassword, setProxyPassword] = useState(settings.proxyPassword || "");
  const [requestTimeout, setRequestTimeout] = useState(settings.requestTimeout);
  const [responseSize, setResponseSize] = useState(settings.responseSize);
  const [jsonIndentation, setJsonIndentation] = useState(settings.jsonIndentation);
  const [defaultResponseView, setDefaultResponseView] = useState(settings.defaultResponseView);
  const [wrapLines, setWrapLines] = useState(settings.wrapLines);
  const [highlightSyntax, setHighlightSyntax] = useState(settings.highlightSyntax);
  // Sync local state with global settings when modal opens
  useEffect(() => {
    if (open) {
      setDefaultHeaders([...settings.defaultHeaders, { id: Date.now(), name: "", value: "" }]);
      setApiKeys([...settings.apiKeys, { id: Date.now(), name: "", value: "" }]);
      setProxyEnabled(settings.proxyEnabled);
      setProxyUrl(settings.proxyUrl || "");
      setProxyUsername(settings.proxyUsername || "");
      setProxyPassword(settings.proxyPassword || "");
      setRequestTimeout(settings.requestTimeout);
      setResponseSize(settings.responseSize);
      setJsonIndentation(settings.jsonIndentation);
      setDefaultResponseView(settings.defaultResponseView);
      setWrapLines(settings.wrapLines);
      setHighlightSyntax(settings.highlightSyntax);
    }
  }, [open, settings]);

  const addHeader = () => {
    setDefaultHeaders([...defaultHeaders, { id: Date.now(), name: "", value: "" }]);
  };

  const removeHeader = (id) => {
    setDefaultHeaders(defaultHeaders.filter(header => header.id !== id));
  };

  const updateHeader = (id, field, value) => {
    setDefaultHeaders(defaultHeaders.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    ));
  };

  const addApiKey = () => {
    setApiKeys([...apiKeys, { id: Date.now(), name: "", value: "" }]);
  };

  const removeApiKey = (id) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const updateApiKey = (id, field, value) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, [field]: value } : key
    ));
  };

  const handleSaveChanges = () => {
    // Clean up empty entries before saving
    const cleanedHeaders = defaultHeaders.filter(header => header.name.trim() !== "" || header.value.trim() !== "");
    const cleanedApiKeys = apiKeys.filter(key => key.name.trim() !== "" || key.value.trim() !== "");
    
    // Update global settings
    updateSettings({
      // Using the theme from useTheme hook instead of localStorage
      defaultHeaders: cleanedHeaders,
      apiKeys: cleanedApiKeys,
      proxyEnabled,
      proxyUrl,
      proxyUsername,
      proxyPassword,
      requestTimeout,
      responseSize,
      jsonIndentation,
      defaultResponseView,
      wrapLines,
      highlightSyntax
    });
    
    // Close the modal
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} className="w-full">      
      <DialogContent 
        className="min-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-800 dark:text-gray-100"
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="text-xl font-semibold dark:text-white">{t('settings.titleApi')}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 dark:text-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{t('settings.general')}</h4>              <div>
                <Label className="block text-sm font-medium mb-1">{t('settings.theme.title')}</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroup 
                      value={theme}
                      onValueChange={setTheme}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light">{t('settings.theme.light')}</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark">{t('settings.theme.dark')}</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system">{t('settings.theme.system')}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>              <div>
                <Label className="block text-sm font-medium mb-1">
                  {t('settings.requestTimeout')}
                </Label>
                <Input
                  type="number"
                  value={requestTimeout}
                  onChange={(e) => setRequestTimeout(Number(e.target.value))}
                  min={1000}
                  max={120000}
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  {t('settings.responseSize')}
                </Label>
                <Input
                  type="number"
                  value={responseSize}
                  onChange={(e) => setResponseSize(Number(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
            </div>

            {/* Default Headers */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{t('settings.defaultHeaders')}</h4>

              <div className="space-y-2">
                {defaultHeaders.map((header, index) => (
                  <div key={header.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">                      <Input
                        type="text"
                        placeholder={t('settings.headerName')}
                        value={header.name}
                        onChange={(e) => updateHeader(header.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        type="text"
                        placeholder={t('settings.headerValue')}
                        value={header.value}
                        onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (index === defaultHeaders.length - 1 && !header.name && !header.value) {
                            addHeader();
                          } else {
                            removeHeader(header.id);
                          }
                        }}
                        disabled={defaultHeaders.length === 1 && index === 0}
                      >
                        {index === defaultHeaders.length - 1 && !header.name && !header.value ? (
                          <Plus className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proxy Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{t('settings.proxySettings')}</h4>

              <div>
                <div className="flex items-center mb-2">
                  <Checkbox 
                    id="enable-proxy" 
                    checked={proxyEnabled} 
                    onCheckedChange={setProxyEnabled} 
                  />
                  <Label htmlFor="enable-proxy" className="ml-2 text-sm">
                    {t('settings.enableProxy')}
                  </Label>
                </div>

                <div className="space-y-2">                  <div>
                    <Label className="block text-sm font-medium mb-1">
                      {t('settings.proxyUrl')}
                    </Label>
                    <Input
                      type="text"
                      placeholder="http://proxy.example.com:8080"
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                      disabled={!proxyEnabled}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="block text-sm font-medium mb-1">
                        {t('settings.username')}
                      </Label>
                      <Input
                        type="text"
                        value={proxyUsername}
                        onChange={(e) => setProxyUsername(e.target.value)}
                        disabled={!proxyEnabled}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">
                        {t('settings.password')}
                      </Label>
                      <Input
                        type="password"
                        value={proxyPassword}
                        onChange={(e) => setProxyPassword(e.target.value)}
                        disabled={!proxyEnabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Management */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{t('settings.apiKeyManagement')}</h4>

              <div className="space-y-2">
                {apiKeys.map((key, index) => (
                  <div key={key.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">                      <Input
                        type="text"
                        placeholder={t('settings.keyName')}
                        value={key.name}
                        onChange={(e) => updateApiKey(key.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-7">
                      <Input
                        type="password"
                        placeholder={t('settings.apiKeyValue')}
                        value={key.value}
                        onChange={(e) => updateApiKey(key.id, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          if (index === apiKeys.length - 1 && !key.name && !key.value) {
                            addApiKey();
                          } else {
                            removeApiKey(key.id);
                          }
                        }}
                        disabled={apiKeys.length === 1 && index === 0}
                      >
                        {index === apiKeys.length - 1 && !key.name && !key.value ? (
                          <Plus className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response Formatting */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">{t('settings.responseFormatting')}</h4>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  {t('settings.jsonIndentation')}
                </Label>                <Select 
                  value={jsonIndentation} 
                  onValueChange={setJsonIndentation}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('settings.selectIndentation', 'Select indentation')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">{t('settings.indentation.twoSpaces', '2 spaces')}</SelectItem>
                    <SelectItem value="4">{t('settings.indentation.fourSpaces', '4 spaces')}</SelectItem>
                    <SelectItem value="tab">{t('settings.indentation.tab', 'Tab')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  {t('settings.defaultResponseView')}
                </Label>                <Select 
                  value={defaultResponseView} 
                  onValueChange={setDefaultResponseView}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('settings.selectView', 'Select view')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pretty">{t('settings.views.pretty', 'Pretty')}</SelectItem>
                    <SelectItem value="raw">{t('settings.views.raw', 'Raw')}</SelectItem>
                    <SelectItem value="preview">{t('settings.views.preview', 'Preview')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Checkbox 
                  id="wrap-lines" 
                  checked={wrapLines} 
                  onCheckedChange={setWrapLines} 
                />
                <Label htmlFor="wrap-lines" className="ml-2 text-sm">
                  {t('settings.wrapLines', 'Wrap long lines')}
                </Label>
              </div>

              <div className="flex items-center">
                <Checkbox 
                  id="highlight-syntax" 
                  checked={highlightSyntax} 
                  onCheckedChange={setHighlightSyntax} 
                />
                <Label htmlFor="highlight-syntax" className="ml-2 text-sm">
                  {t('settings.highlightSyntax', 'Highlight syntax')}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={() => setOpen(false)} className="dark:text-gray-200 dark:hover:bg-gray-700">
            {t('general.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSaveChanges} className="dark:hover:bg-blue-600">
            {t('settings.saveChanges', 'Save Changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
