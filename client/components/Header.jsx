"use client"
import { authAxios } from "@/lib/auth-context";
import { useState, useEffect } from "react"; // Added useEffect for responsive design
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next"; 
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
  Menu, // Added Menu icon for mobile
  X, // Added X icon for closing mobile menu
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import EnvironmentModal from "@/components/EnvironmentModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context"; 
import { useEnvironment } from "@/lib/environment-context"; 
import { toast } from "sonner"; 
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
  const { user, isAuthenticated, login, logout, isLoading: isAuthLoading } = useAuth();
  const { updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  // Use the environment context
  const {
    environments,
    currentEnvironment,
    setCurrentEnvironmentById,
    refreshEnvironments,
    isEnvironmentLoading
  } = useEnvironment();

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State to track screen width
  const [isMobile, setIsMobile] = useState(false);

  // Effect to handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Close mobile menu when screen is resized to larger size
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDarkMode = theme === 'dark';

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
    // ...existing code...
  };

  const handleCopyLink = async () => {
    // ...existing code...
  };

  const handleShareToWorkspace = () => {
    // ...existing code...
  };

  const handleExportRequest = () => {
    // ...existing code...
  };

  // Helper function to close mobile menu
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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

          {/* Mobile menu button */}
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

          {/* Desktop menu */}
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

        {/* Mobile menu dropdown */}
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
        setOpen={setShowSettings}
        currentEnvironment={currentEnvironment}
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
          
          {/* Mobile menu button */}
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
          
          {/* Desktop actions */}
          <div className="hidden md:flex space-x-2 ml-6">
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
        
        {/* Desktop header right section */}
        <div className="hidden md:flex items-center space-x-4">          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`space-x-1 ${isDarkMode ? "" : "text-gray-800"}`} disabled={isEnvironmentLoading}>
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{isEnvironmentLoading ? t('header.environmentLoading', 'Loading...') : currentEnvironment?.name || t('header.environmentList.none', 'No Environment')}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Ortamlar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {environments.length > 0 ? (
                environments.map(env => (
                  <DropdownMenuItem key={env.id} className="flex justify-between cursor-pointer" onClick={() => activateEnvironment(env.id)}>
                    <span className="flex items-center">
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
          />
        </div>
        
        {/* Mobile view, only show theme toggle and profile on main header when menu is closed */}
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
            />
          </div>
        )}
        
        {/* Mobile menu dropdown */}
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
                  <span>{t('general.save')}</span>
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
                  <span>{t('header.generateCode')}</span>
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
                  <span>{t('header.settings')}</span>
                </Button>
                
                <Link href="/loadtests" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>{t('header.loadTests', 'Load Tests')}</span>
                  </Button>
                </Link>
                <Link href="/monitor" onClick={closeMobileMenu}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start space-x-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                  >
                    <Activity className="h-4 w-4" />
                    <span>{t('header.monitoring')}</span>
                  </Button>
                </Link>
                
                <div className="py-2">
                  <div className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Environment</div>
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
                      <span>{isEnvironmentLoading ? t('header.environmentLoading', 'Loading...') : currentEnvironment?.name || t('header.environmentList.none', 'No Environment')}</span>
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
                  <div className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Share</div>
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
