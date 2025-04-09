"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Code,
  Settings,
  Globe,
  Share2,
  Sun,
  Moon,
  Plus,
  Check,
  Pencil,
  ChevronDown,
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function Header({ darkMode, setDarkMode, currentRequestData }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  
  const handleSaveRequest = async (requestData) => {
    try {
      const fullRequestData = {
        ...requestData,
        method: currentRequestData?.method || 'GET',
        url: currentRequestData?.url || '',
        headers: currentRequestData?.headers ? JSON.stringify(currentRequestData.headers) : undefined,
        params: currentRequestData?.params ? JSON.stringify(currentRequestData.params) : undefined,
        body: currentRequestData?.body,
      };

      // Call the API to save the request
      console.log('Saving request:', fullRequestData);
    } catch (error) {
      console.error('Failed to save request:', error);
    }
  };

  return (
    <>
      <SettingsModal 
        open={showSettings}
        setOpen={setShowSettings}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <GenerateCodeModal
        open={showGenerateCode}
        setOpen={setShowGenerateCode}
        darkMode={darkMode}
      />
      <SaveRequestModal
        open={showSaveRequest}
        setOpen={setShowSaveRequest}
        darkMode={darkMode}
        onSaveRequest={handleSaveRequest}
        initialData={currentRequestData}
      />
      <header
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-6 flex items-center justify-between`}
      >
      <div className="flex items-center space-x-2">
        <h1 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
          API Testing Tool
        </h1>
        <div className="flex space-x-2 ml-6">          <Button 
            variant="ghost" 
            size="sm" 
            className="space-x-1"
            onClick={() => setShowSaveRequest(true)}
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button><Button 
            variant="ghost" 
            size="sm" 
            className="space-x-1"
            onClick={() => setShowGenerateCode(true)}
          >
            <Code className="h-4 w-4" />
            <span>Generate Code</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="space-x-1"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="space-x-1">
              <Globe className="h-4 w-4" />
              <span>Environment</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Environments</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-between cursor-pointer">
              <span className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Development
              </span>
              <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between cursor-pointer">
              <span>Staging</span>
              <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between cursor-pointer">
              <span>Production</span>
              <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Environment
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="space-x-1">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Copy Link</DropdownMenuItem>
            <DropdownMenuItem>Share to Workspace</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDarkMode(!darkMode)}
          className={darkMode ? "text-gray-300" : "text-gray-600"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <ProfileDropdown darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
    </header>
    </>
  );
}
