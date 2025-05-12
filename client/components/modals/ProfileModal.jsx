"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context"; // Import useAuth
import { authAxios } from "@/lib/auth-context"; // Import authAxios
import { toast } from "sonner"; // Import toast for notifications
import { X, User, Mail, Phone, MapPin, Globe, Camera, Loader2 } from "lucide-react";
import imageCompression from 'browser-image-compression'; // Import the library
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

// Define constants for validation
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

function ProfileModal({ open, setOpen, darkMode }) {
  const { user, isLoading: authLoading } = useAuth(); // Get user from auth context
  
  const [activeTab, setActiveTab] = useState("personal");const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // For potential future upload preview
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const fileInputRef = useRef(null); // Ref for file input
  // Update state when user data is loaded or changes
  useEffect(() => {
    console.log("User object in ProfileModal useEffect:", user); // Debug log
    if (user) {
      setFirstName(user.name?.split(" ")[0] || "");
      setLastName(user.name?.split(" ").slice(1).join(" ") || "");
      setProfileImageUrl(user.profileImageBase64 || ""); // Use existing profile image URL
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setWebsite(user.website || "");
      // Ensure twoFactorEnabled is explicitly checked and set
      setTwoFactorEnabled(user.twoFactorEnabled === true); 
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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // --- Client-side Validation ---
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File is too large", { description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
        return; // Stop the upload
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error("Invalid file type", { description: "Please select a JPEG, PNG, or GIF image." });
        return; // Stop the upload
      }
      // --- End Validation ---

      setIsSaving(true);
      toast.info("Compressing and uploading image..."); // Updated toast message
      
      try {
        // --- Image Compression ---
        const options = {
          maxSizeMB: 1,          // Max size in MB (adjust as needed)
          maxWidthOrHeight: 1024, // Max width or height (adjust as needed)
          useWebWorker: true,    // Use web worker for better performance
        };
        const compressedFile = await imageCompression(file, options);
        console.log(`Compressed file size: ${compressedFile.size / 1024 / 1024} MB`);
        // --- End Compression ---

        // Read the compressed file as Base64
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = async () => {
          const base64String = reader.result;

          if (!base64String) {
            toast.error("Dosya okunamadı.");
            setIsSaving(false);
            return;
          }

          try {
            // Send Base64 string to the backend API
            const response = await authAxios.post('/user/upload-profile-image', {
              imageBase64: base64String // Send as JSON object
            }); // Content-Type 'application/json' is default for objects

            // Check if the response contains the updated Base64 string
            if (!response.data || !response.data.imageBase64) {
               // Check for specific error messages from backend
               const errorMessage = response.data?.message || 'Profil resmi yüklenemedi (backend hatası).';
               console.error("Backend upload error:", response.data);
               throw new Error(errorMessage);
            }

            // Use the Base64 string returned from the API for UI update
            const returnedBase64 = response.data.imageBase64;

            // Update the UI with the new Base64 image data
            setProfileImageUrl(returnedBase64); // Directly use the Base64 string

            toast.success("Profil resmi başarıyla yüklendi!");

          } catch (error) {
             console.error("Profil resmi yükleme hatası (axios post):", error);
             // Display more specific error from backend if available
             const apiErrorMessage = error.response?.data?.message || error.message || "Profil resmi yüklenirken bir hata oluştu.";
             // Check for 400 Bad Request specifically
             if (error.response?.status === 400) {
                 toast.error("Geçersiz istek", { description: apiErrorMessage });
             } else {
                 toast.error("Yükleme Hatası", { description: apiErrorMessage });
             }
          } finally {
            // Ensure isSaving is set to false regardless of reader success/failure
             setIsSaving(false);
          }
        };
        reader.onerror = (error) => {
          console.error("Dosya okuma hatası:", error);
          toast.error("Dosya okunurken bir hata oluştu.");
          setIsSaving(false); // Ensure loading state is reset on reader error
        };

      } catch (error) { // Catch errors from imageCompression or initial file handling
        console.error("Profil resmi işleme/sıkıştırma hatası:", error);
        toast.error("Resim işlenirken bir hata oluştu.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      // Check if password is being changed
      if (currentPassword && newPassword && confirmPassword) {
        // Validate that new password and confirm password match
        if (newPassword !== confirmPassword) {
          toast.error("Yeni şifre ve onay şifresi eşleşmiyor.");
          setIsSaving(false);
          return;
        }
        // Change the password (use the function from the hook)
        try {
          await authAxios.post('/user/change-password', {
            currentPassword,
            newPassword
          });
          toast.success("Şifre başarıyla güncellendi!");
          
          // Clear password fields
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } catch (error) {
          console.error("Şifre değiştirme hatası:", error);
          toast.error("Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.");
          setIsSaving(false);
          return;
        }        }
        // Update profile information
      await authAxios.put('/user/profile', {
        name: name || undefined,
        phone: phone || undefined,
        address: address || undefined,
        website: website || undefined,
        twoFactorEnabled: twoFactorEnabled,
        // The profile image is handled separately in the handleFileChange function
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
                </div>                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <Phone className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <MapPin className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Input
                      id="website"
                      type="url"
                      placeholder="Website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""} pl-8`}
                    />
                    <Globe className="h-4 w-4 absolute left-2 top-3 text-gray-400" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              {/* Security content remains the same for now */}              <div>
                <h3 className="font-medium text-lg mb-4">Change Password</h3>
                <div className="space-y-4">                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                    />
                  </div>
                </div>
              </div>
                <div className="mt-6">
                <h3 className="font-medium text-lg mb-4">Two-Factor Authentication</h3>                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="enable-2fa" 
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
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
