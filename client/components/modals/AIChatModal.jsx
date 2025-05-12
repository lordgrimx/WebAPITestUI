"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MessageSquare, Send, Bot, User, Loader2, RefreshCw, PlusCircle, Trash2, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createChatMessage, getChatSessions, getSessionMessages, generateSessionId } from "@/lib/api/chat-api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

function AIChatModal({ open, setOpen, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSessions, setIsFetchingSessions] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
    const messagesEndRef = useRef(null);
  // Fetch sessions when modal is opened
  useEffect(() => {
    if (open) {
      fetchSessions().catch(err => {
        // If fetching sessions fails, we still initialize a new session
        if (!currentSession) {
          const newSessionId = generateSessionId();
          setCurrentSession(newSessionId);
        }
      });
    }
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);  const fetchSessions = async () => {
    try {
      setIsFetchingSessions(true);
      const sessionsData = await getChatSessions();
      setSessions(sessionsData);
      return sessionsData;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      
      // Check if it's a database migration issue
      if (error.response?.status === 500 && 
          (error.response?.data?.message?.includes("Invalid object name") || 
           error.message?.includes("Invalid object name"))) {
        toast.error("Chat database tables not found", {
          description: "The database migration for chat functionality hasn't been applied yet. Please contact the system administrator.",
          duration: 6000
        });
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to load chat history";
        toast.error(errorMessage, {
          description: `Status: ${error.response?.status || 'Unknown'}`
        });
      }
      
      // Return an empty array so the component can continue functioning
      return [];
    } finally {
      setIsFetchingSessions(false);
    }
  };  const loadSession = async (sessionId) => {
    try {
      setIsLoading(true);
      const sessionMessages = await getSessionMessages(sessionId);
      setMessages(sessionMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.isFromUser ? "user" : "bot",
        timestamp: new Date(msg.createdAt)
      })));
      setCurrentSession(sessionId);
      setShowSessions(false);
    } catch (error) {
      console.error('Error loading session:', error);
      
      // Check if it's a database migration issue
      if (error.response?.status === 500 && 
          (error.response?.data?.message?.includes("Invalid object name") || 
           error.message?.includes("Invalid object name") ||
           error.message?.includes("ChatMessages"))) {
        
        toast.error("Chat database not configured", {
          description: "The database migration for chat functionality hasn't been applied. Please contact the system administrator.",
          duration: 5000
        });
        
        // Create a new session as fallback behavior
        startNewSession();
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Failed to load chat session";
        toast.error(errorMessage, {
          description: `Status: ${error.response?.status || 'Unknown'}`,
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    const newSessionId = generateSessionId();
    setCurrentSession(newSessionId);
    setMessages([]);
    setShowSessions(false);
  };
  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        text: inputMessage,
        sender: "user",
        timestamp: new Date()
      };

      // Add user message to UI immediately
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Clear input
      setInputMessage("");

      try {
        setIsLoading(true);

        // Ensure currentSession is set before sending
        let sessionToSend = currentSession;
        if (!sessionToSend) {
          sessionToSend = generateSessionId();
          setCurrentSession(sessionToSend); // Update state for future messages
        }

        // Send message to API
        const response = await createChatMessage({
          content: userMessage.text,
          sessionId: sessionToSend,
          modelType: "gemini-2.0-flash" // default model
        });

        if (response && response.modelResponse) {
          // Add bot response to messages
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              text: response.modelResponse,
              sender: "bot",
              timestamp: new Date()
            }
          ]);
        }      } catch (error) {
        console.error("Error sending message:", error);
        
        // Check if it's a database migration issue
        if (error.response?.status === 500 && 
            (error.response?.data?.message?.includes("Invalid object name") || 
             error.message?.includes("Invalid object name") ||
             error.message?.includes("ChatMessages"))) {
          
          toast.error("Chat functionality unavailable", {
            description: "The database tables required for chat haven't been set up yet. Please run database migrations or contact the administrator.",
            duration: 7000,
            action: {
              label: 'Dismiss',
              onClick: () => {}
            }
          });
          
          // Add a more helpful error message
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              text: "I'm sorry, but the chat functionality is not available yet. The database tables required for chat haven't been set up. This usually happens when database migrations haven't been applied. Please contact your system administrator to run the necessary migrations.",
              sender: "bot",
              timestamp: new Date(),
              isError: true
            }
          ]);
        } else {
          // Handle other types of errors
          const errorStatus = error.response?.status || 'Unknown';
          const errorMessage = error.response?.data?.message || error.message || "Failed to send message";
          
          toast.error(`Error: ${errorMessage}`, {
            description: `Status: ${errorStatus}`,
            duration: 5000,
            action: {
              label: 'Retry',
              onClick: () => handleSendMessage()
            }
          });
          
          // Add error message
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              text: `Sorry, I encountered an error (${errorStatus}): ${errorMessage}. Please try again later.`,
              sender: "bot",
              timestamp: new Date(),
              isError: true
            }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  const formatTime = (timestamp) => {
    return timestamp ? new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp)) : '';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={`max-w-5xl h-[80vh] overflow-hidden flex flex-col p-0 gap-0 ${
          darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800 border-gray-200"
        } [&>button]:hidden`}
        hideCloseButton
      >
        <DialogHeader className={`px-6 py-3 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-500" /> AI Chat Assistant
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowSessions(!showSessions)}
                      className={showSessions ? 
                        `bg-${darkMode ? 'gray-700' : 'gray-100'} text-${darkMode ? 'blue-400' : 'blue-600'}` : ''}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Chat History</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={startNewSession}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New Chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {showSessions && (
            <div className={`w-60 border-r overflow-hidden flex flex-col ${darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200"}`}>
              <div className="p-3 border-b font-medium flex items-center justify-between">
                <span>Chat History</span>
                {isFetchingSessions && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left py-2 h-auto items-start"
                    onClick={startNewSession}
                  >
                    <PlusCircle className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      <div className="font-medium">New Chat</div>
                      <div className="text-xs opacity-70">Start a new conversation</div>
                    </div>
                  </Button>
                  
                  <Separator className="my-2" />
                  
                  {sessions.length === 0 && !isFetchingSessions && (
                    <div className="text-xs text-center py-3 opacity-70">No previous chats</div>
                  )}
                  
                  {isFetchingSessions ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-2">
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    sessions.map(session => (
                      <Button
                        key={session.sessionId}
                        variant={currentSession === session.sessionId ? "secondary" : "ghost"}
                        className="w-full justify-start text-left py-2 h-auto items-start truncate"
                        onClick={() => loadSession(session.sessionId)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                        <div className="truncate">
                          <div className="font-medium truncate">
                            {session.messages[0]?.content.substring(0, 20) || "Chat Session"}...
                          </div>
                          <div className="text-xs opacity-70">
                            {new Date(session.lastMessageAt || session.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" style={{ height: "calc(100% - 60px)", overflow: "auto" }}>
              <div className="space-y-4 pb-2">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <Bot className="h-12 w-12 mx-auto opacity-20 mb-4" />
                    <h3 className="text-lg font-medium mb-2">PUTman Yardım Asistanı</h3>
                    <p className="text-sm opacity-70 max-w-md mx-auto mb-8">
                      API test platformumuz, koleksiyonlar, istekler, ortamlar veya diğer özellikler hakkında sorularınızı yanıtlayabilirim.
                    </p>
                    
                    {/* FAQ ve Documentation Bölümleri */}
                    <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto text-left">
                      {/* Sık Sorulan Sorular (FAQ) */}
                      <div className={`rounded-xl p-5 ${darkMode ? "bg-gray-700" : "bg-gray-50"} shadow-sm border ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                        <h4 className="font-medium text-md mb-3 flex items-center">
                          <div className={`rounded-full p-1 mr-2 ${darkMode ? "bg-purple-500/20" : "bg-purple-100"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${darkMode ? "text-purple-400" : "text-purple-500"}`}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                          </div>
                          Sık Sorulan Sorular
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Koleksiyon nasıl oluşturabilirim?")}>
                            • Koleksiyon nasıl oluşturabilirim?
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Ortam değişkenleri nasıl kullanılır?")}>
                            • Ortam değişkenleri nasıl kullanılır?
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("JWT token nasıl kullanabilirim?")}>
                            • JWT token nasıl kullanabilirim?
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("K6 performans testlerini nasıl çalıştırabilirim?")}>
                            • K6 performans testlerini nasıl çalıştırabilirim?
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Başka kullanıcılara koleksiyon nasıl paylaşabilirim?")}>
                            • Başka kullanıcılara koleksiyon nasıl paylaşabilirim?
                          </li>
                        </ul>
                      </div>

                      {/* Dokümantasyon */}
                      <div className={`rounded-xl p-5 ${darkMode ? "bg-gray-700" : "bg-gray-50"} shadow-sm border ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                        <h4 className="font-medium text-md mb-3 flex items-center">
                          <div className={`rounded-full p-1 mr-2 ${darkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${darkMode ? "text-blue-400" : "text-blue-500"}`}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                          </div>
                          Dokümantasyon
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("PUTman nedir ve nasıl kullanılır?")}>
                            • PUTman'e genel bakış
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("İstekler nasıl oluşturulur ve düzenlenir?")}>
                            • İstekler (Requests)
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Koleksiyon yönetimi hakkında bilgi ver")}>
                            • Koleksiyon Yönetimi
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Ortamlar (environments) nasıl kullanılır?")}>
                            • Ortamlar (Environments)
                          </li>
                          <li className="cursor-pointer hover:underline" onClick={() => setInputMessage("Proxy özellikleri nelerdir?")}>
                            • Proxy Özellikleri
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Kısayollar ve İpuçları */}
                    <div className={`rounded-xl p-4 mt-6 max-w-3xl mx-auto ${darkMode ? "bg-blue-500/10 text-blue-200" : "bg-blue-50 text-blue-700"} text-sm`}>
                      <h5 className="font-medium mb-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        Kısayollar ve İpuçları
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs mt-2">
                        <div className="flex items-center">
                          <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>Ctrl+S</kbd>
                          <span>İsteği Kaydet</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>Ctrl+Enter</kbd>
                          <span>İsteği Gönder</span>
                        </div>
                        <div className="flex items-center">
                          <kbd className={`px-1.5 py-0.5 rounded text-xs mr-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>Ctrl+Space</kbd>
                          <span>Otomatik Tamamlama</span>
                        </div>
                      </div>
                    </div>
                    
                    {isFetchingSessions && (
                      <div className="mt-4 text-sm">
                        <p className="text-amber-500 dark:text-amber-400">
                          Sohbet kullanılabilirliği kontrol ediliyor...
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-start max-w-[80%] group">
                      {msg.sender !== "user" && (
                        <div className={`rounded-full p-1 mr-2 mt-1 ${darkMode ? "bg-blue-500" : "bg-blue-100"}`}>
                          <Bot className={`h-4 w-4 ${darkMode ? "text-white" : "text-blue-500"}`} />
                        </div>
                      )}
                      
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white"
                            : msg.isError 
                              ? `${darkMode ? "bg-red-900/50 text-red-100" : "bg-red-50 text-red-800"}`
                              : `${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"}`
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <div className="text-xs opacity-70 text-right mt-1">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                      
                      {msg.sender === "user" && (
                        <div className={`rounded-full p-1 ml-2 mt-1 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start max-w-[80%]">
                      <div className={`rounded-full p-1 mr-2 mt-1 ${darkMode ? "bg-blue-500" : "bg-blue-100"}`}>
                        <Bot className={`h-4 w-4 ${darkMode ? "text-white" : "text-blue-500"}`} />
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "600ms" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className={`px-4 py-3 border-t ${darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                  className={`flex-1 ${darkMode ? "bg-gray-700 border-gray-600" : ""}`}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  variant="default"
                  className={darkMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs mt-1 text-center opacity-70">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AIChatModal;
export { AIChatModal };