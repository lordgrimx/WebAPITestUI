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

function AccountSettingsModal({ open, setOpen, darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">Account Settings</DialogTitle>
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
                General
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                Privacy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Globe className="mr-2 h-5 w-5" /> 
                  Language & Region
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger 
                        id="language" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="tr">Türkçe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger 
                        id="timezone" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                        <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                        <SelectItem value="cet">CET (Central European Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select defaultValue="mdy">
                      <SelectTrigger 
                        id="date-format" 
                        className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                      >
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" /> 
                  Session
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-logout">Auto Logout</Label>
                      <p className="text-sm text-gray-500">
                        Automatically log out after period of inactivity
                      </p>
                    </div>
                    <Switch id="auto-logout" />
                  </div>
                  
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="session-timeout" 
                      type="number" 
                      defaultValue="30" 
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
                  Theme
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`border rounded-md p-4 flex flex-col items-center ${
                        !darkMode ? "border-blue-500 bg-blue-50" : "border-gray-600"
                      } cursor-pointer`}
                      onClick={() => setDarkMode(false)}
                    >
                      <div className="w-full h-24 bg-white border border-gray-200 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">Light</span>
                    </div>
                    <div 
                      className={`border rounded-md p-4 flex flex-col items-center ${
                        darkMode ? "border-blue-500 bg-blue-900/20" : "border-gray-200"
                      } cursor-pointer`}
                      onClick={() => setDarkMode(true)}
                    >
                      <div className="w-full h-24 bg-gray-800 border border-gray-700 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    <div 
                      className="border border-gray-200 dark:border-gray-600 rounded-md p-4 flex flex-col items-center cursor-pointer"
                    >
                      <div className="w-full h-24 bg-gradient-to-r from-white to-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-2"></div>
                      <span className="text-sm font-medium">System</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Layout</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compact-view">Compact View</Label>
                      <p className="text-sm text-gray-500">
                        Reduce spacing and padding throughout the interface
                      </p>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-sidebar">Show Sidebar</Label>
                      <p className="text-sm text-gray-500">
                        Show collection sidebar by default
                      </p>
                    </div>
                    <Switch id="show-sidebar" defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> 
                  Privacy Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-gray-500">
                        Allow collection of anonymous usage data to improve the service
                      </p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="crash-reports">Crash Reports</Label>
                      <p className="text-sm text-gray-500">
                        Send anonymous crash reports to help us fix issues
                      </p>
                    </div>
                    <Switch id="crash-reports" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">
                        Receive emails about new features, tips, and promotions
                      </p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg text-red-500 mb-4">Danger Zone</h3>
                <div className="space-y-4 border border-red-200 dark:border-red-900/50 rounded-md p-4 bg-red-50 dark:bg-red-900/10">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AccountSettingsModal;
export { AccountSettingsModal };