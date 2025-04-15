"use client";

import { useState } from "react";
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
  const [requestName, setRequestName] = useState("");
  const [description, setDescription] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [selectedCollectionState, setSelectedCollectionState] = useState(selectedCollection || "");

  
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
      const requestData = {
        collectionId: showNewCollectionInput ? newCollectionName : selectedCollectionState,
        name: requestName,
        method: initialData?.method || 'GET',
        url: initialData?.url || '',
        headers: initialData?.headers || undefined,
        params: initialData?.params || undefined,
        body: initialData?.body || undefined,
        isFavorite: addToFavorites || undefined,
      };
      
      console.log("Saving request data:", requestData);
      
      const result = await createRequest(requestData);
      
      setOpen(false);
      resetForm();
      
      return result;
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
                  {collections.map((collection) => (
                    <SelectItem key={collection._id} value={collection._id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Create new collection</SelectItem>
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
