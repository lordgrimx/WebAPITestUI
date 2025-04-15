"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import axios from "axios";
// Convex ve API bağımlılıkları kaldırıldı

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
import Cookies from "js-cookie";

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

// Add onHistorySelect and darkMode props
export default function CollectionsSidebar({ setSelectedRequestId, onHistorySelect, hasError, darkMode, onError }) {
  const [currentUserID, setCurrentUserID] = useState(null); // For user ID from JWT token
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Add debouncing  // State for storing collections and history items
  const [collections, setCollections] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user session info from the server-side API endpoint
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Önce güvenli endpoint'ten kimlik doğrulama bilgilerini al
        const authInfoResponse = await fetch('/api/auth/getCookies');
        console.log("Auth info response:", authInfoResponse.token);
        let isAuthenticated = false;
        
        if (authInfoResponse.ok) {
          const authData = await authInfoResponse.json();
          isAuthenticated = authData.success && authData.isAuthenticated;
          
          if (isAuthenticated) {
            console.log("Auth info verified from secure endpoint");
          }
        }
        
        // Oturum API'sine istek yap
    const token = Cookies.get('token');
    const response = await fetch('/api/auth/session', {
      credentials: 'include', // Ensure cookies are sent with the request
      headers: token ? {
                'Authorization': `Bearer ${token}` // Include Bearer token in header
              } : {}
            }); 
        
        // Status 401 ise sessizce ele al ve kullanıcı bilgilerini sıfırla
        if (response.status === 401) {
          console.log("CollectionsSidebar: User not logged in or session expired");
          setCurrentUserID(null);
          return; // Sessizce devam et
        }
        
        // Diğer hata durumlarını kontrol et
        if (!response.ok) {
          console.error("CollectionsSidebar: Session API error:", response.status);
          setCurrentUserID(null);
          return;
        }
        
        // Başarılı yanıtı işle
        const data = await response.json();
        if (data.success && data.userId) {
          console.log("CollectionsSidebar: Session verified, setting user ID:", data.userId);
          setCurrentUserID(data.userId);
        } else {
          // Burada spesifik hata mesajını gösteriyoruz
          const errorMsg = data.message || data.error || 'No user ID returned';
          console.error("CollectionsSidebar: Session verification failed:", errorMsg);
          setCurrentUserID(null);
          
          // Client-side cookie'leri kontrol et (debug için)
          const clientToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='));
          
          if (clientToken) {
            console.log("CollectionsSidebar: Client-side token exists but server couldn't verify it");
          }
        }
      } catch (error) {
        console.error("CollectionsSidebar: Error fetching session:", error);
        setCurrentUserID(null);
      }
    };

    fetchSession();
  }, []); // Runs once on component mount
  
  // Fetch collections when userId changes
  useEffect(() => {
    const fetchCollections = async () => {
      if (!currentUserID) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get('/api/collections/user');
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
  }, [currentUserID, onError]);
  
  // Fetch history when userId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUserID) return;
      
      try {
        const response = await axios.get('/api/history/recent', { params: { limit: 10 } });
        if (response.data) {
          setHistoryItems(response.data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    
    fetchHistory();
  }, [currentUserID]);
  const handleAddCollection = async () => {
    if (newCollectionName.trim()) {
      try {
        console.log("Trying to add collection:", newCollectionName);
        const response = await axios.post('/api/collections/create', {
          name: newCollectionName.trim(),
          description: ""
        });
        
        if (response.data) {
          console.log("Collection added successfully:", response.data);
          // Koleksiyonları güncellemek için yeniden çağır
          const updatedCollections = await axios.get('/api/collections/user');
          setCollections(updatedCollections.data);
        }
        setNewCollectionName("");
        setIsAddDialogOpen(false);
      } catch (err) {
        console.error("Failed to add collection:", err);
        toast.error("Failed to add collection: " + (err.response?.data?.message || err.message || "Unknown error"));
      }
    } else {
      toast.warning("Please enter a collection name");
    }
  };

  const handleDeleteCollection = async (e, collectionId) => {
    e.stopPropagation();
    if (window.confirm("Bu koleksiyonu silmek istediğinizden emin misiniz? İçindeki tüm istekler de silinebilir.")) {
      try {
        await axios.delete(`/api/collections/${collectionId}`);
        // Koleksiyonları güncellemek için yeniden çağır
        const updatedCollections = await axios.get('/api/collections/user');
        setCollections(updatedCollections.data);
      } catch (err) {
        console.error("Failed to delete collection:", err);
        toast.error("Failed to delete collection: " + (err.response?.data?.message || err.message || "Unknown error"));
      }
    }
  };

  const handleDeleteRequest = async (e, requestId) => {
    e.stopPropagation();
    if (window.confirm("Bu isteği silmek istediğinizden emin misiniz?")) {
      try {
        await axios.delete(`/api/requests/${requestId}`);
        // Koleksiyonları güncellemek için yeniden çağır (içinde istekler de olacak)
        const updatedCollections = await axios.get('/api/collections/user');
        setCollections(updatedCollections.data);
      } catch (err) {
        console.error("Failed to delete request:", err);
        toast.error("Failed to delete request: " + (err.response?.data?.message || err.message || "Unknown error"));
      }
    }
  };
  
  const handleDeleteHistoryEntry = async (e, historyId) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/history/${historyId}`);
      // Geçmişi güncellemek için yeniden çağır
      const updatedHistory = await axios.get('/api/history/recent', { params: { limit: 10 } });
      setHistoryItems(updatedHistory.data);
    } catch (err) {
      console.error("Failed to delete history entry:", err);
      toast.error("Failed to delete history entry: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };
  // Update filteredCollections to use debouncedSearchTerm
  const filteredCollections = useMemo(() => 
    (collections || []).filter(collection =>
      collection?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ),
    [collections, debouncedSearchTerm]
  );

  // Optimize search input handler
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  if (hasError || !collections) {
    return (
      <div className={`h-full flex flex-col border-r ${darkMode ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'} p-4`}>
        <Input
          type="search"
          placeholder="Search collections..."
          className={`w-full mb-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button
          className={`w-full ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Collection
        </Button>
        <div className="p-4 text-center">
          <p className={`${darkMode ? 'text-red-400' : 'text-red-500'}`}>Error loading collections</p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please try again later or check the console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col border-r ${darkMode ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-white border-gray-200 text-gray-700'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <Input
          type="search"
          placeholder="Search collections..."
          className={`w-full mb-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black'}`}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className={`w-full ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
              <Plus className="mr-2 h-4 w-4" /> New Collection
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="collection-dialog-description" className={darkMode ? 'dark bg-gray-800 border-gray-700' : ''}>
            <DialogHeader>
              <DialogTitle className={darkMode ? 'text-white' : ''}>Add New Collection</DialogTitle>
              <DialogDescription id="collection-dialog-description" className={darkMode ? 'text-gray-400' : ''}>
                Create a new collection for your API requests.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCollection()}
              autoFocus
              aria-label="Collection name"
              className={`${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className={darkMode ? 'border-gray-600 hover:bg-gray-700' : ''}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddCollection} className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>      <div className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-2">
            <h3 className={`px-2 py-1 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Collections</h3>
            <Accordion type="multiple" className="w-full">
              {isLoading && (
                <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading collections...</p>
              )}
              {!isLoading && filteredCollections.length === 0 && searchTerm && (
                <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No collections found matching "{searchTerm}".</p>
              )}
              {!isLoading && filteredCollections.length === 0 && !searchTerm && (
                <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No collections yet. Click "+ New Collection" to add one.</p>
              )}
              {!isLoading && filteredCollections.map((collection) => (
                <CollectionItem
                  key={collection._id}
                  collection={collection}
                  setSelectedRequestId={setSelectedRequestId}
                  onDeleteCollection={handleDeleteCollection}
                  onDeleteRequest={handleDeleteRequest}
                  darkMode={darkMode} // Pass darkMode
                />
              ))}
            </Accordion>

            <h3 className={`mt-4 px-2 py-1 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>History</h3>
            <Accordion type="multiple" className="w-full">
              {historyItems === null && (
                <p className={`px-2 py-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>Error loading history.</p>
              )}
              {historyItems && historyItems.length === 0 && (
                <p className={`px-2 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent requests.</p>
              )}
              {historyItems && historyItems.map((item) => (
                <HistoryItem
                  key={item._id}
                  item={item}
                  // Pass onHistorySelect down to HistoryItem
                  onHistorySelect={onHistorySelect}
                  onDeleteHistoryEntry={handleDeleteHistoryEntry}
                  darkMode={darkMode} // Pass darkMode
                />
              ))}
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

const CollectionItem = React.memo(function CollectionItem({
  collection,
  setSelectedRequestId,
  onDeleteCollection,
  onDeleteRequest,
  darkMode // Receive darkMode
}) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch requests for this collection
  useEffect(() => {
    const fetchRequests = async () => {
      if (!collection?._id) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/requests/collection/${collection._id}`);
        if (response.data) {
          setRequests(response.data);
        }
      } catch (error) {
        console.error(`Error fetching requests for collection ${collection._id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [collection?._id]);

  return (
    <AccordionItem value={collection._id} className="border-b-0 mb-1">
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
            onDeleteCollection(e, collection._id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </div>
      </div>
      <AccordionContent className="pl-6 pr-2 pt-1 pb-1">
        {isLoading && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-1 px-2`}>Loading requests...</p>}
        {!isLoading && (!requests || requests.length === 0) && (
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-1 px-2`}>No requests in this collection.</p>
        )}
        {!isLoading && requests && requests.map((request) => {
          const style = getMethodStyle(request.method);
          // Adjust badge styles for dark mode
          const badgeClassName = darkMode
            ? style.className.replace('bg-', 'dark:bg-').replace('text-', 'dark:text-').replace('hover:bg-', 'dark:hover:bg-').replace('border-', 'dark:border-')
            : style.className;
          return (
            <div
              key={request._id}
              className={`flex items-center justify-between group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} px-2 py-1.5 rounded cursor-pointer text-sm`}
            >
              <div
                className="flex items-center truncate flex-1 mr-2"
                onClick={() => setSelectedRequestId(request._id)}
              >
                <Badge variant={style.variant} className={`mr-2 w-14 justify-center flex-shrink-0 ${badgeClassName}`}>
                  {request.method.toUpperCase()}
                </Badge>
                <span className="truncate">{request.name}</span>
              </div>
              <div
                className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:text-red-400' : 'hover:text-red-500'} flex items-center justify-center cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(e, request._id);
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
}, (prevProps, nextProps) => {
  return prevProps.collection._id === nextProps.collection._id;
});

// Accept onHistorySelect and darkMode props in HistoryItem
const HistoryItem = React.memo(function HistoryItem({
  item,
  onHistorySelect, // Use onHistorySelect instead of setSelectedRequestId for click action
  onDeleteHistoryEntry,
  darkMode // Receive darkMode
}) {
  const style = getMethodStyle(item.method);
  const timeAgo = formatTimeAgo(item.timestamp);
  const displayPath = getPathFromUrl(item.url);
  // Adjust badge styles for dark mode
  const badgeClassName = darkMode
    ? style.className.replace('bg-', 'dark:bg-').replace('text-', 'dark:text-').replace('hover:bg-', 'dark:hover:bg-').replace('border-', 'dark:border-')
    : style.className;

  return (
    <AccordionItem value={item._id} className="border-b-0 mb-1">
      {/* Call onHistorySelect with the full item when clicked */}
      <div
        className={`flex items-center justify-between group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} px-2 py-1.5 rounded cursor-pointer text-sm`}
        onClick={() => onHistorySelect(item)} // Changed onClick handler
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
              onDeleteHistoryEntry(e, item._id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </AccordionItem>
  );
});
