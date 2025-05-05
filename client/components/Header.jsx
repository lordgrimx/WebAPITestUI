"use client"
import { authAxios } from "@/lib/auth-context";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next"; // Çeviri hook'u eklendi
import { useTheme } from "next-themes";
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
  Home,
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import EnvironmentModal from "@/components/EnvironmentModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context"; // useSettings hook'unu import et
import { useEnvironment } from "@/lib/environment-context"; // Import useEnvironment
import { toast } from "sonner"; // Import toast for notifications
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRequest } from "@/lib/request-context";

// Accept currentRequestData prop from ApiTester
export default function Header({ currentRequestData, openSignupModal, openLoginModal, onRequestSaved, collections, history }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState(null);
  // Remove local environment state - get from context instead
  // const [environments, setEnvironments] = useState([]);
  // const [currentEnvironment, setCurrentEnvironment] = useState(null);
  const { user, isAuthenticated, login, logout, isLoading: isAuthLoading } = useAuth(); // Renamed isLoading to avoid conflict
  const { updateSettings } = useSettings(); // updateSettings'i context'ten al
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("common"); // Çeviri fonksiyonunu elde ediyoruz
  // Use the environment context
  const {
    environments,
    currentEnvironment,
    setCurrentEnvironmentById,
    refreshEnvironments, // Use refreshEnvironments from context
    isEnvironmentLoading // Use loading state from context
  } = useEnvironment();

  const isDarkMode = theme === 'dark';

  // Remove useEffect and fetchEnvironments - context handles loading
  // useEffect(() => { ... });
  // const fetchEnvironments = async () => { ... };

  // Modify activateEnvironment to use context function
  const activateEnvironment = async (environmentId) => {
    // Call context function to set the environment
    await setCurrentEnvironmentById(environmentId);
    // No need to fetch manually, context handles updates
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

  // Modify handleEnvironmentSaved to use context refresh
  const handleEnvironmentSaved = () => {
    refreshEnvironments(); // Refresh the list via context
  };

  const handleSaveRequest = async (requestData) => {
    try {
      const fullRequestData = {
        ...requestData,
        method: currentRequestData?.method || "GET",
        url: currentRequestData?.url || "",
        headers: currentRequestData?.headers
          ? JSON.stringify(currentRequestData.headers)
          : undefined,
        params: currentRequestData?.params
          ? JSON.stringify(currentRequestData.params)
          : undefined,
        body: currentRequestData?.body,
      };

      console.log("Saving request:", fullRequestData);
    } catch (error) {
      console.error("Failed to save request:", error);
    }
  };  const handleCopyLink = async () => { // Make the function async
    try {
      // Format data according to SwaggerUI example - using lowercase property names
      const exportData = {
        // Request property must match RequestDto structure with lowercase first letter
        request: {
          id: currentRequestData?.id || 0,
          userId: currentRequestData?.userId || "string",
          collectionId: currentRequestData?.collectionId || 0,
          collectionName: currentRequestData?.collectionName || "string",
          name: currentRequestData?.name || 'Shared Request',
          description: currentRequestData?.description || "string",
          method: currentRequestData?.method || 'GET',
          url: currentRequestData?.url || 'string',          // Convert headers array to Dictionary<string, string> format as expected by the backend
          headers: currentRequestData?.headers
            ? (() => {
                // Convert from array of {id, key, value, enabled} to key-value pairs
                let headersDict = {};
                const headersArray = typeof currentRequestData.headers === 'string' 
                  ? JSON.parse(currentRequestData.headers) 
                  : currentRequestData.headers;
                
                if (Array.isArray(headersArray)) {
                  headersArray.forEach(header => {
                    if (header.enabled !== false) { // Only include enabled headers or those without the 'enabled' property
                      headersDict[header.key] = header.value;
                    }
                  });
                  return headersDict;
                } else {
                  // If already in object format, return as is
                  return headersArray;
                }
              })()
            : {},
          authType: currentRequestData?.auth?.type || 'none',
          // authConfig should be a string according to the Swagger example
          authConfig: currentRequestData?.auth?.type === 'none'
            ? null // Set authConfig to null when authType is 'none'
            : (currentRequestData?.auth?.config
                ? (typeof currentRequestData.auth.config === 'string'
                    ? currentRequestData.auth.config
                    : JSON.stringify(currentRequestData.auth.config))
                : null), // Also set to null if authConfig is missing and authType is not 'none'
          // Convert params to Dictionary<string, string> if it's an array
          params: currentRequestData?.params
            ? (() => {
                const paramsData = typeof currentRequestData.params === 'string' 
                  ? JSON.parse(currentRequestData.params) 
                  : currentRequestData.params;
                
                // If it's an array, convert it to a dictionary
                if (Array.isArray(paramsData)) {
                  let paramsDict = {};
                  paramsData.forEach(param => {
                    if (param.enabled !== false) {
                      paramsDict[param.key] = param.value;
                    }
                  });
                  return paramsDict;
                } else {
                  // If already in object format, return as is
                  return paramsData;
                }
              })()
            : {},
          body: currentRequestData?.body || "string",
          // Tests should be a string
          tests: currentRequestData?.tests 
            ? (typeof currentRequestData.tests === 'string' 
                ? currentRequestData.tests 
                : JSON.stringify(currentRequestData.tests)) 
            : '{}',
          isFavorite: currentRequestData?.isFavorite || false,
          createdAt: currentRequestData?.createdAt || new Date().toISOString(),
          updatedAt: currentRequestData?.updatedAt || new Date().toISOString(),
        },          // Environment must match EnvironmentDto structure with lowercase first letter
        environment: currentEnvironment ? {
          id: currentEnvironment.id,
          name: currentEnvironment.name,
          isActive: currentEnvironment.isActive || true,
          // Ensure variables is a Dictionary<string, string>
          variables: (() => {
            // Handle different formats of variables
            if (currentEnvironment.variables) {
              // If variables is already an object and not an array, use it
              if (typeof currentEnvironment.variables === 'object' && !Array.isArray(currentEnvironment.variables)) {
                return currentEnvironment.variables;
              } 
              // If it's a string, try parsing it
              else if (typeof currentEnvironment.variables === 'string') {
                try {
                  return JSON.parse(currentEnvironment.variables);
                } catch (e) {
                  console.error('Error parsing environment variables:', e);
                  return {};
                }
              }
              // If it's an array, convert it to dictionary
              else if (Array.isArray(currentEnvironment.variables)) {
                const varDict = {};
                currentEnvironment.variables.forEach(v => {
                  varDict[v.key || v.name] = v.value;
                });
                return varDict;
              }
            }
            return {};
          })(),
          createdAt: currentEnvironment.createdAt || new Date().toISOString(),
          updatedAt: currentEnvironment.updatedAt || new Date().toISOString()
        } : null,
        // Match the expected structure with uppercase property names and include all properties
        Request: null, // Assuming Request is not needed for this export, set to null
        Environment: null, // Assuming Environment is not needed for this export, set to null
        Collections: collections || [],
        History: history ? history.map(item => ({
          Method: item.method,
          Url: item.url,
          RequestName: item.requestName || '', // Provide empty string as default
          RequestHeaders: item.requestHeaders,
          RequestBody: item.requestBody,
        })) : []
      };
      console.log('Sending data to backend:', JSON.stringify(exportData));
        // For debugging - to see exactly what we're sending to the backend
      console.log('Sending data to backend (formatted):', JSON.stringify(exportData));
      
      let shareId;      try {
        // Get currentEnvironmentId from localStorage for filtering
        const currentEnvironmentId = typeof window !== 'undefined' ? localStorage.getItem('currentEnvironmentId') : null;
        
        // Send data to backend and get shareId
        // Add currentEnvironmentId as query parameter if it exists
        const endpoint = currentEnvironmentId ? `/SharedData?currentEnvironmentId=${currentEnvironmentId}` : '/SharedData';
        console.log('Using endpoint with environment filter:', endpoint);
        
        const response = await authAxios.post(endpoint, exportData);
        shareId = response.data.shareId;

        if (!shareId) {
          throw new Error("Backend did not return a share ID.");
        }
      } catch (error) {
        console.error('Error details:', error.response?.data);
        throw error;
      }
      
      // Create shareable URL
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?shareId=${shareId}`;
      
      // Copy URL to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("Share Link Generated!", {
            description: "Shareable link copied to clipboard."
          });
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
          toast.error("Copy Failed", {
            description: "Could not copy the share link to the clipboard."
          });
        });
    } catch (error) {
      console.error('Failed to generate shareable link:', error);
      toast.error("Generation Failed", {
        description: "Could not generate a shareable link. " + (error.response?.data?.message || error.message)
      });
    }
  };

  const handleShareToWorkspace = () => {
    console.log("Sharing to workspace (placeholder)...", currentRequestData);
    toast.info("Share to Workspace", {
      description: "This feature is not yet fully implemented.",
    });
  };

  const handleExportRequest = () => {
    if (!currentRequestData) {
      toast.error("Export Failed", {
        description: "No request data available to export.",
      });
      return;
    }

    try {
      const exportData = {
        method: currentRequestData.method || "GET",
        url: currentRequestData.url || "",
        headers:
          currentRequestData.headers &&
          typeof currentRequestData.headers === "string"
            ? JSON.parse(currentRequestData.headers)
            : currentRequestData.headers || {},
        params:
          currentRequestData.params &&
          typeof currentRequestData.params === "string"
            ? JSON.parse(currentRequestData.params)
            : currentRequestData.params || {},
        body: currentRequestData.body || "",
        auth: currentRequestData.auth || { type: "none" },
        tests: currentRequestData.tests || { script: "", results: [] },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = `request-export-${
        exportData.url?.split("/").pop() || "data"
      }.json`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Request Exported", {
        description: `Request data saved as ${filename}`,
      });
    } catch (error) {
      console.error("Failed to export request:", error);
      toast.error("Export Failed", {
        description: "Could not export the request data.",
      });
    }
  };


  // Use isAuthLoading for auth check
  if (isAuthLoading) {
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
            PUTMAN
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
              Özellikler
            </a>
            <a
              href="#pricing"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              Fiyatlandırma
            </a>
            <a
              href="#docs"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              Dokümantasyon
            </a>
            <a
              href="#about"
              className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              Hakkında
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
              Giriş Yap
            </Button>
            <Button
              className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={openSignupModal}
            >
              Kayıt Ol
            </Button>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      <SettingsModal
        open={showSettings}
        setOpen={setShowSettings}
        currentEnvironment={currentEnvironment} // Pass environment from context
      />
      <EnvironmentModal
        open={showEnvironmentModal}
        setOpen={setShowEnvironmentModal}
        environment={environmentToEdit}
        onEnvironmentSaved={handleEnvironmentSaved}
      />
      <GenerateCodeModal
        open={showGenerateCode}
        setOpen={setShowGenerateCode}
        darkMode={isDarkMode}
        // Pass data from currentRequestData to the modal
        selectedMethod={currentRequestData?.method || "GET"}
        url={currentRequestData?.url || ""}
        parameterRows={
          currentRequestData?.params &&
          typeof currentRequestData.params === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(currentRequestData.params);
                  return Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                  console.error(
                    "Error parsing params for GenerateCodeModal:",
                    e
                  );
                  return [];
                }
              })()
            : []
        }
      />      <SaveRequestModal
        open={showSaveRequest}
        setOpen={setShowSaveRequest}
        darkMode={isDarkMode}
        onSaveRequest={handleSaveRequest}
        onRequestSaved={onRequestSaved} // ApiTester'dan gelen callback'i ilet
        initialData={currentRequestData}
        currentEnvironment={currentEnvironment}
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
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`} disabled={isEnvironmentLoading}> {/* Disable while loading */}
                <Globe className="h-4 w-4" />
                {/* Display current environment name or loading state */}
                <span>{isEnvironmentLoading ? t('header.environmentLoading', 'Loading...') : currentEnvironment?.name || t('header.environmentList.none', 'No Environment')}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Ortamlar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Use environments from context */}
              {environments.length > 0 ? (
                environments.map(env => (
                  <DropdownMenuItem key={env.id} className="flex justify-between cursor-pointer" onClick={() => activateEnvironment(env.id)}>
                    <span className="flex items-center">
                      {/* Check against currentEnvironment from context */}
                      <Check className={`h-4 w-4 ${currentEnvironment?.id === env.id ? 'text-green-500' : 'text-transparent' } mr-2`} />
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
                Ortam Ekle
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`}>
                <Share2 className="h-4 w-4" />
                <span>Paylaş</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                Bağlantıyı Kopyala
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToWorkspace}>
                Çalışma Alanına Paylaş
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRequest}>
                Dışa Aktar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>          
          <NotificationBell darkMode={isDarkMode} />
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
