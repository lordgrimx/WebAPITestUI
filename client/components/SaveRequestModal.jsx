"use client";

import { useState, useEffect } from "react"; // useEffect eklendi
// import { useQuery, useMutation } from "convex/react"; // Kaldırıldı
// import { api } from "@/convex/_generated/api"; // Kaldırıldı
import { authAxios } from "@/lib/auth-context"; // Auth context'ten axios instance'ı import et (veya ayrı bir API service oluştur)
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export default function SaveRequestModal({ 
  open, 
  setOpen, 
  darkMode, 
  onSaveRequest, 
  selectedCollection,
  initialData
}) {
  const [requestName, setRequestName] = useState(initialData?.name || ""); // Initial data ile doldur
  const [description, setDescription] = useState(initialData?.description || ""); // Initial data ile doldur
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(initialData?.isFavorite || false); // Initial data ile doldur
  const [selectedCollectionState, setSelectedCollectionState] = useState(selectedCollection || initialData?.collectionId || ""); // Initial data ile doldur
  const [collections, setCollections] = useState([]); // State'e çevrildi
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // TODO: Backend'den koleksiyonları çek
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoadingCollections(true);
      try {
        // const response = await authAxios.get('/Collections'); // Örnek endpoint
        // setCollections(response.data || []);
        console.log("TODO: Fetch collections from backend");
        // Geçici dummy data
        setCollections([{ id: 'dummy1', name: 'Dummy Collection 1' }, { id: 'dummy2', name: 'Dummy Collection 2' }]);
      } catch (error) {
        console.error("Error fetching collections:", error);
        // toast.error("Failed to load collections");
      } finally {
        setIsLoadingCollections(false);
      }
    };
    if (open) { // Modal açıldığında koleksiyonları çek
       fetchCollections();
    }
  }, [open]);

  // const createRequest = useMutation(api.requests.createRequest); // Kaldırıldı

  const handleCollectionChange = (value) => {
    if (value === "new") {
      setShowNewCollectionInput(true);
    } else {
      setShowNewCollectionInput(false);
      setSelectedCollectionState(value);
    }
  };
    const handleSaveRequest = async () => {
    // TODO: Yeni koleksiyon oluşturma işlemini backend'e taşı
    try {
      let collectionIdToSave = selectedCollectionState;

      if (showNewCollectionInput && newCollectionName.trim()) {
        // TODO: Backend'e yeni koleksiyon oluşturma isteği gönder ('/Collections')
        // const newCollectionResponse = await authAxios.post('/Collections', { name: newCollectionName });
        // collectionIdToSave = newCollectionResponse.data.id; // Backend'den dönen ID'yi al
        collectionIdToSave = `new_${newCollectionName}`; // Geçici ID
        console.log("TODO: Create new collection in backend", newCollectionName);
        // Yeni koleksiyonu listeye ekle (geçici)
        setCollections(prev => [...prev, { id: collectionIdToSave, name: newCollectionName }]);
      } else if (showNewCollectionInput && !newCollectionName.trim()) {
          alert("Please enter a name for the new collection."); // Veya daha iyi bir validation
          return;
      }


      // TODO: Backend'e request kaydetme isteği gönder ('/Requests')
      const requestPayload = {
        collectionId: collectionIdToSave, // Kullanılacak koleksiyon ID'si
        name: requestName,
        description: description, // Açıklamayı ekle
        method: initialData?.method || 'GET',
        url: initialData?.url || '',
        // Headers, Params, Body objelerini string'e çevirerek gönder (backend DTO'suna göre ayarla)
        headers: initialData?.headers ? JSON.stringify(initialData.headers) : null,
        queryParams: initialData?.params ? JSON.stringify(initialData.params) : null, // Backend DTO'suna göre 'params' -> 'queryParams' olabilir
        body: initialData?.body ? JSON.stringify(initialData.body) : null,
        isFavorite: addToFavorites,
      };

      console.log("Saving request data to backend:", requestPayload);

      // const response = await authAxios.post('/Requests', requestPayload); // Örnek endpoint
      console.log("TODO: Send save request to backend");

      // onSaveRequest callback'ini çağır (gerekirse backend'den dönen veriyle)
      if (onSaveRequest) {
        // onSaveRequest(response.data); // Backend'den dönen request objesi
        onSaveRequest({ ...requestPayload, id: `saved_${Date.now()}` }); // Geçici ID ile callback
      }

      setOpen(false);
      resetForm();

      // return response.data; // Backend'den dönen sonucu döndür
      return { success: true }; // Geçici dönüş
    } catch (error) {
      console.error("Failed to save request:", error);
      throw error;
    }
  };
  
  const resetForm = () => {
    setRequestName("");
    setDescription("");
    setSelectedCollectionState("");
    setNewCollectionName("");
    setShowNewCollectionInput(false);
    setAddToFavorites(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogContent
        className={`max-w-md max-h-[90vh] overflow-hidden flex flex-col ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold">Save Request</DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <Label 
                htmlFor="request-name" 
                className="block text-sm font-medium mb-1"
              >
                Request Name
              </Label>
              <Input
                id="request-name"
                type="text"
                placeholder="e.g. Get User List"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
              />
            </div>
            
            <div>
              <Label 
                htmlFor="request-description" 
                className="block text-sm font-medium mb-1"
              >
                Description (optional)
              </Label>
              <Textarea
                id="request-description"
                placeholder="Add a description for this request"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
              />
            </div>
            
            <div>
              <Label 
                htmlFor="collection-select" 
                className="block text-sm font-medium mb-1"
              >
                Collection
              </Label>
              <Select
                value={selectedCollectionState}
                onValueChange={handleCollectionChange}
              >
                <SelectTrigger 
                  id="collection-select" 
                  className={`w-full ${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                >
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCollections ? (
                     <SelectItem value="loading" disabled>Loading collections...</SelectItem>
                  ) : (
                    <>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}> {/* id kullanıldı */}
                          {collection.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Create new collection</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {showNewCollectionInput && (
              <div>
                <Label 
                  htmlFor="new-collection" 
                  className="block text-sm font-medium mb-1"
                >
                  New Collection Name
                </Label>
                <Input
                  id="new-collection"
                  type="text"
                  placeholder="e.g. Authentication API"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className={`${darkMode ? "bg-gray-700 border-gray-700" : ""}`}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="add-favorite" 
                checked={addToFavorites}
                onCheckedChange={setAddToFavorites}
              />
              <Label 
                htmlFor="add-favorite" 
                className="text-sm"
              >
                Add to favorites
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveRequest}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
