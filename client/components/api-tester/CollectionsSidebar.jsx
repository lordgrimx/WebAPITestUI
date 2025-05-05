"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { authAxios } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
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
import { Plus, Folder, Trash2, History, Menu, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// HTTP Method renkleri ve Badge variantları
const methodStyles = {
  GET:    { 
    variant: "default", 
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
    darkClassName: "bg-blue-900 text-blue-100 hover:bg-blue-800 border-blue-700"
  },
  POST:   { 
    variant: "default", 
    className: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
    darkClassName: "bg-green-900 text-green-100 hover:bg-green-800 border-green-700"
  },
  PUT:    { 
    variant: "default", 
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
    darkClassName: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800 border-yellow-700"
  },
  DELETE: { 
    variant: "destructive", 
    className: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
    darkClassName: "bg-red-900 text-red-100 hover:bg-red-800 border-red-700"
  },
  PATCH:  { 
    variant: "default", 
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
    darkClassName: "bg-purple-900 text-purple-100 hover:bg-purple-800 border-purple-700"
  },
  OPTIONS:{ 
    variant: "secondary", 
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
    darkClassName: "bg-gray-700 text-gray-100 hover:bg-gray-600 border-gray-500"
  },
  HEAD:   { 
    variant: "secondary", 
    className: "bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300",
    darkClassName: "bg-pink-900 text-pink-100 hover:bg-pink-800 border-pink-700"
  },
  DEFAULT:{ 
    variant: "secondary", 
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
    darkClassName: "bg-gray-700 text-gray-100 hover:bg-gray-600 border-gray-500"
  },
};

const getMethodStyle = (method) => methodStyles[method.toUpperCase()] || methodStyles.DEFAULT;

// Helper to format timestamps
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60000) {
    return 'just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Default to time display
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to get path part from URL
const getPathFromUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (e) {
    // If URL parsing fails, return the original string or a reasonable part of it
    const slashIndex = urlString.indexOf('/', 8); // Skip 'http://' or 'https://'
    if (slashIndex > -1) {
      return urlString.substring(slashIndex);
    }
    return urlString;
  }
};

