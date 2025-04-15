"use client";

import { useState, useEffect } from "react";
import { authAxios } from "@/lib/auth-context";
import { toast } from "react-toastify";
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
  const [requestName, setRequestName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(initialData?.isFavorite || false);
  const [selectedCollectionState, setSelectedCollectionState] = useState(selectedCollection || initialData?.collectionId || "");
  const [collections, setCollections] = useState([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoadingCollections(true);
      try {
        const response = await authAxios.get('/collections');
        
        if (response.data) {
          setCollections(response.data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast.error("Failed to load collections: " + (error.response?.data?.message || error.message));
      } finally {
        setIsLoadingCollections(false);
      }
    };

    if (open) {
      fetchCollections();
    }
  }, [open]);

  const handleCollectionChange = (value) => {
    if (value === "new") {
      setShowNewCollectionInput(true);
    } else {
      setShowNewCollectionInput(false);
      setSelectedCollectionState(value);
    }
  };

  const handleSaveRequest = async () => {
    try {
      let collectionIdToSave = selectedCollectionState;

      if (showNewCollectionInput && newCollectionName.trim()) {
        const newCollectionResponse = await authAxios.post('/collections', 
          { 
            name: newCollectionName.trim(),
            description: "" 
          }
        );
        
        if (newCollectionResponse.data) {
          collectionIdToSave = newCollectionResponse.data.id;
          setCollections(prev => [...prev, newCollectionResponse.data]);
        }
      } else if (showNewCollectionInput && !newCollectionName.trim()) {
        toast.error("Please enter a collection name");
        return;
      }

      console.log("initialData:", initialData);

      // Headers formatını dönüştür
      let formattedHeaders = {};
      if (initialData?.headers) {
        // Eğer headers bir string ise, parse et
        const headersArray = typeof initialData.headers === 'string' 
          ? JSON.parse(initialData.headers) 
          : initialData.headers;
        
        // Eğer bir array ise (büyük ihtimalle öyle), key-value formatına dönüştür
        if (Array.isArray(headersArray)) {
          headersArray.forEach(header => {
            if (header.enabled !== false) { // Sadece enabled olan header'ları ekle
              formattedHeaders[header.key] = header.value;
            }
          });
        } else if (typeof headersArray === 'object') {
          formattedHeaders = headersArray; // Zaten uygun formatta ise doğrudan kullan
        }
      }

      // Tests formatını dönüştür
      let formattedTests = '';
      if (initialData?.tests) {
        if (typeof initialData.tests === 'object' && initialData.tests.script) {
          formattedTests = initialData.tests.script;
        } else if (typeof initialData.tests === 'string') {
          formattedTests = initialData.tests;
        }
      }

      // CollectionId'yi integer'a dönüştür
      const parsedCollectionId = collectionIdToSave ? parseInt(collectionIdToSave, 10) : null;

      const requestPayload = {
        collectionId: parsedCollectionId,
        name: requestName,
        description: description,
        method: initialData?.method || 'GET',
        url: initialData?.url || '',
        headers: formattedHeaders,
        params: initialData?.params || {},
        body: initialData?.body || '',
        isFavorite: addToFavorites,
        authType: initialData?.authType || 'none',
        authConfig: initialData?.authConfig || '',
        tests: formattedTests
      };

      console.log("Request payload being sent:", requestPayload);

      const response = await authAxios.post('/Requests', requestPayload);
      console.log("Response from save request:", response);

      if (response.data) {
        toast.success("Request saved successfully");
        if (onSaveRequest) {
          onSaveRequest(response.data);
        }
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save request:", error);
      toast.error("Failed to save request: " + (error.response?.data?.message || error.message));
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
                        <SelectItem key={collection.id} value={collection.id}>
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
