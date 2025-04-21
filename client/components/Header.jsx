"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next"; // Çeviri hook'u eklendi
import { useTheme } from "next-themes";
import { authAxios } from "@/lib/auth-context"; // Import authAxios for authenticated requests
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
import EnvironmentModal from "@/components/EnvironmentModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context"; // useSettings hook'unu import et
import { toast } from "sonner"; // Import toast for notifications
import Image from "next/image";

// Accept currentRequestData prop from ApiTester
export default function Header({ currentRequestData, openSignupModal, openLoginModal }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState(null);
  const [environments, setEnvironments] = useState([]);
  const [currentEnvironment, setCurrentEnvironment] = useState(null);
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const { updateSettings } = useSettings(); // updateSettings'i context'ten al
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("common"); // Çeviri fonksiyonunu elde ediyoruz
  
  const isDarkMode = theme === 'dark';

  // Fetch environments from the API when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchEnvironments();
    }
  }, [isAuthenticated]);
  // Function to fetch environments from the API
  const fetchEnvironments = async () => {
    try {
      // Using authAxios instead of fetch to include authentication token automatically
      const response = await authAxios.get('/environments');
      
      // authAxios response data is directly available at response.data
      const data = response.data;
      setEnvironments(data);
      
      // Set the active environment if available
      const activeEnv = data.find(env => env.isActive);
      setCurrentEnvironment(activeEnv || null);

      // Aktif environment varsa ayarları yükle
      if (activeEnv && activeEnv.variables) {
        try {
          // Variables string ise parse et, değilse doğrudan kullan (eski kayıtlar için)
          const settings = typeof activeEnv.variables === 'string' 
            ? JSON.parse(activeEnv.variables) 
            : activeEnv.variables;
          updateSettings(settings); // Settings context'ini güncelle
        } catch (e) {
          console.error('Failed to parse environment settings:', e);
          // Hata durumunda varsayılan ayarlara dönülebilir veya kullanıcı bilgilendirilebilir
        }
      } else {
        // Aktif environment yoksa veya variables boşsa, context'i sıfırla veya varsayılan yap
        // updateSettings(defaultSettings); // Gerekirse varsayılan ayarları yükle
      }
    } catch (error) {
      console.error('Error fetching environments:', error);
      toast.error('Failed to load environments', { 
        description: 'Could not retrieve environment data from the server.' 
      });
    }
  };
  // Function to set an environment as active
  const activateEnvironment = async (environmentId) => {
    try {
      // Using authAxios for authenticated request
      await authAxios.put(`/environments/${environmentId}/activate`);
      
      // Refresh environments after activation
      fetchEnvironments();
      toast.success('Environment activated successfully');
    } catch (error) {
      console.error('Error activating environment:', error);
      toast.error('Failed to activate environment', {
        description: 'Could not set the environment as active.'
      });
    }
  };
  
  // Function to open the environment modal for editing
  const openEditEnvironmentModal = (env, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick (activating the environment)
    setEnvironmentToEdit(env);
    setShowEnvironmentModal(true);
  };
  
  // Function to open environment modal for creating a new environment
  const openCreateEnvironmentModal = () => {
    setEnvironmentToEdit(null); // Reset any previously selected environment
    setShowEnvironmentModal(true);
  };
  
  // Handle successful environment creation/update
  const handleEnvironmentSaved = () => {
    fetchEnvironments(); // Refresh the list
  };

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

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        toast.success("Link Copied!", { description: "Current URL copied to clipboard." });
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        toast.error("Copy Failed", { description: "Could not copy the link to the clipboard." });
      });
  };

  const handleShareToWorkspace = () => {
    // Placeholder: Implement actual workspace sharing logic here
    console.log("Sharing to workspace (placeholder)...", currentRequestData);
    toast.info("Share to Workspace", { description: "This feature is not yet fully implemented." });
    // Example: You might open a modal to select users/teams,
    // then send the currentRequestData to a backend endpoint.
  };

  const handleExportRequest = () => {
    if (!currentRequestData) {
      toast.error("Export Failed", { description: "No request data available to export." });
      return;
    }

    try {
      // Prepare data for export, ensuring headers/params are objects if they are strings
      const exportData = {
        method: currentRequestData.method || 'GET',
        url: currentRequestData.url || '',
        headers: currentRequestData.headers && typeof currentRequestData.headers === 'string'
          ? JSON.parse(currentRequestData.headers)
          : (currentRequestData.headers || {}),
        params: currentRequestData.params && typeof currentRequestData.params === 'string'
          ? JSON.parse(currentRequestData.params)
          : (currentRequestData.params || {}),
        body: currentRequestData.body || '',
        auth: currentRequestData.auth || { type: 'none' },
        tests: currentRequestData.tests || { script: '', results: [] },
        // Add any other relevant fields you want to export
      };

      const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Suggest a filename based on the request URL or a default
      const filename = `request-export-${exportData.url?.split('/').pop() || 'data'}.json`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Request Exported", { description: `Request data saved as ${filename}` });
    } catch (error) {
      console.error('Failed to export request:', error);
      toast.error("Export Failed", { description: "Could not export the request data." });
    }
  };


  // If the authentication process is still loading, show a minimal header
  if (isLoading) {
    return (
      <header
        className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-6 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <h1
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            PUTman
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className={isDarkMode ? "text-gray-300" : "text-gray-600"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
            {/* Light mode için text-gray-800, dark mode için text-white */}
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>API Testing Tool</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Light mode için text-gray-600, dark mode için text-white */}
            <a
              href="#features"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('header.features', 'Features')}
            </a>
            <a
              href="#pricing"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('header.pricing', 'Pricing')}
            </a>
            <a
              href="#docs"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('header.documentation', 'Documentation')}
            </a>
            <a
              href="#about"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('header.about', 'About')}
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              // Light mode için text-gray-600, dark mode için text-white
              className={isDarkMode ? "text-white" : "text-gray-600"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              className="px-4 py-2 text-blue-600 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors"
              onClick={openLoginModal}
            >
              {t('auth.login')}
            </Button>
            <Button
              className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={openSignupModal}
            >
              {t('auth.register')}
            </Button>
          </div>
        </nav>
      </header>
    );
  }

  // If user is authenticated, show the full app header
  return (    <>      <SettingsModal
        open={showSettings}
        setOpen={setShowSettings}
        currentEnvironment={currentEnvironment} // currentEnvironment prop'unu ekle
      />      <EnvironmentModal
        open={showEnvironmentModal}
        setOpen={setShowEnvironmentModal}
        environment={environmentToEdit}
        onEnvironmentSaved={handleEnvironmentSaved}
      />      <GenerateCodeModal
        open={showGenerateCode}
        setOpen={setShowGenerateCode}
        darkMode={isDarkMode}
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
      />      <SaveRequestModal
        open={showSaveRequest}
        setOpen={setShowSaveRequest}
        darkMode={isDarkMode}
        onSaveRequest={handleSaveRequest}
        initialData={currentRequestData}
      />
      <header
        className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-6 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          <div
            className="flex gap-2 items-center cursor-pointer"
          >
            <Image src={'icon.svg'} width={30} height={30} alt="icon"/> 
            <h1 className={`text-xl font-extrabold ${
              isDarkMode ? "text-white" : "text-gray-800" // Ana başlık rengi zaten doğru
            }`} >
              <span className="text-blue-500">PUT</span> {/* PUT her zaman mavi */}
              <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>man</span> {/* man kısmı moda göre değişir, light modda daha koyu gri */}
            </h1>
          </div>
          <div className="flex space-x-2 ml-6">
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowSaveRequest(true)}
            >
              <Save className="h-4 w-4" />
              <span>{t('general.save')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowGenerateCode(true)}
            >
              <Code className="h-4 w-4" />
              <span>{t('header.generateCode')}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              <span>{t('header.settings')}</span>
            </Button>            
            <Link href="/loadtests">
              <Button
                variant="ghost"
                size="sm"
                className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              >
                <Activity className="h-4 w-4 mr-1" />
                <span>{t('header.loadTests', 'Load Tests')}</span>
              </Button>
            </Link>
            <Link href="/monitor">
              <Button
                variant="ghost"
                size="sm"
                className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              >
                <Activity className="h-4 w-4 mr-1" />
                <span>{t('header.monitoring')}</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`}>
                <Globe className="h-4 w-4" />
                <span>{t('header.environment')}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>{t('header.environments', 'Environments')}</DropdownMenuLabel>
              <DropdownMenuSeparator />              {environments.length > 0 ? (
                environments.map(env => (
                  <DropdownMenuItem key={env.id} className="flex justify-between cursor-pointer" onClick={() => activateEnvironment(env.id)}>
                    <span className="flex items-center">
                      <Check className={`h-4 w-4 ${env.isActive ? 'text-green-500' : 'text-transparent' } mr-2`} />
                      {env.name}
                    </span>
                    <span onClick={(e) => openEditEnvironmentModal(env, e)}>
                      <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  {t('header.environmentList.none', 'No environments found')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-center"
                onClick={openCreateEnvironmentModal}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('header.environmentList.add', 'Add Environment')}
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`}>
                <Share2 className="h-4 w-4" />
                <span>{t('header.share', 'Share')}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>{t('header.shareList.copyLink', 'Copy Link')}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToWorkspace}>{t('header.shareList.toWorkspace')}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRequest}>{t('header.shareList.export')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className={isDarkMode ? "text-gray-300" : "text-gray-600"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>          
          <ProfileDropdown
            darkMode={isDarkMode}
            setDarkMode={() => setTheme(isDarkMode ? 'light' : 'dark')}
            user={user}
            onLogout={logout}
          />
        </div>
      </header>
    </>
  );
}