// Update the component to include mobile toggle functionality
export default function CollectionsSidebar({ setSelectedRequestId, onHistorySelect, hasError, darkMode, onError, historyUpdated, currentEnvironment, environmentChangedTimestamp }) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [collections, setCollections] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation("common");
  
  // Add state for mobile sidebar toggle
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Effect to detect screen size and set mobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Automatically close sidebar on mobile when resizing to mobile
      if (mobile && !isMobile) {
        setIsSidebarOpen(false);
      } else if (!mobile && isMobile) {
        // Automatically open sidebar when resizing to desktop
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial sizes on mount
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Toggle sidebar function for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle selection on mobile to automatically close the sidebar
  const handleMobileSelection = (callback, ...args) => {
    if (isMobile) {
      callback(...args);
      setIsSidebarOpen(false);
    } else {
      callback(...args);
    }
  };

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      try {
        const environmentId = currentEnvironment?.id;
        const endpoint = '/collections' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
        const response = await authAxios.get(endpoint);
        if (response.data) {
          setCollections(response.data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        if (onError) onError("Failed to fetch collections.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, [onError, currentEnvironment, environmentChangedTimestamp]);

  const fetchHistory = useCallback(async () => {
    try {
      const environmentId = currentEnvironment?.id;
      const endpoint = '/history' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
      const response = await authAxios.get(endpoint);
      if (response.data) {
        setHistoryItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [currentEnvironment]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, historyUpdated, environmentChangedTimestamp]);

  const handleAddCollection = async () => {
    if (newCollectionName.trim()) {
      try {
        const payload = {
          name: newCollectionName.trim(),
          description: "",
          environmentId: currentEnvironment?.id
        };
        const response = await authAxios.post('/collections', payload);
        if (response.data) {
          const environmentId = currentEnvironment?.id;
          const endpoint = '/collections' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
          const updatedCollections = await authAxios.get(endpoint);
          setCollections(updatedCollections.data);
          toast.success("Collection added successfully");
        }
        setNewCollectionName("");
        setIsAddDialogOpen(false);
      } catch (err) {
        console.error("Failed to add collection:", err);
        toast.error("Failed to add collection: " + (err.response?.data?.message || err.message));
      }
    } else {
      toast.warning("Please enter a collection name");
    }
  };

  const handleDeleteCollection = async (e, collectionId) => {
    e.stopPropagation();
    if (window.confirm(t('collections.confirmDelete', "Bu koleksiyonu silmek istediğinizden emin misiniz? İçindeki tüm istekler de silinebilir."))) {
      try {
        await authAxios.delete(`/collections/${collectionId}`);
        const environmentId = currentEnvironment?.id;
        const endpoint = '/collections' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
        const updatedCollections = await authAxios.get(endpoint);
        setCollections(updatedCollections.data);
      } catch (err) {
        console.error("Failed to delete collection:", err);
        toast.error(t('collections.deleteError', "Failed to delete collection: ") + (err.response?.data?.message || err.message || "Unknown error"));
      }
    }
  };

  const handleDeleteRequest = async (e, requestId) => {
    e.stopPropagation();
    if (window.confirm(t('collections.confirmDeleteRequest', "Bu isteği silmek istediğinizden emin misiniz?"))) {
      try {
        await authAxios.delete(`/requests/${requestId}`);
        const environmentId = currentEnvironment?.id;
        const endpoint = '/collections' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
        const updatedCollections = await authAxios.get(endpoint);
        setCollections(updatedCollections.data);
      } catch (err) {
        console.error("Failed to delete request:", err);
        toast.error(t('collections.deleteRequestError', "Failed to delete request: ") + (err.response?.data?.message || err.message || "Unknown error"));
      }
    }
  };

  const handleDeleteHistoryEntry = async (e, historyId) => {
    e.stopPropagation();
    if (!historyId) {
      console.error("Cannot delete history entry: ID is undefined");
      toast.error("Failed to delete history entry: ID is missing");
      return;
    }
    try {
      await authAxios.delete(`/history/${historyId}`);
      const environmentId = currentEnvironment?.id;
      const endpoint = '/history' + (environmentId ? `?currentEnvironmentId=${environmentId}` : '');
      const updatedHistory = await authAxios.get(endpoint);
      setHistoryItems(updatedHistory.data);
      toast.success("History entry deleted successfully");
    } catch (err) {
      console.error("Failed to delete history entry:", err);
      if (err.response?.status === 405) {
        toast.error("Server doesn't allow deletion through this route. Please check API configuration.");
      } else {
        toast.error("Failed to delete history entry: " + (err.response?.data?.message || err.message || "Unknown error"));
      }
    }
  };

  const filteredCollections = useMemo(() => 
    (collections || []).filter(collection =>
      collection?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ),
    [collections, debouncedSearchTerm]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const MobileToggleButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className={`fixed z-50 top-16 left-2 rounded-full shadow-md ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'} md:hidden`}
    >
      {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  );

  if (hasError || !collections) {
    return (
      <div className={`h-full flex flex-col border-r ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} p-4`}>
        <Input
          type="search"
          placeholder={t('collections.searchPlaceholder', "Search collections...")}
          className={`w-full mb-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button
          className={`w-full ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> {t('collections.newCollection', "New Collection")}
        </Button>
        <div className="p-4 text-center">
          <p className={`${darkMode ? 'text-red-400' : 'text-red-500'}`}>{t('collections.loadError', "Error loading collections")}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('collections.tryAgain', "Please try again later or check the console for details")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isMobile && <MobileToggleButton />}

      <div 
        className={`${isMobile ? 'fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300 transform shadow-2xl ' + (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'h-full flex flex-col border-r'} ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}
        style={{ top: isMobile ? '56px' : 0 }}
      >
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Input
            type="search"
            placeholder={t('collections.searchPlaceholder', "Search collections...")}
            className={`w-full mb-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className={`w-full ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <Plus className="mr-2 h-4 w-4" /> {t('collections.newCollection', "New Collection")}
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="collection-dialog-description" className={darkMode ? 'dark bg-gray-800 border-gray-700' : ''}>
              <DialogHeader>
                <DialogTitle className={darkMode ? 'text-white' : ''}>{t('collections.addNewCollection', "Add New Collection")}</DialogTitle>
                <DialogDescription id="collection-dialog-description" className={darkMode ? 'text-gray-400' : ''}>
                  {t('collections.createCollectionDesc', "Create a new collection for your API requests.")}
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder={t('collections.collectionName', "Collection Name")}
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCollection()}
                autoFocus
                aria-label="Collection name"
                className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              />
              <DialogFooter>
                <DialogClose asChild key="cancel-btn">
                  <Button variant="outline" className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}>{t('general.cancel', "Cancel")}</Button>
                </DialogClose>
                <Button onClick={handleAddCollection} key="add-btn" className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>{t('general.add', "Add")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-2">
              <h3 className={`px-2 py-1 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>{t('collections.title', "Collections")}</h3>
              <Accordion type="multiple" className="w-full">
                {isLoading && (
                  <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('collections.loading', "Loading collections...")}</p>
                )}
                {!isLoading && filteredCollections.length === 0 && searchTerm && (
                  <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('collections.notFound', "No collections found matching")} "{searchTerm}".</p>
                )}
                {!isLoading && filteredCollections.length === 0 && !searchTerm && (
                  <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('collections.empty', "No collections yet. Click \"+ New Collection\" to add one.")}</p>
                )}
                {!isLoading && filteredCollections.map((collection, index) => (
                  <CollectionItem
                    key={index}
                    collection={collection}
                    setSelectedRequestId={(id) => handleMobileSelection(setSelectedRequestId, id)}
                    onDeleteCollection={handleDeleteCollection}
                    onDeleteRequest={handleDeleteRequest}
                    darkMode={darkMode}
                    t={t}
                    currentEnvironment={currentEnvironment}
                  />
                ))}
              </Accordion>

              <h3 className={`mt-4 px-2 py-1 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>{t('collections.history', "History")}</h3>
              <Accordion type="multiple" className="w-full">
                {historyItems === null && (
                  <p className={`px-2 py-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{t('collections.historyError', "Error loading history.")}</p>
                )}
                {historyItems && historyItems.length === 0 && (
                  <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('collections.noHistory', "No recent requests.")}</p>
                )}
                {historyItems && historyItems.map((item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    onHistorySelect={(item) => handleMobileSelection(onHistorySelect, item)}
                    onDeleteHistoryEntry={handleDeleteHistoryEntry}
                    darkMode={darkMode}
                    t={t}
                  />
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      </div>

      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </>
  );
}

const CollectionItem = function CollectionItem({
  collection,
  setSelectedRequestId,
  onDeleteCollection,
  onDeleteRequest,
  darkMode,
  t,
  currentEnvironment
}) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!collection?.id) return;
      
      setIsLoading(true);
      try {
        const environmentId = currentEnvironment?.id;
        const endpoint = environmentId 
          ? `/requests/collection/${collection.id}?currentEnvironmentId=${environmentId}` 
          : `/requests/collection/${collection.id}`;
          
        const response = await authAxios.get(endpoint);
        if (response.data) {
          setRequests(response.data);
        }
      } catch (error) {
        console.error(`Error fetching requests for collection ${collection.id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [collection?.id, currentEnvironment]);

  return (
    <AccordionItem value={collection.id} className="border-b-0 mb-1">
      <div className="flex items-center">
        <AccordionTrigger
          className={`flex-1 flex justify-between items-center w-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} px-2 py-1.5 rounded text-sm font-medium text-left [&[data-state=open]>span>svg:last-child]:rotate-90`}
        >
          <span className="flex items-center flex-1 truncate mr-2">
            <Folder className={`h-4 w-4 mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex-shrink-0`} />
            <span className="truncate">{collection.name}</span>
          </span>
        </AccordionTrigger>
        <div
          className={`px-2 py-1.5 cursor-pointer ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'}`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteCollection(e, collection.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </div>
      </div>
      <AccordionContent className="pl-6 pr-2 pt-1 pb-1">
        {isLoading && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-1 px-2`}>{t('collections.loadingRequests', "Loading requests...")}</p>}
        {!isLoading && (!requests || requests.length === 0) && (
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-1 px-2`}>{t('collections.noRequests', "No requests in this collection.")}</p>
        )}
        {!isLoading && requests && requests.map((request) => {          
          const style = getMethodStyle(request.method);
          const badgeClassName = darkMode ? style.darkClassName : style.className;
          
          return (
            <div
              key={request.id}
              className={`flex items-center justify-between group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} px-2 py-1.5 rounded cursor-pointer text-sm`}
            >
              <div
                className="flex items-center truncate flex-1 mr-2"
                onClick={() => setSelectedRequestId(request.id)}
              >
                <Badge variant={style.variant} className={`mr-2 w-14 justify-center flex-shrink-0 ${badgeClassName}`}>
                  {request.method.toUpperCase()}
                </Badge>
                <span className="truncate">{request.name}</span>
              </div>
              <div
                className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(e, request.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
};

const HistoryItem = function HistoryItem({
  item,
  onHistorySelect,
  onDeleteHistoryEntry,
  darkMode,
  t
}) {  
  const style = getMethodStyle(item.method);
  const timeAgo = formatTimeAgo(item.timestamp);
  const displayPath = getPathFromUrl(item.url);
  const itemId = item._id || item.id || item.historyId;

  if (!itemId) {
    console.warn("History item missing ID:", item);
  }
  
  const badgeClassName = darkMode ? style.darkClassName : style.className;

  return (
    <AccordionItem value={itemId || 'no-id'} className="border-b-0 mb-1">
      <div
        className={`flex items-center justify-between group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} px-2 py-1.5 rounded cursor-pointer text-sm`}
        onClick={() => onHistorySelect(item)}
      >
        <div className="flex items-center truncate flex-1 mr-2">
          <Badge variant={style.variant} className={`mr-2 w-14 justify-center flex-shrink-0 ${badgeClassName}`}>
            {item.method.toUpperCase()}
          </Badge>
          <span className="truncate">{displayPath}</span>
        </div>
        <div className="flex items-center">
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0 mr-2`}>{timeAgo}</span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (itemId) {
                onDeleteHistoryEntry(e, itemId);
              } else {
                console.error("Cannot delete history item - no ID found");
                toast.error(t('collections.historyDeleteError', "Cannot delete history item - ID is missing"));
              }
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </AccordionItem>
  );
};
