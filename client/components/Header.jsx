"use client"
import { authAxios } from "@/lib/auth-context";
import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  Menu,
  X,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import EnvironmentModal from "@/components/EnvironmentModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context"; 
import { useEnvironment } from "@/lib/environment-context"; 
import Image from "next/image";
import { toast } from "sonner";

// DeleteConfirmDialog bileşeni - Environment silme onay dialog'u
const DeleteConfirmDialog = ({ open, setOpen, environment, onConfirm }) => {
  const handleConfirm = () => {
    onConfirm(environment);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Environment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the environment "${environment?.name}"? This will also delete all associated collections, requests, and history for this environment.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Accept currentRequestData prop from ApiTester
export default function Header({ currentRequestData, openSignupModal, openLoginModal, onRequestSaved, collections, history, onCloseSettingsModal }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [environmentToEdit, setEnvironmentToEdit] = useState(null);
  // Environment silme dialog'u için state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState(null);
  // Remove local environment state - get from context instead
  // const [environments, setEnvironments] = useState([]);
  // const [currentEnvironment, setCurrentEnvironment] = useState(null);
  const { user, isAuthenticated, login, logout, isLoading: isAuthLoading } = useAuth(); // Renamed isLoading to avoid conflict
  const { updateSettings } = useSettings(); // updateSettings'i context'ten al
  const { theme, setTheme } = useTheme();
  const {
    environments,
    currentEnvironment,
    setCurrentEnvironmentById,
    refreshEnvironments, // Use refreshEnvironments from context
    isEnvironmentLoading, // Use loading state from context
    deleteEnvironment // Add the delete environment function
  } = useEnvironment();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDarkMode = theme === 'dark';

  const activateEnvironment = async (environmentId) => {
    await setCurrentEnvironmentById(environmentId);
  };

  const openEditEnvironmentModal = (env, e) => {
    e.stopPropagation();
    setEnvironmentToEdit(env);
    setShowEnvironmentModal(true);
  };

  const openCreateEnvironmentModal = () => {
    setEnvironmentToEdit(null);
    setShowEnvironmentModal(true);
  };

  const handleEnvironmentSaved = () => {
    refreshEnvironments();
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
  };

  const handleCopyLink = async () => { // Make the function async
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


  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
  };  // Function to open the delete confirmation dialog
  const openDeleteDialog = (env, e) => {
    if (e) e.stopPropagation(); // Prevent triggering parent onClick
    setEnvironmentToDelete(env);
    setShowDeleteDialog(true);
  };

  // Function to handle environment deletion after confirmation
  const handleDeleteEnvironment = async (env) => {
    if (env && env.id) {
      try {
        await deleteEnvironment(env.id);
        toast.success('Environment deleted successfully.');
      } catch (error) {
        toast.error('Failed to delete environment.');
        console.error('Delete environment error:', error);
      }
    }
  };

  const handleSetShowSettings = (isOpen) => {
    setShowSettings(isOpen);
    if (!isOpen && onCloseSettingsModal) { // Modal kapatılıyorsa ve callback varsa
      onCloseSettingsModal();
    }
  };

  // Use isAuthLoading for auth check
  if (isAuthLoading) {
    return (
      <header
        className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-4 md:px-6 flex items-center justify-between`}
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
      <header className="container mx-auto px-4 md:px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>API Testing Tool</h1>
          </div>

          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={isDarkMode ? "text-white" : "text-gray-600"}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}

          <div className="hidden md:flex items-center space-x-6">
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

          <div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-4`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
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

        {isMobile && isMobileMenuOpen && (
          <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-100/90'}`}>
            <div className={`flex flex-col p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} h-full`}>
              <div className="flex justify-between items-center mb-8">
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>API Testing Tool</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isDarkMode ? "text-white" : "text-gray-600"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex flex-col space-y-6 text-lg">
                <a
                  href="#features"
                  className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Özellikler
                </a>
                <a
                  href="#pricing"
                  className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Fiyatlandırma
                </a>
                <a
                  href="#docs"
                  className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Dokümantasyon
                </a>
                <a
                  href="#about"
                  className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  onClick={closeMobileMenu}
                >
                  Hakkında
                </a>
              </div>
              
              <div className="mt-auto flex flex-col space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    openLoginModal();
                    closeMobileMenu();
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    openSignupModal();
                    closeMobileMenu();
                  }}
                >
                  Kayıt Ol
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className={`w-full ${isDarkMode ? "text-white" : "text-gray-600"}`}
                >
                  {isDarkMode ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <>
      <SettingsModal
        open={showSettings}
        setOpen={handleSetShowSettings}
        currentEnvironment={currentEnvironment}
      />
      <EnvironmentModal
        open={showEnvironmentModal}
        setOpen={setShowEnvironmentModal}
        environment={environmentToEdit}
        onEnvironmentSaved={handleEnvironmentSaved}
      />      <DeleteConfirmDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        environment={environmentToDelete}
        onConfirm={handleDeleteEnvironment}
      />
      <GenerateCodeModal
        open={showGenerateCode}
        setOpen={setShowGenerateCode}
        darkMode={isDarkMode}
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
      />      
      <SaveRequestModal
        open={showSaveRequest}
        setOpen={setShowSaveRequest}
        darkMode={isDarkMode}
        onSaveRequest={handleSaveRequest}
        onRequestSaved={onRequestSaved}
        initialData={currentRequestData}
        currentEnvironment={currentEnvironment}
      />
      <header
        className={`${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b py-3 px-4 md:px-6 flex items-center justify-between`}
      >
        <div className="flex items-center">
          <div className="flex gap-2 items-center cursor-pointer">
            <Image src={'icon.svg'} width={30} height={30} alt="icon"/> 
            <h1 className={`text-xl font-extrabold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`} >
              <span className="text-blue-500">PUT</span>
              <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>man</span>
            </h1>
          </div>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className={`ml-2 ${isDarkMode ? "text-white" : "text-gray-600"}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
          
          <div className="hidden md:flex space-x-2 ml-6">
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowSaveRequest(true)}
            >
              <Save className="h-4 w-4" />
              <span>Kaydet</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowGenerateCode(true)}
            >
              <Code className="h-4 w-4" />
              <span>Kod Üret</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              <span>Ayarlar</span>
            </Button>            
            <Link href="/loadtests">
              <Button
                variant="ghost"
                size="sm"
                className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              >
                <Activity className="h-4 w-4 mr-1" />
                <span>Yük Testleri</span>
              </Button>
            </Link>
            <Link href="/monitor">
              <Button
                variant="ghost"
                size="sm"
                className={`space-x-1 ${isDarkMode ? "":"text-gray-800"}`}
              >
                <Activity className="h-4 w-4 mr-1" />
                <span>İzleme</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`} disabled={isEnvironmentLoading}>
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{isEnvironmentLoading ? "Yükleniyor..." : currentEnvironment?.name || "Ortam Yok"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Environments</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Use environments from context */}              
              {environments.length > 0 ? (
                environments.map(env => (
                  <div key={env.id} className="px-2 py-1.5 flex items-center justify-between">
                    <div 
                      className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 flex-1"
                      onClick={() => activateEnvironment(env.id)}
                    >
                      <Check className={`h-4 w-4 ${currentEnvironment?.id === env.id ? 'text-green-500' : 'text-transparent' } mr-2`} />
                      {env.name}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => openEditEnvironmentModal(env, e)} 
                        className="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                      </button>                      <button 
                        onClick={(e) => openDeleteDialog(env, e)} 
                        className="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Trash2 className="h-3 w-3 text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  Ortam Bulunamadı
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={openCreateEnvironmentModal}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Environment
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`}>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Paylaş</span>
                <ChevronDown className="h-3 w-3 sm:ml-1" />
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
            closeMobileMenu={closeMobileMenu}
          />
        </div>
        
        {isMobile && !isMobileMenuOpen && (
          <div className="flex items-center space-x-2">
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
              closeMobileMenu={closeMobileMenu}
            />
          </div>
        )}
        
        {isMobile && isMobileMenuOpen && (
          <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-900/90' : 'bg-gray-100/90'}`}>
            <div className={`flex flex-col p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} h-full`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 items-center">
                  <Image src={'icon.svg'} width={30} height={30} alt="icon"/> 
                  <h1 className={`text-xl font-extrabold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    <span className="text-blue-500">PUT</span>
                    <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>man</span>
                  </h1>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isDarkMode ? "text-white" : "text-gray-600"}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex flex-col space-y-4">
                <Button
                  variant="ghost"
                  className={`justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  onClick={() => {
                    setShowSaveRequest(true);
                    closeMobileMenu();
                  }}
                >
                  <Save className="h-4 w-4" />
                  <span>Kaydet</span>
                </Button>
                <Button
                  variant="ghost"
                  className={`justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  onClick={() => {
                    setShowGenerateCode(true);
                    closeMobileMenu();
                  }}
                >
                  <Code className="h-4 w-4" />
                  <span>Kod Üret</span>
                </Button>
                <Button
                  variant="ghost"
                  className={`justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  onClick={() => {
                    setShowSettings(true);
                    closeMobileMenu();
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Ayarlar</span>
                </Button>
                
                <Link href="/loadtests" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>Yük Testleri</span>
                  </Button>
                </Link>
                <Link href="/monitor" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>İzleme</span>
                  </Button>
                </Link>
                
                <div className="py-2">
                  <div className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Ortam</div>
                  <Button
                    variant="outline"
                    className="w-full justify-between mb-2"
                    onClick={() => {
                      openCreateEnvironmentModal();
                      closeMobileMenu();
                    }}
                  >
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{isEnvironmentLoading ? "Yükleniyor..." : currentEnvironment?.name || "Ortam Yok"}</span>
                    </div>
                    <Plus className="h-4 w-4" />
                  </Button>
                  {environments.length > 0 && (
                    <div className={`max-h-32 overflow-auto ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} rounded-md p-1`}>
                      {environments.map(env => (
                        <div 
                          key={env.id} 
                          className={`flex justify-between items-center p-2 rounded ${currentEnvironment?.id === env.id ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-200') : ''} cursor-pointer mb-1`}
                          onClick={() => {
                            activateEnvironment(env.id);
                            closeMobileMenu();
                          }}
                        >
                          <span className="flex items-center">
                            <Check className={`h-4 w-4 ${currentEnvironment?.id === env.id ? 'text-green-500' : 'text-transparent' } mr-2`} />
                            {env.name}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEnvironmentModal(env, e);
                              closeMobileMenu();
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="py-2">
                  <div className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Paylaş</div>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                      onClick={() => {
                        handleCopyLink();
                        closeMobileMenu();
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Bağlantıyı Kopyala</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                      onClick={() => {
                        handleShareToWorkspace();
                        closeMobileMenu();
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Çalışma Alanına Paylaş</span>
                    </Button>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                      onClick={() => {
                        handleExportRequest();
                        closeMobileMenu();
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Dışa Aktar</span>
                    </Button>
                  </div>
                </div>
                
                <div className="py-2">
                  <NotificationBell darkMode={isDarkMode} isMobile={true} />
                </div>
              </div>
              
              <div className="mt-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className={`w-full justify-start ${isDarkMode ? "text-white" : "text-gray-600"}`}
                >
                  {isDarkMode ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                
                <div className="flex justify-between items-center mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {user?.name || user?.email || 'User'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {user?.email || ''}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
