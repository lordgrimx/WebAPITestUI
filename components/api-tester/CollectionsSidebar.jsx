"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Folder, Trash2, History } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

// HTTP Method renkleri ve Badge variantları
const methodStyles = {
  GET:    { variant: "default", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300" },
  POST:   { variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300" },
  PUT:    { variant: "default", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300" },
  DELETE: { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300" },
  PATCH:  { variant: "default", className: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300" },
  OPTIONS:{ variant: "secondary", className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300" },
  HEAD:   { variant: "secondary", className: "bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300" },
  DEFAULT:{ variant: "secondary", className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300" },
};

const getMethodStyle = (method) => methodStyles[method.toUpperCase()] || methodStyles.DEFAULT;

export default function CollectionsSidebar({ setSelectedRequestId, hasError }) {
  // Use try-catch with useQuery to handle potential errors
  let collections = [];
  let error = null;
  try {
    collections = useQuery(api?.collections?.getCollections) || [];
  } catch (err) {
    error = err;
    console.error("Failed to fetch collections:", err);
    collections = [];
  }

  // Define these with null checks to handle potential undefined API
  const addCollection = useMutation(api?.collections?.addCollection);
  const deleteCollection = useMutation(api?.collections?.deleteCollection);
  const deleteRequest = useMutation(api?.requests?.deleteRequest);

  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddCollection = async () => {
    if (newCollectionName.trim()) {
      try {
        if (addCollection) {
          await addCollection({ name: newCollectionName.trim() });
        } else {
          console.warn("addCollection function is not available");
        }
        setNewCollectionName("");
        setIsAddDialogOpen(false);
      } catch (err) {
        console.error("Failed to add collection:", err);
      }
    }
  };

  const handleDeleteCollection = (e, collectionId) => {
    e.stopPropagation();
    if (window.confirm("Bu koleksiyonu silmek istediğinizden emin misiniz? İçindeki tüm istekler de silinebilir.")) {
      try {
        if (deleteCollection) {
          deleteCollection({ id: collectionId });
        } else {
          console.warn("deleteCollection function is not available");
        }
      } catch (err) {
        console.error("Failed to delete collection:", err);
      }
    }
  };

  const handleDeleteRequest = (e, requestId) => {
    e.stopPropagation();
    if (window.confirm("Bu isteği silmek istediğinizden emin misiniz?")) {
      try {
        if (deleteRequest) {
          deleteRequest({ id: requestId });
        } else {
          console.warn("deleteRequest function is not available");
        }
      } catch (err) {
        console.error("Failed to delete request:", err);
      }
    }
  };

  // Arama filtrelemesi
  const filteredCollections = (collections || []).filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock history data for now
  const historyItems = [
    { _id: "h1", method: "GET", name: "/users", _creationTime: Date.now() - 1000 * 60 * 5 }, // 5 dk önce
    { _id: "h2", method: "POST", name: "/products", _creationTime: Date.now() - 1000 * 60 * 15 }, // 15 dk önce
  ];

  if (hasError || error) {
    return (
      <div className="h-full flex flex-col border-r bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 p-4">
        <Input
          type="search"
          placeholder="Search collections..."
          className="w-full mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Collection
        </Button>
        <div className="p-4 text-center">
          <p className="text-red-500">Error loading collections</p>
          <p className="text-sm text-gray-500">Please try again later or check the console for details</p>
        </div>
      </div>
    );
  }

  return (
    // Stil güncellemesi: beyaz arka plan, hafif kenarlık
    <div className="h-full flex flex-col border-r bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Input
          type="search"
          placeholder="Search collections..."
          className="w-full mb-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection for your API requests.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCollection()}
              autoFocus
            />
            <DialogFooter>
              <DialogClose asChild>
                 <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddCollection} className="bg-blue-600 hover:bg-blue-700 text-white">Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-2">
        {/* Koleksiyonlar */}
        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</h3>
        <Accordion type="multiple" className="w-full">
          {filteredCollections.length === 0 && searchTerm && (
            <p className="px-2 py-2 text-sm text-gray-500">No collections found matching "{searchTerm}".</p>
          )}
          {filteredCollections.length === 0 && !searchTerm && (
            <p className="px-2 py-2 text-sm text-gray-500">No collections yet. Click "+ New Collection" to add one.</p>
          )}
          {filteredCollections.map((collection) => (
            <CollectionItem
              key={collection._id}
              collection={collection}
              setSelectedRequestId={setSelectedRequestId}
              onDeleteCollection={handleDeleteCollection}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </Accordion>

        {/* Geçmiş Bölümü */}
        <h3 className="mt-4 px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">History</h3>
        {historyItems.length === 0 && (
          <p className="px-2 py-2 text-sm text-gray-500">No recent requests.</p>
        )}
        <div className="space-y-1 px-2">
          {historyItems.map((item) => {
            const style = getMethodStyle(item.method);
            const timeAgo = new Date(item._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Basit zaman gösterimi
            return (
              <div
                key={item._id}
                className="flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 rounded cursor-pointer text-sm"
              >
                <div className="flex items-center truncate flex-1 mr-2">
                  <Badge variant={style.variant} className={`mr-2 w-14 justify-center flex-shrink-0 ${style.className}`}>
                    {item.method.toUpperCase()}
                  </Badge>
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Ayrı bir bileşen olarak CollectionItem (Shadcn Accordion kullanacak şekilde güncellendi)
function CollectionItem({ collection, setSelectedRequestId, onDeleteCollection, onDeleteRequest }) {
  let requests = [];
  let error = null;
  
  try {
    requests = useQuery(api?.requests?.getRequestsByCollection, 
      collection && collection._id ? { collectionId: collection._id } : null
    ) || [];
  } catch (err) {
    error = err;
    console.error("Failed to fetch requests for collection:", err);
    requests = [];
  }

  return (
    <AccordionItem value={collection._id} className="border-b-0 mb-1">
      <AccordionTrigger
        className="flex justify-between items-center w-full hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 rounded text-sm font-medium text-left [&[data-state=open]>span>svg:last-child]:rotate-90"
      >
        <span className="flex items-center flex-1 truncate mr-2">
          <Folder className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
          <span className="truncate">{collection.name}</span>
        </span>
        <span className="flex items-center space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCollection(e, collection._id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </span>
      </AccordionTrigger>
      <AccordionContent className="pl-6 pr-2 pt-1 pb-1">
        {error && <p className="text-xs text-red-500 py-1 px-2">Error loading requests</p>}
        {!error && requests.length === 0 && (
          <p className="text-xs text-gray-400 py-1 px-2">No requests in this collection.</p>
        )}
        {!error && requests.map((request) => {
          const style = getMethodStyle(request.method);
          return (
            <div
              key={request._id}
              onClick={() => setSelectedRequestId(request._id)}
              className="flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 rounded cursor-pointer text-sm"
            >
              <div className="flex items-center truncate flex-1 mr-2">
                <Badge variant={style.variant} className={`mr-2 w-14 justify-center flex-shrink-0 ${style.className}`}>
                  {request.method.toUpperCase()}
                </Badge>
                <span className="truncate">{request.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(e, request._id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}
