"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Activity,
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/lib/auth-context";

// Accept currentRequestData prop from ApiTester
export default function Header({ darkMode, setDarkMode, currentRequestData, openSignupModal, openLoginModal }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
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

  // If the authentication process is still loading, show a minimal header
  if (isLoading) {
    return (
      <header
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-6 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <h1
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            API Testing Tool
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "text-gray-300" : "text-gray-600"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>
    );
  }

  // If no user is authenticated, show the landing page header from the mock
  if (!isAuthenticated) {
    return (
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">API Testing Tool</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Documentation
            </a>
            <a
              href="#about"
              className="text-white hover:text-blue-200 transition-colors"
            >
              About
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-white"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              className="px-4 py-2 text-blue-600 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors"
              onClick={openLoginModal}
            >
              Sign In
            </Button>
            <Button
              className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={openSignupModal}
            >
              Sign Up Free
            </Button>
          </div>
        </nav>
      </header>
    );
  }

  // If user is authenticated, show the full app header
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
        // Pass data from currentRequestData to the modal
        selectedMethod={currentRequestData?.method || "GET"}
        url={currentRequestData?.url || ""}
        // Attempt to parse params if they exist and are a string, otherwise pass empty array
        parameterRows={
          currentRequestData?.params && typeof currentRequestData.params === 'string'
            ? (() => {
                try {
                  const parsed = JSON.parse(currentRequestData.params);
                  // Ensure it's an array before passing
                  return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  console.error("Error parsing params for GenerateCodeModal:", e);
                  return []; // Return empty array on parsing error
                }
              })()
            : [] // Default to empty array if params don't exist or aren't a string
        }
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
          <h1
            className={`text-xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            API Testing Tool
          </h1>          <div className="flex space-x-2 ml-6">
            <Button
              variant="ghost"
              size="sm"
              className="space-x-1"
              onClick={() => setShowSaveRequest(true)}
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
            <Button
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
            <Link 
              href="/monitor" 
              className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Activity className="h-4 w-4 mr-1" />
              <span>Monitoring</span>
            </Link>
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
              <Button variant="ghost" size="sm" className="w-full justify-center">
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
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "text-gray-300" : "text-gray-600"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <ProfileDropdown
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            user={user}
            onLogout={logout}
          />
        </div>
      </header>
    </>
  );
}