"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Shield, Bell, Globe, Palette, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/lib/settings-context"; // Import useSettings
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import { authAxios } from "@/lib/auth-context"; // Import authAxios for API calls
import { toast } from "sonner"; // Import toast for notifications
import { useEffect } from "react"; // Import useEffect
import { useTranslation } from "react-i18next"; // Çoklu dil desteği için eklendi
function AccountSettingsModal({ open, setOpen, darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("general");
  const { settings: globalSettings, updateSetting: updateGlobalSetting } = useSettings(); // Rename for clarity
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and loading state
  const [localSettings, setLocalSettings] = useState({}); // State for local edits
  const { t, i18n } = useTranslation("common"); // Çeviri hook'u

  // Initialize local settings when modal opens or user data changes
  useEffect(() => {
    if (open && user && !isAuthLoading) {
      // Mevcut dili ve kullanıcı ayarlarını kontrol et
      const currentLanguage = user.language || i18n.language || 'en';
      
      // Initialize with user data from AuthContext, falling back to global settings or defaults
      setLocalSettings({
        language: currentLanguage, // Mevcut aktif dili kullan
        timezone: user.timezone || 'utc',
        dateFormat: user.dateFormat || 'mdy',
        autoLogoutEnabled: user.autoLogoutEnabled ?? false, // Use ?? for boolean defaults
        sessionTimeoutMinutes: user.sessionTimeoutMinutes || 30,
        theme: user.theme || (globalSettings.darkMode ? 'dark' : 'light'), // Map darkMode to theme string
        compactViewEnabled: user.compactViewEnabled ?? false,
        showSidebarEnabled: user.showSidebarEnabled ?? true,
        usageAnalyticsEnabled: user.usageAnalyticsEnabled ?? true,
        crashReportsEnabled: user.crashReportsEnabled ?? true,
        marketingEmailsEnabled: user.marketingEmailsEnabled ?? false,
        // Include other relevant fields from user DTO if needed, but keep it focused on settings
        name: user.name,
        phone: user.phone,
        address: user.address,
        website: user.website,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    }
  }, [open, user, isAuthLoading, globalSettings, i18n]);


  // Generic handler to update local settings state
  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  // Dil değiştiğinde çalışacak özel fonksiyon
  const handleLanguageChange = (value) => {
    // Sadece yerel ayarı güncelle, değişiklikleri kaydet butonuna basınca uygulanacak
    handleSettingChange('language', value);
    
    // Not: Artık burada dil değişikliği hemen uygulanmayacak
    // Değişiklikler "Değişiklikleri Kaydet" butonuna basıldığında uygulanacak
  };

  // Handler for theme change (updates local state and potentially visual theme instantly)
  const handleThemeChange = (newTheme) => {
    handleSettingChange('theme', newTheme);
    // Optionally update the visual theme immediately via setDarkMode prop
    if (newTheme === 'dark') setDarkMode(true);
    if (newTheme === 'light') setDarkMode(false);
    // 'system' theme handling might require more logic based on OS preference
  };


  // Handle Save Changes button click
  const handleSaveChanges = async () => {
     if (!user) {
       toast.error("User data not available. Cannot save settings.");
       return;
     }
    
     // Prepare payload from localSettings
     const payload = { ...localSettings }; 
     // Ensure only fields present in UpdateProfileDto are sent
     // (Backend should ignore extra fields, but cleaner to send only relevant ones)
     // Example: delete payload.id; delete payload.email; etc. if they exist in localSettings

     try {
       const response = await authAxios.put('/user/profile', payload);
       toast.success("Settings updated successfully");

       // Dil değişikliğini burada uygula - Değişiklikleri Kaydet'e basıldığında
       if (typeof window !== 'undefined' && i18n && typeof i18n.changeLanguage === 'function' && 
           payload.language && payload.language !== i18n.language) {
         i18n.changeLanguage(payload.language);
       }

       // TODO: Optionally update AuthContext user state here if needed immediately
       // updateUser(response.data); // Assuming an updateUser function exists in AuthContext
       setOpen(false); // Close modal on success
     } catch (error) {
       console.error("Failed to save settings:", error);
       toast.error("Failed to update settings");
     }
  };

  // Handle Cancel button click
  const handleCancel = () => {
     // Reset local settings to reflect the actual user settings before closing
     if (user) {
       setLocalSettings({
         language: user.language || globalSettings.language || 'en',
         timezone: user.timezone || 'utc',
         dateFormat: user.dateFormat || 'mdy',
         autoLogoutEnabled: user.autoLogoutEnabled ?? false,
         sessionTimeoutMinutes: user.sessionTimeoutMinutes || 30,
         theme: user.theme || (globalSettings.darkMode ? 'dark' : 'light'),
         compactViewEnabled: user.compactViewEnabled ?? false,
         showSidebarEnabled: user.showSidebarEnabled ?? true,
         usageAnalyticsEnabled: user.usageAnalyticsEnabled ?? true,
         crashReportsEnabled: user.crashReportsEnabled ?? true,
         marketingEmailsEnabled: user.marketingEmailsEnabled ?? false,
         name: user.name,
         phone: user.phone,
         address: user.address,
         website: user.website,
         twoFactorEnabled: user.twoFactorEnabled,
       });
       // Also reset the visual theme if it was changed instantly
       const currentTheme = user.theme || (globalSettings.darkMode ? 'dark' : 'light');
       if (currentTheme === 'dark') setDarkMode(true);
       if (currentTheme === 'light') setDarkMode(false);
     }
    setOpen(false); // Just close the modal, discard local changes
  };


  // Render loading state or empty if user data isn't ready
  if (isAuthLoading || !user) {
     // Optionally return a loading spinner or null
     return null; 
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">{t('settings.title')}</DialogTitle> 
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b flex-wrap rounded-none justify-start mb-4 bg-transparent">
              <TabsTrigger 
                value="general" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                {t('settings.general')}
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                {t('settings.appearance')}
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                {t('settings.privacy')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> 
                  {t('settings.language')} & {t('settings.timezone')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">{t('settings.language')}</Label>
                    {/* Bind value to localSettings and use language-specific handler */}
                    <Select 
                      value={localSettings.language || 'en'} // Provide default if undefined
                      onValueChange={(value) => handleLanguageChange(value)}
                    >
                      <SelectTrigger 
                        id="language" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder={t('settings.selectLanguage', 'Select language')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('settings.languages.english', 'English (US)')}</SelectItem>
                        <SelectItem value="es">{t('settings.languages.spanish', 'Spanish')}</SelectItem>
                        <SelectItem value="fr">{t('settings.languages.french', 'French')}</SelectItem>
                        <SelectItem value="de">{t('settings.languages.german', 'German')}</SelectItem>
                        <SelectItem value="tr">{t('settings.languages.turkish', 'Turkish')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">{t('settings.timezone')}</Label>
                    <Select 
                      value={localSettings.timezone || 'utc'} 
                      onValueChange={(value) => handleSettingChange('timezone', value)}
                    >
                      <SelectTrigger 
                        id="timezone" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder={t('settings.selectTimezone', 'Select timezone')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">{t('settings.timezones.utc', 'UTC (Coordinated Universal Time)')}</SelectItem>
                        <SelectItem value="est">{t('settings.timezones.est', 'EST (Eastern Standard Time)')}</SelectItem>
                        <SelectItem value="pst">{t('settings.timezones.pst', 'PST (Pacific Standard Time)')}</SelectItem>
                        <SelectItem value="cet">{t('settings.timezones.cet', 'CET (Central European Time)')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-format">{t('settings.dateFormat')}</Label>
                     <Select 
                      value={localSettings.dateFormat || 'mdy'} 
                      onValueChange={(value) => handleSettingChange('dateFormat', value)}
                    >
                      <SelectTrigger 
                        id="date-format" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder={t('settings.selectDateFormat', 'Select date format')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">{t('settings.dateFormats.mdy', 'MM/DD/YYYY')}</SelectItem>
                        <SelectItem value="dmy">{t('settings.dateFormats.dmy', 'DD/MM/YYYY')}</SelectItem>
                        <SelectItem value="ymd">{t('settings.dateFormats.ymd', 'YYYY/MM/DD')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" /> 
                  {t('settings.sessionTimeout')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-logout">{t('settings.autoLogout')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.autoLogoutDescription', 'Automatically log out after period of inactivity')}
                      </p>
                    </div>
                   <Switch 
                    id="auto-logout" 
                    checked={localSettings.autoLogoutEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('autoLogoutEnabled', checked)} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="session-timeout">{t('settings.sessionTimeout')}</Label>
                  <Input 
                    id="session-timeout" 
                    type="number" 
                    value={localSettings.sessionTimeoutMinutes || 30} 
                    onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value, 10) || 0)}
                    min="5" 
                    max="120" 
                    className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Palette className="mr-2 h-5 w-5" /> 
                  {t('settings.theme.title')}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                     {/* Light Theme */}
                    <div 
                      className={`border rounded-md p-4 flex flex-col items-center cursor-pointer ${
                        localSettings.theme === 'light' ? "border-blue-500 bg-blue-50" : "border-gray-600"
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="w-full h-24 bg-white border border-gray-200 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">{t('settings.theme.light')}</span>
                    </div>
                     {/* Dark Theme */}
                    <div 
                      className={`border rounded-md p-4 flex flex-col items-center cursor-pointer ${
                        localSettings.theme === 'dark' ? "border-blue-500 bg-blue-900/20" : "border-gray-200"
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">{t('settings.theme.dark')}</span>
                    </div>
                     {/* System Theme (visual selection only, actual implementation might vary) */}
                    <div 
                      className={`border rounded-md p-4 flex flex-col items-center cursor-pointer ${
                        localSettings.theme === 'system' ? "border-blue-500 bg-gray-50 dark:bg-gray-900/20" : "border-gray-200 dark:border-gray-600"
                      }`}
                       onClick={() => handleThemeChange('system')} // Allow selecting 'system'
                    >
                      <div className="w-full h-24 bg-gradient-to-r from-white to-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">{t('settings.theme.system')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">{t('settings.layout', 'Layout')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view">{t('settings.compactView', 'Compact View')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.compactViewDescription', 'Reduce spacing and padding throughout the interface')}
                      </p>
                    </div>
                   <Switch 
                    id="compact-view" 
                    checked={localSettings.compactViewEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('compactViewEnabled', checked)} 
                  />
                </div>
                
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-sidebar">{t('settings.showSidebar', 'Show Sidebar')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.showSidebarDescription', 'Show collection sidebar by default')}
                      </p>
                    </div>
                   <Switch 
                    id="show-sidebar" 
                    checked={localSettings.showSidebarEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('showSidebarEnabled', checked)} 
                  />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> 
                  {t('settings.privacy')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">{t('settings.usageAnalytics', 'Usage Analytics')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.usageAnalyticsDescription', 'Allow collection of anonymous usage data to improve the service')}
                      </p>
                    </div>
                   <Switch 
                    id="analytics" 
                    checked={localSettings.usageAnalyticsEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('usageAnalyticsEnabled', checked)} 
                  />
                </div>
                
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="crash-reports">{t('settings.crashReports', 'Crash Reports')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.crashReportsDescription', 'Send anonymous crash reports to help us fix issues')}
                      </p>
                    </div>
                   <Switch 
                    id="crash-reports" 
                    checked={localSettings.crashReportsEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('crashReportsEnabled', checked)} 
                  />
                </div>
                
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">{t('settings.marketingEmails', 'Marketing Emails')}</Label>
                      <p className="text-sm text-gray-500">
                        {t('settings.marketingEmailsDescription', 'Receive emails about new features, tips, and promotions')}
                      </p>
                    </div>
                   <Switch 
                    id="marketing" 
                    checked={localSettings.marketingEmailsEnabled || false} 
                    onCheckedChange={(checked) => handleSettingChange('marketingEmailsEnabled', checked)} 
                  />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg text-red-500 mb-4">{t('settings.dangerZone', 'Danger Zone')}</h3>
                <div className="space-y-4 border border-red-200 dark:border-red-900/50 rounded-md p-4 bg-red-50 dark:bg-red-900/10">
                  <div>
                    <h4 className="font-medium">{t('settings.deleteAccount', 'Delete Account')}</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('settings.deleteAccountDescription', 'Once you delete your account, there is no going back. Please be certain.')}
                    </p>
                    <Button variant="destructive" size="sm">{t('settings.deleteAccount', 'Delete Account')}</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleCancel}>{t('general.cancel')}</Button>
          <Button onClick={handleSaveChanges}>{t('settings.saveChanges')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AccountSettingsModal;
export { AccountSettingsModal };
