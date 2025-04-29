"use client";
import { useState } from "react";
import dynamic from "next/dynamic"; // Re-add dynamic import
import { authAxios } from "@/lib/auth-context";
import { useTranslation } from "react-i18next"; // Çeviri hook'u eklendi
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react";

import ProfileModal from "@/components/modals/ProfileModal";
import AccountSettingsModal from "@/components/modals/AccountSettingsModal";
import NotificationsModal from "@/components/modals/NotificationsModal";
import HelpSupportModal from "@/components/modals/HelpSupportModal";

export default function ProfileDropdown({ darkMode, setDarkMode, user, onLogout }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpSupportModal, setShowHelpSupportModal] = useState(false);
  const { t } = useTranslation("common"); // Çeviri fonksiyonunu elde ediyoruz
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "?";
    return user.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <ProfileModal 
        open={showProfileModal} 
        setOpen={setShowProfileModal} 
        darkMode={darkMode} 
      />
      
      <AccountSettingsModal 
        open={showAccountSettingsModal} 
        setOpen={setShowAccountSettingsModal} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <NotificationsModal 
        open={showNotificationsModal} 
        setOpen={setShowNotificationsModal} 
        darkMode={darkMode} 
      />
      
      <HelpSupportModal 
        open={showHelpSupportModal} 
        setOpen={setShowHelpSupportModal} 
        darkMode={darkMode} 
      />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Display profile image if available, otherwise initials */}
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer overflow-hidden">
            {user?.profileImageBase64 ? ( // Check for Base64 property
              <img
                src={user.profileImageBase64} // Use Base64 string as src
                alt={user.name || 'User Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className={`w-56 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          align="end"
        >
          <div className={`py-3 px-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center`}>
            {/* Display profile image in dropdown header as well */}
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3 overflow-hidden">
              {user?.profileImageBase64 ? ( // Check for Base64 property
                <img
                  src={user.profileImageBase64} // Use Base64 string as src
                  alt={user.name || 'User Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <div>
              <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{user?.name || "User"}</div>
              <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {user?.email || ""}
              </div>
            </div>
          </div>
          
          <DropdownMenuItem 
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <User className="mr-3 w-4 h-4" />
            <span>{t('auth.profile')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={() => setShowAccountSettingsModal(true)}
          >
            <Settings className="mr-3 w-4 h-4" />
            <span>{t('settings.title')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={() => setShowNotificationsModal(true)}
          >
            <Bell className="mr-3 w-4 h-4" />
            <span>{t('profile.notifications', 'Notifications')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center px-4 py-2 cursor-pointer"
            onClick={() => setShowHelpSupportModal(true)}
          >
            <HelpCircle className="mr-3 w-4 h-4" />
            <span>{t('profile.helpSupport', 'Help & Support')}</span>
          </DropdownMenuItem>
            <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center px-4 py-2 cursor-pointer text-red-600"
            onClick={onLogout}
          >
            <LogOut className="mr-3 w-4 h-4" />
            <span>{t('auth.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
