"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import { useMutation } from "convex/react"; // Import useMutation
import { api } from "@/convex/_generated/api"; // Import api
import { toast } from "sonner"; // Import toast for notifications
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
import { X, User, Mail, Phone, MapPin, Globe, Camera, Loader2 } from "lucide-react";

function ProfileModal({ open, setOpen, darkMode }) {
  const { user, isLoading: authLoading } = useAuth(); // Get user from auth context
  const updateProfile = useMutation(api.users.updateProfile); // Get updateProfile mutation

  const [activeTab, setActiveTab] = useState("personal");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // For potential future upload preview
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null); // Ref for file input

  // Update state when user data is loaded or changes
  useEffect(() => {
    if (user) {
      setFirstName(user.name?.split(" ")[0] || "");
      setLastName(user.name?.split(" ").slice(1).join(" ") || "");
      setProfileImageUrl(user.profileImage || ""); // Use existing profile image URL
    }
  }, [user]);

  const getInitials = () => {
    if (!user || !user.name) return "?";
    return user.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfilePictureClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement file upload logic here
      // 1. Upload file to Convex storage (requires setup)
      // 2. Get the URL of the uploaded file
      // 3. Update the profileImageUrl state for preview
      // 4. Store the URL to be saved with updateProfile mutation
      console.log("Selected file:", file);
      toast.info("Profil resmi yükleme henüz aktif değil.");
      // Example preview (replace with actual upload URL later)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile({
        userId: user.userId, // Make sure userId is passed correctly from useAuth
        name: name || undefined, // Send name only if it's not empty
        // profileImage: profileImageUrl || undefined, // Send profile image URL if available (after upload)
        // TODO: Pass the actual uploaded image URL here once upload is implemented
      });
      toast.success("Profil başarıyla güncellendi!");
      setOpen(false); // Close modal on success
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);
      toast.error("Profil güncellenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`max-w-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
     // Optionally handle the case where the user is somehow not available after loading
     // This might indicate an issue with the auth context or login state
     return (
        <Dialog open={open} onOpenChange={setOpen}>
         <DialogContent className={`max-w-2xl ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
            <DialogHeader>
               <DialogTitle>Hata</DialogTitle>
            </DialogHeader>
            <p>Kullanıcı bilgileri yüklenemedi. Lütfen tekrar giriş yapmayı deneyin.</p>
            <DialogFooter>
               <Button variant="outline" onClick={() => setOpen(false)}>Kapat</Button>
            </DialogFooter>
         </DialogContent>
        </Dialog>
     );
  }


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
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl overflow-hidden">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profil Resmi" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleProfilePictureClick}
                title="Profil resmini değiştir"
              >
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <h2 className="mt-4 font-bold text-xl">{user.name || "Kullanıcı"}</h2>
            <p className="text-gray-500 text-sm">{user.email || ""}</p>
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
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                      value={user.email || ""}
                      readOnly // Email should not be editable here
                      className={`${darkMode ? "bg-gray-600 border-gray-600 text-gray-400" : "bg-gray-100 border-gray-300 text-gray-500"} pl-8 cursor-not-allowed`}
                    />
                    <Mail className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Coming Soon)</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Telefon numarası"
                      disabled // Disable for now
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8 cursor-not-allowed`}
                    />
                    <Phone className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address (Coming Soon)</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="Adres"
                      disabled // Disable for now
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8 cursor-not-allowed`}
                    />
                    <MapPin className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website (Coming Soon)</Label>
                  <div className="relative">
                    <Input
                      id="website"
                      type="url"
                      placeholder="Web sitesi"
                      disabled // Disable for now
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8 cursor-not-allowed`}
                    />
                    <Globe className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              {/* Security content remains the same for now */}
              <div>
                <h3 className="font-medium text-lg mb-4">Change Password (Coming Soon)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      disabled
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      disabled
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      disabled
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} cursor-not-allowed`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">Two-Factor Authentication (Coming Soon)</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox id="enable-2fa" disabled />
                  <Label htmlFor="enable-2fa" className="cursor-not-allowed text-gray-500">Enable two-factor authentication</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Adding an extra layer of security to your account will help protect your data.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileModal;
export { ProfileModal };
