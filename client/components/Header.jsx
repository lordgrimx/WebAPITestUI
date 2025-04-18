"use client";

import { useState } from "react";
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
  Home,
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import GenerateCodeModal from "@/components/GenerateCodeModal";
import SaveRequestModal from "@/components/SaveRequestModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRequest } from "@/lib/request-context";

export default function Header({ darkMode, setDarkMode, openLoginModal, openSignupModal }) {
  const { pathname } = useRouter();
  const [showSaveRequest, setShowSaveRequest] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerateCode, setShowGenerateCode] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { currentRequestData } = useRequest();

  const isApiTester = pathname === "/";

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

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success("Link Copied!", {
          description: "Current URL copied to clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        toast.error("Copy Failed", {
          description: "Could not copy the link to the clipboard.",
        });
      });
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
            PUTman
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "text-gray-300" : "text-gray-600"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
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
            <h1 className="text-2xl font-bold text-white">API Testing Tool</h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Özellikler
            </a>
            <a
              href="#pricing"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Fiyatlandırma
            </a>
            <a
              href="#docs"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Dokümantasyon
            </a>
            <a
              href="#about"
              className="text-white hover:text-blue-200 transition-colors"
            >
              Hakkında
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-white"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
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
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <GenerateCodeModal
        open={showGenerateCode}
        setOpen={setShowGenerateCode}
        darkMode={darkMode}
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
          <div className="flex gap-2 items-center">
            <Link href="/" className="flex gap-2 items-center cursor-pointer">
              <Image src={"icon.svg"} width={30} height={30} alt="icon" />
              <h1
                className={`text-xl font-extrabold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <span className="text-blue-500">PUT</span>
                <span className={darkMode ? "text-white" : "text-gray-500"}>
                  man
                </span>
              </h1>
            </Link>
          </div>
          {isAuthenticated && (
            <div className="flex space-x-2 ml-6">
              <Link
                href="/"
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Home className="h-4 w-4 mr-1" />
                <span>Ana Sayfa</span>
              </Link>
              {isApiTester && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="space-x-1"
                    onClick={() => setShowSaveRequest(true)}
                  >
                    <Save className="h-4 w-4" />
                    <span>Kaydet</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="space-x-1"
                    onClick={() => setShowGenerateCode(true)}
                  >
                    <Code className="h-4 w-4" />
                    <span>Kod Oluştur</span>
                  </Button>
                </>
              )}
            </div>
          )}
          <div className="flex space-x-2 ml-6">
            <Button
              variant="ghost"
              size="sm"
              className="space-x-1"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
              <span>Ayarlar</span>
            </Button>
            <Link
              href="/loadtests"
              className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Activity className="h-4 w-4 mr-1" />
              <span>Yük Testleri</span>
            </Link>
            <Link
              href="/monitor"
              className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <Activity className="h-4 w-4 mr-1" />
              <span>İzleme</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="space-x-1">
                <Globe className="h-4 w-4" />
                <span>Ortam</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Ortamlar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex justify-between cursor-pointer">
                <span className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Geliştirme
                </span>
                <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between cursor-pointer">
                <span>Test</span>
                <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex justify-between cursor-pointer">
                <span>Üretim</span>
                <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ortam Ekle
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="space-x-1">
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={darkMode ? "text-gray-300" : "text-gray-600"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
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