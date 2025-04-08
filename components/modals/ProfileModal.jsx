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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, Mail, Phone, MapPin, Globe, Camera } from "lucide-react";

function ProfileModal({ open, setOpen, darkMode }) {
  const [activeTab, setActiveTab] = useState("personal");
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={`max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">My Profile</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl">
                JD
              </div>
              <div className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2 cursor-pointer">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <h2 className="mt-4 font-bold text-xl">John Doe</h2>
            <p className="text-gray-500 text-sm">john.doe@example.com</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full border-b flex-wrap rounded-none justify-start mb-4 bg-transparent">
              <TabsTrigger 
                value="personal" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                Personal Information
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="py-2 px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none"
              >
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <Input 
                      id="firstName" 
                      defaultValue="John" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <User className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <Input 
                      id="lastName" 
                      defaultValue="Doe" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <User className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="john.doe@example.com" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <Mail className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input 
                      id="phone" 
                      type="tel" 
                      defaultValue="+1 (555) 123-4567" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <Phone className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <Input 
                      id="address" 
                      defaultValue="123 Main Street, New York, NY 10001" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <MapPin className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Input 
                      id="website" 
                      type="url" 
                      defaultValue="https://johndoe.com" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <Globe className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="enable-2fa" />
                  <Label htmlFor="enable-2fa">Enable two-factor authentication</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Adding an extra layer of security to your account will help protect your data.
                </p>
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

export default ProfileModal;
export { ProfileModal };